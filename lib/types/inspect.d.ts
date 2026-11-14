/**
 * Read-only inspection projection for the GET route and the S3 UI contract.
 *
 * This module performs no LLM generation, no compaction, no CLI call, no temp
 * file write, and no goal/session mutation. It prices the session through the
 * singleton `ctx.tokenMeter`, projects the last native compaction bracket from
 * real log events/usage, mirrors the native safe-cut selection for the preview,
 * and reports unknown values as `null` (never 0, never a fabricated
 * percentage).
 *
 * Cold sessions are read through `ctx.sessionQuery.observeSession` and replayed
 * into a detached `Session` for the same meter; a failure to reconstruct one is
 * reported as an unavailable measurement, not as a different algorithm.
 *
 * The payload shape is owned by `shared/contract.ts` so the settings page and
 * this route cannot drift; every unknown field stays `null`.
 */
import { Session } from '@deepseek-ai/dsh-session';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import type { Message } from '@deepseek-ai/dsh-llm';
import type { TokenMeasurement } from '@deepseek-ai/dsh-token-meter';
import { INSPECT_PATH } from './shared/contract.ts';
import type { ConfigSnapshot, InspectBudget, InspectLastCompaction, InspectPayload, InspectPreview } from './shared/contract.ts';
export { INSPECT_PATH };
/** Fixed replacement framing tokens included in the preview upper bound. */
export declare const NATIVE_CHECKPOINT_FRAMING_TOKENS: number;
/** Structured failure the HTTP layer maps to a status. */
export declare class InspectError extends Error {
    /** HTTP status the route answers with. */
    readonly status: number;
    /** Stable machine code for the failure. */
    readonly code: string;
    /**
     * @param status - HTTP status.
     * @param code - stable machine code.
     * @param message - human-readable detail.
     */
    constructor(status: number, code: string, message: string);
}
/** Minimal `ctx.get` face; every host service below is optional. */
interface ContextReader {
    get(name: string): unknown;
}
/** `betterCompactConfig` provider face. */
export interface InspectCompanion {
    snapshot(): ConfigSnapshot;
    current(): ConfigSnapshot;
}
/** `llm` face: only the capacity and default-cap fields are read. */
export interface ModelInfoFace {
    readonly provider?: string;
    readonly id?: string;
    /** Adapter-reported display name; accepted, never projected. */
    readonly name?: string;
    readonly context?: {
        readonly contextWindow?: number;
    } | undefined;
    readonly defaultMaxTokens?: number | undefined;
}
/** Optional projection seams for {@link projectLastCompaction}. */
export interface ProjectLastCompactionOptions {
    /** Message estimator (defaults to the token-meter one). */
    readonly estimate?: ((message: Message) => number) | undefined;
}
/**
 * Project the latest native compaction attempt from real events.
 *
 * Status vocabulary is `running | completed | failed | cancelled |
 * persistence-error`. `running` is claimed only for a live in-memory summary
 * attempt; an unmatched start with no live attempt is reported as failed, never
 * as an imaginary active process. A durability checkpoint failure after a
 * successful append is only knowable from this process's own observation; the
 * persisted log alone looks completed. Unknown fields are null.
 *
 * @param events - session events in seq order.
 * @param sessionId - owning session identity.
 * @param options - projection options.
 * @returns projected record, or null with no compaction.
 */
export declare function projectLastCompaction(events: readonly SessionEvent[], sessionId: string, options?: ProjectLastCompactionOptions): InspectLastCompaction | null;
/** Inputs of one budget/preview projection. */
export interface BudgetPreviewInput {
    /** Host context; accepted for call-site compatibility and unused here. */
    readonly ctx?: unknown;
    readonly session: Session | null;
    readonly events: readonly SessionEvent[];
    readonly activeConfig: ConfigSnapshot;
    readonly measurement?: TokenMeasurement | undefined;
    readonly modelInfo?: ModelInfoFace | undefined;
    readonly modelInfoError?: string | undefined;
}
/** Budget/preview sections of the inspect payload. */
export interface BudgetPreviewSections {
    readonly budget: InspectBudget;
    readonly preview: InspectPreview | null;
    readonly diagnostics: string[];
}
/**
 * Build the budget/preview section for one session.
 * @param input - resolved inspection inputs.
 * @returns sections.
 */
export declare function buildBudgetPreview(input: BudgetPreviewInput): BudgetPreviewSections;
/**
 * Build the complete inspect payload.
 *
 * @param ctx - host companion context.
 * @param companion - `betterCompactConfig` provider.
 * @param sessionId - optional requested session id.
 * @returns response payload.
 */
export declare function inspectPlugin(ctx: ContextReader, companion: InspectCompanion, sessionId?: string | null): Promise<InspectPayload>;
