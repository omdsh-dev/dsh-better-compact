/**
 * Process-local observations about in-flight compaction attempts.
 *
 * The native session log is the durable authority for completed, failed, and
 * orphaned brackets. Two facts cannot be recovered from the log after the
 * fact: whether an unmatched `compaction/start` still belongs to a live
 * in-memory attempt, and whether a replacement that did append failed its
 * durability checkpoint. The engine reports those facts here for the inspect
 * route; the map is deliberately process-local and has no durability claim.
 *
 * The map lives at module scope in one package copy. The host companion and
 * the engine import the same module, so they share it; a duplicated package
 * (for example a second explicit bundle source) has its own map, which only
 * loses these two optimistic facts, never correctness of the persisted log.
 */
import type { CompactionMode } from './shared/contract.ts';
/** One compaction-related record from an immutable session log. */
export interface CompactionSessionEvent {
    /** Record type (`compaction/start` or `compaction/end` for brackets). */
    readonly type: string;
    /** Record payload; only the bracket records are inspected here. */
    readonly data: unknown;
}
/** The session-log face this module reads backwards. */
export interface CompactionSession {
    readonly id: string;
    /** Number of committed records. */
    readonly seq: number;
    eventAt(seq: number): CompactionSessionEvent | undefined;
}
/** One live in-memory summarization attempt. */
export interface ActiveSummary {
    /** Compaction bracket the attempt belongs to. */
    readonly compactionId: string | null;
    /** When the attempt started (epoch milliseconds). */
    readonly startedAt: number;
    /** Enhanced mode the attempt is summarizing for. */
    readonly mode: CompactionMode;
}
/** Classified terminal status of one failed compaction attempt. */
export type CompactionFailureStatus = 'failed' | 'cancelled' | 'persistence-error';
/** Last process-observed failure for one session. */
export interface CompactionFailure {
    /** Bracket the failure belongs to, when one could be identified. */
    readonly compactionId: string | null;
    readonly status: CompactionFailureStatus;
    readonly message: string;
}
/** The manual handoff-continuation decision this process made. */
export interface ContinuationOutcome {
    readonly compactionId: string;
    readonly status: 'scheduled' | 'skipped';
    readonly blockers: readonly string[];
    /** When the decision was made (epoch milliseconds). */
    readonly at: number;
}
/** Inputs recorded by {@link recordContinuationOutcome}. */
export interface ContinuationOutcomeInput {
    readonly compactionId: string;
    readonly status: 'scheduled' | 'skipped';
    readonly blockers?: readonly string[];
    /** Decision time override (defaults to now). */
    readonly at?: number;
}
/** Authoritative state omitted from the most recent enhanced summary. */
export interface BudgetFallback {
    readonly omitted: readonly string[];
    /** When the omission was observed (epoch milliseconds). */
    readonly at: number;
}
/** Find the latest unmatched `compaction/start` in a session log. */
export declare function findOpenCompaction(session?: CompactionSession): CompactionSessionEvent | undefined;
/** Find the compaction id of the newest bracket in a session log. */
export declare function findLatestCompactionId(session?: CompactionSession): string | null;
/**
 * Mark the beginning of one summarization attempt. Called from the engine's
 * summary hook, which runs while the native `compaction/start` bracket is open.
 */
export declare function markSummaryStart(session: CompactionSession, mode: CompactionMode): void;
/** Mark the end of one summarization attempt (success or failure). */
export declare function markSummaryEnd(sessionId: string): void;
/** Whether a live in-memory summarization attempt owns this compaction id. */
export declare function isSummaryActive(sessionId: string, compactionId: string | null): boolean;
/** Mode of the live attempt, when one is active (used for diagnostics only). */
export declare function activeSummaryMode(sessionId: string): CompactionMode | null;
/** Record one classified manual/automatic failure for inspect. */
export declare function recordCompactionFailure(session: CompactionSession | undefined, status: CompactionFailureStatus, message: unknown, compactionId?: string | null): void;
/** Read the last process-observed failure for one session. */
export declare function lastCompactionFailure(sessionId: string): CompactionFailure | undefined;
/** Record the read-only outcome of the manual handoff continuation decision. */
export declare function recordContinuationOutcome(sessionId: string, outcome: ContinuationOutcomeInput): void;
/** Read the latest continuation decision for one session, if this process made one. */
export declare function continuationOutcome(sessionId: string): ContinuationOutcome | null;
/** Record authoritative state omitted from the most recent enhanced summary. */
export declare function recordBudgetFallback(sessionId: string, omitted: readonly string[]): void;
/** Read the latest summary-budget omission for one session. */
export declare function lastBudgetFallback(sessionId: string): BudgetFallback | null;
/** Test-only reset; keeps unit tests independent. */
export declare function resetLiveRegistry(): void;
