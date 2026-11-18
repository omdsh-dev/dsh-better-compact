import { C as BudgetConfigError, F as configEquals, I as deepFreeze, N as serviceIdentity, O as resolveTargetPolicy, R as toNativeConfig, S as renderStateBlock, X as SUMMARY_IMAGE_MODES, Y as SUMMARY_IMAGE_CAPTION, _ as customPromptVariables, b as redactContentBlocks, c as markSummaryStart, d as recordContinuationOutcome, f as assertSummaryStructure, g as continuationText, h as composeHandoffDocument, k as routedTarget, l as recordBudgetFallback, m as buildInstruction, n as activeSummaryMode, o as lastCompactionFailure, p as buildCustomInstruction, s as markSummaryEnd, t as optionalService, u as recordCompactionFailure, x as redactSecrets, y as omittedStateNames } from "./chunks/services.js";
import z from "@deepseek-ai/schemastery";
import { estimateMessage, estimateToolsTokens } from "@deepseek-ai/dsh-token-meter/estimate";
import { ManualCompactionError } from "@deepseek-ai/dsh-compaction";
import { BasicCompactionEngine } from "@deepseek-ai/dsh-compaction-basic";
import { BlockAssembler, LlmError, contentHasImage, createUserMessage, errorChain } from "@deepseek-ai/dsh-llm";
import { deflateSync } from "node:zlib";
import { chmod, mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
// src/summary-image.ts
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
/** Fixed page width in pixels; shared by every page so a page break never reflows. */
const PAGE_WIDTH = 860;
/** Horizontal inset applied to the header, the body, and the page index. */
const PADDING_X = 44;
/** Usable text width between the insets. */
const CONTENT_WIDTH = 772;
/** Header font size in pixels. */
const HEADER_FONT_SIZE = 13;
/** Page index font size in pixels. */
const FOOTER_FONT_SIZE = 13;
/** Distance from the page top to the header's top edge. */
const HEADER_TOP = 32;
/** Space below the last body line, holding the page index. */
const FOOTER_HEIGHT = 36;
/** Body top edge; derived from the header geometry above. */
const BODY_TOP = 78;
/** Page background. */
const BACKGROUND_COLOR = "#ffffff";
/** Body glyph color. */
const BODY_COLOR = "#111111";
/** Header and page-index color. */
const MUTED_COLOR = "#555555";
/** Separator rule color. */
const RULE_COLOR = "#d0d0d0";
/**
* Default body layout: 16px on a 25px leading, 40 lines per page.
*
* A full page stays near 1100px tall, so the page cap and the request pixel
* budget both hold without touching the type size.
*/
const DEFAULT_LAYOUT = Object.freeze({
	fontSize: 16,
	lineHeight: 25,
	maxLines: 40
});
/**
* Compact body layout, used only when `DEFAULT_LAYOUT` overflows the page cap:
* 14px on a 22px leading, 48 lines per page — about 30% more text per page.
*/
const COMPACT_LAYOUT = Object.freeze({
	fontSize: 14,
	lineHeight: 22,
	maxLines: 48
});
/**
* CJK families probed in priority order.
*
* The first installed one becomes the stack's CJK face; a face is required
* because the body text of a checkpoint summary is usually CJK.
*/
const CJK_FAMILIES = Object.freeze([
	"Microsoft YaHei",
	"Noto Sans SC",
	"Noto Sans CJK SC",
	"PingFang SC",
	"SimHei",
	"SimSun"
]);
/** Windows fallback font file, registered when the family list reports no CJK face. */
const WINDOWS_CJK_FONT_PATH = "C:\\Windows\\Fonts\\msyh.ttc";
/**
* Load `@napi-rs/canvas` on demand.
* @returns the canvas module namespace.
* @throws Error naming the missing dependency when the native module cannot load.
*/
async function loadCanvas() {
	try {
		return await import("@napi-rs/canvas");
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		throw new Error("dsh-better-compact: rendering the checkpoint summary as an image needs the optional dependency \"@napi-rs/canvas\" (install it with `npm install @napi-rs/canvas`): " + reason, { cause: error });
	}
}
/**
* Resolve a CJK-capable font family for the body and header.
* @param api - the loaded canvas module.
* @returns the family name to place in the font stack.
* @throws Error when no CJK font can be found at all.
*/
async function resolveCjkFamily(api) {
	const installed = new Set(api.GlobalFonts.families.map((entry) => entry.family));
	const detected = CJK_FAMILIES.find((family) => installed.has(family));
	if (detected !== void 0) return detected;
	const { existsSync } = await import("node:fs");
	if (existsSync(WINDOWS_CJK_FONT_PATH)) try {
		if (api.GlobalFonts.registerFromPath(WINDOWS_CJK_FONT_PATH) !== null) return "Microsoft YaHei";
	} catch {}
	throw new Error("dsh-better-compact: no CJK font is available, so the checkpoint summary image would render as empty boxes. Install one of: " + CJK_FAMILIES.join(", "));
}
/**
* Build the CSS font shorthand used for every text run.
* @param family - resolved CJK family, kept as the fallback after monospace.
* @param size - font size in pixels.
* @returns a canvas `font` value.
*/
function fontStack(family, size) {
	return `${size}px monospace, "${family}", sans-serif`;
}
/**
* Test whether a code point is a wide glyph (CJK, full-width form, emoji).
*
* Wide glyphs are the only characters allowed to break anywhere; Latin runs are
* kept whole so words are not cut mid-token.
* @param codePoint - the code point to classify.
* @returns true when the glyph occupies a full em and may break on either side.
*/
function isWideCodePoint(codePoint) {
	return codePoint >= 4352 && (codePoint <= 4447 || codePoint === 9001 || codePoint === 9002 || codePoint >= 11904 && codePoint <= 42191 && codePoint !== 12351 || codePoint >= 44032 && codePoint <= 55203 || codePoint >= 63744 && codePoint <= 64255 || codePoint >= 65072 && codePoint <= 65135 || codePoint >= 65280 && codePoint <= 65376 || codePoint >= 65504 && codePoint <= 65510 || codePoint >= 127744 && codePoint <= 129535 || codePoint >= 131072 && codePoint <= 262141);
}
/**
* Split one logical line into wrappable tokens.
* @param line - one source line, tabs already expanded.
* @returns tokens where wide glyphs stand alone, Latin runs and single spaces are whole.
*/
function tokenizeLine(line) {
	const tokens = [];
	let run = "";
	for (const char of line) {
		if (char === " " || char === "	") {
			if (run !== "") {
				tokens.push(run);
				run = "";
			}
			tokens.push(char);
			continue;
		}
		if (isWideCodePoint(char.codePointAt(0) ?? 0)) {
			if (run !== "") {
				tokens.push(run);
				run = "";
			}
			tokens.push(char);
			continue;
		}
		run += char;
	}
	if (run !== "") tokens.push(run);
	return tokens;
}
/**
* Wrap one logical line to the content width.
* @param ctx - context whose font is already the body font.
* @param line - one source line.
* @param maxWidth - usable pixel width.
* @returns the visual lines, never empty.
*/
function wrapLine(ctx, line, maxWidth) {
	const wrapped = [];
	let current = "";
	for (const token of tokenizeLine(line)) {
		if (token === " " && current === "") continue;
		if (ctx.measureText(current + token).width <= maxWidth) {
			current += token;
			continue;
		}
		if (current !== "") {
			wrapped.push(current.trimEnd());
			current = "";
			if (token === " ") continue;
		}
		if (ctx.measureText(token).width <= maxWidth) {
			current = token;
			continue;
		}
		for (const char of token) {
			if (current !== "" && ctx.measureText(current + char).width > maxWidth) {
				wrapped.push(current);
				current = "";
			}
			current += char;
		}
	}
	if (current !== "" || wrapped.length === 0) wrapped.push(current);
	return wrapped;
}
/**
* Wrap a whole checkpoint text into visual lines.
* @param ctx - context whose font is already the body font.
* @param text - the checkpoint text.
* @param maxWidth - usable pixel width.
* @returns every visual line, in order; at least one (possibly empty) line.
*/
function wrapText(ctx, text, maxWidth) {
	const sourceLines = text.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n");
	while (sourceLines.length > 1 && sourceLines[sourceLines.length - 1]?.trim() === "") sourceLines.pop();
	const lines = [];
	for (const line of sourceLines) lines.push(...wrapLine(ctx, line, maxWidth));
	return lines;
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
function planPages(lines, maxPages, maxLines) {
	const totalPages = Math.max(1, Math.ceil(lines.length / maxLines));
	const pageCount = Math.min(totalPages, maxPages);
	const truncated = totalPages > pageCount;
	const pages = [];
	let consumed = 0;
	for (let index = 0; index < pageCount; index += 1) {
		const capacity = index === pageCount - 1 && truncated ? maxLines - 1 : maxLines;
		const slice = lines.slice(consumed, consumed + capacity);
		consumed += slice.length;
		pages.push(slice);
	}
	if (pages.length === 0) pages.push([]);
	return {
		pages,
		omitted: lines.length - consumed,
		totalPages
	};
}
/**
* The line appended to a truncated last page, so nothing disappears silently.
* @param omitted - how many wrapped body lines the page cap dropped.
* @returns the marker line.
*/
function omissionMarker(omitted) {
	return `… (${omitted} more line(s) omitted; the full checkpoint text stays in the session record)`;
}
/**
* Shorten one line so it fits the content width, ending it with an ellipsis.
* @param ctx - context whose font is already the target font.
* @param text - the single line to fit.
* @param maxWidth - usable pixel width.
* @returns the text unchanged when it fits, else a truncated form.
*/
function fitText(ctx, text, maxWidth) {
	if (ctx.measureText(text).width <= maxWidth) return text;
	let fitted = "";
	for (const char of text) {
		if (ctx.measureText(`${fitted}${char}…`).width > maxWidth) break;
		fitted += char;
	}
	return `${fitted}…`;
}
/** PNG signature: the 8 bytes every decoder checks first. */
const PNG_SIGNATURE = Uint8Array.from([
	137,
	80,
	78,
	71,
	13,
	10,
	26,
	10
]);
/** CRC-32 lookup table for the PNG chunk trailer. */
const CRC_TABLE = (() => {
	const table = /* @__PURE__ */ new Uint32Array(256);
	for (let index = 0; index < 256; index += 1) {
		let value = index;
		for (let bit = 0; bit < 8; bit += 1) value = (value & 1) !== 0 ? 3988292384 ^ value >>> 1 : value >>> 1;
		table[index] = value >>> 0;
	}
	return table;
})();
/**
* CRC-32 of one PNG chunk payload, as the format's chunk trailer requires.
* @param bytes - the chunk type plus its data.
* @returns the unsigned checksum.
*/
function crc32(bytes) {
	let crc = 4294967295;
	for (const byte of bytes) crc = (CRC_TABLE[(crc ^ byte) & 255] ^ crc >>> 8) >>> 0;
	return (crc ^ 4294967295) >>> 0;
}
/**
* Build one length-prefixed, CRC-trailed PNG chunk.
* @param type - the 4-character chunk type.
* @param data - the chunk payload.
* @returns the encoded chunk.
*/
function pngChunk(type, data) {
	const body = Buffer.concat([Buffer.from(type, "ascii"), Buffer.from(data)]);
	const length = Buffer.alloc(4);
	length.writeUInt32BE(data.length, 0);
	const checksum = Buffer.alloc(4);
	checksum.writeUInt32BE(crc32(body), 0);
	return Buffer.concat([
		length,
		body,
		checksum
	]);
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
function encodeGrayscalePng(pixels, width, height) {
	const stride = width + 1;
	const raw = Buffer.alloc(height * stride);
	for (let y = 0; y < height; y += 1) {
		const rowStart = y * stride;
		raw[rowStart] = 0;
		for (let x = 0; x < width; x += 1) {
			const offset = (y * width + x) * 4;
			const alpha = pixels[offset + 3] ?? 0;
			const luma = .299 * (pixels[offset] ?? 0) + .587 * (pixels[offset + 1] ?? 0) + .114 * (pixels[offset + 2] ?? 0) + (255 - alpha);
			raw[rowStart + 1 + x] = luma >= 255 ? 255 : luma <= 0 ? 0 : Math.round(luma);
		}
	}
	const header = Buffer.alloc(13);
	header.writeUInt32BE(width, 0);
	header.writeUInt32BE(height, 4);
	header[8] = 8;
	header[9] = 0;
	return new Uint8Array(Buffer.concat([
		Buffer.from(PNG_SIGNATURE),
		pngChunk("IHDR", header),
		pngChunk("IDAT", deflateSync(raw, { level: 9 })),
		pngChunk("IEND", /* @__PURE__ */ new Uint8Array(0))
	]));
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
function renderPage(api, family, header, bodyLines, pageIndex, pageCount, layout) {
	const height = BODY_TOP + bodyLines.length * layout.lineHeight + FOOTER_HEIGHT;
	const canvas = api.createCanvas(PAGE_WIDTH, height);
	const ctx = canvas.getContext("2d");
	ctx.textBaseline = "top";
	ctx.fillStyle = BACKGROUND_COLOR;
	ctx.fillRect(0, 0, PAGE_WIDTH, height);
	ctx.fillStyle = MUTED_COLOR;
	ctx.font = fontStack(family, HEADER_FONT_SIZE);
	const headerText = header.trim();
	if (headerText !== "") ctx.fillText(fitText(ctx, headerText, CONTENT_WIDTH), PADDING_X, HEADER_TOP);
	ctx.strokeStyle = RULE_COLOR;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(PADDING_X, 62.5);
	ctx.lineTo(816, 62.5);
	ctx.stroke();
	ctx.fillStyle = BODY_COLOR;
	ctx.font = fontStack(family, layout.fontSize);
	bodyLines.forEach((line, index) => {
		if (line !== "") ctx.fillText(line, PADDING_X, BODY_TOP + index * layout.lineHeight);
	});
	ctx.fillStyle = MUTED_COLOR;
	ctx.font = fontStack(family, FOOTER_FONT_SIZE);
	ctx.textAlign = "right";
	ctx.fillText(`${pageIndex}/${pageCount}`, 816, height - FOOTER_HEIGHT + 11);
	return {
		data: encodeGrayscalePng(canvas.data(), PAGE_WIDTH, height),
		mediaType: "image/png",
		name: `compaction-summary-${pageIndex}.png`,
		width: PAGE_WIDTH,
		height
	};
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
function planRequest(api, family, text, maxPages, layout) {
	const measureCtx = api.createCanvas(CONTENT_WIDTH, layout.lineHeight).getContext("2d");
	measureCtx.font = fontStack(family, layout.fontSize);
	return planPages(wrapText(measureCtx, text, CONTENT_WIDTH), maxPages, layout.maxLines);
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
async function renderSummaryImages(request, maxPages = 2) {
	const limit = Number.isFinite(maxPages) ? Math.max(1, Math.trunc(maxPages)) : 2;
	const api = await loadCanvas();
	const family = await resolveCjkFamily(api);
	const defaultPlan = planRequest(api, family, request.text, limit, DEFAULT_LAYOUT);
	const plan = defaultPlan.totalPages > limit ? planRequest(api, family, request.text, limit, COMPACT_LAYOUT) : defaultPlan;
	const layout = defaultPlan.totalPages > limit ? COMPACT_LAYOUT : DEFAULT_LAYOUT;
	const pageCount = plan.pages.length;
	return plan.pages.map((bodyLines, index) => {
		const finalLines = index === pageCount - 1 && plan.omitted > 0 ? [...bodyLines, omissionMarker(plan.omitted)] : bodyLines;
		return renderPage(api, family, request.title, finalLines, index + 1, pageCount, layout);
	});
}
// src/handoff.ts
/**
* Per-attempt temporary handoff files.
*
* The file is written under the operating system temp directory, in a fresh
* directory per attempt, with owner-only permissions, then read back and
* compared byte-for-byte. A failure at any step throws, so the native
* transaction never installs a checkpoint that points at an unverified file.
*
* The file is a convenience copy only: the same Markdown body is embedded in
* the native checkpoint replacement by the engine. Deleting the file therefore
* does not break replay, and there is deliberately no cleanup scheduler or
* sidecar index here.
*/
/** Directory prefix for every attempt. */
const HANDOFF_DIR_PREFIX = "dsh-better-compact-";
/**
* Permission proof used for the handoff file.
*
* POSIX systems expose the requested `0600` mode through `stat().mode`.
* Windows has no POSIX mode bits: Node reports a synthetic value derived from
* the read-only attribute (`0666` or `0444`), and `chmod` only toggles that
* attribute. The file still lives under the per-user `%TEMP%` directory, which
* is the platform's owner-only boundary; an ACL check is not available from
* Node's standard library without native modules, so the POSIX mode assertion
* is skipped there rather than failing every legitimate write.
*
* @param platform - Node `process.platform` value.
* @returns the proof policy that applies.
*/
function handoffPermissionPolicy(platform = process.platform) {
	return platform === "win32" ? "windows-owner-temp" : "posix-0600";
}
/**
* Sanitize a session id into a path-safe, still-recognizable component.
* @param sessionId - raw session id.
* @returns path-safe id.
*/
function safeSessionComponent(sessionId) {
	const text = String(sessionId ?? "session").replace(/[^A-Za-z0-9._-]/g, "_");
	return text.slice(0, 80).length > 0 ? text.slice(0, 80) : "session";
}
/**
* Create the attempt directory and the exact target path. Exposed so the
* engine can embed the real path in the document before the write; callers
* that already have a body can pass it straight to {@link writeHandoffFile}.
*/
async function prepareHandoffFile(input = {}) {
	const attemptId = input.attemptId ?? randomUUID();
	const createdAt = input.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	const directory = await mkdtemp(join(tmpdir(), HANDOFF_DIR_PREFIX));
	await chmod(directory, 448);
	const stamp = createdAt.replace(/[:.]/g, "-");
	return {
		directory,
		path: join(directory, `${safeSessionComponent(input.sessionId)}-${stamp}-${attemptId}.md`),
		attemptId,
		createdAt
	};
}
/**
* Write one handoff Markdown document, verify permissions and content by
* reading it back, and return the exact path that can be shown to the user.
*
* @param input - write inputs.
* @returns verified file facts.
* @throws {Error} when the directory, write, permission, or read-back check fails.
*/
async function writeHandoffFile(input) {
	const prepared = await prepareHandoffFile(input);
	const permissionPolicy = handoffPermissionPolicy(input.platform ?? process.platform);
	const statFile = input.statFile ?? stat;
	const body = typeof input.makeBody === "function" ? input.makeBody(prepared.path) : input.body;
	if (typeof body !== "string" || body.trim().length === 0) throw new Error("handoff: refusing to write an empty document");
	try {
		await writeFile(prepared.path, body, {
			encoding: "utf8",
			mode: 384,
			flag: "wx"
		});
		await chmod(prepared.path, 384);
		const info = await statFile(prepared.path);
		if (!info.isFile()) throw new Error(`handoff file ${prepared.path} is not a regular file`);
		if (permissionPolicy === "posix-0600" && (info.mode & 511) !== 384) throw new Error(`handoff file ${prepared.path} has mode ${(info.mode & 511).toString(8)}; expected 600 (owner-only)`);
		if (await readFile(prepared.path, "utf8") !== body) throw new Error(`handoff file ${prepared.path} did not read back identically; refusing to install the checkpoint`);
		return {
			...prepared,
			bytes: Buffer.byteLength(body, "utf8"),
			body,
			permissionPolicy
		};
	} catch (error) {
		throw new Error(`handoff: could not write and verify ${prepared.path}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
	}
}
// src/state.ts
/**
* Read the goal with its exact live-agent identity, or a diagnostic.
*
* The lookup is deliberately not routed through {@link optionalService}: an
* unreadable goal service must surface as `goalError` (and thus as a prompt
* diagnostic), not look like "this session has no goal".
*/
function readGoal(ctx, agent) {
	try {
		const goals = ctx.get("goals");
		if (goals === void 0) return { goal: null };
		const goal = goals.get(agent);
		if (goal === void 0) return { goal: null };
		return { goal: {
			id: goal.id,
			revision: goal.revision,
			objective: goal.objective,
			phase: goal.phase,
			roundsStarted: goal.roundsStarted,
			maxGoalRounds: goal.maxGoalRounds,
			...goal.blockedReason === void 0 ? {} : { blockedReason: goal.blockedReason }
		} };
	} catch (error) {
		return {
			goal: null,
			goalError: error instanceof Error ? error.message : String(error)
		};
	}
}
/** Read the native todo projection from the owning session. */
function readTodos(values) {
	const todos = values.todos;
	return Array.isArray(todos) ? todos.map((todo) => ({
		content: todo.content,
		status: todo.status
	})) : [];
}
/** Read pending user questions (all still-answerable entries, read-only). */
function readQuestions(values) {
	try {
		const active = values.userQuestions?.active;
		if (!Array.isArray(active)) return [];
		return active.map((question) => {
			const items = Array.isArray(question.questions) ? question.questions : [];
			return {
				callId: question.callId,
				state: question.state,
				questions: items.map((item) => ({
					id: item.id,
					question: item.question,
					...item.header === void 0 ? {} : { header: item.header }
				}))
			};
		});
	} catch {
		return [];
	}
}
/** Read jobs owned by this exact session that are still running. */
function readRunningJobs(ctx, agent) {
	try {
		const jobs = optionalService(ctx, "jobs");
		if (jobs === void 0) return [];
		return jobs.list(agent.id).filter((job) => job.owner === agent.id && (job.status === "running" || job.status === "stopping")).map((job) => ({
			id: job.id,
			kind: job.kind,
			label: job.label,
			status: job.status
		}));
	} catch {
		return [];
	}
}
/** Read live child agents of this agent that are currently running a turn. */
function readRunningChildren(ctx, agent) {
	try {
		const agents = optionalService(ctx, "agents");
		if (agents === void 0) return [];
		const all = agents.list();
		const byId = new Map(all.map((candidate) => [candidate.id, candidate]));
		const running = [];
		for (const candidate of all) {
			if (candidate.id === agent.id || candidate.status !== "running") continue;
			let cursor = candidate;
			let depth = 0;
			let matched = false;
			const seen = /* @__PURE__ */ new Set();
			while (cursor !== void 0 && depth < 64) {
				const parentId = cursor.session?.header?.parentSession;
				if (parentId === void 0) break;
				depth += 1;
				if (parentId === agent.id) {
					matched = true;
					break;
				}
				if (seen.has(parentId)) break;
				seen.add(parentId);
				cursor = byId.get(parentId);
			}
			if (matched) running.push({
				id: candidate.id,
				depth,
				...candidate.session?.header?.agentPreset === void 0 ? {} : { label: `child preset ${candidate.session.header.agentPreset}` }
			});
		}
		return running;
	} catch {
		return [];
	}
}
/**
* Collect the authoritative state injected into an enhanced summary.
*
* The projection lookup is deliberately not routed through
* {@link optionalService}: an unreadable registered projection must fail the
* whole collection instead of masquerading as "no pending work".
*
* @param ctx - engine context.
* @param agent - target live agent.
* @returns state.
*/
function collectAuthoritativeState(ctx, agent) {
	const { goal, goalError } = readGoal(ctx, agent);
	let values = {};
	const projections = ctx.get("sessionProjections");
	if (projections !== void 0) values = projections.snapshot(agent.session, /* @__PURE__ */ new Set(["todos", "userQuestions"])).values;
	return {
		goal,
		...goalError === void 0 ? {} : { goalError },
		todos: readTodos(values),
		questions: readQuestions(values),
		jobs: readRunningJobs(ctx, agent),
		children: readRunningChildren(ctx, agent)
	};
}
/**
* Reasons the handoff mode must NOT schedule an automatic continuation.
* An empty array means continuing is allowed by the read-only state.
*
* @param ctx - engine context.
* @param agent - target live agent.
* @returns blockers plus collected state.
*/
function handoffContinuationBlockers(ctx, agent) {
	const state = collectAuthoritativeState(ctx, agent);
	const blockers = [];
	if (agent.status !== "idle") blockers.push(`agent status is ${String(agent.status)}, not idle`);
	const inbox = agent.inbox;
	if (inbox !== void 0 && (inbox.nextTurn.length > 0 || inbox.nextStep.length > 0)) blockers.push("the agent has queued input; that input owns the next turn");
	if (state.goal !== null && (state.goal.phase === "paused" || state.goal.phase === "blocked")) blockers.push(`the goal is ${state.goal.phase}; a handoff continuation must not resume it`);
	if (state.questions.length > 0) blockers.push("a user question is still pending");
	if (state.jobs.length > 0) blockers.push("a background job owned by this session is still running");
	if (state.children.length > 0) blockers.push("a child agent is still running");
	return {
		blockers,
		state
	};
}
// src/engine.ts
/**
* dsh-better-compact engine — one native-compatible compaction provider.
*
* This class extends `BasicCompactionEngine` and customizes only its public
* `summarize()` hook (plus the manual entry's post-success continuation and a
* cross-realm guard). Selection, retention, the durable compaction transaction,
* locking, flush, overflow recovery, and retry bounds all stay in the inherited
* native implementation: successful compactions still produce exactly the
* native `compaction/start` → `compaction/summary` → checkpoint replacement →
* `compaction/end` sequence.
*
* The enhanced modes reuse the native one-shot request shape (replayed
* system/tool/history prefix + a final user instruction) so the provider's warm
* prefix stays reusable; only the instruction, authoritative state, reasoning
* effort, and post-output validation differ. Native mode delegates to the
* inherited implementation untouched.
*
* The `BETTER_COMPACT_ROUTE` and `BETTER_COMPACT_BUDGET` failure codes are this
* plugin's own inspect classification vocabulary, carried on `LlmError` because
* that is the failure type the compaction seam already surfaces. Upstream types
* its code parameter as the builtin set only, and the constructor does not
* validate it, so those two literals are asserted once at each site.
*/
/** Empty engine row config: every setting lives on the host companion row. */
const EMPTY_CONFIG = z.object({});
/**
* Upstream request image pixel budget (2048×2048). A request carrying more
* total image pixels than this has its images offloaded to placeholder text by
* the adapter, which would drop the checkpoint content the model needs.
*/
const REQUEST_IMAGE_PIXEL_BUDGET = 4194304;
/**
* Run one summary-image step, mapping any failure to the fail-closed code. A
* checkpoint the operator asked to rasterize never degrades to text silently.
* @param what - readable description of the failed step.
* @param run - step to execute.
* @returns the step result.
* @throws {LlmError} with code BETTER_COMPACT_IMAGE when the step rejects.
*/
async function imageStep(what, run) {
	try {
		return await run();
	} catch (error) {
		throw new LlmError(`better-compact: ${what}: ${errorChain(error)}`, "BETTER_COMPACT_IMAGE");
	}
}
/** Verified handoff path per session, consumed by the manual entry point. */
const handoffBySession = /* @__PURE__ */ new Map();
/** Manual compactions that already scheduled their one continuation. */
const continuedCompactions = /* @__PURE__ */ new Set();
/** Keep process-local auxiliary maps bounded. */
function remember(map, key, value) {
	map.delete(key);
	map.set(key, value);
	while (map.size > 200) map.delete(map.keys().next().value);
}
/**
* The instruction the auxiliary request ends with, priced as a user message.
* `estimateMessage` reads only `role` and `content`, so the identity fields a
* durable message also carries cannot change the estimate.
* @param text - rendered instruction.
* @returns one user-role message carrying exactly that text.
*/
function instructionMessage(text) {
	return createUserMessage({
		content: [{
			type: "text",
			text
		}],
		source: { kind: "user" }
	});
}
/**
* Whether an error is a cancellation/abort rather than a content failure.
* @param error - caught value.
* @returns true for code or message naming an abort/cancellation.
*/
function isCancellation(error) {
	const carrier = error;
	const code = typeof carrier?.code === "string" ? carrier.code : "";
	const message = typeof carrier?.message === "string" ? carrier.message : String(error);
	return /abort|cancel/i.test(code) || /abort|cancel/i.test(message);
}
/**
* Map a terminal summarization finish to the native fail-closed error.
* @param finish - assembler finish reason.
* @returns the error to raise, or undefined when the finish is usable.
*/
function finishError(finish) {
	switch (finish.kind) {
		case "error":
		case "aborted": return new LlmError(finish.failure.message, finish.failure.code, finish.failure);
		case "max-tokens": {
			const error = /* @__PURE__ */ new Error("summarization truncated at the token cap (incomplete checkpoint)");
			error.code = "MAX_TOKENS";
			return error;
		}
		default: return;
	}
}
/**
* Classify a failure for the inspect status vocabulary.
* @param error - caught value.
* @returns the inspect status for that failure.
*/
function classifyFailure(error) {
	if (error instanceof ManualCompactionError) {
		if (error.code === "cancelled") return "cancelled";
		if (error.code === "persistence") return "persistence-error";
		return "failed";
	}
	return isCancellation(error) ? "cancelled" : "failed";
}
/**
* Build the target-resolution failure used when no route exists.
* @returns the actionable route failure.
*/
function noTargetError() {
	return new LlmError("no provider/model available for summarization: set both summarizationProvider and summarizationModel, route one request, or set both AgentOptions fields", "BETTER_COMPACT_ROUTE");
}
/**
* Fall back to the AgentOptions pair when no request was routed yet.
* @param agent - agent whose routing options are read.
* @returns the configured target, or undefined when either side is empty.
*/
function routeFromAgentOptions(agent) {
	const provider = agent.options?.provider;
	const model = agent.options?.model;
	if (typeof provider !== "string" || provider.length === 0) return void 0;
	if (typeof model !== "string" || model.length === 0) return void 0;
	return {
		provider,
		model
	};
}
var BetterCompactEngine = class extends BasicCompactionEngine {
	static inject = [...BasicCompactionEngine.inject, "betterCompactConfig"];
	static Config = EMPTY_CONFIG;
	/** Marker used by tests and diagnostics; never a behavioral branch. */
	static betterCompactEngine = true;
	/**
	* @param ctx - engine context.
	* @param rowConfig - engine row config (always empty in shipped patches).
	*/
	constructor(ctx, rowConfig = {}) {
		const companion = ctx.get("betterCompactConfig");
		if (companion === void 0) throw new Error("dsh-better-compact/engine: the host companion row \"dsh-better-compact\" is not mounted; the engine cannot read its configuration snapshot");
		const snapshot = companion.snapshot();
		let engine;
		const engineCtx = ctx.extend({ on(event, listener, options) {
			if (![
				"agent/pre-step",
				"agent/request",
				"agent/request-error"
			].includes(event)) return ctx.on(event, listener, options);
			return ctx.on(event, function(payload, next) {
				if (engine._supersededByPreset(payload.agent)) return next();
				return listener.call(this, payload, next);
			}, options);
		} });
		super(engineCtx, toNativeConfig(snapshot));
		engine = this;
		this.snapshot = snapshot;
		this.mode = snapshot.mode;
		this.rowConfigEmpty = Object.keys(rowConfig ?? {}).length === 0;
	}
	/**
	* Summarize the replayed conversation region.
	* Native mode delegates entirely to the inherited implementation.
	* @param input - replayed conversation prefix to condense.
	* @param agent - owner of the summarized session.
	* @param signal - optional cancellation forwarded to the adapter.
	* @returns safe text summary blocks and the exact auxiliary call envelope.
	*/
	async summarize(input, agent, signal) {
		markSummaryStart(agent.session, this.mode);
		try {
			if (this.mode === "native") return await super.summarize(input, agent, signal);
			return await this._summarizeEnhanced(input, agent, signal);
		} finally {
			markSummaryEnd(agent.session.id);
		}
	}
	/**
	* Automatic pressure/overflow entry. A Web session that selected a preset
	* gets its own isolated `compaction` service, and that preset engine receives
	* the same agent-scoped events. The host-plane engine must stay out of the
	* way instead of double-compacting; a preset with no compaction group has no
	* preset service and correctly falls back to this row.
	* @param agent - agent whose latest routed request is measured.
	* @param trigger - normal step-boundary pressure or overflow recovery.
	* @param signal - live turn cancellation signal.
	* @returns the compaction result, or null when nothing was compacted.
	*/
	async compactIfNeeded(agent, trigger, signal) {
		if (this._supersededByPreset(agent)) return null;
		try {
			return await super.compactIfNeeded(agent, trigger, signal);
		} catch (error) {
			recordCompactionFailure(agent.session, classifyFailure(error), errorChain(error));
			throw error;
		}
	}
	/**
	* Manual idle compaction. On a live successful handoff compaction it
	* schedules exactly one ordinary same-session follow-up, subject to the
	* documented read-only safety checks.
	* @param agent - idle agent whose next-turn admission this call reserves.
	* @param signal - cancellation scoped to this compaction request.
	* @param sourceCommandId - initiating command identity for presentation.
	* @returns the committed result, or null when no safe useful range exists.
	*/
	async compactNow(agent, signal, sourceCommandId) {
		try {
			const result = await super.compactNow(agent, signal, sourceCommandId);
			if (result !== null) {
				if (this.mode === "handoff") await this._maybeContinue(agent, result, signal);
				else handoffBySession.delete(agent.session.id);
			}
			return result;
		} catch (error) {
			if (!(error instanceof ManualCompactionError && error.code === "busy")) recordCompactionFailure(agent.session, classifyFailure(error), errorChain(error));
			throw error;
		}
	}
	/**
	* Whether a preset-owned engine supersedes this host-plane instance.
	* @param agent - agent whose isolated compaction service is inspected.
	* @returns true when another engine owns this agent's compaction.
	*/
	_supersededByPreset(agent) {
		const presets = optionalService(this.ctx, "agentPresets");
		if (presets === void 0) return false;
		try {
			const mounted = presets.serviceFor(agent, "compaction");
			return mounted !== void 0 && serviceIdentity(mounted) !== serviceIdentity(this);
		} catch {
			return false;
		}
	}
	/**
	* Resolve the summary route exactly like the native engine.
	* @param agent - agent whose routed target and options are read.
	* @returns the resolved target and its effective policy.
	* @throws with code BETTER_COMPACT_ROUTE when no route exists.
	*/
	_resolveRoute(agent) {
		const snapshot = this.snapshot;
		const conversationTarget = routedTarget(agent.session) ?? routeFromAgentOptions(agent);
		const policy = conversationTarget === void 0 ? {
			summarizationProvider: snapshot.summarizationProvider,
			summarizationModel: snapshot.summarizationModel,
			maxTokens: snapshot.maxTokens
		} : resolveTargetPolicy(snapshot, conversationTarget);
		const configured = policy.summarizationProvider.length > 0 ? {
			provider: policy.summarizationProvider,
			model: policy.summarizationModel
		} : void 0;
		const latest = routedTarget(agent.session);
		const target = configured ?? latest ?? routeFromAgentOptions(agent);
		if (target === void 0) throw noTargetError();
		return {
			target,
			policy
		};
	}
	/**
	* Validate the saved effort against the exact summary model's capabilities.
	* @param info - resolved model facts for the summary target.
	* @returns the supported effort, or undefined when none is configured.
	* @throws with code UNSUPPORTED_REASONING_EFFORT when the model cannot honor it.
	*/
	_resolveEffort(info) {
		const effort = this.snapshot.reasoningEffort;
		if (effort.length === 0) return void 0;
		const reasoning = info.reasoning;
		if (reasoning === void 0 || !reasoning.efforts.some((candidate) => candidate.id === effort)) throw new LlmError(`provider "${info.provider}" model "${info.id}" does not support reasoning effort "${effort}"; choose a supported effort or clear reasoningEffort (no substitution is performed)`, "UNSUPPORTED_REASONING_EFFORT");
		return effort;
	}
	/**
	* Estimate the auxiliary request size under the fixed token-meter heuristic.
	* @param input - replayed conversation prefix.
	* @param instruction - rendered instruction added as the final user message.
	* @param effortIgnored - reserved argument kept from the previous signature.
	* @returns estimated prompt tokens for that request.
	*/
	_estimateRequest(input, instruction, effortIgnored) {
		let tokens = 0;
		for (const message of input.messages) tokens += estimateMessage(message);
		tokens += estimateMessage(instructionMessage(instruction));
		if (this.snapshot.cachePriority && input.tools !== void 0) tokens += estimateToolsTokens({ tools: [...input.tools] });
		return tokens;
	}
	/**
	* Choose an instruction that fits the model context. Ordering keeps compact
	* pending work (questions/jobs/children) before the often-large todo list, so
	* a continuation checkpoint does not silently lose "wait for this" facts.
	* Every omission is disclosed in the instruction and recorded for inspect.
	* @param input - replayed conversation prefix.
	* @param state - collected authoritative state.
	* @param info - resolved model facts for the summary target.
	* @param maxTokens - generation cap reserved for the summary.
	* @param sessionId - session the omission record belongs to.
	* @returns the instruction text to send.
	* @throws with code BETTER_COMPACT_BUDGET when nothing fits.
	*/
	_chooseInstruction(input, state, info, maxTokens, sessionId) {
		const mode = this.mode;
		const contextWindow = info.context?.contextWindow;
		const present = omittedStateNames(state);
		const full = renderStateBlock(state, mode);
		const withoutTodos = present.includes("todos") ? renderStateBlock({
			...state,
			todos: []
		}, mode) : null;
		const goalOnly = renderStateBlock({
			goal: state.goal,
			...state.goalError === void 0 ? {} : { goalError: state.goalError },
			todos: [],
			questions: [],
			jobs: [],
			children: []
		}, mode);
		const empty = {
			text: "",
			trimmed: false,
			omitted: []
		};
		const candidates = [
			{
				block: full,
				omittedState: [],
				keptState: present
			},
			...withoutTodos === null ? [] : [{
				block: withoutTodos,
				omittedState: ["todos"],
				keptState: ["the goal", ...present.filter((name) => name !== "todos")]
			}],
			{
				block: goalOnly,
				omittedState: present,
				keptState: ["the goal"]
			},
			{
				block: empty,
				stateOmitted: true,
				omittedState: present,
				keptState: []
			}
		];
		const seen = /* @__PURE__ */ new Set();
		const unique = candidates.filter((candidate) => {
			const key = `${candidate.stateOmitted === true ? "omitted" : "included"}\u0000${candidate.block.text}`;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
		const record = (candidate) => {
			const omitted = [.../* @__PURE__ */ new Set([...candidate.omittedState, ...candidate.block.trimmed ? candidate.block.omitted : []])];
			if (omitted.length === 0) return;
			recordBudgetFallback(sessionId, omitted);
			this.ctx.logger.warn(`better-compact: summary budget omitted authoritative state (${omitted.join("; ")}); the checkpoint instruction discloses the omission`);
		};
		if (contextWindow === void 0) {
			record(unique[0]);
			return buildInstruction(mode, full);
		}
		for (const candidate of unique) {
			const instruction = buildInstruction(mode, candidate.block, {
				stateOmitted: candidate.stateOmitted === true,
				omittedState: candidate.omittedState,
				keptState: candidate.keptState
			});
			if (this._estimateRequest(input, instruction) + maxTokens <= contextWindow) {
				record(candidate);
				return instruction;
			}
		}
		throw new LlmError(`the summary request does not fit ${info.provider}/${info.id}: the replayed conversation plus maxTokens ${maxTokens} exceeds the ${contextWindow}-token context window; compact a smaller span, lower maxTokens, or choose a larger summary model`, "BETTER_COMPACT_BUDGET");
	}
	/**
	* Build the custom-mode instruction; the expanded prompt is the whole request.
	* @param input - replayed conversation prefix.
	* @param state - collected authoritative state.
	* @param info - resolved model facts for the summary target.
	* @param maxTokens - generation cap reserved for the summary.
	* @param sessionId - session identity exposed as a prompt variable.
	* @param target - resolved summary target.
	* @param policy - effective policy for that target.
	* @returns the expanded instruction text.
	* @throws with code BETTER_COMPACT_BUDGET when the request does not fit.
	*/
	_customInstruction(input, state, info, maxTokens, sessionId, target, policy) {
		const variables = customPromptVariables(state, {
			target,
			policy,
			sessionId
		});
		const instruction = buildCustomInstruction(this.snapshot.customPrompt, variables);
		const contextWindow = info?.context?.contextWindow;
		if (contextWindow !== void 0) {
			if (this._estimateRequest(input, instruction) + maxTokens > contextWindow) throw new LlmError(`the custom prompt plus the replayed conversation plus maxTokens ${maxTokens} exceeds the ${contextWindow}-token context window of ${target.provider}/${target.model}; shorten the prompt, lower maxTokens, or choose a larger summary model`, "BETTER_COMPACT_BUDGET");
		}
		return instruction;
	}
	/**
	* Enhanced-mode summarization (goal, handoff, or custom).
	* @param input - replayed conversation prefix to condense.
	* @param agent - owner of the summarized session.
	* @param signal - optional cancellation forwarded to the adapter.
	* @returns safe summary blocks and the exact auxiliary call envelope.
	*/
	async _summarizeEnhanced(input, agent, signal) {
		const { target, policy } = this._resolveRoute(agent);
		const maxTokens = policy.maxTokens;
		const info = await this.ctx.llm.resolveModelInfo(target.provider, target.model, signal);
		const effort = this._resolveEffort(info);
		const state = collectAuthoritativeState(this.ctx, agent);
		const instruction = this.mode === "custom" ? this._customInstruction(input, state, info, maxTokens, agent.session.id, target, policy) : this._chooseInstruction(input, state, info, maxTokens, agent.session.id);
		const finalMessage = deepFreeze({
			role: "user",
			content: [{
				type: "text",
				text: instruction
			}]
		});
		const messages = [...input.messages, finalMessage];
		const options = {
			provider: target.provider,
			model: target.model,
			messages,
			maxTokens,
			sessionId: agent.session.id,
			purpose: "compaction",
			...effort === void 0 ? {} : { reasoningEffort: effort },
			...signal === void 0 ? {} : { signal }
		};
		if (this.snapshot.cachePriority) {
			options.toolHistory = agent.session.toolHistory();
			if (input.tools !== void 0) options.tools = [...input.tools];
		}
		const assembler = new BlockAssembler();
		for await (const chunk of this.ctx.llm.stream(options)) assembler.push(chunk);
		const error = finishError(assembler.finish);
		if (error !== void 0) throw error;
		const rawOutput = assembler.blocks();
		if (contentHasImage(rawOutput)) throw new LlmError("compaction summary cannot contain image output", "UNSUPPORTED_CONTENT");
		const text = rawOutput.filter((block) => block.type === "text").map((block) => block.text).join("\n");
		assertSummaryStructure(text, this.mode);
		let finalText = text;
		if (this.mode === "handoff") {
			const redacted = redactSecrets(text);
			const createdAt = (/* @__PURE__ */ new Date()).toISOString();
			const written = await writeHandoffFile({
				sessionId: agent.session.id,
				createdAt,
				makeBody: (path) => composeHandoffDocument({
					body: redacted,
					path,
					sessionId: agent.session.id,
					createdAt
				})
			});
			remember(handoffBySession, agent.session.id, {
				path: written.path,
				bytes: written.bytes
			});
			finalText = written.body;
		}
		return {
			summary: this.snapshot.summaryImage && SUMMARY_IMAGE_MODES.includes(this.mode) ? await this.summaryImageBlocks(finalText, agent, signal) : [{
				type: "text",
				text: finalText
			}],
			rawOutput: this.mode === "handoff" ? redactContentBlocks(rawOutput) : rawOutput,
			llmStreamCall: true,
			provider: target.provider,
			model: target.model,
			maxTokens,
			...assembler.usage === void 0 ? {} : { usage: assembler.usage }
		};
	}
	/**
	* Render the checkpoint as image attachment(s) and cite them in place of the
	* text block. Fail-closed: a missing attachment store, a renderer failure, and
	* a storage failure all reject, so a session never silently keeps a text
	* checkpoint that the operator asked to rasterize.
	* @param text - final checkpoint text to rasterize.
	* @param agent - owner of the compacted session, named in the page title.
	* @param signal - cancellation forwarded to model-capability resolution.
	* @returns the caption block followed by one image block per rendered page.
	* @throws {LlmError} with code BETTER_COMPACT_IMAGE on any failure.
	*/
	async summaryImageBlocks(text, agent, signal) {
		const attachments = optionalService(this.ctx, "attachments");
		if (attachments === void 0) throw new LlmError("better-compact: summaryImage is enabled but the host attachments service is unavailable; the checkpoint cannot carry rendered images", "BETTER_COMPACT_IMAGE");
		await this.assertConversationAcceptsImages(agent, signal);
		const request = {
			text,
			title: `better-compact ${this.mode} checkpoint · ${agent.session.id}`
		};
		const pages = await imageStep("could not render the summary image checkpoint", () => renderSummaryImages(request));
		const refs = await imageStep("could not store the rendered summary image checkpoint", () => attachments.saveImages(pages.map((page) => ({
			data: page.data,
			mediaType: page.mediaType,
			name: page.name
		}))));
		const totalBytes = pages.reduce((total, page) => total + page.data.byteLength, 0);
		const totalPixels = pages.reduce((total, page) => total + page.width * page.height, 0);
		this.ctx.logger.info(`better-compact: attached ${pages.length} summary image page(s), ${totalBytes} bytes, ${totalPixels} pixels total`);
		if (totalPixels > REQUEST_IMAGE_PIXEL_BUDGET) this.ctx.logger.warn(`better-compact: the attached summary image(s) total ${totalPixels} pixels, above the ${REQUEST_IMAGE_PIXEL_BUDGET}-pixel request budget; the adapter may offload them to placeholder text and drop the checkpoint content`);
		return [{
			type: "text",
			text: SUMMARY_IMAGE_CAPTION
		}, ...refs.map((attachment) => ({
			type: "image",
			attachment
		}))];
	}
	/**
	* Reject a rendered checkpoint the conversation's own model could not read.
	*
	* The image blocks land in the compacted session, so the very next request
	* carries them; an adapter that refuses image input fails that request after
	* the checkpoint was already committed, which leaves the session unable to
	* continue. The check therefore uses the conversation target, not the summary
	* target. An undisclosed modality list stays fail-open: absence means unknown,
	* and aborting compaction over an unknown capability would be worse than the
	* rendering attempt itself.
	* @param agent - owner of the compacted session.
	* @param signal - cancellation forwarded to model resolution.
	* @throws {LlmError} with code BETTER_COMPACT_IMAGE when the model is text-only.
	*/
	async assertConversationAcceptsImages(agent, signal) {
		const conversationTarget = routedTarget(agent.session) ?? routeFromAgentOptions(agent);
		if (conversationTarget === void 0) return;
		const { provider, model } = conversationTarget;
		const inputModalities = (await this.ctx.llm.resolveModelInfo(provider, model, signal)).inputModalities;
		if (inputModalities === void 0) {
			this.ctx.logger.warn(`better-compact: image input capability unknown for ${provider}/${model}; attaching the rendered checkpoint anyway`);
			return;
		}
		if (inputModalities.includes("image")) return;
		throw new LlmError(`the conversation model ${provider}/${model} does not accept image input, so summaryImage cannot be used; turn it off or switch to a vision-capable model`, "BETTER_COMPACT_IMAGE");
	}
	/**
	* Schedule the one documented continuation after a successful manual handoff.
	* @param agent - agent whose manual compaction just committed.
	* @param result - committed compaction result.
	* @param signal - cancellation scoped to the manual request.
	*/
	async _maybeContinue(agent, result, signal) {
		const attempt = handoffBySession.get(agent.session.id) ?? null;
		handoffBySession.delete(agent.session.id);
		if (continuedCompactions.has(result.compactionId)) return;
		const record = (status, blockers) => recordContinuationOutcome(agent.session.id, {
			compactionId: result.compactionId,
			status,
			blockers
		});
		if (signal !== void 0 && signal.aborted) {
			record("skipped", ["the manual compaction request was cancelled"]);
			this.ctx.logger.info("better-compact: handoff continuation skipped because the request was cancelled");
			return;
		}
		if (this.ctx.get("agents")?.get(agent.id) !== agent) {
			record("skipped", ["the agent is no longer live"]);
			this.ctx.logger.warn("better-compact: handoff continuation skipped because the agent is no longer live");
			return;
		}
		const { blockers } = handoffContinuationBlockers(this.ctx, agent);
		if (blockers.length > 0) {
			record("skipped", blockers);
			this.ctx.logger.info(`better-compact: handoff continuation not scheduled (${blockers.join("; ")}); the handoff checkpoint and file remain available`);
			return;
		}
		try {
			agent.followup(createUserMessage({
				content: [{
					type: "text",
					text: continuationText(result, attempt?.path ?? null)
				}],
				source: { kind: "user" }
			}));
			continuedCompactions.add(result.compactionId);
			while (continuedCompactions.size > 200) continuedCompactions.delete(continuedCompactions.values().next().value);
			record("scheduled", []);
		} catch (error) {
			record("skipped", [`could not queue the continuation: ${errorChain(error)}`]);
			this.ctx.logger.warn(`better-compact: could not queue the handoff continuation: ${errorChain(error)}`);
			return;
		}
		try {
			await this.ctx.sessions.flush(agent.session);
		} catch (error) {
			this.ctx.logger.warn(`better-compact: the handoff continuation was queued but its inbox splice could not be flushed: ${errorChain(error)}; the turn may still start in this process`);
		}
	}
	/** Test/inspection helper: the mode this exact engine instance holds. */
	get activeMode() {
		return this.mode;
	}
	/**
	* Test/inspection helper: last process-observed failure for a session.
	* @param sessionId - session identity.
	* @returns the recorded failure, or undefined.
	*/
	failureFor(sessionId) {
		return lastCompactionFailure(sessionId);
	}
	/**
	* Test/inspection helper: whether a live summary attempt owns a session.
	* @param sessionId - session identity.
	* @returns the running attempt's mode, or null.
	*/
	activeSummaryFor(sessionId) {
		return activeSummaryMode(sessionId);
	}
	/**
	* Test helper: compare the frozen snapshot with a candidate config.
	* @param candidate - configuration value to compare.
	* @returns true when both normalize identically.
	*/
	snapshotEquals(candidate) {
		return configEquals(this.snapshot, candidate);
	}
};
export { BetterCompactEngine, BetterCompactEngine as default, BudgetConfigError };
