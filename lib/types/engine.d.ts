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
import z from '@deepseek-ai/schemastery';
import type { Context } from '@deepseek-ai/cordis';
import { BasicCompactionEngine } from '@deepseek-ai/dsh-compaction-basic';
import type { CompactionResult, CompactionTrigger } from '@deepseek-ai/dsh-compaction';
import type { CommandId } from '@deepseek-ai/dsh-commands/brand';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { ContentBlock, LlmResolvedModelInfo, ReasoningEffortId } from '@deepseek-ai/dsh-llm';
import type { CompactionMode, ConfigSnapshot } from './shared/contract.ts';
import { BudgetConfigError, resolveTargetPolicy } from './budget.ts';
import { collectAuthoritativeState } from './state.ts';
import { lastCompactionFailure } from './live.ts';
/**
 * The summarizer hook is protected on the inherited class, so its argument and
 * result types are derived from it rather than rebuilt here.
 */
type SummarizeArguments = Parameters<BasicCompactionEngine['summarize']>;
/** Replayed conversation prefix handed to the summarizer. */
type SummarizationInput = SummarizeArguments[0];
/** Owner of the summarized session. */
type SummarizeAgent = SummarizeArguments[1];
/** Summary blocks plus the exact auxiliary call envelope. */
type SummaryResult = Awaited<ReturnType<BasicCompactionEngine['summarize']>>;
/** One routed summary target. */
interface SummaryTarget {
    readonly provider: string;
    readonly model: string;
}
/** Effective policy resolved for one routed target. */
type ResolvedPolicy = ReturnType<typeof resolveTargetPolicy>;
/**
 * The snapshot-derived fallback when no request was routed yet. Only these
 * fields exist in that branch, and only these are read from it.
 */
type SummaryRoutePolicy = Pick<ResolvedPolicy, 'summarizationProvider' | 'summarizationModel' | 'maxTokens'>;
export declare class BetterCompactEngine extends BasicCompactionEngine {
    static inject: string[];
    static Config: z;
    /** Marker used by tests and diagnostics; never a behavioral branch. */
    static betterCompactEngine: boolean;
    /** Frozen load-time configuration actually in force. */
    readonly snapshot: ConfigSnapshot;
    /** Enhanced mode in force for this engine instance. */
    readonly mode: CompactionMode;
    /** True when this row config is the shipped empty config. */
    readonly rowConfigEmpty: boolean;
    /**
     * @param ctx - engine context.
     * @param rowConfig - engine row config (always empty in shipped patches).
     */
    constructor(ctx: Context, rowConfig?: Record<string, unknown>);
    /**
     * Summarize the replayed conversation region.
     * Native mode delegates entirely to the inherited implementation.
     * @param input - replayed conversation prefix to condense.
     * @param agent - owner of the summarized session.
     * @param signal - optional cancellation forwarded to the adapter.
     * @returns safe text summary blocks and the exact auxiliary call envelope.
     */
    summarize(input: SummarizationInput, agent: SummarizeAgent, signal?: AbortSignal): Promise<SummaryResult>;
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
    compactIfNeeded(agent: Agent, trigger: CompactionTrigger, signal: AbortSignal): Promise<CompactionResult | null>;
    /**
     * Manual idle compaction. On a live successful handoff compaction it
     * schedules exactly one ordinary same-session follow-up, subject to the
     * documented read-only safety checks.
     * @param agent - idle agent whose next-turn admission this call reserves.
     * @param signal - cancellation scoped to this compaction request.
     * @param sourceCommandId - initiating command identity for presentation.
     * @returns the committed result, or null when no safe useful range exists.
     */
    compactNow(agent: Agent, signal: AbortSignal, sourceCommandId?: CommandId): Promise<CompactionResult | null>;
    /**
     * Whether a preset-owned engine supersedes this host-plane instance.
     * @param agent - agent whose isolated compaction service is inspected.
     * @returns true when another engine owns this agent's compaction.
     */
    _supersededByPreset(agent: Agent): boolean;
    /**
     * Resolve the summary route exactly like the native engine.
     * @param agent - agent whose routed target and options are read.
     * @returns the resolved target and its effective policy.
     * @throws with code BETTER_COMPACT_ROUTE when no route exists.
     */
    _resolveRoute(agent: Agent): {
        target: SummaryTarget;
        policy: ResolvedPolicy | SummaryRoutePolicy;
    };
    /**
     * Validate the saved effort against the exact summary model's capabilities.
     * @param info - resolved model facts for the summary target.
     * @returns the supported effort, or undefined when none is configured.
     * @throws with code UNSUPPORTED_REASONING_EFFORT when the model cannot honor it.
     */
    _resolveEffort(info: LlmResolvedModelInfo): ReasoningEffortId | undefined;
    /**
     * Estimate the auxiliary request size under the fixed token-meter heuristic.
     * @param input - replayed conversation prefix.
     * @param instruction - rendered instruction added as the final user message.
     * @param effortIgnored - reserved argument kept from the previous signature.
     * @returns estimated prompt tokens for that request.
     */
    _estimateRequest(input: SummarizationInput, instruction: string, effortIgnored?: unknown): number;
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
    _chooseInstruction(input: SummarizationInput, state: ReturnType<typeof collectAuthoritativeState>, info: LlmResolvedModelInfo, maxTokens: number, sessionId: string): string;
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
    _customInstruction(input: SummarizationInput, state: ReturnType<typeof collectAuthoritativeState>, info: LlmResolvedModelInfo, maxTokens: number, sessionId: string, target: SummaryTarget, policy: ResolvedPolicy | SummaryRoutePolicy): string;
    /**
     * Enhanced-mode summarization (goal, handoff, or custom).
     * @param input - replayed conversation prefix to condense.
     * @param agent - owner of the summarized session.
     * @param signal - optional cancellation forwarded to the adapter.
     * @returns safe summary blocks and the exact auxiliary call envelope.
     */
    _summarizeEnhanced(input: SummarizationInput, agent: SummarizeAgent, signal?: AbortSignal): Promise<SummaryResult>;
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
    summaryImageBlocks(text: string, agent: Agent, signal?: AbortSignal): Promise<ContentBlock[]>;
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
    assertConversationAcceptsImages(agent: Agent, signal?: AbortSignal): Promise<void>;
    /**
     * Schedule the one documented continuation after a successful manual handoff.
     * @param agent - agent whose manual compaction just committed.
     * @param result - committed compaction result.
     * @param signal - cancellation scoped to the manual request.
     */
    _maybeContinue(agent: Agent, result: CompactionResult, signal?: AbortSignal): Promise<void>;
    /** Test/inspection helper: the mode this exact engine instance holds. */
    get activeMode(): CompactionMode;
    /**
     * Test/inspection helper: last process-observed failure for a session.
     * @param sessionId - session identity.
     * @returns the recorded failure, or undefined.
     */
    failureFor(sessionId: string): ReturnType<typeof lastCompactionFailure>;
    /**
     * Test/inspection helper: whether a live summary attempt owns a session.
     * @param sessionId - session identity.
     * @returns the running attempt's mode, or null.
     */
    activeSummaryFor(sessionId: string): CompactionMode | null;
    /**
     * Test helper: compare the frozen snapshot with a candidate config.
     * @param candidate - configuration value to compare.
     * @returns true when both normalize identically.
     */
    snapshotEquals(candidate: unknown): boolean;
}
/** Re-exported for tests that assert the budget error type. */
export { BudgetConfigError };
export default BetterCompactEngine;
