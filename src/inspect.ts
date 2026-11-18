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

import { Session } from '@deepseek-ai/dsh-session'
import type {
  EpochHeader,
  SessionEvent,
  SessionMessageProjection,
  SessionSeq,
} from '@deepseek-ai/dsh-session'
import type { SessionObservation } from '@deepseek-ai/dsh-session-query'
import type { CompactionId } from '@deepseek-ai/dsh-compaction'
import type { ContentBlock, Message } from '@deepseek-ai/dsh-llm'
import {
  ROLE_OVERHEAD,
  estimateContent,
  estimateMessage,
  estimateToolsTokens,
} from '@deepseek-ai/dsh-token-meter/estimate'
import type { TokenMeasurement } from '@deepseek-ai/dsh-token-meter'
import { configEquals } from './config.ts'
import { isBetterCompactEngine, serviceIdentity } from './identity.ts'
import {
  fixedPrefixTokens,
  measurementKind,
  reservedCompletionTokens,
  resolveCompactSpec,
  resolveTargetPolicy,
  selectCompactableRange,
  targetFromHeader,
} from './budget.ts'
import { detectSummaryMode } from './prompts.ts'
import {
  continuationOutcome,
  isSummaryActive,
  lastBudgetFallback,
  lastCompactionFailure,
} from './live.ts'
import { INSPECT_PATH } from './shared/contract.ts'
import type {
  CompactionMode,
  ConfigSnapshot,
  InspectBudget,
  InspectEngine,
  InspectHandoffContinuation,
  InspectLastCompaction,
  InspectPayload,
  InspectPreview,
} from './shared/contract.ts'

export { INSPECT_PATH }

/**
 * Native checkpoint framing reproduced only to price the replacement upper
 * bound: the preamble + `<compacted-summary>` tags wrap every native summary
 * message. Adapted from DeepSeek Harness (MIT; see `third-party/NOTICE`).
 */
const NATIVE_CHECKPOINT_PREAMBLE =
  'This is an automatically generated checkpoint condensing an earlier span of the conversation to free up context. Treat the captured context as established background and build on it without restating it. Continue the task directly from the messages that follow, without acknowledging this checkpoint.'

/** Fixed replacement framing tokens included in the preview upper bound. */
export const NATIVE_CHECKPOINT_FRAMING_TOKENS =
  estimateContent([
    { type: 'text', text: `${NATIVE_CHECKPOINT_PREAMBLE}\n\n<compacted-summary>` },
    { type: 'text', text: '</compacted-summary>' },
  ]) + ROLE_OVERHEAD

/** Structured failure the HTTP layer maps to a status. */
export class InspectError extends Error {
  /** HTTP status the route answers with. */
  readonly status: number
  /** Stable machine code for the failure. */
  readonly code: string

  /**
   * @param status - HTTP status.
   * @param code - stable machine code.
   * @param message - human-readable detail.
   */
  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'InspectError'
    this.status = status
    this.code = code
  }
}

/** Minimal `ctx.get` face; every host service below is optional. */
interface ContextReader {
  get(name: string): unknown
}

/** `betterCompactConfig` provider face. */
export interface InspectCompanion {
  snapshot(): ConfigSnapshot
  current(): ConfigSnapshot
}

/** `agents` face: the live agent owning a session. */
interface InspectAgentsService {
  get(id: string): { readonly session: Session } | undefined
}

/** `sessions` face (live store). */
interface InspectSessionsService {
  get(id: string): Session | undefined
  readonly messageProjections?: readonly SessionMessageProjection[] | undefined
}

/** `sessionQuery` face (cold reads). */
interface InspectSessionQueryService {
  observeSession(sessionId: string): Promise<SessionObservation>
}

/** `tokenMeter` face. */
interface InspectTokenMeterService {
  measure(session: Session): TokenMeasurement
}

/** `llm` face: only the capacity and default-cap fields are read. */
export interface ModelInfoFace {
  readonly provider?: string
  readonly id?: string
  /** Adapter-reported display name; accepted, never projected. */
  readonly name?: string
  readonly context?: { readonly contextWindow?: number } | undefined
  readonly defaultMaxTokens?: number | undefined
}

/** `llm` face. */
interface InspectLlmService {
  resolveModelInfo(provider: string, model: string): Promise<ModelInfoFace>
}

/** `agentPresets` face. */
interface InspectAgentPresetsService {
  serviceFor(agent: unknown, service: string): unknown
}

/** Read one optional service without failing inspection. */
function service<T>(ctx: ContextReader, name: string): T | undefined {
  try {
    return ctx.get(name) as T | undefined
  } catch {
    return undefined
  }
}

/** Build the stable inspect payload for a resolved session. */
function emptyPayload(
  activeConfig: ConfigSnapshot,
  requiresReload: boolean,
  sessionId: string | null = null,
): InspectPayload {
  return {
    activeConfig,
    requiresReload,
    sessionId,
    engine: null,
    diagnostics: [],
    budget: null,
    preview: null,
    lastCompaction: null,
    handoffContinuation: null,
  }
}

/** One resolved live or replayed session plus its log events. */
interface ResolvedSession {
  readonly session: Session | null
  readonly events: readonly SessionEvent[]
  readonly agent: unknown
  readonly cold: boolean
}

/**
 * Determine which compaction engine actually serves a session, so inspect
 * never presents better-compact's configuration/budget for a session running
 * another preset's native engine.
 */
function engineOwnership(ctx: ContextReader, resolved: ResolvedSession): InspectEngine {
  if (resolved.agent === undefined) {
    return {
      owner: 'unknown',
      inspectApplies: true,
      reason: resolved.session === null
        ? 'no live agent or replayable session is available; engine ownership cannot be proven'
        : 'the session is not live; engine ownership cannot be proven, so budget/preview use the active configuration',
    }
  }
  let presets: InspectAgentPresetsService | undefined
  try {
    presets = ctx.get('agentPresets') as InspectAgentPresetsService | undefined
  } catch {
    presets = undefined
  }
  let mounted: unknown
  if (presets !== undefined && typeof presets.serviceFor === 'function') {
    try {
      mounted = presets.serviceFor(resolved.agent, 'compaction')
    } catch {
      mounted = undefined
    }
  }
  if (mounted !== undefined) {
    if (isBetterCompactEngine(mounted)) {
      return { owner: 'better-compact-preset', inspectApplies: true, reason: null }
    }
    const implementation = serviceIdentity(mounted) as
      | { constructor?: { name?: string } | undefined }
      | null
      | undefined
    return {
      owner: 'foreign-preset',
      inspectApplies: false,
      reason:
        'the session preset owns a different compaction engine (' +
        `${implementation?.constructor?.name ?? 'unknown'}); better-compact configuration and budget preview do not apply to it`,
    }
  }
  let hostEngine: unknown
  try {
    hostEngine = ctx.get('compaction')
  } catch {
    hostEngine = undefined
  }
  if (hostEngine !== undefined && isBetterCompactEngine(hostEngine)) {
    return { owner: 'host', inspectApplies: true, reason: null }
  }
  return {
    owner: 'unknown',
    inspectApplies: true,
    reason: 'no better-compact engine is mounted for this session; budget/preview use the active plugin configuration',
  }
}

/** Collect the session's own log events without mutating it. */
function eventsOf(session: Session): SessionEvent[] {
  const events: SessionEvent[] = []
  for (let seq = 0; seq < session.seq; seq += 1) {
    const event = session.eventAt(seq as SessionSeq)
    if (event !== undefined) events.push(event)
  }
  return events
}

/** Find the latest request header event in a log. */
function latestHeader(events: readonly SessionEvent[]): EpochHeader | undefined {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index] as SessionEvent
    if (event.type === 'request/header') return event.data.header
  }
  return undefined
}

/** Project one compaction summary's text from its blocks. */
function summaryText(summary: readonly ContentBlock[] | undefined): string {
  if (!Array.isArray(summary)) return ''
  return summary
    .filter((block): block is Extract<ContentBlock, { type: 'text' }> => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
}

/** Optional projection seams for {@link projectLastCompaction}. */
export interface ProjectLastCompactionOptions {
  /** Message estimator (defaults to the token-meter one). */
  readonly estimate?: ((message: Message) => number) | undefined
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
export function projectLastCompaction(
  events: readonly SessionEvent[],
  sessionId: string,
  options: ProjectLastCompactionOptions = {},
): InspectLastCompaction | null {
  const estimate = options.estimate ?? estimateMessage
  let latestStart: SessionEvent<'compaction/start'> | undefined
  const summaries = new Map<CompactionId, SessionEvent<'compaction/summary'>>()
  const ends = new Map<CompactionId, SessionEvent<'compaction/end'>>()
  const replacements = new Map<CompactionId, SessionEvent<'user/message'>>()
  for (const event of events) {
    switch (event.type) {
      case 'compaction/start':
        latestStart = event
        break
      case 'compaction/summary':
        summaries.set(event.data.compactionId, event)
        break
      case 'compaction/end':
        ends.set(event.data.compactionId, event)
        break
      case 'user/message':
        if (event.data.source?.kind === 'compact-checkpoint') {
          replacements.set(event.data.source.compactionId, event)
        }
        break
      default:
        break
    }
  }
  if (latestStart === undefined) return null
  const id = latestStart.data.compactionId
  const summary = summaries.get(id)
  const end = ends.get(id)
  const replacement = replacements.get(id)
  const observedFailure = lastCompactionFailure(sessionId)
  const failureMatches = observedFailure?.compactionId === id

  let status: InspectLastCompaction['status']
  if (end === undefined) {
    status = isSummaryActive(sessionId, id) ? 'running' : 'failed'
  } else if (failureMatches && observedFailure.status === 'persistence-error') {
    status = 'persistence-error'
  } else if (end.data.error !== undefined) {
    status = /abort|cancel/i.test(end.data.error) ? 'cancelled' : 'failed'
  } else {
    status = 'completed'
  }

  const mode: CompactionMode | null =
    summary === undefined ? null : detectSummaryMode(summaryText(summary.data.summary))
  const error: string | null =
    end?.data.error ??
    (failureMatches && status !== 'completed' ? observedFailure!.message : undefined) ??
    null

  return {
    id,
    trigger: latestStart.data.turn === null ? 'manual' : 'automatic',
    status,
    mode,
    beforeTokens: summary?.data.shadowedTokenCount ?? null,
    afterTokens: replacement === undefined ? null : estimate(replacement.data),
    durationMs: end === undefined ? null : end.time - latestStart.time,
    cacheReadTokens: summary?.data.usage?.cacheReadTokens ?? null,
    cacheWriteTokens: summary?.data.usage?.cacheWriteTokens ?? null,
    error,
  }
}

/** Inputs of one budget/preview projection. */
export interface BudgetPreviewInput {
  /** Host context; accepted for call-site compatibility and unused here. */
  readonly ctx?: unknown
  readonly session: Session | null
  readonly events: readonly SessionEvent[]
  readonly activeConfig: ConfigSnapshot
  readonly measurement?: TokenMeasurement | undefined
  readonly modelInfo?: ModelInfoFace | undefined
  readonly modelInfoError?: string | undefined
}

/** Budget/preview sections of the inspect payload. */
export interface BudgetPreviewSections {
  readonly budget: InspectBudget
  readonly preview: InspectPreview | null
  readonly diagnostics: string[]
}

/**
 * Build the budget/preview section for one session.
 * @param input - resolved inspection inputs.
 * @returns sections.
 */
export function buildBudgetPreview(input: BudgetPreviewInput): BudgetPreviewSections {
  const { session, events, activeConfig } = input
  const header = latestHeader(events)
  const target = targetFromHeader(header)
  const diagnostics: string[] = []
  const info = input.modelInfo
  const measurement = input.measurement
  const toolsTokens = estimateToolsTokens(header)
  const contextWindow = info?.context?.contextWindow ?? null
  let spec: ReturnType<typeof resolveCompactSpec> | undefined
  let policy: ReturnType<typeof resolveTargetPolicy> | undefined
  let budgetReason: string | undefined
  if (target === undefined) {
    budgetReason = 'no routed request exists yet, so the pressure threshold cannot be resolved; send one request or configure summarizationProvider/Model'
  } else if (contextWindow === null) {
    budgetReason =
      input.modelInfoError ??
      `no context capacity is known for ${target.provider}/${target.model}; configure contextWindow on that adapter model`
  } else {
    policy = resolveTargetPolicy(activeConfig, target)
    const reserved = reservedCompletionTokens(header, info?.defaultMaxTokens)
    try {
      spec = resolveCompactSpec(policy, contextWindow, reserved)
    } catch (error) {
      budgetReason = error instanceof Error ? error.message : String(error)
    }
  }
  if (budgetReason !== undefined) diagnostics.push(budgetReason)

  const reservedCompletion = target === undefined ? null : reservedCompletionTokens(header, info?.defaultMaxTokens)
  const budget: InspectBudget = {
    target: target ?? null,
    contextWindow,
    reservedCompletionTokens: reservedCompletion,
    messageBudgetTokens: contextWindow === null || reservedCompletion === null ? null : contextWindow - reservedCompletion,
    headroomTokens: policy?.headroomTokens ?? null,
    pressureBudgetTokens: policy === undefined || contextWindow === null || reservedCompletion === null ? null : contextWindow - reservedCompletion - policy.headroomTokens,
    ratioThresholdTokens: policy === undefined || contextWindow === null ? null : Math.floor(contextWindow * policy.thresholdRatio),
    currentTokens: measurement?.totalTokens ?? null,
    measurement: measurementKind(measurement),
    fixedTokens:
      session !== null && measurement !== undefined
        ? fixedPrefixTokens(session, measurement, toolsTokens)
        : null,
    thresholdTokens: spec?.thresholdTokens ?? null,
    retainTokens: spec?.retainTokens ?? null,
    summaryMaxTokens: policy?.maxTokens ?? activeConfig.maxTokens,
  }

  if (session === null || measurement === undefined) {
    return {
      budget,
      preview: null,
      diagnostics: [
        ...diagnostics,
        measurement === undefined ? 'token measurement is unavailable for this session' : 'session surface is unavailable; token measurement could not be projected',
      ],
    }
  }

  let range: { start: SessionSeq; end: SessionSeq } | null = null
  let selectionError: string | undefined
  if (budgetReason === undefined) {
    try {
      range = selectCompactableRange(session, measurement, spec!.retainTokens)
    } catch (error) {
      selectionError = error instanceof Error ? error.message : String(error)
    }
  }

  if (budgetReason !== undefined || selectionError !== undefined) {
    if (selectionError !== undefined) diagnostics.push(selectionError)
    return {
      budget,
      preview: {
        beforeTokens: measurement.totalTokens,
        afterUpperBoundTokens: null,
        rangeStart: null,
        rangeEnd: null,
        reason: (budgetReason ?? selectionError)!,
      },
      diagnostics,
    }
  }

  if (range === null) {
    return {
      budget,
      preview: {
        beforeTokens: measurement.totalTokens,
        afterUpperBoundTokens: null,
        rangeStart: null,
        rangeEnd: null,
        reason:
          'no safe compactable range: the session has no older balanced span left after the system prompt and retained tail, or every candidate would split a tool-call/result pair',
      },
      diagnostics,
    }
  }

  const surface = session.surface.nodes
  const endIndex = surface.indexOf(range.end)
  let tailTokens = 0
  if (endIndex >= 0) {
    for (let index = endIndex + 1; index < measurement.nodes.length; index += 1) {
      tailTokens += measurement.nodes[index]!.tokens
    }
  }
  const afterUpperBoundTokens =
    (budget.fixedTokens ?? 0) + tailTokens + spec!.maxTokens + NATIVE_CHECKPOINT_FRAMING_TOKENS
  const belowTrigger =
    measurement.totalTokens >= spec!.thresholdTokens
      ? null
      : `current ${measurement.totalTokens} tokens are below the automatic trigger ${spec!.thresholdTokens}; this is the candidate range, not a running compaction`
  const autoDisabled =
    activeConfig.auto === false
      ? 'automatic compaction is disabled (auto=false); this preview is informational only'
      : null
  const reason =
    belowTrigger === null && autoDisabled === null
      ? null
      : [belowTrigger, autoDisabled].filter((part) => part !== null).join('; ')
  return {
    budget,
    preview: {
      beforeTokens: measurement.totalTokens,
      afterUpperBoundTokens,
      retainedTokens: tailTokens,
      replacedTokens: measurement.totalTokens - (budget.fixedTokens ?? 0) - tailTokens,
      checkpointFramingTokens: NATIVE_CHECKPOINT_FRAMING_TOKENS,
      rangeStart: range.start,
      rangeEnd: range.end,
      reason,
    },
    diagnostics,
  }
}

/** Session-query failure fields this route classifies. */
interface SessionQueryFailure {
  readonly code?: unknown
  readonly sessionId?: unknown
  readonly message?: unknown
}

/** Map a session-query failure to an inspect error. */
function mapSessionQueryError(error: unknown): InspectError {
  const failed = error as SessionQueryFailure | null | undefined
  const code = typeof failed?.code === 'string' ? failed.code : ''
  if (code === 'SESSION_QUERY_SESSION_NOT_FOUND') {
    return new InspectError(404, 'SESSION_NOT_FOUND', `session "${String(failed?.sessionId ?? '')}" was not found or is not visible to this host`.trim())
  }
  if (code === 'SESSION_QUERY_PERSISTENCE_FAILED') {
    return new InspectError(503, 'SESSION_QUERY_UNAVAILABLE', `session persistence is unavailable: ${String(failed?.message)}`)
  }
  if (code === 'SESSION_QUERY_ABORTED') {
    return new InspectError(503, 'INSPECTION_ABORTED', String(failed?.message))
  }
  return new InspectError(503, 'SESSION_QUERY_UNAVAILABLE', `session inspection failed: ${error instanceof Error ? error.message : String(error)}`)
}

/**
 * Resolve a live or cold session into a replay object plus its events.
 */
async function resolveSession(ctx: ContextReader, sessionId: string): Promise<ResolvedSession> {
  const agents = service<InspectAgentsService>(ctx, 'agents')
  const liveAgent = agents?.get(sessionId)
  if (liveAgent !== undefined) {
    return { session: liveAgent.session, events: eventsOf(liveAgent.session), agent: liveAgent, cold: false }
  }
  const sessions = service<InspectSessionsService>(ctx, 'sessions')
  const liveSession = sessions?.get(sessionId)
  if (liveSession !== undefined) {
    return { session: liveSession, events: eventsOf(liveSession), agent: undefined, cold: false }
  }
  const sessionQuery = service<InspectSessionQueryService>(ctx, 'sessionQuery')
  if (sessionQuery === undefined) {
    throw new InspectError(
      503,
      'SESSION_QUERY_UNAVAILABLE',
      'this host has no session-query service, so a non-live session cannot be inspected; the live session remains inspectable',
    )
  }
  let observation: SessionObservation
  try {
    observation = await sessionQuery.observeSession(sessionId)
  } catch (error) {
    throw mapSessionQueryError(error)
  }
  try {
    const events = [...observation.events]
    let session: Session | null = null
    try {
      const projections = sessions?.messageProjections ?? []
      session = Session.create(
        observation.header.id,
        observation.events,
        observation.header,
        observation.inheritedEventCount,
        projections,
      )
    } catch {
      session = null
    }
    return { session, events, agent: undefined, cold: true }
  } finally {
    try {
      observation[Symbol.dispose]?.()
    } catch {
      // A failed lease release must not turn a successful read into an error.
    }
  }
}

/**
 * Build the complete inspect payload.
 *
 * @param ctx - host companion context.
 * @param companion - `betterCompactConfig` provider.
 * @param sessionId - optional requested session id.
 * @returns response payload.
 */
export async function inspectPlugin(
  ctx: ContextReader,
  companion: InspectCompanion,
  sessionId: string | null = null,
): Promise<InspectPayload> {
  const activeConfig = companion.snapshot()
  let requiresReload: boolean
  try {
    requiresReload = !configEquals(companion.current(), activeConfig)
  } catch {
    // A saved value that no longer normalizes is still "different from the
    // active snapshot"; the running engine keeps its frozen configuration.
    requiresReload = true
  }
  if (sessionId === null) return emptyPayload(activeConfig, requiresReload)

  const resolved = await resolveSession(ctx, sessionId)
  const events = resolved.events
  const lastCompaction = projectLastCompaction(events, sessionId)
  const engine = engineOwnership(ctx, resolved)
  const handoffContinuation: InspectHandoffContinuation | null = continuationOutcome(sessionId)
  if (!engine.inspectApplies) {
    return {
      activeConfig,
      requiresReload,
      sessionId,
      engine,
      diagnostics: [engine.reason].filter((value): value is string => value !== null),
      budget: null,
      preview: null,
      lastCompaction,
      handoffContinuation,
    }
  }
  const tokenMeter = service<InspectTokenMeterService>(ctx, 'tokenMeter')
  let measurement: TokenMeasurement | undefined
  let measurementFailure: string | undefined
  if (resolved.session !== null && tokenMeter !== undefined) {
    try {
      measurement = tokenMeter.measure(resolved.session)
    } catch (error) {
      measurementFailure = error instanceof Error ? error.message : String(error)
    }
  }

  const header = latestHeader(events)
  const target = targetFromHeader(header)
  let info: ModelInfoFace | undefined
  let modelInfoError: string | undefined
  if (target !== undefined) {
    const llm = service<InspectLlmService>(ctx, 'llm')
    if (llm !== undefined) {
      try {
        info = await llm.resolveModelInfo(target.provider, target.model)
      } catch (error) {
        modelInfoError = `model metadata is unavailable for ${target.provider}/${target.model}: ${error instanceof Error ? error.message : String(error)}`
        measurementFailure ??= modelInfoError
      }
    }
  }

  const sections = buildBudgetPreview({
    ctx,
    session: resolved.session,
    events,
    activeConfig,
    measurement,
    modelInfo: info,
    modelInfoError,
  })
  const diagnostics = [...sections.diagnostics]
  if (measurementFailure !== undefined) diagnostics.push(measurementFailure)
  const fallback = lastBudgetFallback(sessionId)
  if (fallback !== null) {
    diagnostics.push(
      `the last enhanced summary omitted authoritative state to fit the model budget: ${fallback.omitted.join('; ')}`,
    )
  }
  if (engine.reason !== null) diagnostics.push(engine.reason)

  return {
    activeConfig,
    requiresReload,
    sessionId,
    engine,
    diagnostics: [...new Set(diagnostics.filter((entry) => typeof entry === 'string' && entry.length > 0))],
    budget: sections.budget,
    preview: sections.preview,
    lastCompaction,
    handoffContinuation,
  }
}
