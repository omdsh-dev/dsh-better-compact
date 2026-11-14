/**
 * Host/client shared contract for dsh-better-compact.
 *
 * This module is the ONE place the two halves agree on stable identifiers,
 * wire shapes, and enum vocabulary. It must stay free of `node:` imports and of
 * host-only packages: the tsdown client bundle inlines it, so a Node builtin
 * here would break the browser bundle.
 *
 * Keep the runtime values byte-identical to the pre-TypeScript sources; the
 * types are new, the behaviour is not.
 */
/** npm package name and bundle row name. */
export declare const PACKAGE_NAME = "dsh-better-compact";
/** Host companion row id (also the settings namespace). */
export declare const ENTRY_ID = "dsh-better-compact";
/** Host-plane / preset engine row id. */
export declare const ENGINE_ENTRY_ID = "dsh-better-compact-engine";
/** Canonical `plugins.row.config` slot key. */
export declare const ROW_CONFIG_KEY = "dsh-better-compact#dsh-better-compact";
/** Better DSH declares the same stable row. */
export declare const BETTER_DSH_ROW_CONFIG_KEY = "dsh-better-dsh#dsh-better-compact";
/** Apollo's published scoped package name declares the same stable row. */
export declare const APOLLO_ROW_CONFIG_KEY = "@menghuan1918/dsh-apollo#dsh-better-compact";
/** Historical unscoped Apollo row key. */
export declare const APOLLO_LEGACY_ROW_CONFIG_KEY = "dsh-apollo#dsh-better-compact";
/** Every assembly's `plugins.row.config` key, in dispatch order. */
export declare const ROW_CONFIG_KEYS: readonly string[];
/** Supported compaction modes. */
export declare const MODES: readonly ["native", "goal", "handoff", "custom"];
/** One compaction strategy. */
export type CompactionMode = (typeof MODES)[number];
/** The two enhanced modes that render an authoritative state block. */
export type EnhancedMode = Exclude<CompactionMode, 'native' | 'custom'>;
/** Maximum characters accepted for a custom-mode instruction. */
export declare const MAX_CUSTOM_PROMPT_CHARS = 8000;
/** Exact inspect route pathname. */
export declare const INSPECT_PATH = "/better-compact/api/inspect";
/** Exact read-only models route pathname. */
export declare const MODELS_PATH = "/better-compact/api/models";
/** Slot namespace the settings row is registered under. */
export declare const ROW_CONFIG_SLOT = "plugins.row.config";
/** Locale namespace shared by the client half and the settings slot. */
export declare const LOCALE_NAMESPACE = "better-compact";
/**
 * Variables accepted by the custom-mode prompt editor and runtime expander.
 * Keep in sync with the client chip toolbar (both sides import this list).
 */
export declare const PROMPT_VARIABLES: readonly [Readonly<{
    token: "goal";
    label: "目标";
    hint: "当前目标 objective";
}>, Readonly<{
    token: "todos";
    label: "待办";
    hint: "当前待办列表";
}>, Readonly<{
    token: "questions";
    label: "待答问题";
    hint: "仍等待用户回答的问题";
}>, Readonly<{
    token: "jobs";
    label: "后台任务";
    hint: "运行中的后台任务";
}>, Readonly<{
    token: "children";
    label: "子代理";
    hint: "运行中的子代理";
}>, Readonly<{
    token: "date";
    label: "日期";
    hint: "压缩时的 ISO 时间";
}>, Readonly<{
    token: "session";
    label: "会话 ID";
    hint: "当前会话标识";
}>, Readonly<{
    token: "model";
    label: "摘要模型";
    hint: "provider/model";
}>, Readonly<{
    token: "trigger";
    label: "触发比例";
    hint: "有效触发百分比";
}>, Readonly<{
    token: "retain";
    label: "保留预算";
    hint: "固定 tokens 或百分比";
}>];
/** One custom-prompt placeholder. */
export type PromptVariable = (typeof PROMPT_VARIABLES)[number];
/** Placeholder token name without braces. */
export type PromptToken = PromptVariable['token'];
/** Value map the runtime expander substitutes. */
export type PromptVariableValues = Record<PromptToken, string>;
/** Modes whose checkpoint may carry the rendered summary image. */
export declare const SUMMARY_IMAGE_MODES: readonly CompactionMode[];
/** One-line framing attached next to the rendered summary image blocks. */
export declare const SUMMARY_IMAGE_CAPTION = "The checkpoint summary above this line is rendered as the image(s) below: read the continuation state from the image text.";
/**
 * Hard cap on rendered summary pages. Upstream pi-ai profiles price a whole
 * request version against a 2048x2048 pixel budget and a 1 MiB byte target, and
 * images past the budget are offloaded to placeholder text — which would lose
 * the checkpoint itself, not just a detail. Two pages of the renderer's
 * compact layout stay inside both the pixel budget and the 1 MiB byte target,
 * while the renderer's two font ladders keep ~96 lines of checkpoint text.
 */
export declare const SUMMARY_IMAGE_MAX_PAGES = 2;
/** One encoded summary page, shaped for `ctx.attachments.saveImages()`. */
export interface SummaryImagePage {
    readonly data: Uint8Array;
    readonly mediaType: 'image/png';
    /** Display name shown by attachment-aware clients. */
    readonly name: string;
    readonly width: number;
    readonly height: number;
}
/** Input of the summary-image renderer. */
export interface SummaryImageRequest {
    /** The checkpoint text to rasterize. */
    readonly text: string;
    /** Short header line rendered above the body, e.g. session and mode. */
    readonly title: string;
}
/** One exact-target override, as normalized by `readConfig`. */
export interface ModelPolicy {
    readonly provider: string;
    readonly model: string;
    readonly thresholdRatio?: number;
    readonly headroomTokens?: number;
    readonly retainRatio?: number;
    readonly retainTokens?: number;
    readonly summarizationProvider?: string;
    readonly summarizationModel?: string;
    readonly maxTokens?: number;
    readonly compactionRetries?: number;
    readonly maxOverflowRetries?: number;
}
/**
 * Normalized plugin configuration, as frozen by the companion at load time and
 * returned by `current()`. Exactly one of `retainRatio`/`retainTokens` is set.
 */
export interface ConfigSnapshot {
    readonly mode: CompactionMode;
    readonly auto: boolean;
    readonly thresholdRatio: number;
    readonly headroomTokens: number;
    readonly retainRatio: number | null;
    readonly retainTokens: number | null;
    readonly summarizationProvider: string;
    readonly summarizationModel: string;
    readonly reasoningEffort: string;
    readonly customPrompt: string;
    readonly cachePriority: boolean;
    /** Render the checkpoint summary as image attachment(s) instead of text blocks. */
    readonly summaryImage: boolean;
    readonly maxTokens: number;
    readonly compactionRetries: number;
    readonly maxOverflowRetries: number;
    readonly modelPolicies: readonly ModelPolicy[];
}
/** Goal phase vocabulary reported by the host goal service. */
export type GoalPhase = 'active' | 'paused' | 'blocked' | 'complete';
/** Read-only goal projection. */
export interface GoalSnapshot {
    readonly id: string;
    readonly revision: number;
    readonly objective: string;
    readonly phase: GoalPhase;
    readonly roundsStarted: number;
    readonly maxGoalRounds: number;
    readonly blockedReason?: {
        readonly code: string;
        readonly message: string;
    };
}
/** One authoritative todo entry. */
export interface TodoSnapshot {
    readonly content: string;
    readonly status: string;
}
/** One still-answerable question group. */
export interface PendingQuestion {
    readonly callId: string;
    readonly state: string;
    readonly questions: readonly {
        readonly id: string;
        readonly question: string;
        readonly header?: string;
    }[];
}
/** One running background job owned by the session. */
export interface RunningJobSnapshot {
    readonly id: string;
    readonly kind: string;
    readonly label: string;
    readonly status: string;
}
/** One running descendant agent. */
export interface RunningChildSnapshot {
    readonly id: string;
    readonly depth?: number;
    readonly label?: string;
}
/** Authoritative live state injected into an enhanced summary. */
export interface AuthoritativeState {
    readonly goal: GoalSnapshot | null;
    readonly goalError?: string;
    readonly todos: readonly TodoSnapshot[];
    readonly questions: readonly PendingQuestion[];
    readonly jobs: readonly RunningJobSnapshot[];
    readonly children: readonly RunningChildSnapshot[];
}
/** Renderable authoritative-state block. */
export interface StateBlock {
    readonly text: string;
    readonly trimmed: boolean;
    readonly omitted: readonly string[];
}
/** Which compaction engine actually serves a session. */
export interface InspectEngine {
    readonly owner: 'host' | 'better-compact-preset' | 'foreign-preset' | 'unknown';
    readonly inspectApplies: boolean;
    readonly reason: string | null;
}
/** Budget arithmetic section of the inspect payload. */
export interface InspectBudget {
    readonly target: {
        readonly provider: string;
        readonly model: string;
    } | null;
    readonly contextWindow: number | null;
    readonly reservedCompletionTokens: number | null;
    readonly messageBudgetTokens: number | null;
    readonly headroomTokens: number | null;
    readonly pressureBudgetTokens: number | null;
    readonly ratioThresholdTokens: number | null;
    readonly currentTokens: number | null;
    readonly measurement: 'measured' | 'estimated' | 'unavailable';
    readonly fixedTokens: number | null;
    readonly thresholdTokens: number | null;
    readonly retainTokens: number | null;
    readonly summaryMaxTokens: number | null;
}
/** Candidate-range preview section of the inspect payload. */
export interface InspectPreview {
    readonly beforeTokens: number;
    readonly afterUpperBoundTokens: number | null;
    readonly retainedTokens?: number;
    readonly replacedTokens?: number;
    readonly checkpointFramingTokens?: number;
    readonly rangeStart: number | null;
    readonly rangeEnd: number | null;
    readonly reason: string | null;
}
/** Projection of the latest native compaction attempt. */
export interface InspectLastCompaction {
    readonly id: string;
    readonly trigger: 'manual' | 'automatic';
    readonly status: 'running' | 'completed' | 'failed' | 'cancelled' | 'persistence-error';
    readonly mode: CompactionMode | null;
    readonly beforeTokens: number | null;
    readonly afterTokens: number | null;
    readonly durationMs: number | null;
    readonly cacheReadTokens: number | null;
    readonly cacheWriteTokens: number | null;
    readonly error: string | null;
}
/** This process's latest handoff-continuation decision. */
export interface InspectHandoffContinuation {
    readonly compactionId: string;
    readonly status: 'scheduled' | 'skipped';
    readonly blockers: readonly string[];
    readonly at: number;
}
/** Complete `GET /better-compact/api/inspect` payload. */
export interface InspectPayload {
    readonly activeConfig: ConfigSnapshot;
    readonly requiresReload: boolean;
    readonly sessionId: string | null;
    readonly engine: InspectEngine | null;
    readonly diagnostics: readonly string[];
    readonly budget: InspectBudget | null;
    readonly preview: InspectPreview | null;
    readonly lastCompaction: InspectLastCompaction | null;
    readonly handoffContinuation: InspectHandoffContinuation | null;
}
/** One allowed summary route with its advertised reasoning efforts. */
export interface ModelRoute {
    readonly provider: string;
    readonly model: string;
    readonly efforts: readonly string[];
    readonly defaultEffort: string;
}
/** Complete `GET /better-compact/api/models` payload. */
export interface ModelRoutesPayload {
    readonly enabled: boolean;
    readonly routes: readonly ModelRoute[];
}
