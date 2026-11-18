/**
 * PNG page renderer for dsh-better-compact checkpoint summaries.
 *
 * The compaction engine can attach a summary as image(s) instead of text blocks
 * (`config.summaryImage`); this module is the only place that touches pixels.
 * It rasterizes a checkpoint text into one or more white PNG pages with a
 * monospace body, a muted header line, and an `n/total` page index.
 *
 * Two upstream budgets shape the layout, and neither is negotiable:
 *
 *   - pixels: pi-ai allows a bounded pixel budget per request payload, and an
 *     over-budget image is offloaded to a placeholder text — which would silently
 *     throw the summary away. Hence the fixed 860px width, the line caps per
 *     page, and the `SUMMARY_IMAGE_MAX_PAGES` page cap.
 *   - bytes: the same payload has a byte target. Skia's own PNG writer stores
 *     unfiltered RGBA here and lands two orders of magnitude above it, so pages
 *     are encoded by `encodeGrayscalePng` instead: the page only uses greys, so
 *     an 8-bit greyscale PNG is lossless for it and deflates to a few KB.
 *
 * When the default layout needs more pages than the cap allows, the whole text is
 * re-wrapped once on the compact layout (`COMPACT_LAYOUT`) — more lines per page
 * at a smaller size — because a checkpoint that still fits is worth more than one
 * that is truncated. Beyond that the last page carries an explicit omission
 * marker; nothing is dropped silently.
 *
 * `@napi-rs/canvas` is a native module, so it is imported lazily: a host that
 * never renders a summary neither pays for loading it nor fails when the
 * prebuilt binary is missing. Font probing prefers a real CJK family, because a
 * fallback face without CJK coverage renders the summary as empty boxes.
 *
 * The renderer is pure: no module-level cache, no font registered between calls,
 * no disk writes — the same request always produces the same bytes on the same
 * machine, and every page is a fresh canvas.
 */

import { deflateSync } from 'node:zlib'
import { SUMMARY_IMAGE_MAX_PAGES } from './shared/contract.ts'
import type { SummaryImagePage, SummaryImageRequest } from './shared/contract.ts'
import type { SKRSContext2D } from '@napi-rs/canvas'

/** Fixed page width in pixels; shared by every page so a page break never reflows. */
const PAGE_WIDTH = 860
/** Horizontal inset applied to the header, the body, and the page index. */
const PADDING_X = 44
/** Usable text width between the insets. */
const CONTENT_WIDTH = PAGE_WIDTH - PADDING_X * 2
/** Header font size in pixels. */
const HEADER_FONT_SIZE = 13
/** Page index font size in pixels. */
const FOOTER_FONT_SIZE = 13
/** Distance from the page top to the header's top edge. */
const HEADER_TOP = 32
/** Pixel height reserved for the header line box. */
const HEADER_LINE_HEIGHT = 18
/** Gap between the header and the separator rule. */
const RULE_GAP = 12
/** Gap between the separator rule and the first body line. */
const BODY_GAP = 16
/** Space below the last body line, holding the page index. */
const FOOTER_HEIGHT = 36
/** Body top edge; derived from the header geometry above. */
const BODY_TOP = HEADER_TOP + HEADER_LINE_HEIGHT + RULE_GAP + BODY_GAP
/** Vertical top of the separator rule. */
const RULE_Y = HEADER_TOP + HEADER_LINE_HEIGHT + RULE_GAP
/** Page background. */
const BACKGROUND_COLOR = '#ffffff'
/** Body glyph color. */
const BODY_COLOR = '#111111'
/** Header and page-index color. */
const MUTED_COLOR = '#555555'
/** Separator rule color. */
const RULE_COLOR = '#d0d0d0'

/** One body layout: the type size, its leading, and how many lines a page holds. */
interface BodyLayout {
  /** Body font size in pixels. */
  readonly fontSize: number
  /** Body line box height in pixels. */
  readonly lineHeight: number
  /** Body lines a page may hold before it breaks. */
  readonly maxLines: number
}

/**
 * Default body layout: 16px on a 25px leading, 40 lines per page.
 *
 * A full page stays near 1100px tall, so the page cap and the request pixel
 * budget both hold without touching the type size.
 */
const DEFAULT_LAYOUT: BodyLayout = Object.freeze({ fontSize: 16, lineHeight: 25, maxLines: 40 })

/**
 * Compact body layout, used only when `DEFAULT_LAYOUT` overflows the page cap:
 * 14px on a 22px leading, 48 lines per page — about 30% more text per page.
 */
const COMPACT_LAYOUT: BodyLayout = Object.freeze({ fontSize: 14, lineHeight: 22, maxLines: 48 })

/**
 * CJK families probed in priority order.
 *
 * The first installed one becomes the stack's CJK face; a face is required
 * because the body text of a checkpoint summary is usually CJK.
 */
const CJK_FAMILIES: readonly string[] = Object.freeze([
  'Microsoft YaHei',
  'Noto Sans SC',
  'Noto Sans CJK SC',
  'PingFang SC',
  'SimHei',
  'SimSun',
])

/** Windows fallback font file, registered when the family list reports no CJK face. */
const WINDOWS_CJK_FONT_PATH = 'C:\\Windows\\Fonts\\msyh.ttc'

/** The lazily imported `@napi-rs/canvas` module namespace. */
type CanvasApi = typeof import('@napi-rs/canvas')

/** One text laid out against a body layout. */
interface PagePlan {
  /** Body lines of every emitted page, in order. */
  readonly pages: readonly (readonly string[])[]
  /** Body lines dropped by the page cap (0 when nothing was dropped). */
  readonly omitted: number
  /** Page count before the cap was applied; drives the compact-layout retry. */
  readonly totalPages: number
}

/**
 * Load `@napi-rs/canvas` on demand.
 * @returns the canvas module namespace.
 * @throws Error naming the missing dependency when the native module cannot load.
 */
async function loadCanvas(): Promise<CanvasApi> {
  try {
    return await import('@napi-rs/canvas')
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(
      'dsh-better-compact: rendering the checkpoint summary as an image needs the optional dependency "@napi-rs/canvas" (install it with `npm install @napi-rs/canvas`): ' +
        reason,
      { cause: error },
    )
  }
}

/**
 * Resolve a CJK-capable font family for the body and header.
 * @param api - the loaded canvas module.
 * @returns the family name to place in the font stack.
 * @throws Error when no CJK font can be found at all.
 */
async function resolveCjkFamily(api: CanvasApi): Promise<string> {
  const installed = new Set(api.GlobalFonts.families.map((entry) => entry.family))
  const detected = CJK_FAMILIES.find((family) => installed.has(family))
  if (detected !== undefined) return detected

  const { existsSync } = await import('node:fs')
  if (existsSync(WINDOWS_CJK_FONT_PATH)) {
    try {
      const key = api.GlobalFonts.registerFromPath(WINDOWS_CJK_FONT_PATH)
      if (key !== null) return 'Microsoft YaHei'
    } catch {
      // A corrupt or unreadable font file just means this fallback is unavailable.
    }
  }

  throw new Error(
    'dsh-better-compact: no CJK font is available, so the checkpoint summary image would render as empty boxes. Install one of: ' +
      CJK_FAMILIES.join(', '),
  )
}

/**
 * Build the CSS font shorthand used for every text run.
 * @param family - resolved CJK family, kept as the fallback after monospace.
 * @param size - font size in pixels.
 * @returns a canvas `font` value.
 */
function fontStack(family: string, size: number): string {
  return `${size}px monospace, "${family}", sans-serif`
}

/**
 * Test whether a code point is a wide glyph (CJK, full-width form, emoji).
 *
 * Wide glyphs are the only characters allowed to break anywhere; Latin runs are
 * kept whole so words are not cut mid-token.
 * @param codePoint - the code point to classify.
 * @returns true when the glyph occupies a full em and may break on either side.
 */
function isWideCodePoint(codePoint: number): boolean {
  return (
    codePoint >= 0x1100 &&
    (codePoint <= 0x115f ||
      codePoint === 0x2329 ||
      codePoint === 0x232a ||
      (codePoint >= 0x2e80 && codePoint <= 0xa4cf && codePoint !== 0x303f) ||
      (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
      (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
      (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
      (codePoint >= 0xff00 && codePoint <= 0xff60) ||
      (codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
      (codePoint >= 0x1f300 && codePoint <= 0x1f9ff) ||
      (codePoint >= 0x20000 && codePoint <= 0x3fffd))
  )
}

/**
 * Split one logical line into wrappable tokens.
 * @param line - one source line, tabs already expanded.
 * @returns tokens where wide glyphs stand alone, Latin runs and single spaces are whole.
 */
function tokenizeLine(line: string): string[] {
  const tokens: string[] = []
  let run = ''
  for (const char of line) {
    if (char === ' ' || char === '\t') {
      if (run !== '') {
        tokens.push(run)
        run = ''
      }
      tokens.push(char)
      continue
    }
    if (isWideCodePoint(char.codePointAt(0) ?? 0)) {
      if (run !== '') {
        tokens.push(run)
        run = ''
      }
      tokens.push(char)
      continue
    }
    run += char
  }
  if (run !== '') tokens.push(run)
  return tokens
}

/**
 * Wrap one logical line to the content width.
 * @param ctx - context whose font is already the body font.
 * @param line - one source line.
 * @param maxWidth - usable pixel width.
 * @returns the visual lines, never empty.
 */
function wrapLine(ctx: SKRSContext2D, line: string, maxWidth: number): string[] {
  const wrapped: string[] = []
  let current = ''
  for (const token of tokenizeLine(line)) {
    if (token === ' ' && current === '') continue
    if (ctx.measureText(current + token).width <= maxWidth) {
      current += token
      continue
    }
    if (current !== '') {
      wrapped.push(current.trimEnd())
      current = ''
      if (token === ' ') continue
    }
    if (ctx.measureText(token).width <= maxWidth) {
      current = token
      continue
    }
    for (const char of token) {
      if (current !== '' && ctx.measureText(current + char).width > maxWidth) {
        wrapped.push(current)
        current = ''
      }
      current += char
    }
  }
  if (current !== '' || wrapped.length === 0) wrapped.push(current)
  return wrapped
}

/**
 * Wrap a whole checkpoint text into visual lines.
 * @param ctx - context whose font is already the body font.
 * @param text - the checkpoint text.
 * @param maxWidth - usable pixel width.
 * @returns every visual line, in order; at least one (possibly empty) line.
 */
function wrapText(ctx: SKRSContext2D, text: string, maxWidth: number): string[] {
  const sourceLines = text.replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n')
  while (sourceLines.length > 1 && sourceLines[sourceLines.length - 1]?.trim() === '') sourceLines.pop()
  const lines: string[] = []
  for (const line of sourceLines) lines.push(...wrapLine(ctx, line, maxWidth))
  return lines
}

/**
 * Group wrapped lines into pages and apply the page cap.
 *
 * A truncated last page reserves its final body line for the omission marker, so
 * every page — truncated or not — stays inside the line cap of its layout.
 * @param lines - every visual line of the summary.
 * @param maxPages - hard page cap, already normalized to >= 1.
 * @param maxLines - body lines one page may hold.
 * @returns the pages to render, how many lines the cap dropped, and the uncapped page count.
 */
function planPages(lines: readonly string[], maxPages: number, maxLines: number): PagePlan {
  const totalPages = Math.max(1, Math.ceil(lines.length / maxLines))
  const pageCount = Math.min(totalPages, maxPages)
  const truncated = totalPages > pageCount
  const pages: string[][] = []
  let consumed = 0
  for (let index = 0; index < pageCount; index += 1) {
    const capacity = index === pageCount - 1 && truncated ? maxLines - 1 : maxLines
    const slice = lines.slice(consumed, consumed + capacity)
    consumed += slice.length
    pages.push(slice)
  }
  if (pages.length === 0) pages.push([])
  return { pages, omitted: lines.length - consumed, totalPages }
}

/**
 * The line appended to a truncated last page, so nothing disappears silently.
 * @param omitted - how many wrapped body lines the page cap dropped.
 * @returns the marker line.
 */
function omissionMarker(omitted: number): string {
  return `… (${omitted} more line(s) omitted; the full checkpoint text stays in the session record)`
}

/**
 * Shorten one line so it fits the content width, ending it with an ellipsis.
 * @param ctx - context whose font is already the target font.
 * @param text - the single line to fit.
 * @param maxWidth - usable pixel width.
 * @returns the text unchanged when it fits, else a truncated form.
 */
function fitText(ctx: SKRSContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let fitted = ''
  for (const char of text) {
    if (ctx.measureText(`${fitted}${char}…`).width > maxWidth) break
    fitted += char
  }
  return `${fitted}…`
}

/** PNG signature: the 8 bytes every decoder checks first. */
const PNG_SIGNATURE = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/** CRC-32 lookup table for the PNG chunk trailer. */
const CRC_TABLE = ((): Uint32Array => {
  const table = new Uint32Array(256)
  for (let index = 0; index < 256; index += 1) {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) value = (value & 1) !== 0 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    table[index] = value >>> 0
  }
  return table
})()

/**
 * CRC-32 of one PNG chunk payload, as the format's chunk trailer requires.
 * @param bytes - the chunk type plus its data.
 * @returns the unsigned checksum.
 */
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) crc = (CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8)) >>> 0
  return (crc ^ 0xffffffff) >>> 0
}

/**
 * Build one length-prefixed, CRC-trailed PNG chunk.
 * @param type - the 4-character chunk type.
 * @param data - the chunk payload.
 * @returns the encoded chunk.
 */
function pngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), Buffer.from(data)])
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, checksum])
}

/**
 * Encode one page as an 8-bit greyscale PNG.
 *
 * The renderer draws only greys (`BACKGROUND_COLOR` through `BODY_COLOR`), so
 * dropping the colour channels is lossless while cutting the encoded size by
 * more than an order of magnitude — which is what keeps a page inside the
 * upstream byte target. Antialiasing is preserved as real grey levels, so the
 * text stays crisp at reading size.
 * @param pixels - the canvas's premultiplied RGBA bytes, row-major.
 * @param width - page width in pixels.
 * @param height - page height in pixels.
 * @returns the encoded PNG bytes.
 */
function encodeGrayscalePng(pixels: Uint8Array, width: number, height: number): Uint8Array {
  const stride = width + 1
  const raw = Buffer.alloc(height * stride)
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * stride
    raw[rowStart] = 0
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4
      const alpha = pixels[offset + 3] ?? 0
      const luma =
        0.299 * (pixels[offset] ?? 0) + 0.587 * (pixels[offset + 1] ?? 0) + 0.114 * (pixels[offset + 2] ?? 0) + (255 - alpha)
      raw[rowStart + 1 + x] = luma >= 255 ? 255 : luma <= 0 ? 0 : Math.round(luma)
    }
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 0
  return new Uint8Array(
    Buffer.concat([
      Buffer.from(PNG_SIGNATURE),
      pngChunk('IHDR', header),
      pngChunk('IDAT', deflateSync(raw, { level: 9 })),
      pngChunk('IEND', new Uint8Array(0)),
    ]),
  )
}

/**
 * Render one page to PNG.
 * @param api - the loaded canvas module.
 * @param family - resolved CJK family.
 * @param header - header text (session and mode).
 * @param bodyLines - body lines of this page, already wrapped and capped.
 * @param pageIndex - 1-based index of this page.
 * @param pageCount - total page count.
 * @param layout - body layout the page is drawn with.
 * @returns the encoded page.
 */
function renderPage(
  api: CanvasApi,
  family: string,
  header: string,
  bodyLines: readonly string[],
  pageIndex: number,
  pageCount: number,
  layout: BodyLayout,
): SummaryImagePage {
  const height = BODY_TOP + bodyLines.length * layout.lineHeight + FOOTER_HEIGHT
  const canvas = api.createCanvas(PAGE_WIDTH, height)
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'

  ctx.fillStyle = BACKGROUND_COLOR
  ctx.fillRect(0, 0, PAGE_WIDTH, height)

  ctx.fillStyle = MUTED_COLOR
  ctx.font = fontStack(family, HEADER_FONT_SIZE)
  const headerText = header.trim()
  if (headerText !== '') ctx.fillText(fitText(ctx, headerText, CONTENT_WIDTH), PADDING_X, HEADER_TOP)

  ctx.strokeStyle = RULE_COLOR
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PADDING_X, RULE_Y + 0.5)
  ctx.lineTo(PAGE_WIDTH - PADDING_X, RULE_Y + 0.5)
  ctx.stroke()

  ctx.fillStyle = BODY_COLOR
  ctx.font = fontStack(family, layout.fontSize)
  bodyLines.forEach((line, index) => {
    if (line !== '') ctx.fillText(line, PADDING_X, BODY_TOP + index * layout.lineHeight)
  })

  ctx.fillStyle = MUTED_COLOR
  ctx.font = fontStack(family, FOOTER_FONT_SIZE)
  ctx.textAlign = 'right'
  ctx.fillText(`${pageIndex}/${pageCount}`, PAGE_WIDTH - PADDING_X, height - FOOTER_HEIGHT + 11)

  return {
    data: encodeGrayscalePng(canvas.data(), PAGE_WIDTH, height),
    mediaType: 'image/png',
    name: `compaction-summary-${pageIndex}.png`,
    width: PAGE_WIDTH,
    height,
  }
}

/**
 * Wrap the request text and split it into pages for one body layout.
 * @param api - the loaded canvas module.
 * @param family - resolved CJK family.
 * @param text - the checkpoint text.
 * @param maxPages - hard page cap.
 * @param layout - body layout that drives both the wrap and the line cap.
 * @returns the page plan for that layout.
 */
function planRequest(
  api: CanvasApi,
  family: string,
  text: string,
  maxPages: number,
  layout: BodyLayout,
): PagePlan {
  const measureCtx = api.createCanvas(CONTENT_WIDTH, layout.lineHeight).getContext('2d')
  measureCtx.font = fontStack(family, layout.fontSize)
  const lines = wrapText(measureCtx, text, CONTENT_WIDTH)
  return planPages(lines, maxPages, layout.maxLines)
}

/**
 * Render a checkpoint summary as PNG page image(s).
 *
 * The text is wrapped to a fixed 860px-wide white page with the default layout;
 * when that needs more pages than `maxPages`, the text is re-wrapped once on the
 * compact layout so the summary still fits. Content beyond `maxPages` after the
 * retry is dropped with an explicit omission marker on the last page, so the
 * caller never receives an unbounded image list and nothing disappears silently.
 * @param request - the checkpoint text and its header line.
 * @param maxPages - hard page cap; defaults to `SUMMARY_IMAGE_MAX_PAGES`.
 * @returns one page per chunk of body text, in order; always at least one page.
 * @throws Error when `@napi-rs/canvas` cannot load or no CJK font is available.
 */
export async function renderSummaryImages(
  request: SummaryImageRequest,
  maxPages: number = SUMMARY_IMAGE_MAX_PAGES,
): Promise<readonly SummaryImagePage[]> {
  const limit = Number.isFinite(maxPages) ? Math.max(1, Math.trunc(maxPages)) : SUMMARY_IMAGE_MAX_PAGES
  const api = await loadCanvas()
  const family = await resolveCjkFamily(api)

  const defaultPlan = planRequest(api, family, request.text, limit, DEFAULT_LAYOUT)
  const plan = defaultPlan.totalPages > limit ? planRequest(api, family, request.text, limit, COMPACT_LAYOUT) : defaultPlan
  const layout = defaultPlan.totalPages > limit ? COMPACT_LAYOUT : DEFAULT_LAYOUT
  const pageCount = plan.pages.length

  return plan.pages.map((bodyLines, index) => {
    const isLast = index === pageCount - 1
    const finalLines = isLast && plan.omitted > 0 ? [...bodyLines, omissionMarker(plan.omitted)] : bodyLines
    return renderPage(api, family, request.title, finalLines, index + 1, pageCount, layout)
  })
}
