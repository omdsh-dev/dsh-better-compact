/**
 * Host-side configuration contract for dsh-better-compact.
 *
 * This module is the single source of truth for the plugin row's settings
 * schema and for the normalized configuration the host companion publishes to
 * the engine and to the read-only inspect route. The Loader re-exports
 * `Config` from the companion entry; DSH validates and resolves the row
 * config through that schema.
 *
 * Every field is `.volatile()`: the shipped settings service can read and save
 * the values without remounting the row. That is also why the engine takes one
 * frozen load-time snapshot instead of hot-updating: saving a value is not the
 * same as applying it to a running engine. `current()` reads the live volatile
 * value, `snapshot()` is the value the running engine actually holds.
 *
 * Native key names, units, and defaults are preserved from
 * `@deepseek-ai/dsh-compaction-basic` 0.2.1-rc.2. The enhanced-only keys
 * (`mode`, `reasoningEffort`, `cachePriority`, `customPrompt`) are stripped before the
 * native engine base receives the configuration.
 *
 * Stable identifiers and the normalized wire shapes live in
 * `./shared/contract.ts`; they are re-exported here so the pre-TypeScript import
 * surface of this module is unchanged.
 */

import { isDeepStrictEqual } from 'node:util'
import z from '@deepseek-ai/schemastery'
import type { BasicCompactionConfig } from '@deepseek-ai/dsh-compaction-basic'
import { MAX_CUSTOM_PROMPT_CHARS, MODES } from './shared/contract.ts'
import type { CompactionMode, ConfigSnapshot, ModelPolicy } from './shared/contract.ts'

export {
  APOLLO_LEGACY_ROW_CONFIG_KEY,
  APOLLO_ROW_CONFIG_KEY,
  BETTER_DSH_ROW_CONFIG_KEY,
  ENGINE_ENTRY_ID,
  ENTRY_ID,
  MAX_CUSTOM_PROMPT_CHARS,
  MODES,
  PACKAGE_NAME,
  ROW_CONFIG_KEYS,
  ROW_CONFIG_KEY,
} from './shared/contract.ts'

/** Native keys accepted by `BasicCompactionEngine` (native semantics/units). */
export const NATIVE_CONFIG_KEYS: readonly string[] = Object.freeze([
  'thresholdRatio',
  'headroomTokens',
  'retainRatio',
  'retainTokens',
  'summarizationProvider',
  'summarizationModel',
  'maxTokens',
  'compactionRetries',
  'maxOverflowRetries',
  'modelPolicies',
  'auto',
])

/** Exact-target override keys preserved from the native engine. */
export const MODEL_POLICY_KEYS: readonly string[] = Object.freeze([
  'provider',
  'model',
  'thresholdRatio',
  'headroomTokens',
  'retainRatio',
  'retainTokens',
  'summarizationProvider',
  'summarizationModel',
  'maxTokens',
  'compactionRetries',
  'maxOverflowRetries',
])

/** Enhanced-only keys stripped before the native engine sees the config. */
export const ENHANCED_CONFIG_KEYS: readonly string[] = Object.freeze([
  'mode',
  'reasoningEffort',
  'cachePriority',
  'customPrompt',
  'summaryImage',
])

/** Complete accepted top-level key set. */
export const CONFIG_KEYS: readonly string[] = Object.freeze([
  ...ENHANCED_CONFIG_KEYS,
  ...NATIVE_CONFIG_KEYS.filter((key) => key !== 'auto'),
  'auto',
])
const CONFIG_KEY_SET: ReadonlySet<string> = new Set(CONFIG_KEYS)

/** Plain (non-volatile) default value for every accepted key. */
export interface ConfigDefaults {
  readonly mode: CompactionMode
  readonly auto: boolean
  readonly thresholdRatio: number
  readonly headroomTokens: number
  /** `null` because the default retention form is a ratio. */
  readonly retainRatio: number | null
  /** `null` because the default retention form is a ratio. */
  readonly retainTokens: number | null
  readonly summarizationProvider: string
  readonly summarizationModel: string
  readonly reasoningEffort: string
  readonly customPrompt: string
  readonly cachePriority: boolean
  readonly summaryImage: boolean
  /** `null` means "follow headroomTokens". */
  readonly maxTokens: number | null
  readonly compactionRetries: number
  readonly maxOverflowRetries: number
  readonly modelPolicies: readonly ModelPolicy[]
}

/** Plain defaults. `maxTokens: null` means "follow headroomTokens". */
export const DEFAULTS: ConfigDefaults = Object.freeze({
  mode: 'goal',
  auto: true,
  thresholdRatio: 0.8,
  headroomTokens: 65536,
  retainRatio: 0.16,
  retainTokens: null,
  summarizationProvider: '',
  summarizationModel: '',
  reasoningEffort: '',
  customPrompt: '',
  cachePriority: true,
  summaryImage: false,
  maxTokens: null,
  compactionRetries: 1,
  maxOverflowRetries: 1,
  modelPolicies: Object.freeze([]) as readonly ModelPolicy[],
})

/** One validated policy fragment before `provider`/`model` are attached. */
export interface PolicyFields {
  thresholdRatio?: number
  headroomTokens?: number
  retainRatio?: number
  retainTokens?: number
  summarizationProvider?: string
  summarizationModel?: string
  maxTokens?: number
  compactionRetries?: number
  maxOverflowRetries?: number
}

/**
 * A ratio inside `(0, 1)`, expressed with plain leaf bounds.
 *
 * The spec requires positive values below 1 for both the trigger and the
 * retention fraction. A transform node would enforce that exactly, but the
 * Web settings client rehydrates the serialized schema without the transform
 * callback; the row form then fails to decode and stays on "Reading
 * configuration…". Keep the schema plain and rehydratable: the one-step
 * representable range rejects 0 and 1, and {@link readConfig} still enforces
 * the exact exclusive check with an actionable message at load time.
 */
function ratioSchema(defaultValue?: number) {
  const schema = z.number().min(Number.MIN_VALUE).max(1 - Number.EPSILON)
  return defaultValue === undefined ? schema : schema.default(defaultValue)
}

/** One optional native policy fragment; omitted keys inherit the target. */
const modelPolicySchema = z.object({
  provider: z.string().required(),
  model: z.string().required(),
  thresholdRatio: ratioSchema(),
  headroomTokens: z.natural(),
  retainRatio: ratioSchema(),
  retainTokens: z.natural(),
  summarizationProvider: z.string(),
  summarizationModel: z.string(),
  maxTokens: z.natural().min(1),
  compactionRetries: z.natural(),
  maxOverflowRetries: z.natural(),
})

/**
 * The plugin row's formal configuration schema.
 *
 * Per-field constraints are real: ranges, integer steps, enum membership.
 * Cross-field constraints (mutually exclusive retention, summarization pair,
 * retention below threshold) are enforced by {@link readConfig} because
 * schemastery object schemas have no sibling-field validator; they fail at
 * plugin load/reload with an actionable message, and the settings form
 * validates them before a save is attempted. Keep every node rehydratable by
 * the Web settings client: a transform node loses its callback in the wire
 * schema and leaves the row form stuck on "Reading configuration…".
 */
export const Config = z.object({
  mode: z.union([...MODES]).default(DEFAULTS.mode).volatile(),
  auto: z.boolean().default(DEFAULTS.auto).volatile(),
  thresholdRatio: ratioSchema(DEFAULTS.thresholdRatio).volatile(),
  headroomTokens: z.natural().default(DEFAULTS.headroomTokens).volatile(),
  retainRatio: ratioSchema().volatile(),
  retainTokens: z.natural().volatile(),
  summarizationProvider: z.string().default(DEFAULTS.summarizationProvider).volatile(),
  summarizationModel: z.string().default(DEFAULTS.summarizationModel).volatile(),
  reasoningEffort: z.string().default(DEFAULTS.reasoningEffort).volatile(),
  customPrompt: z.string().max(MAX_CUSTOM_PROMPT_CHARS).default(DEFAULTS.customPrompt).volatile(),
  cachePriority: z.boolean().default(DEFAULTS.cachePriority).volatile(),
  summaryImage: z.boolean().default(DEFAULTS.summaryImage).volatile(),
  maxTokens: z.natural().min(1).volatile(),
  compactionRetries: z.natural().default(DEFAULTS.compactionRetries).volatile(),
  maxOverflowRetries: z.natural().default(DEFAULTS.maxOverflowRetries).volatile(),
  modelPolicies: z.array(modelPolicySchema).default([]).volatile(),
})

/** Shared cosmokit volatile-reference symbol (identical across package copies). */
const VOLATILE_WRITE: symbol = Symbol.for('cosmokit.volatile.write')

/** The readable half of a cosmokit volatile reference. */
interface VolatileRef {
  get(): unknown
}

/** Whether a value is a cosmokit volatile reference. */
function isVolatileRef(value: unknown): value is VolatileRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { get?: unknown }).get === 'function' &&
    VOLATILE_WRITE in value
  )
}

/** Read one field, unwrapping a volatile reference when present. */
function fieldOf(config: unknown, key: string): unknown {
  const value = (config as Record<string, unknown> | null | undefined)?.[key]
  return isVolatileRef(value) ? value.get() : value
}

/** Whether a value is one of the supported compaction modes. */
function isCompactionMode(value: unknown): value is CompactionMode {
  return (MODES as readonly unknown[]).includes(value)
}

/** Bounds for {@link requireInteger}. */
export interface IntegerBounds {
  /** Inclusive lower bound used when `positive` is not set. */
  min?: number
  /** Require a value strictly above zero instead of comparing with `min`. */
  positive?: boolean
}

/** Reject non-integer or out-of-range numeric values without coercion. */
function requireInteger(value: unknown, label: string, { min = 0, positive = false }: IntegerBounds = {}): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new TypeError(`${label} must be a safe integer, got ${String(value)}`)
  }
  if ((positive && value <= 0) || (!positive && value < min)) {
    throw new TypeError(
      `${label} must be ${positive ? 'a positive integer' : `an integer >= ${min}`}, got ${value}`,
    )
  }
  return value
}

/** Require a finite ratio strictly inside `(0, upper)`. */
function requireRatio(value: unknown, label: string, upper: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value >= upper) {
    throw new TypeError(`${label} must be a number in (0, ${upper}), got ${String(value)}`)
  }
  return value
}

/** Detect an explicitly present value (not `undefined`/`null`). */
function present(value: unknown): boolean {
  return value !== undefined && value !== null
}

/**
 * Validate, detach, and normalize one policy fragment shared by the defaults
 * and exact-target overrides.
 *
 * @param source - untrusted policy fields.
 * @param name - diagnostic prefix.
 * @param thresholdRatio - resolved threshold ratio for the retention check.
 * @returns detached policy fields.
 */
function normalizePolicy(source: unknown, name: string, thresholdRatio: number): PolicyFields {
  if (typeof source !== 'object' || source === null || Array.isArray(source)) {
    throw new TypeError(`${name} must be an object`)
  }
  const fields = source as Record<string, unknown>
  const policy: PolicyFields = {}
  const hasRatio = present(fields.retainRatio)
  const hasTokens = present(fields.retainTokens)
  if (hasRatio && hasTokens) {
    throw new TypeError(`${name}: retainRatio and retainTokens are mutually exclusive`)
  }
  if (present(fields.thresholdRatio)) {
    policy.thresholdRatio = requireRatio(fields.thresholdRatio, `${name}.thresholdRatio`, 1)
  }
  if (present(fields.headroomTokens)) {
    policy.headroomTokens = requireInteger(fields.headroomTokens, `${name}.headroomTokens`)
  }
  if (hasRatio) policy.retainRatio = requireRatio(fields.retainRatio, `${name}.retainRatio`, 1)
  if (hasTokens) policy.retainTokens = requireInteger(fields.retainTokens, `${name}.retainTokens`)
  const hasProvider = present(fields.summarizationProvider)
  const hasModel = present(fields.summarizationModel)
  if (hasProvider !== hasModel) {
    throw new TypeError(
      `${name}: summarizationProvider and summarizationModel must be set together as an empty or non-empty pair`,
    )
  }
  if (hasProvider) {
    if (typeof fields.summarizationProvider !== 'string' || typeof fields.summarizationModel !== 'string') {
      throw new TypeError(`${name}: summarizationProvider and summarizationModel must be strings`)
    }
    if ((fields.summarizationProvider.length === 0) !== (fields.summarizationModel.length === 0)) {
      throw new TypeError(
        `${name}: summarizationProvider and summarizationModel must be set together as an empty or non-empty pair`,
      )
    }
    policy.summarizationProvider = fields.summarizationProvider
    policy.summarizationModel = fields.summarizationModel
  }
  if (present(fields.maxTokens)) {
    policy.maxTokens = requireInteger(fields.maxTokens, `${name}.maxTokens`, { positive: true })
  }
  if (present(fields.compactionRetries)) {
    policy.compactionRetries = requireInteger(fields.compactionRetries, `${name}.compactionRetries`)
  }
  if (present(fields.maxOverflowRetries)) {
    policy.maxOverflowRetries = requireInteger(fields.maxOverflowRetries, `${name}.maxOverflowRetries`)
  }
  const ratio = policy.retainRatio
  if (ratio !== undefined && ratio >= thresholdRatio) {
    throw new TypeError(
      `${name}: retainRatio (${ratio}) must be less than the resolved thresholdRatio (${thresholdRatio})`,
    )
  }
  return policy
}

/** The global retention form an exact-target policy may inherit. */
export interface GlobalRetention {
  readonly retainRatio: number | null
  readonly retainTokens: number | null
}

/** Validate, detach, and reject duplicate exact-target overrides. */
function normalizeModelPolicies(
  source: unknown,
  thresholdRatio: number,
  globalMaxTokensExplicit: boolean,
  globalRetention: GlobalRetention,
): ModelPolicy[] {
  if (source === undefined) return []
  if (!Array.isArray(source)) throw new TypeError('modelPolicies must be an array')
  const seen = new Set<string>()
  const policies = (source as readonly unknown[]).map((entry, index) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new TypeError(`modelPolicies[${index}] must be an object`)
    }
    const record = entry as Record<string, unknown>
    for (const key of Object.keys(record)) {
      if (!MODEL_POLICY_KEYS.includes(key)) {
        throw new TypeError(`modelPolicies[${index}]: unknown key "${key}"`)
      }
    }
    if (typeof record.provider !== 'string' || record.provider.length === 0) {
      throw new TypeError(`modelPolicies[${index}].provider must be a non-empty string`)
    }
    if (typeof record.model !== 'string' || record.model.length === 0) {
      throw new TypeError(`modelPolicies[${index}].model must be a non-empty string`)
    }
    const key = `${record.provider}\u0000${record.model}`
    if (seen.has(key)) {
      throw new TypeError(
        `modelPolicies: duplicate model policy for ${record.provider}/${record.model}`,
      )
    }
    seen.add(key)
    const resolvedThreshold = present(record.thresholdRatio)
      ? requireRatio(record.thresholdRatio, `modelPolicies[${index}].thresholdRatio`, 1)
      : thresholdRatio
    const policy = normalizePolicy(entry, `modelPolicies[${index}]`, resolvedThreshold)
    // A policy can lower its threshold while inheriting the global ratio
    // retention. The native resolver rejects that combination at load; reject it
    // here with the same actionable diagnostic instead of failing later.
    if (policy.retainRatio === undefined && policy.retainTokens === undefined) {
      if (globalRetention.retainTokens !== null) {
        // Inherited absolute retention has no ratio to compare at load.
      } else if (globalRetention.retainRatio !== null && globalRetention.retainRatio >= resolvedThreshold) {
        throw new TypeError(
          `modelPolicies[${index}]: inherited retainRatio (${globalRetention.retainRatio}) must be less than the resolved thresholdRatio (${resolvedThreshold})`,
        )
      }
    }
    // Native rule: with no explicit global maxTokens, a policy-level headroom
    // becomes that policy's summary output cap. Preserve it here so the routed
    // policy resolves exactly like the native engine.
    if (policy.maxTokens === undefined && !globalMaxTokensExplicit && policy.headroomTokens !== undefined) {
      if (!(policy.headroomTokens > 0)) {
        throw new TypeError(
          `modelPolicies[${index}].maxTokens is required when its headroomTokens is 0: the native engine needs a positive summary output cap`,
        )
      }
      policy.maxTokens = policy.headroomTokens
    }
    return { provider: record.provider, model: record.model, ...policy }
  })
  return policies
}

/**
 * Read the live (or plain) configuration as one normalized, detached snapshot.
 *
 * Missing fields take the documented defaults; present values are validated
 * against the same boundaries as {@link Config} and never silently coerced.
 * Cross-field conflicts throw `TypeError` with an actionable message.
 *
 * @param config - live row config (volatile fields unwrap) or a plain object.
 * @returns frozen normalized configuration.
 * @throws {TypeError} for an invalid or conflicting configuration.
 */
export function readConfig(config?: unknown): ConfigSnapshot {
  const source = config ?? {}
  if (typeof source !== 'object' || source === null || Array.isArray(source)) {
    throw new TypeError('configuration must be an object')
  }
  for (const key of Object.keys(source)) {
    if (!CONFIG_KEY_SET.has(key)) {
      throw new TypeError(
        `unknown configuration key "${key}"; supported keys: ${CONFIG_KEYS.join(', ')}`,
      )
    }
  }

  const mode = fieldOf(source, 'mode') ?? DEFAULTS.mode
  if (!isCompactionMode(mode)) {
    throw new TypeError(`mode must be one of ${MODES.join(', ')}, got ${String(mode)}`)
  }
  const auto = fieldOf(source, 'auto') ?? DEFAULTS.auto
  if (typeof auto !== 'boolean') throw new TypeError(`auto must be a boolean, got ${String(auto)}`)

  const thresholdRatio = requireRatio(
    fieldOf(source, 'thresholdRatio') ?? DEFAULTS.thresholdRatio,
    'thresholdRatio',
    1,
  )
  const headroomTokens = requireInteger(
    fieldOf(source, 'headroomTokens') ?? DEFAULTS.headroomTokens,
    'headroomTokens',
  )

  const retainRatioValue = fieldOf(source, 'retainRatio')
  const retainTokensValue = fieldOf(source, 'retainTokens')
  const hasRatio = present(retainRatioValue)
  const hasTokens = present(retainTokensValue)
  if (hasRatio && hasTokens) {
    throw new TypeError('retainRatio and retainTokens are mutually exclusive; clear the one you are not using')
  }
  let retainRatio: number | null = null
  let retainTokens: number | null = null
  if (hasTokens) {
    retainTokens = requireInteger(retainTokensValue, 'retainTokens')
  } else {
    retainRatio = requireRatio(hasRatio ? retainRatioValue : DEFAULTS.retainRatio, 'retainRatio', 1)
  }
  if (retainRatio !== null && retainRatio >= thresholdRatio) {
    throw new TypeError(`retainRatio (${retainRatio}) must be less than thresholdRatio (${thresholdRatio})`)
  }

  const summarizationProvider = fieldOf(source, 'summarizationProvider') ?? ''
  const summarizationModel = fieldOf(source, 'summarizationModel') ?? ''
  if (typeof summarizationProvider !== 'string' || typeof summarizationModel !== 'string') {
    throw new TypeError('summarizationProvider and summarizationModel must be strings')
  }
  if ((summarizationProvider.length === 0) !== (summarizationModel.length === 0)) {
    throw new TypeError('summarizationProvider and summarizationModel must be set together as an empty or non-empty pair')
  }

  const reasoningEffort = fieldOf(source, 'reasoningEffort') ?? ''
  if (typeof reasoningEffort !== 'string') {
    throw new TypeError('reasoningEffort must be a string (empty means the selected summary model default)')
  }
  if (reasoningEffort.length > 0 && reasoningEffort.trim().length === 0) {
    throw new TypeError('reasoningEffort must be empty or an exact opaque model effort id')
  }

  const customPrompt = fieldOf(source, 'customPrompt') ?? DEFAULTS.customPrompt
  if (typeof customPrompt !== 'string') throw new TypeError('customPrompt must be a string (empty unless mode is custom)')
  if (customPrompt.length > MAX_CUSTOM_PROMPT_CHARS) {
    throw new TypeError(`customPrompt must be at most ${MAX_CUSTOM_PROMPT_CHARS} characters, got ${customPrompt.length}`)
  }
  if (mode === 'custom' && customPrompt.trim().length === 0) {
    throw new TypeError('customPrompt is required when mode is custom; write an instruction or choose another mode')
  }

  const cachePriority = fieldOf(source, 'cachePriority') ?? DEFAULTS.cachePriority
  if (typeof cachePriority !== 'boolean') throw new TypeError(`cachePriority must be a boolean, got ${String(cachePriority)}`)

  const summaryImage = fieldOf(source, 'summaryImage') ?? DEFAULTS.summaryImage
  if (typeof summaryImage !== 'boolean') throw new TypeError(`summaryImage must be a boolean, got ${String(summaryImage)}`)

  const configuredMaxTokens = fieldOf(source, 'maxTokens')
  const globalMaxTokensExplicit = present(configuredMaxTokens)
  let maxTokens: number
  if (globalMaxTokensExplicit) {
    maxTokens = requireInteger(configuredMaxTokens, 'maxTokens', { positive: true })
  } else {
    if (headroomTokens <= 0) {
      throw new TypeError('maxTokens is required when headroomTokens is 0: the native engine needs a positive summary output cap')
    }
    maxTokens = headroomTokens
  }

  const compactionRetries = requireInteger(
    fieldOf(source, 'compactionRetries') ?? DEFAULTS.compactionRetries,
    'compactionRetries',
  )
  const maxOverflowRetries = requireInteger(
    fieldOf(source, 'maxOverflowRetries') ?? DEFAULTS.maxOverflowRetries,
    'maxOverflowRetries',
  )

  const modelPolicies = normalizeModelPolicies(
    fieldOf(source, 'modelPolicies'),
    thresholdRatio,
    globalMaxTokensExplicit,
    { retainRatio, retainTokens },
  )

  return deepFreeze<ConfigSnapshot>({
    mode,
    auto,
    thresholdRatio,
    headroomTokens,
    retainRatio,
    retainTokens,
    summarizationProvider,
    summarizationModel,
    reasoningEffort,
    customPrompt,
    cachePriority,
    summaryImage,
    maxTokens,
    compactionRetries,
    maxOverflowRetries,
    modelPolicies,
  })
}

/**
 * Project one normalized configuration onto the native engine config.
 *
 * Enhanced-only keys are stripped; `maxTokens` is already resolved (the native
 * default is the resolved headroom). The native config keys, their units, and
 * their meanings are unchanged.
 *
 * @param snapshot - normalized configuration from {@link readConfig}.
 * @returns native engine config.
 */
export function toNativeConfig(snapshot: ConfigSnapshot): BasicCompactionConfig {
  // `readConfig` guarantees exactly one retention form, while the snapshot type
  // keeps both as `number | null` because a live row may declare either one.
  const retention =
    snapshot.retainTokens !== null
      ? { retainTokens: snapshot.retainTokens }
      : { retainRatio: snapshot.retainRatio as number }
  return {
    thresholdRatio: snapshot.thresholdRatio,
    headroomTokens: snapshot.headroomTokens,
    ...retention,
    summarizationProvider: snapshot.summarizationProvider,
    summarizationModel: snapshot.summarizationModel,
    maxTokens: snapshot.maxTokens,
    compactionRetries: snapshot.compactionRetries,
    maxOverflowRetries: snapshot.maxOverflowRetries,
    modelPolicies: snapshot.modelPolicies.map((policy) => ({ ...policy })),
    auto: snapshot.auto,
  }
}

/** Whether two normalized configurations are identical. */
export function configEquals(left: unknown, right: unknown): boolean {
  return isDeepStrictEqual(left, right)
}

/** Recursively freeze a plain JSON-shaped value. */
export function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child)
  return Object.freeze(value)
}

/** Read one field from a live config object (exported for the companion). */
export function readField(config: unknown, key: string): unknown {
  return fieldOf(config, key)
}
