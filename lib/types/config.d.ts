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
import z from '@deepseek-ai/schemastery';
import type { BasicCompactionConfig } from '@deepseek-ai/dsh-compaction-basic';
import type { CompactionMode, ConfigSnapshot, ModelPolicy } from './shared/contract.ts';
export { APOLLO_LEGACY_ROW_CONFIG_KEY, APOLLO_ROW_CONFIG_KEY, BETTER_DSH_ROW_CONFIG_KEY, ENGINE_ENTRY_ID, ENTRY_ID, MAX_CUSTOM_PROMPT_CHARS, MODES, PACKAGE_NAME, ROW_CONFIG_KEYS, ROW_CONFIG_KEY, } from './shared/contract.ts';
/** Native keys accepted by `BasicCompactionEngine` (native semantics/units). */
export declare const NATIVE_CONFIG_KEYS: readonly string[];
/** Exact-target override keys preserved from the native engine. */
export declare const MODEL_POLICY_KEYS: readonly string[];
/** Enhanced-only keys stripped before the native engine sees the config. */
export declare const ENHANCED_CONFIG_KEYS: readonly string[];
/** Complete accepted top-level key set. */
export declare const CONFIG_KEYS: readonly string[];
/** Plain (non-volatile) default value for every accepted key. */
export interface ConfigDefaults {
    readonly mode: CompactionMode;
    readonly auto: boolean;
    readonly thresholdRatio: number;
    readonly headroomTokens: number;
    /** `null` because the default retention form is a ratio. */
    readonly retainRatio: number | null;
    /** `null` because the default retention form is a ratio. */
    readonly retainTokens: number | null;
    readonly summarizationProvider: string;
    readonly summarizationModel: string;
    readonly reasoningEffort: string;
    readonly customPrompt: string;
    readonly cachePriority: boolean;
    readonly summaryImage: boolean;
    /** `null` means "follow headroomTokens". */
    readonly maxTokens: number | null;
    readonly compactionRetries: number;
    readonly maxOverflowRetries: number;
    readonly modelPolicies: readonly ModelPolicy[];
}
/** Plain defaults. `maxTokens: null` means "follow headroomTokens". */
export declare const DEFAULTS: ConfigDefaults;
/** One validated policy fragment before `provider`/`model` are attached. */
export interface PolicyFields {
    thresholdRatio?: number;
    headroomTokens?: number;
    retainRatio?: number;
    retainTokens?: number;
    summarizationProvider?: string;
    summarizationModel?: string;
    maxTokens?: number;
    compactionRetries?: number;
    maxOverflowRetries?: number;
}
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
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    mode: z<"native" | "goal" | "handoff" | "custom", "native" | "goal" | "handoff" | "custom", "volatile-defined">;
    auto: z<boolean, boolean, "volatile-defined">;
    thresholdRatio: z<number, number, "volatile">;
    headroomTokens: z<number, number, "volatile-defined">;
    retainRatio: z<number, number, "volatile">;
    retainTokens: z<number, number, "volatile">;
    summarizationProvider: z<string, string, "volatile-defined">;
    summarizationModel: z<string, string, "volatile-defined">;
    reasoningEffort: z<string, string, "volatile-defined">;
    customPrompt: z<string, string, "volatile-defined">;
    cachePriority: z<boolean, boolean, "volatile-defined">;
    summaryImage: z<boolean, boolean, "volatile-defined">;
    maxTokens: z<number, number, "volatile">;
    compactionRetries: z<number, number, "volatile-defined">;
    maxOverflowRetries: z<number, number, "volatile-defined">;
    modelPolicies: z<NoInfer<({
        provider?: string | null | undefined;
        model?: string | null | undefined;
        thresholdRatio?: number | null | undefined;
        headroomTokens?: number | null | undefined;
        retainRatio?: number | null | undefined;
        retainTokens?: number | null | undefined;
        summarizationProvider?: string | null | undefined;
        summarizationModel?: string | null | undefined;
        maxTokens?: number | null | undefined;
        compactionRetries?: number | null | undefined;
        maxOverflowRetries?: number | null | undefined;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        provider: z<string, string, "defined">;
        model: z<string, string, "defined">;
        thresholdRatio: z<number, number, "plain">;
        headroomTokens: z<number, number, "plain">;
        retainRatio: z<number, number, "plain">;
        retainTokens: z<number, number, "plain">;
        summarizationProvider: z<string, string, "plain">;
        summarizationModel: z<string, string, "plain">;
        maxTokens: z<number, number, "plain">;
        compactionRetries: z<number, number, "plain">;
        maxOverflowRetries: z<number, number, "plain">;
    }>>[]>, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    mode: z<"native" | "goal" | "handoff" | "custom", "native" | "goal" | "handoff" | "custom", "volatile-defined">;
    auto: z<boolean, boolean, "volatile-defined">;
    thresholdRatio: z<number, number, "volatile">;
    headroomTokens: z<number, number, "volatile-defined">;
    retainRatio: z<number, number, "volatile">;
    retainTokens: z<number, number, "volatile">;
    summarizationProvider: z<string, string, "volatile-defined">;
    summarizationModel: z<string, string, "volatile-defined">;
    reasoningEffort: z<string, string, "volatile-defined">;
    customPrompt: z<string, string, "volatile-defined">;
    cachePriority: z<boolean, boolean, "volatile-defined">;
    summaryImage: z<boolean, boolean, "volatile-defined">;
    maxTokens: z<number, number, "volatile">;
    compactionRetries: z<number, number, "volatile-defined">;
    maxOverflowRetries: z<number, number, "volatile-defined">;
    modelPolicies: z<NoInfer<({
        provider?: string | null | undefined;
        model?: string | null | undefined;
        thresholdRatio?: number | null | undefined;
        headroomTokens?: number | null | undefined;
        retainRatio?: number | null | undefined;
        retainTokens?: number | null | undefined;
        summarizationProvider?: string | null | undefined;
        summarizationModel?: string | null | undefined;
        maxTokens?: number | null | undefined;
        compactionRetries?: number | null | undefined;
        maxOverflowRetries?: number | null | undefined;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        provider: z<string, string, "defined">;
        model: z<string, string, "defined">;
        thresholdRatio: z<number, number, "plain">;
        headroomTokens: z<number, number, "plain">;
        retainRatio: z<number, number, "plain">;
        retainTokens: z<number, number, "plain">;
        summarizationProvider: z<string, string, "plain">;
        summarizationModel: z<string, string, "plain">;
        maxTokens: z<number, number, "plain">;
        compactionRetries: z<number, number, "plain">;
        maxOverflowRetries: z<number, number, "plain">;
    }>>[]>, "volatile-defined">;
}>>, "plain">;
/** Bounds for {@link requireInteger}. */
export interface IntegerBounds {
    /** Inclusive lower bound used when `positive` is not set. */
    min?: number;
    /** Require a value strictly above zero instead of comparing with `min`. */
    positive?: boolean;
}
/** The global retention form an exact-target policy may inherit. */
export interface GlobalRetention {
    readonly retainRatio: number | null;
    readonly retainTokens: number | null;
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
export declare function readConfig(config?: unknown): ConfigSnapshot;
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
export declare function toNativeConfig(snapshot: ConfigSnapshot): BasicCompactionConfig;
/** Whether two normalized configurations are identical. */
export declare function configEquals(left: unknown, right: unknown): boolean;
/** Recursively freeze a plain JSON-shaped value. */
export declare function deepFreeze<T>(value: T): T;
/** Read one field from a live config object (exported for the companion). */
export declare function readField(config: unknown, key: string): unknown;
