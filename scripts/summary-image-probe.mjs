/**
 * Visual check for the rendered checkpoint summary pages.
 *
 * The compaction engine can attach a summary as PNG image(s) instead of a text
 * block (`summaryImage`); this script renders one sample checkpoint through the
 * real renderer and drops the pages into a temp directory, so the layout,
 * paging, and the page cap can be eyeballed without a DSH profile, a session,
 * or a model call.
 *
 * Usage:
 *   node scripts/summary-image-probe.mjs                 # renderer default page cap
 *   node scripts/summary-image-probe.mjs --max-pages 1   # force the omitted-lines marker
 *   node scripts/summary-image-probe.mjs --font /path/to/font.otf
 *
 * Without --font it uses the installed fixed face (the one the settings page
 * downloads); install it first with `npm run font:fetch`.
 *
 * Node runs the TypeScript source directly through its own type stripping. If
 * this Node build cannot import `.ts` files, run it through the repo's loader:
 *   node --import tsx scripts/summary-image-probe.mjs
 *
 * It is a developer tool: nothing imports it, and `npm test` never runs it.
 */

import { existsSync } from 'node:fs'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Upstream pi-ai per-request image pixel budget; past it, an adapter omits images. */
const REQUEST_IMAGE_PIXEL_BUDGET = 2048 * 2048

const args = process.argv.slice(2)
const maxPagesIndex = args.indexOf('--max-pages')
const maxPagesArg = maxPagesIndex >= 0 ? args[maxPagesIndex + 1] : undefined
const maxPages = maxPagesArg === undefined ? undefined : Number(maxPagesArg)
if (maxPagesArg !== undefined && !Number.isFinite(maxPages)) {
  throw new Error('--max-pages expects a number, got: ' + maxPagesArg)
}
/** `--long` appends filler sections until even the compact layout runs out of pages. */
const long = args.includes('--long')
const fontIndex = args.indexOf('--font')
const fontArg = fontIndex >= 0 ? args[fontIndex + 1] : undefined

/** A checkpoint-shaped sample: CJK, Latin, a list, and one long unwrapped line. */
const SAMPLE_TEXT = [
  '## Objective',
  '把 dsh-better-compact 的检查点摘要渲染成图片，替代纯文本摘要块进入上下文；渲染失败时必须明确报错，不能静默退回文本。',
  '',
  '## Decisions',
  '- 选项 summaryImage 默认关闭，仅在 goal / custom 模式下生效，handoff 与 native 忽略它。',
  '- 渲染器只做像素，不做业务判断：分页、页数上限、省略标注都在渲染器内部完成。',
  '- 失败一律抛 LlmError(code=BETTER_COMPACT_IMAGE)，让压缩失败，而不是交出一份看不见的检查点。',
  '- The renderer draws with the pinned Noto Sans SC face only; a host without it fails closed instead of falling back to a system font.',
  '',
  '## Open questions',
  '- 页数上限 SUMMARY_IMAGE_MAX_PAGES 是否随宿主像素预算变化？',
  '- 字体缓存在 $DSH_HOME/cache/better-compact/fonts；离线时压缩失败并提示下载。',
  '',
  '## Continuation state',
  '- 会话 a1b2c3d4，模式 goal，阈值 0.72，保留比例 0.16。',
  '- 待办：为渲染器补一条端到端 smoke；更新 DEVELOPMENT.md 的仓库布局表。',
  '- 一条很长的行，用来观察换行行为：the renderer wraps this single logical line at the content width and never lets a Latin run break mid-token, while CJK glyphs may break anywhere because they are full-width.',
  '',
  '## Facts',
  ...Array.from({ length: long ? 90 : 26 }, (_, index) =>
    '- 事实 ' + String(index + 1).padStart(2, '0') + '：检查点每轮请求都会重放，图片每轮重新计视觉 token，'
    + '所以页数必须封顶，省略的行数要显式标出来，而不是悄悄丢掉。'),
].join('\n')

/** Resolve the renderer from the TypeScript source, or from a built lib/ tree. */
async function loadRenderer() {
  const candidates = [
    join(root, 'src', 'summary-image.ts'),
    join(root, 'lib', 'summary-image.js'),
  ]
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue
    try {
      const module = await import(pathToFileURL(candidate).href)
      if (typeof module.renderSummaryImages === 'function') return { module, from: candidate }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      console.error('probe: could not import ' + candidate + ': ' + reason)
    }
  }
  throw new Error(
    'no renderer found (tried src/summary-image.ts and lib/summary-image.js);'
    + ' if this Node build cannot strip types, run: node --import tsx scripts/summary-image-probe.mjs',
  )
}

/** Resolve the fixed face: explicit --font, or the installed cache entry. */
async function loadFontPath(explicit) {
  if (explicit !== undefined) return resolve(explicit)
  const candidates = [
    join(root, 'src', 'font.ts'),
    join(root, 'lib', 'font.js'),
  ]
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue
    try {
      const module = await import(pathToFileURL(candidate).href)
      if (typeof module.requireFontPath === 'function') return await module.requireFontPath()
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      console.error('probe: could not resolve the fixed font via ' + candidate + ': ' + reason)
    }
  }
  throw new Error('no installed fixed font found; run `npm run font:fetch` (or download it in Better Compact settings)')
}

const { module, from } = await loadRenderer()
const title = 'better-compact goal checkpoint · probe'
const fontPath = await loadFontPath(fontArg).catch((error) => {
  console.error('probe: ' + error.message)
  process.exit(1)
})

const pages = await module.renderSummaryImages(
  { text: SAMPLE_TEXT, title },
  { fontPath, ...(maxPages === undefined ? {} : { maxPages }) },
)

const outDir = await mkdtemp(join(tmpdir(), 'bc-summary-image-'))
const written = []
for (const [index, page] of pages.entries()) {
  const path = join(outDir, page.name)
  await writeFile(path, page.data)
  written.push({ index: index + 1, path, page })
}

console.log('renderer: ' + from)
console.log('max pages: ' + (maxPages === undefined ? 'renderer default' : String(maxPages)))
console.log('font: ' + fontPath)
console.log('sample: ' + (long ? 'long (filler sections appended)' : 'default'))
console.log('sample: ' + SAMPLE_TEXT.length + ' chars, ' + SAMPLE_TEXT.split('\n').length + ' source lines')
console.log('output: ' + outDir)
let totalBytes = 0
let totalPixels = 0
for (const entry of written) {
  const bytes = entry.page.data.byteLength
  const pixels = entry.page.width * entry.page.height
  totalBytes += bytes
  totalPixels += pixels
  console.log(
    'page ' + entry.index + '/' + pages.length
    + '  ' + entry.page.mediaType
    + '  ' + entry.page.width + 'x' + entry.page.height
    + '  ' + (bytes / 1024).toFixed(1) + ' kB'
    + '  ' + entry.path,
  )
}
console.log(
  'total: ' + pages.length + ' page(s), ' + (totalBytes / 1024).toFixed(1) + ' kB, '
  + totalPixels + ' px (pi-ai request budget ' + REQUEST_IMAGE_PIXEL_BUDGET + ' px'
  + (totalPixels > REQUEST_IMAGE_PIXEL_BUDGET ? ', OVER BUDGET: adapters may offload the images' : '')
  + ')',
)
