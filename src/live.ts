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

import type { CompactionMode } from './shared/contract.ts'

/** One compaction-related record from an immutable session log. */
export interface CompactionSessionEvent {
  /** Record type (`compaction/start` or `compaction/end` for brackets). */
  readonly type: string
  /** Record payload; only the bracket records are inspected here. */
  readonly data: unknown
}

/** The session-log face this module reads backwards. */
export interface CompactionSession {
  readonly id: string
  /** Number of committed records. */
  readonly seq: number
  eventAt(seq: number): CompactionSessionEvent | undefined
}

/** One live in-memory summarization attempt. */
export interface ActiveSummary {
  /** Compaction bracket the attempt belongs to. */
  readonly compactionId: string | null
  /** When the attempt started (epoch milliseconds). */
  readonly startedAt: number
  /** Enhanced mode the attempt is summarizing for. */
  readonly mode: CompactionMode
}

/** Classified terminal status of one failed compaction attempt. */
export type CompactionFailureStatus = 'failed' | 'cancelled' | 'persistence-error'

/** Last process-observed failure for one session. */
export interface CompactionFailure {
  /** Bracket the failure belongs to, when one could be identified. */
  readonly compactionId: string | null
  readonly status: CompactionFailureStatus
  readonly message: string
}

/** The manual handoff-continuation decision this process made. */
export interface ContinuationOutcome {
  readonly compactionId: string
  readonly status: 'scheduled' | 'skipped'
  readonly blockers: readonly string[]
  /** When the decision was made (epoch milliseconds). */
  readonly at: number
}

/** Inputs recorded by {@link recordContinuationOutcome}. */
export interface ContinuationOutcomeInput {
  readonly compactionId: string
  readonly status: 'scheduled' | 'skipped'
  readonly blockers?: readonly string[]
  /** Decision time override (defaults to now). */
  readonly at?: number
}

/** Authoritative state omitted from the most recent enhanced summary. */
export interface BudgetFallback {
  readonly omitted: readonly string[]
  /** When the omission was observed (epoch milliseconds). */
  readonly at: number
}

/** Live attempts keyed by session id. */
const activeSummaries = new Map<string, ActiveSummary>()
/** Last classified failure keyed by session id. */
const lastFailures = new Map<string, CompactionFailure>()
/** Manual continuation decisions keyed by session id. */
const continuationOutcomes = new Map<string, ContinuationOutcome>()
/** Summary-budget omissions keyed by session id. */
const budgetFallbacks = new Map<string, BudgetFallback>()

/**
 * Read the compaction id of one bracket record.
 *
 * `compaction/start` and `compaction/end` require an id; a foreign record that
 * carries none is normalized to `null` exactly like {@link findLatestCompactionId}.
 */
function compactionIdOf(event: CompactionSessionEvent): string | null {
  return (event.data as { readonly compactionId?: string | null }).compactionId ?? null
}

/** Find the latest unmatched `compaction/start` in a session log. */
export function findOpenCompaction(session?: CompactionSession): CompactionSessionEvent | undefined {
  if (session === undefined) return undefined
  for (let seq = session.seq - 1; seq >= 0; seq -= 1) {
    const event = session.eventAt(seq)
    if (event === undefined) continue
    if (event.type === 'compaction/start') return event
    if (event.type === 'compaction/end') return undefined
  }
  return undefined
}

/** Find the compaction id of the newest bracket in a session log. */
export function findLatestCompactionId(session?: CompactionSession): string | null {
  if (session === undefined) return null
  for (let seq = session.seq - 1; seq >= 0; seq -= 1) {
    const event = session.eventAt(seq)
    if (event === undefined) continue
    if (event.type === 'compaction/start' || event.type === 'compaction/end') {
      return compactionIdOf(event)
    }
  }
  return null
}

/**
 * Mark the beginning of one summarization attempt. Called from the engine's
 * summary hook, which runs while the native `compaction/start` bracket is open.
 */
export function markSummaryStart(session: CompactionSession, mode: CompactionMode): void {
  const open = findOpenCompaction(session)
  if (open === undefined) return
  activeSummaries.set(session.id, {
    compactionId: compactionIdOf(open),
    startedAt: Date.now(),
    mode,
  })
}

/** Mark the end of one summarization attempt (success or failure). */
export function markSummaryEnd(sessionId: string): void {
  activeSummaries.delete(sessionId)
}

/** Whether a live in-memory summarization attempt owns this compaction id. */
export function isSummaryActive(sessionId: string, compactionId: string | null): boolean {
  return activeSummaries.get(sessionId)?.compactionId === compactionId
}

/** Mode of the live attempt, when one is active (used for diagnostics only). */
export function activeSummaryMode(sessionId: string): CompactionMode | null {
  return activeSummaries.get(sessionId)?.mode ?? null
}

/** Record one classified manual/automatic failure for inspect. */
export function recordCompactionFailure(
  session: CompactionSession | undefined,
  status: CompactionFailureStatus,
  message: unknown,
  compactionId?: string | null,
): void {
  if (session === undefined) return
  const id = compactionId ?? findLatestCompactionId(session)
  lastFailures.set(session.id, {
    compactionId: id,
    status,
    message: typeof message === 'string' ? message : String(message),
  })
}

/** Read the last process-observed failure for one session. */
export function lastCompactionFailure(sessionId: string): CompactionFailure | undefined {
  return lastFailures.get(sessionId)
}

/** Record the read-only outcome of the manual handoff continuation decision. */
export function recordContinuationOutcome(sessionId: string, outcome: ContinuationOutcomeInput): void {
  continuationOutcomes.set(
    sessionId,
    Object.freeze({
      compactionId: outcome.compactionId,
      status: outcome.status,
      blockers: Object.freeze([...(outcome.blockers ?? [])]),
      at: outcome.at ?? Date.now(),
    }),
  )
}

/** Read the latest continuation decision for one session, if this process made one. */
export function continuationOutcome(sessionId: string): ContinuationOutcome | null {
  return continuationOutcomes.get(sessionId) ?? null
}

/** Record authoritative state omitted from the most recent enhanced summary. */
export function recordBudgetFallback(sessionId: string, omitted: readonly string[]): void {
  budgetFallbacks.set(
    sessionId,
    Object.freeze({
      omitted: Object.freeze([...omitted]),
      at: Date.now(),
    }),
  )
}

/** Read the latest summary-budget omission for one session. */
export function lastBudgetFallback(sessionId: string): BudgetFallback | null {
  return budgetFallbacks.get(sessionId) ?? null
}

/** Test-only reset; keeps unit tests independent. */
export function resetLiveRegistry(): void {
  activeSummaries.clear()
  lastFailures.clear()
  continuationOutcomes.clear()
  budgetFallbacks.clear()
}
