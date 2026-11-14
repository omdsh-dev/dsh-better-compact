import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadImage } from '@napi-rs/canvas'
import { SUMMARY_IMAGE_MAX_PAGES } from '../src/shared/contract.ts'
import type { SummaryImagePage } from '../src/shared/contract.ts'
import { renderSummaryImages } from '../src/summary-image.ts'

/** PNG signature bytes, as a real encoder always emits them. */
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const

/** Contract width: every page shares it, so a page break never reflows the text. */
const EXPECTED_WIDTH = 860

/** Header block plus footer band around the body, in pixels (see the renderer's geometry). */
const PAGE_FURNITURE = 78 + 36

/** Default body layout: 16px on a 25px leading, 40 lines per page. */
const DEFAULT_LINE_HEIGHT = 25
const DEFAULT_MAX_LINES = 40

/** Compact body layout, used only when the default one overflows the page cap. */
const COMPACT_FONT_SIZE = 14
const COMPACT_LINE_HEIGHT = 22
const COMPACT_MAX_LINES = 48

/** Upstream request budgets: one page, all pages, and all pixels together. */
const PAGE_BYTE_LIMIT = 450 * 1024
const TOTAL_BYTE_LIMIT = 900 * 1024
const TOTAL_PIXEL_LIMIT = 3_932_160

/** A checkpoint-shaped body of `count` short lines, one visual line each. */
function summaryText(count: number): string {
  return Array.from({ length: count }, (_, index) => `line ${index} 摘要 内容 ok`).join('\n')
}

/** `count` lines of dense CJK, each one visual line at both layouts — the byte worst case. */
function denseCjkText(count: number): string {
  const line = '压缩摘要正文包含目标与待办与决策与风险与文件改动与后续'
  return Array.from({ length: count }, () => line).join('\n')
}

/** Assert one page is a real PNG of the contract shape and inside the per-page budget. */
function assertPngPage(page: SummaryImagePage, name: string): void {
  assert.equal(page.mediaType, 'image/png')
  assert.equal(page.name, name)
  assert.ok(page.data instanceof Uint8Array, 'data must be a Uint8Array')
  assert.ok(page.data.length > 128, 'a PNG page must not be trivially small')
  assert.deepEqual(Array.from(page.data.subarray(0, 8)), Array.from(PNG_MAGIC))
  assert.equal(page.width, EXPECTED_WIDTH)
  assert.ok(page.height >= DEFAULT_LINE_HEIGHT, 'a page must be tall enough for at least one line')
  assert.ok(page.data.length <= PAGE_BYTE_LIMIT, `a page must stay under ${PAGE_BYTE_LIMIT} bytes, got ${page.data.length}`)
}

/** Assert the whole render fits the upstream per-request budgets. */
function assertRequestBudget(pages: readonly SummaryImagePage[]): void {
  const bytes = pages.reduce((total, page) => total + page.data.length, 0)
  const pixels = pages.reduce((total, page) => total + page.width * page.height, 0)
  assert.ok(bytes <= TOTAL_BYTE_LIMIT, `all pages must stay under ${TOTAL_BYTE_LIMIT} bytes, got ${bytes}`)
  assert.ok(pixels <= TOTAL_PIXEL_LIMIT, `all pages must stay under ${TOTAL_PIXEL_LIMIT} pixels, got ${pixels}`)
}

test('rasterizes a short summary as one PNG page', async () => {
  const pages = await renderSummaryImages({ text: summaryText(3), title: 'session abc · goal' })
  assert.equal(pages.length, 1)
  assertPngPage(pages[0]!, 'compaction-summary-1.png')
})

test('is deterministic: the same request yields identical bytes', async () => {
  const request = { text: summaryText(5), title: 'session abc · goal' }
  const [first, second] = await Promise.all([renderSummaryImages(request), renderSummaryImages(request)])
  assert.equal(first.length, 1)
  assert.deepEqual(first[0]!.data, second[0]!.data)
})

test('keeps the width fixed at 860 and lets the height follow the text', async () => {
  const [short] = await renderSummaryImages({ text: summaryText(1), title: 'session abc · goal' })
  const [tall] = await renderSummaryImages({ text: summaryText(20), title: 'session abc · goal' })
  assert.equal(short!.width, EXPECTED_WIDTH)
  assert.equal(tall!.width, EXPECTED_WIDTH)
  assert.equal(tall!.height - short!.height, 19 * DEFAULT_LINE_HEIGHT)
})

test('still returns one page for empty text', async () => {
  const pages = await renderSummaryImages({ text: '', title: '' })
  assert.equal(pages.length, 1)
  assertPngPage(pages[0]!, 'compaction-summary-1.png')
})

test('breaks a summary at 40 body lines on the default layout', async () => {
  const [single] = await renderSummaryImages({ text: summaryText(DEFAULT_MAX_LINES), title: 'session abc · goal' })
  const split = await renderSummaryImages({ text: summaryText(DEFAULT_MAX_LINES + 1), title: 'session abc · goal' })
  assert.equal(single!.height, DEFAULT_MAX_LINES * DEFAULT_LINE_HEIGHT + PAGE_FURNITURE)
  assert.equal(split.length, 2)
  assert.equal(split[0]!.height, single!.height)
  assert.equal(split[1]!.height, DEFAULT_LINE_HEIGHT + PAGE_FURNITURE, 'the 41st line opens a short second page')
})

test('numbers page names consecutively and stops at SUMMARY_IMAGE_MAX_PAGES', async () => {
  assert.equal(SUMMARY_IMAGE_MAX_PAGES, 2)
  const pages = await renderSummaryImages({ text: summaryText(600), title: 'session abc · goal' })
  assert.equal(pages.length, SUMMARY_IMAGE_MAX_PAGES)
  pages.forEach((page, index) => assertPngPage(page, `compaction-summary-${index + 1}.png`))
  assertRequestBudget(pages)
})

test('re-wraps 100 dense CJK lines onto the compact layout to fit the page cap', async () => {
  const pages = await renderSummaryImages({ text: denseCjkText(100), title: 'session abc · goal · deepseek/chat' })
  assert.equal(pages.length, 2)
  pages.forEach((page, index) => assertPngPage(page, `compaction-summary-${index + 1}.png`))
  assert.equal(
    pages[0]!.height,
    COMPACT_MAX_LINES * COMPACT_LINE_HEIGHT + PAGE_FURNITURE,
    `the compact layout must be in use: ${COMPACT_FONT_SIZE}px on a ${COMPACT_LINE_HEIGHT}px leading`,
  )
  assert.equal(pages[1]!.height, pages[0]!.height, 'the truncated page spends its last line on the omission marker')
  assertRequestBudget(pages)
})

test('keeps the default layout when the summary already fits the cap', async () => {
  const pages = await renderSummaryImages({ text: summaryText(80), title: 'session abc · goal' })
  assert.equal(pages.length, 2)
  assert.ok(
    pages.every((page) => page.height === DEFAULT_MAX_LINES * DEFAULT_LINE_HEIGHT + PAGE_FURNITURE),
    '80 lines fill two default pages, so no compact re-wrap happens',
  )
})

test('marks how many lines the page cap dropped', async () => {
  const [capped, oneMoreLine] = await Promise.all([
    renderSummaryImages({ text: summaryText(600), title: 'session abc · goal' }),
    renderSummaryImages({ text: summaryText(601), title: 'session abc · goal' }),
  ])
  assert.equal(capped.length, 2)
  assert.equal(capped[1]!.height, capped[0]!.height, 'the last page stays inside the line cap')
  assert.notDeepEqual(
    capped[1]!.data,
    oneMoreLine[1]!.data,
    'the omission marker carries the dropped line count, so one extra source line changes the last page',
  )
  assert.deepEqual(capped[0]!.data, oneMoreLine[0]!.data, 'the earlier pages are unaffected by the marker')
})

test('honors an explicit maxPages below the contract cap', async () => {
  const pages = await renderSummaryImages({ text: summaryText(600), title: 'session abc · goal' }, 1)
  assert.equal(pages.length, 1)
  assertPngPage(pages[0]!, 'compaction-summary-1.png')
})

test('renders CJK and ASCII-only summaries to different bytes', async () => {
  const [cjk] = await renderSummaryImages({ text: '继续状态：目标已达成，待办三项。', title: '会话 abc · 目标' })
  const [ascii] = await renderSummaryImages({ text: 'continuation state: goal done, three todos.', title: 'session abc · goal' })
  assert.notDeepEqual(cjk!.data, ascii!.data)
})

test('encodes pages that a real PNG decoder accepts', async () => {
  const pages = await renderSummaryImages({ text: denseCjkText(100), title: 'session abc · goal' })
  for (const page of pages) {
    const decoded = await loadImage(Buffer.from(page.data))
    assert.equal(decoded.width, page.width)
    assert.equal(decoded.height, page.height)
  }
})
