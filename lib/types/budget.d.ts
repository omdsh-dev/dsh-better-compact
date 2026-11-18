/**
 * Budget and safe-cut adapter for dsh-better-compact.
 *
 * The DSH 0.2.2-rc.2 `@deepseek-ai/dsh-compaction-basic` build is a bundled
 * library that does not export its config resolution, capacity scaling, or
 * retention selection helpers. This module re-implements exactly those rules
 * for two consumers that must agree:
 *
 *   - the engine's only add-on work (choosing the injected authoritative state
 *     that fits the summary model budget), and
 *   - the read-only inspect route (threshold/retention numbers and the preview
 *     cut), which must never invent a second token count or a drifting
 *     compaction algorithm.
 *
 * Adapted from DeepSeek Harness (MIT); see `third-party/NOTICE`. Native
 * meanings and units are preserved: `thresholdRatio` is a window fraction,
 * `headroomTokens` is additional pressure headroom beyond the routed output
 * reservation, `maxTokens` is the summary output cap, and retention is a
 * recent-tail budget. Behavior-compatibility with the native engine is
 * exercised by the real-profile smoke (the preview range and trigger numbers
 * are compared against the actual native events).
 *
 * TypeScript migration note: the mirrored functions declare the upstream
 * result contracts (`ResolvedTargetPolicy`, `ResolvedCompactSpec`) and the
 * upstream parameter contracts (`Session`, `TokenMeasurement`,
 * `SessionSeq`). When upstream renames or reshapes a field, this module stops
 * compiling instead of drifting silently at runtime. The arithmetic and the
 * returned field names are unchanged.
 */
import type { ResolvedCompactSpec, ResolvedTargetPolicy } from '@deepseek-ai/dsh-compaction-basic';
import type { LlmCallConfig } from '@deepseek-ai/dsh-llm';
import type { EpochHeader, Session, SessionSeq } from '@deepseek-ai/dsh-session';
import type { TokenMeasurement } from '@deepseek-ai/dsh-token-meter';
import type { ConfigSnapshot } from './shared/contract.ts';
/** Exact provider/model route, matching the upstream resolver's target shape. */
export type ModelTarget = Pick<LlmCallConfig, 'provider' | 'model'>;
/** Capacity/retention conflict resolved while preparing a summary call. */
export declare class BudgetConfigError extends Error {
    /** Stable machine code carried by every budget conflict. */
    readonly code = "BETTER_COMPACT_BUDGET";
    /** Exact provider/model route whose configuration is unsatisfiable. */
    readonly targetKey: string;
    /**
     * @param targetKey - exact provider/model route.
     * @param message - actionable configuration failure detail.
     */
    constructor(targetKey: string, message: string);
}
/** Request header fields the reservation helper reads. */
export interface ReservedTokensHeader {
    readonly config: {
        readonly maxTokens?: number;
    };
}
/** Measurement shape the inspect `measurement` vocabulary is derived from. */
export interface BaselineKindLike {
    readonly baseline?: {
        readonly kind?: string;
        readonly tokens?: number;
        readonly usage?: unknown;
    } | null;
}
/** Inspect vocabulary for how a token count was obtained. */
export type MeasurementKind = 'measured' | 'estimated' | 'unavailable';
/**
 * Resolve the exact provider/model routed for the latest durable request.
 * @param session - session carrying request headers.
 * @returns routed target.
 */
export declare function routedTarget(session: Session): ModelTarget | undefined;
/** Resolve a routed target from a plain request header (cold inspection). */
export declare function targetFromHeader(header: EpochHeader | undefined): ModelTarget | undefined;
/**
 * Output tokens the routed request reserves, charged to the same window as the
 * prompt. The effective envelope's cap wins; otherwise the adapter default.
 * @param header - effective request header, including a proposed model switch.
 * @param defaultMaxTokens - adapter per-request default.
 * @returns reserved completion tokens.
 */
export declare function reservedCompletionTokens(header: ReservedTokensHeader | undefined, defaultMaxTokens?: number): number;
/**
 * Merge the exact provider/model override over the normalized global policy.
 * @param config - normalized plugin configuration (`readConfig`).
 * @param target - exact routed target.
 * @returns frozen merged policy before capacity scaling.
 */
export declare function resolveTargetPolicy(config: ConfigSnapshot, target: ModelTarget): ResolvedTargetPolicy;
/**
 * Scale one routed policy into concrete token budgets for its model capacity.
 *
 * Mirrors the native rules exactly:
 *   messageBudget = contextWindow - reservedCompletionTokens
 *   pressureBudget = messageBudget - headroomTokens
 *   thresholdTokens = floor(min(contextWindow * thresholdRatio, pressureBudget))
 *   retainTokens = absolute override ?? floor(messageBudget * retainRatio)
 * and rejects a retained budget that is not below the trigger.
 *
 * @param policy - merged policy for the exact routed target.
 * @param contextWindow - positive adapter-owned capacity.
 * @param reservedTokens - output tokens one routed request reserves.
 * @returns frozen pressure/retention budgets.
 * @throws {BudgetConfigError} for a capacity or retention conflict.
 */
export declare function resolveCompactSpec(policy: ResolvedTargetPolicy, contextWindow: number, reservedTokens: number): ResolvedCompactSpec;
/**
 * Resolve the next compaction range: the oldest balanced span that leaves a
 * priced recent tail and never splits a tool-call/result pair. A
 * `system/message` at surface node 0 is never inside the range.
 *
 * Mirrors the upstream selection rule (adapted DSH MIT; see NOTICE).
 *
 * @param session - session with an authoritative current surface.
 * @param measurement - token-meter measurement for that surface.
 * @param retainTokens - minimum recent-tail budget retained verbatim.
 * @returns inclusive surface seq range.
 */
export declare function selectCompactableRange(session: Session, measurement: TokenMeasurement, retainTokens: number): {
    start: SessionSeq;
    end: SessionSeq;
} | null;
/**
 * Price the fixed prefix a compaction can never remove: the tool schema tokens
 * plus a leading `system/message` surface node when present.
 *
 * @param session - session with an authoritative current surface.
 * @param measurement - token-meter measurement for that surface.
 * @param toolsTokens - priced tool-schema tokens.
 * @returns fixed prefix tokens, or null when not measurable.
 */
export declare function fixedPrefixTokens(session: Session, measurement: Pick<TokenMeasurement, 'nodes'> | null | undefined, toolsTokens: number): number | null;
/** Map a token-meter baseline to the inspect `measurement` vocabulary. */
export declare function measurementKind(measurement: BaselineKindLike | null | undefined): MeasurementKind;
/**
 * Sum the route-priced tokens of the retained tail (including the retained
 * system node when the range is impossible). Used only for an upper-bound
 * preview, never as a result prediction.
 *
 * @param measurement - token-meter measurement.
 * @param keepFromIndex - first retained node index.
 * @returns tail tokens when known.
 */
export declare function retainedTailTokens(measurement: Pick<TokenMeasurement, 'nodes'> | undefined, keepFromIndex: number | undefined): number | null;
