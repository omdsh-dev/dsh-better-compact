/**
 * Settings-form draft: the editable string snapshot of one plugin row, the
 * validation the page can do before a save, and the single atomic mutation
 * derived from it.
 *
 * Pure functions only — no React, no network — so the page stays a renderer and
 * this file stays unit-testable. The host schema remains the final authority:
 * everything here exists so a user does not have to round-trip a rejected save.
 *
 * Behaviour is the pre-TypeScript client bundle's (`policyDraft` … `buildOps`);
 * the additions are types.
 */

import type { SettingsPathOpView } from '@deepseek-ai/dsh-api-remotes/client'

import { MAX_CUSTOM_PROMPT_CHARS, MODES, type ModelRoute } from '../shared/contract.ts'
import { t } from './locales/index.ts'
import type { MessageKey } from './locales/zh.ts'

/** One path-addressed settings mutation, as `form.mutate` accepts it. */
export type PathOp = SettingsPathOpView

/** Value carried by a `set` op. */
type PathOpValue = Extract<SettingsPathOpView, { op: 'set' }>['value']

/** Retention strategy of one model policy. */
export type PolicyRetainMode = 'inherit' | 'ratio' | 'tokens'

/** How one model policy picks its summary model. */
export type PolicySummaryMode = 'inherit' | 'session' | 'custom'

/** Retention strategy of the whole row. */
export type DraftRetainMode = 'ratio' | 'tokens'

/**
 * Editable draft of one exact-target model policy. Every number is a string:
 * the draft is what the inputs hold, not what the host schema accepts.
 */
export interface PolicyDraft {
  provider: string
  model: string
  retainMode: PolicyRetainMode
  retainRatio: string
  retainTokens: string
  summaryMode: PolicySummaryMode
  summarizationProvider: string
  summarizationModel: string
  thresholdRatio: string
  headroomTokens: string
  maxTokens: string
  compactionRetries: string
  maxOverflowRetries: string
}

/** Editable draft of the whole row. */
export interface ConfigDraft {
  mode: string
  customPrompt: string
  provider: string
  model: string
  effort: string
  thresholdRatio: string
  headroomTokens: string
  retainMode: DraftRetainMode
  retainRatio: string
  retainTokens: string
  cachePriority: boolean
  summaryImage: boolean
  auto: boolean
  policies: PolicyDraft[]
  maxTokens: string
  compactionRetries: string
  maxOverflowRetries: string
}

/** One validation message, addressed to one form field. */
export interface DraftError {
  field: string
  message: string
}

/** Provider/model identity of one summary route. */
export interface ModelRef {
  provider: string
  model: string
}

/** The policy fields that carry a number, in form order. */
export type PolicyNumberKey =
  | 'thresholdRatio'
  | 'headroomTokens'
  | 'maxTokens'
  | 'compactionRetries'
  | 'maxOverflowRetries'

/**
 * Numeric policy fields with their label key and whether they are ratios.
 * Shared by the draft conversion, the validation, and the advanced section.
 */
export const POLICY_NUMBERS: readonly (readonly [PolicyNumberKey, MessageKey, true?])[] = Object.freeze([
  ['thresholdRatio', 'threshold', true], ['headroomTokens', 'headroom'],
  ['maxTokens', 'summaryOutputCap'], ['compactionRetries', 'pressureRetry'], ['maxOverflowRetries', 'overflowRecovery'],
])

/**
 * Retention ratio assumed when the draft leaves it empty. Mirrors the host
 * default (`src/config.ts` DEFAULTS.retainRatio); kept local because the shared
 * contract does not carry host defaults.
 */
export const DEFAULT_RETAIN_RATIO = 0.16

/** Convert one saved model policy into its editable draft. */
export function policyDraft(value: unknown = {}): PolicyDraft {
  const source = value as Record<string, unknown>
  const result: PolicyDraft = {
    provider: (source.provider ?? '') as string,
    model: (source.model ?? '') as string,
    retainMode: source.retainTokens != null ? 'tokens' : source.retainRatio != null ? 'ratio' : 'inherit',
    retainRatio: source.retainRatio != null ? String(source.retainRatio) : '',
    retainTokens: source.retainTokens != null ? String(source.retainTokens) : '',
    summaryMode: source.summarizationProvider === undefined ? 'inherit' : source.summarizationProvider === '' ? 'session' : 'custom',
    summarizationProvider: (source.summarizationProvider ?? '') as string,
    summarizationModel: (source.summarizationModel ?? '') as string,
    thresholdRatio: '',
    headroomTokens: '',
    maxTokens: '',
    compactionRetries: '',
    maxOverflowRetries: '',
  }
  for (const [key] of POLICY_NUMBERS) result[key] = source[key] == null ? '' : String(source[key])
  return result
}

/** Convert one editable model policy back into its stored shape. */
export function policyValue(draft: PolicyDraft): Record<string, string | number> {
  const value: Record<string, string | number> = { provider: draft.provider, model: draft.model }
  for (const [key] of POLICY_NUMBERS) if (draft[key] !== '') value[key] = Number(draft[key])
  if (draft.retainMode === 'ratio' && draft.retainRatio !== '') value.retainRatio = Number(draft.retainRatio)
  if (draft.retainMode === 'tokens' && draft.retainTokens !== '') value.retainTokens = Number(draft.retainTokens)
  if (draft.summaryMode !== 'inherit') {
    value.summarizationProvider = draft.summaryMode === 'session' ? '' : draft.summarizationProvider
    value.summarizationModel = draft.summaryMode === 'session' ? '' : draft.summarizationModel
  }
  return value
}

/** Convert one accepted row value into the editable draft. */
export function draftFromValue(value: unknown): ConfigDraft {
  const source = (value !== null && typeof value === 'object' ? value : {}) as Record<string, unknown>
  const hasRetainTokens = source.retainTokens !== undefined && source.retainTokens !== null
  return {
    mode: typeof source.mode === 'string' ? source.mode : '',
    customPrompt: typeof source.customPrompt === 'string' ? source.customPrompt : '',
    provider: typeof source.summarizationProvider === 'string' ? source.summarizationProvider : '',
    model: typeof source.summarizationModel === 'string' ? source.summarizationModel : '',
    effort: typeof source.reasoningEffort === 'string' ? source.reasoningEffort : '',
    thresholdRatio: typeof source.thresholdRatio === 'number' ? String(source.thresholdRatio) : '',
    headroomTokens: typeof source.headroomTokens === 'number' ? String(source.headroomTokens) : '',
    retainMode: hasRetainTokens ? 'tokens' : 'ratio',
    retainRatio: typeof source.retainRatio === 'number' ? String(source.retainRatio) : '',
    retainTokens: hasRetainTokens ? String(source.retainTokens) : '',
    cachePriority: source.cachePriority === true,
    summaryImage: source.summaryImage === true,
    auto: source.auto === true,
    policies: (Array.isArray(source.modelPolicies) ? source.modelPolicies : []).map(policyDraft),
    maxTokens: typeof source.maxTokens === 'number' ? String(source.maxTokens) : '',
    compactionRetries: typeof source.compactionRetries === 'number' ? String(source.compactionRetries) : '',
    maxOverflowRetries: typeof source.maxOverflowRetries === 'number' ? String(source.maxOverflowRetries) : '',
  }
}

/**
 * Compare scalar fields and the ordered model-policy drafts. The retention form
 * the draft does not use is ignored, so a hidden ratio/token value cannot keep
 * the page marked dirty.
 */
export function equalDraft(left: ConfigDraft | null, right: ConfigDraft | null): boolean {
  if (left === null || right === null) return left === right
  const leftRecord = left as unknown as Record<string, unknown>
  const rightRecord = right as unknown as Record<string, unknown>
  const keys = Object.keys(leftRecord)
  if (keys.length !== Object.keys(rightRecord).length) return false
  for (const key of keys) {
    if (key === 'retainTokens' && left.retainMode !== 'tokens' || key === 'retainRatio' && left.retainMode !== 'ratio') continue
    if (key === 'policies'
      ? JSON.stringify(left.policies.map(policyValue)) !== JSON.stringify(right.policies.map(policyValue))
      : leftRecord[key] !== rightRecord[key]) return false
  }
  return true
}

/**
 * Validate the editable draft before a save. The host schema remains the final
 * authority; this catches the fields the page can reason about so a user does
 * not have to round-trip a rejected save.
 */
export function validateDraft(draft: ConfigDraft): DraftError[] {
  const errors: DraftError[] = []
  const add = (field: string, message: string) => errors.push({ field, message })
  if (!(MODES as readonly string[]).includes(draft.mode)) add('mode', t('validationMode'))
  if (draft.mode === 'custom' && draft.customPrompt.trim().length === 0) add('customPrompt', t('processpromptEmpty'))
  else if (draft.customPrompt.length > MAX_CUSTOM_PROMPT_CHARS) add('customPrompt', t('processpromptTooLong'))
  const validRatio = (value: string) => value !== '' && Number.isFinite(Number(value)) && Number(value) > 0 && Number(value) < 1
  const validInt = (value: string, min = 0) => value !== '' && Number.isSafeInteger(Number(value)) && Number(value) >= min
  if (!validRatio(draft.thresholdRatio)) add('thresholdRatio', t('validationThreshold'))
  if (!validInt(draft.headroomTokens)) add('headroomTokens', t('validationHeadroom'))
  const retainRatio = draft.retainRatio === '' ? DEFAULT_RETAIN_RATIO : Number(draft.retainRatio)
  if (draft.retainMode === 'tokens') {
    if (!validInt(draft.retainTokens)) add('retainTokens', t('validationRetainTokens'))
  } else if (!validRatio(String(retainRatio)) || retainRatio >= Number(draft.thresholdRatio)) {
    add('retainRatio', t('validationRetainRatio'))
  }
  if ((draft.provider === '') !== (draft.model === '')) add('summarizationModel', t('validationSummaryPair'))
  if (draft.effort !== '' && draft.effort.trim() === '') add('reasoningEffort', t('validationEffortSpaces'))
  if (draft.maxTokens !== '' ? !validInt(draft.maxTokens, 1) : Number(draft.headroomTokens) === 0) {
    add('maxTokens', t('validationMaxTokens'))
  }
  for (const key of ['compactionRetries', 'maxOverflowRetries'] as const) {
    if (!validInt(draft[key])) add(key, t('validationRetries'))
  }
  const seen = new Set<string>()
  draft.policies.forEach((policy, index) => {
    const prefix = 'policies.' + index + '.'
    const identity = JSON.stringify([policy.provider, policy.model])
    if (!policy.provider || !policy.model) add(prefix + 'model', t('validationPolicyModel'))
    else if (seen.has(identity)) add(prefix + 'model', t('validationDuplicatePolicy'))
    seen.add(identity)
    for (const [key, labelKey, ratio] of POLICY_NUMBERS) {
      if (policy[key] !== '' && !(ratio ? validRatio(policy[key]) : validInt(policy[key], key === 'maxTokens' ? 1 : 0))) {
        add(prefix + key, t(labelKey) + t(ratio ? 'validationSuffixRatio' : key === 'maxTokens' ? 'validationSuffixPositive' : 'validationSuffixNonNegative'))
      }
    }
    const threshold = Number(policy.thresholdRatio || draft.thresholdRatio)
    const ratio = policy.retainMode === 'ratio' ? Number(policy.retainRatio) : retainRatio
    if (policy.retainMode === 'tokens') {
      if (!validInt(policy.retainTokens)) add(prefix + 'retainTokens', t('validationPolicyRetainTokens'))
    } else if (policy.retainMode === 'ratio' || draft.retainMode === 'ratio') {
      if (!(ratio > 0 && ratio < threshold)) add(prefix + 'retainRatio', t('validationPolicyRetainRatio'))
    }
    if (policy.summaryMode === 'custom' && (!policy.summarizationProvider || !policy.summarizationModel)) {
      add(prefix + 'summarizationModel', t('validationPolicySummaryPair'))
    }
    if (policy.maxTokens === '' && draft.maxTokens === '' && Number(policy.headroomTokens || draft.headroomTokens) === 0) {
      add(prefix + 'maxTokens', t('validationPolicyMaxTokens'))
    }
  })
  return errors
}

/**
 * Validate a known-incompatible effort. The allowed-candidate list is host
 * metadata (the subagent model allow-list), not a hard restriction on the
 * summary route, so a route outside that list is never silently deleted and
 * never blocks a save. Native mode does not apply enhanced effort at all.
 */
export function validateModelSelection(
  draft: ConfigDraft,
  routes: readonly ModelRoute[],
  routesKnown: boolean,
  target?: ModelRef | null,
): DraftError[] {
  if (draft.mode === 'native' || draft.effort === '' || !routesKnown) return []
  const candidates: { provider: string; model: string; field: string; label: string }[] = []
  if (draft.provider && draft.model) candidates.push({ provider: draft.provider, model: draft.model, field: 'reasoningEffort', label: t('validationGlobalSummaryModel') })
  draft.policies.forEach((policy, index) => {
    const provider = policy.summaryMode === 'custom' ? policy.summarizationProvider : policy.summaryMode === 'session' || !draft.provider ? policy.provider : draft.provider
    const model = policy.summaryMode === 'custom' ? policy.summarizationModel : policy.summaryMode === 'session' || !draft.model ? policy.model : draft.model
    candidates.push({ provider, model, field: 'policies.' + index + '.summarizationModel', label: t('validationRule', { provider: policy.provider, model: policy.model }) })
  })
  if (!draft.provider && target && !draft.policies.some((policy) => policy.provider === target.provider && policy.model === target.model)) {
    candidates.push({ provider: target.provider, model: target.model, field: 'reasoningEffort', label: t('validationFollowedSummaryModel') })
  }
  return candidates.flatMap((candidate) => {
    const route = routes.find((entry) => entry.provider === candidate.provider && entry.model === candidate.model)
    return route && !route.efforts.includes(draft.effort) ? [{ field: candidate.field,
      message: t('validationEffortUnsupported', { label: candidate.label, provider: candidate.provider, model: candidate.model, effort: draft.effort }) }] : []
  })
}

/** Non-blocking marker for a saved route outside the candidate metadata. */
export function routeCandidateWarning(draft: ConfigDraft, routes: readonly ModelRoute[], routesKnown: boolean): string | null {
  if (draft.provider === '' || draft.model === '' || !routesKnown) return null
  if (routes.some((entry) => entry.provider === draft.provider && entry.model === draft.model)) return null
  return t('routeWarning', { provider: draft.provider, model: draft.model })
}

/** The allowed route matching the draft, when the catalog is known. */
export function routeForDraft(draft: ConfigDraft, routes: readonly ModelRoute[]): ModelRoute | undefined {
  return routes.find((entry) => entry.provider === draft.provider && entry.model === draft.model)
}

/**
 * Build one atomic mutation from the draft. Only fields the page owns are
 * written; unchanged model policies are preserved. Retention writes always
 * clear the other form, so a hidden ratio/token conflict cannot survive a save.
 */
export function buildOps(draft: ConfigDraft, value: unknown): PathOp[] {
  const current = (value !== null && typeof value === 'object' ? value : {}) as Record<string, unknown>
  const ops: PathOp[] = []
  const setIfChanged = (path: string[], next: PathOpValue, previous: unknown) => {
    if (next !== previous) ops.push({ op: 'set', path, value: next })
  }
  setIfChanged(['mode'], draft.mode, current.mode)
  setIfChanged(['customPrompt'], draft.customPrompt, typeof current.customPrompt === 'string' ? current.customPrompt : '')
  if (
    draft.provider !== (typeof current.summarizationProvider === 'string' ? current.summarizationProvider : '') ||
    draft.model !== (typeof current.summarizationModel === 'string' ? current.summarizationModel : '')
  ) {
    ops.push({ op: 'set', path: ['summarizationProvider'], value: draft.provider })
    ops.push({ op: 'set', path: ['summarizationModel'], value: draft.model })
  }
  setIfChanged(
    ['reasoningEffort'],
    draft.effort,
    typeof current.reasoningEffort === 'string' ? current.reasoningEffort : '',
  )
  setIfChanged(['thresholdRatio'], Number(draft.thresholdRatio), current.thresholdRatio)
  setIfChanged(['headroomTokens'], Number(draft.headroomTokens), current.headroomTokens)

  if (draft.retainMode === 'tokens') {
    ops.push({ op: 'unset', path: ['retainRatio'] })
    ops.push({ op: 'set', path: ['retainTokens'], value: Number(draft.retainTokens) })
  } else {
    ops.push({ op: 'unset', path: ['retainTokens'] })
    if (draft.retainRatio === '') {
      if (current.retainRatio !== undefined) ops.push({ op: 'unset', path: ['retainRatio'] })
    } else {
      ops.push({ op: 'set', path: ['retainRatio'], value: Number(draft.retainRatio) })
    }
  }

  setIfChanged(['cachePriority'], draft.cachePriority, current.cachePriority)
  setIfChanged(['summaryImage'], draft.summaryImage, current.summaryImage)
  setIfChanged(['auto'], draft.auto, current.auto)
  if (draft.maxTokens === '') {
    if (current.maxTokens !== undefined && current.maxTokens !== null) ops.push({ op: 'unset', path: ['maxTokens'] })
  } else {
    setIfChanged(['maxTokens'], Number(draft.maxTokens), current.maxTokens)
  }
  setIfChanged(['compactionRetries'], Number(draft.compactionRetries), current.compactionRetries)
  setIfChanged(['maxOverflowRetries'], Number(draft.maxOverflowRetries), current.maxOverflowRetries)
  if (JSON.stringify(draft.policies.map(policyValue)) !== JSON.stringify(draftFromValue(current).policies.map(policyValue))) {
    ops.push({ op: 'set', path: ['modelPolicies'], value: draft.policies.map(policyValue) })
  }
  return ops
}
