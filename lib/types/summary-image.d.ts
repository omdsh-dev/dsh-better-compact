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
import type { SummaryImagePage, SummaryImageRequest } from './shared/contract.ts';
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
export declare function renderSummaryImages(request: SummaryImageRequest, maxPages?: number): Promise<readonly SummaryImagePage[]>;
