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

import { toolPairingBalancedAfter, toolPairingBalancedBefore } from '@deepseek-ai/dsh-compaction'
import type { ResolvedCompactSpec, ResolvedTargetPolicy } from '@deepseek-ai/dsh-compaction-basic'
import type { LlmCallConfig } from '@deepseek-ai/dsh-llm'
import type { EpochHeader, Session, SessionSeq } from '@deepseek-ai/dsh-session'
import type { TokenMeasurement } from '@deepseek-ai/dsh-token-meter'
import type { ConfigSnapshot, ModelPolicy } from './shared/contract.ts'

/** Exact provider/model route, matching the upstream resolver's target shape. */
export type ModelTarget = Pick<LlmCallConfig, 'provider' | 'model'>

/** Capacity/retention conflict resolved while preparing a summary call. */
export class BudgetConfigError extends Error {
  /** Stable machine code carried by every budget conflict. */
  readonly code = 'BETTER_COMPACT_BUDGET'
  /** Exact provider/model route whose configuration is unsatisfiable. */
  readonly targetKey: string

  /**
   * @param targetKey - exact provider/model route.
   * @param message - actionable configuration failure detail.
   */
  constructor(targetKey: string, message: string) {
    super(message)
    this.name = 'BudgetConfigError'
    this.targetKey = targetKey
  }
}

/** Request header fields the reservation helper reads. */
export interface ReservedTokensHeader {
  readonly config: {
    readonly maxTokens?: number
  }
}

/** Measurement shape the inspect `measurement` vocabulary is derived from. */
export interface BaselineKindLike {
  readonly baseline?:
    | { readonly kind?: string; readonly tokens?: number; readonly usage?: unknown }
    | null
}

/** Inspect vocabulary for how a token count was obtained. */
export type MeasurementKind = 'measured' | 'estimated' | 'unavailable'

/**
 * Resolve the exact provider/model routed for the latest durable request.
 * @param session - session carrying request headers.
 * @returns routed target.
 */
export function routedTarget(session: Session): ModelTarget | undefined {
  const config = session.requestHeader()?.config
  if (config === undefined || config.provider.length === 0 || config.model.length === 0) return undefined
  return { provider: config.provider, model: config.model }
}

/** Resolve a routed target from a plain request header (cold inspection). */
export function targetFromHeader(header: EpochHeader | undefined): ModelTarget | undefined {
  const config = header?.config
  if (config === undefined || typeof config.provider !== 'string' || typeof config.model !== 'string') return undefined
  if (config.provider.length === 0 || config.model.length === 0) return undefined
  return { provider: config.provider, model: config.model }
}

/**
 * Output tokens the routed request reserves, charged to the same window as the
 * prompt. The effective envelope's cap wins; otherwise the adapter default.
 * @param header - effective request header, including a proposed model switch.
 * @param defaultMaxTokens - adapter per-request default.
 * @returns reserved completion tokens.
 */
export function reservedCompletionTokens(
  header: ReservedTokensHeader | undefined,
  defaultMaxTokens?: number,
): number {
  return header?.config.maxTokens ?? defaultMaxTokens ?? 0
}

/**
 * Resolve retention from an override, else the already-resolved global form.
 * `readConfig` guarantees exactly one of the two global forms is set.
 */
function resolveOverrideRetention(
  override: ModelPolicy | undefined,
  config: ConfigSnapshot,
): { retainTokens: number } | { retainRatio: number } {
  if (override?.retainTokens !== undefined) return { retainTokens: override.retainTokens }
  if (override?.retainRatio !== undefined) return { retainRatio: override.retainRatio }
  return config.retainTokens !== null
    ? { retainTokens: config.retainTokens }
    : { retainRatio: config.retainRatio as number }
}

/**
 * Merge the exact provider/model override over the normalized global policy.
 * @param config - normalized plugin configuration (`readConfig`).
 * @param target - exact routed target.
 * @returns frozen merged policy before capacity scaling.
 */
export function resolveTargetPolicy(config: ConfigSnapshot, target: ModelTarget): ResolvedTargetPolicy {
  const override = config.modelPolicies.find(
    (policy) => policy.provider === target.provider && policy.model === target.model,
  )
  return Object.freeze({
    target: { provider: target.provider, model: target.model },
    thresholdRatio: override?.thresholdRatio ?? config.thresholdRatio,
    headroomTokens: override?.headroomTokens ?? config.headroomTokens,
    ...resolveOverrideRetention(override, config),
    summarizationProvider: override?.summarizationProvider ?? config.summarizationProvider,
    summarizationModel: override?.summarizationModel ?? config.summarizationModel,
    maxTokens: override?.maxTokens ?? config.maxTokens,
    compactionRetries: override?.compactionRetries ?? config.compactionRetries,
    maxOverflowRetries: override?.maxOverflowRetries ?? config.maxOverflowRetries,
  })
}

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
export function resolveCompactSpec(
  policy: ResolvedTargetPolicy,
  contextWindow: number,
  reservedTokens: number,
): ResolvedCompactSpec {
  const targetKey = `${policy.target.provider}/${policy.target.model}`
  if (!Number.isInteger(contextWindow) || contextWindow <= 0) {
    throw new BudgetConfigError(targetKey, `contextWindow (${String(contextWindow)}) must be a positive integer for ${targetKey}`)
  }
  if (!Number.isInteger(reservedTokens) || reservedTokens < 0) {
    throw new BudgetConfigError(targetKey, `reservedCompletionTokens (${String(reservedTokens)}) must be a non-negative integer for ${targetKey}`)
  }
  const messageBudgetTokens = contextWindow - reservedTokens
  if (messageBudgetTokens <= 0) {
    throw new BudgetConfigError(
      targetKey,
      `${targetKey} reserves ${reservedTokens} completion tokens of its ${contextWindow}-token context window, leaving no message budget; configure a larger adapter contextWindow or a smaller maxTokens`,
    )
  }
  const pressureBudgetTokens = messageBudgetTokens - policy.headroomTokens
  if (pressureBudgetTokens <= 0) {
    throw new BudgetConfigError(
      targetKey,
      `${targetKey} reserves ${reservedTokens} completion tokens and ${policy.headroomTokens} headroom tokens of its ${contextWindow}-token context window, leaving no pressure budget; reduce headroomTokens or maxTokens, or use a larger adapter contextWindow`,
    )
  }
  const thresholdTokens = Math.floor(Math.min(contextWindow * policy.thresholdRatio, pressureBudgetTokens))
  const retainTokens =
    policy.retainTokens === undefined
      ? Math.floor(messageBudgetTokens * (policy.retainRatio as number))
      : policy.retainTokens
  if (retainTokens >= thresholdTokens) {
    throw new BudgetConfigError(
      targetKey,
      `${targetKey} retainTokens (${retainTokens}) must be less than threshold tokens ${thresholdTokens}; lower the retention budget or raise the trigger`,
    )
  }
  return Object.freeze({
    target: { ...policy.target },
    contextWindow,
    thresholdRatio: policy.thresholdRatio,
    thresholdTokens,
    retainTokens,
    summarizationProvider: policy.summarizationProvider,
    summarizationModel: policy.summarizationModel,
    maxTokens: policy.maxTokens,
    compactionRetries: policy.compactionRetries,
    maxOverflowRetries: policy.maxOverflowRetries,
  })
}

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
export function selectCompactableRange(
  session: Session,
  measurement: TokenMeasurement,
  retainTokens: number,
): { start: SessionSeq; end: SessionSeq } | null {
  const pricedNodes = measurement.nodes
  if (pricedNodes.length === 0) return null
  const surfaceNodes = session.surface.nodes
  if (
    surfaceNodes.length !== pricedNodes.length ||
    surfaceNodes.some((seq, index) => seq !== pricedNodes[index]?.seq)
  ) {
    throw new Error('compaction: token-meter surface does not match the current session surface')
  }
  const head = session.eventAt(surfaceNodes[0] as SessionSeq)
  const firstIdx = head?.type === 'system/message' ? 1 : 0
  let accumulated = 0
  let keepFromIdx = pricedNodes.length
  for (let index = pricedNodes.length - 1; index >= 0; index -= 1) {
    accumulated += pricedNodes[index]!.tokens
    keepFromIdx = index
    if (accumulated >= retainTokens) break
  }
  if (keepFromIdx <= firstIdx) return null
  while (keepFromIdx > firstIdx) {
    if (toolPairingBalancedBefore(session, surfaceNodes[keepFromIdx] as SessionSeq)) break
    keepFromIdx -= 1
  }
  if (keepFromIdx <= firstIdx) return null
  return {
    start: surfaceNodes[firstIdx] as SessionSeq,
    end: surfaceNodes[keepFromIdx - 1] as SessionSeq,
  }
}

/**
 * Price the fixed prefix a compaction can never remove: the tool schema tokens
 * plus a leading `system/message` surface node when present.
 *
 * @param session - session with an authoritative current surface.
 * @param measurement - token-meter measurement for that surface.
 * @param toolsTokens - priced tool-schema tokens.
 * @returns fixed prefix tokens, or null when not measurable.
 */
export function fixedPrefixTokens(
  session: Session,
  measurement: Pick<TokenMeasurement, 'nodes'> | null | undefined,
  toolsTokens: number,
): number | null {
  if (measurement === undefined || measurement === null) return null
  let fixed = toolsTokens
  const first = measurement.nodes[0]
  if (first !== undefined) {
    const head = session.eventAt(first.seq)
    if (head?.type === 'system/message') fixed += first.tokens
  }
  return fixed
}

/** Map a token-meter baseline to the inspect `measurement` vocabulary. */
export function measurementKind(measurement: BaselineKindLike | null | undefined): MeasurementKind {
  if (measurement === undefined || measurement === null) return 'unavailable'
  return measurement.baseline?.kind === 'usage' ? 'measured' : 'estimated'
}

/**
 * Sum the route-priced tokens of the retained tail (including the retained
 * system node when the range is impossible). Used only for an upper-bound
 * preview, never as a result prediction.
 *
 * @param measurement - token-meter measurement.
 * @param keepFromIndex - first retained node index.
 * @returns tail tokens when known.
 */
export function retainedTailTokens(
  measurement: Pick<TokenMeasurement, 'nodes'> | undefined,
  keepFromIndex: number | undefined,
): number | null {
  if (measurement === undefined || keepFromIndex === undefined) return null
  let total = 0
  for (let index = keepFromIndex; index < measurement.nodes.length; index += 1) {
    total += measurement.nodes[index]!.tokens
  }
  return total
}
