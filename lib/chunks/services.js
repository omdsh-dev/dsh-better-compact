import { isDeepStrictEqual } from "node:util";
import z from "@deepseek-ai/schemastery";
import { symbols } from "@deepseek-ai/cordis";
import { toolPairingBalancedBefore } from "@deepseek-ai/dsh-compaction";
// src/shared/contract.ts
/**
* Host/client shared contract for dsh-better-compact.
*
* This module is the ONE place the two halves agree on stable identifiers,
* wire shapes, and enum vocabulary. It must stay free of `node:` imports and of
* host-only packages: the tsdown client bundle inlines it, so a Node builtin
* here would break the browser bundle.
*
* Keep the runtime values byte-identical to the pre-TypeScript sources; the
* types are new, the behaviour is not.
*/
/** npm package name and bundle row name. */
const PACKAGE_NAME = "dsh-better-compact";
/** Host companion row id (also the settings namespace). */
const ENTRY_ID = "dsh-better-compact";
/** Host-plane / preset engine row id. */
const ENGINE_ENTRY_ID = "dsh-better-compact-engine";
/** Canonical `plugins.row.config` slot key. */
const ROW_CONFIG_KEY = `${PACKAGE_NAME}#${ENTRY_ID}`;
/** Better DSH declares the same stable row. */
const BETTER_DSH_ROW_CONFIG_KEY = `dsh-better-dsh#${ENTRY_ID}`;
/** Apollo's published scoped package name declares the same stable row. */
const APOLLO_ROW_CONFIG_KEY = `@menghuan1918/dsh-apollo#${ENTRY_ID}`;
/** Historical unscoped Apollo row key. */
const APOLLO_LEGACY_ROW_CONFIG_KEY = `dsh-apollo#${ENTRY_ID}`;
/** Every assembly's `plugins.row.config` key, in dispatch order. */
const ROW_CONFIG_KEYS = Object.freeze([
	ROW_CONFIG_KEY,
	BETTER_DSH_ROW_CONFIG_KEY,
	APOLLO_ROW_CONFIG_KEY,
	APOLLO_LEGACY_ROW_CONFIG_KEY
]);
/** Supported compaction modes. */
const MODES = Object.freeze([
	"native",
	"goal",
	"handoff",
	"custom"
]);
/** Maximum characters accepted for a custom-mode instruction. */
const MAX_CUSTOM_PROMPT_CHARS = 8e3;
/** Exact inspect route pathname. */
const INSPECT_PATH = "/better-compact/api/inspect";
/** Exact read-only models route pathname. */
const MODELS_PATH = "/better-compact/api/models";
Object.freeze([
	Object.freeze({
		token: "goal",
		label: "目标",
		hint: "当前目标 objective"
	}),
	Object.freeze({
		token: "todos",
		label: "待办",
		hint: "当前待办列表"
	}),
	Object.freeze({
		token: "questions",
		label: "待答问题",
		hint: "仍等待用户回答的问题"
	}),
	Object.freeze({
		token: "jobs",
		label: "后台任务",
		hint: "运行中的后台任务"
	}),
	Object.freeze({
		token: "children",
		label: "子代理",
		hint: "运行中的子代理"
	}),
	Object.freeze({
		token: "date",
		label: "日期",
		hint: "压缩时的 ISO 时间"
	}),
	Object.freeze({
		token: "session",
		label: "会话 ID",
		hint: "当前会话标识"
	}),
	Object.freeze({
		token: "model",
		label: "摘要模型",
		hint: "provider/model"
	}),
	Object.freeze({
		token: "trigger",
		label: "触发比例",
		hint: "有效触发百分比"
	}),
	Object.freeze({
		token: "retain",
		label: "保留预算",
		hint: "固定 tokens 或百分比"
	})
]);
/** Modes whose checkpoint may carry the rendered summary image. */
const SUMMARY_IMAGE_MODES = Object.freeze(["goal", "custom"]);
/** One-line framing attached next to the rendered summary image blocks. */
const SUMMARY_IMAGE_CAPTION = "The checkpoint summary above this line is rendered as the image(s) below: read the continuation state from the image text.";
// src/config.ts
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
/** Native keys accepted by `BasicCompactionEngine` (native semantics/units). */
const NATIVE_CONFIG_KEYS = Object.freeze([
	"thresholdRatio",
	"headroomTokens",
	"retainRatio",
	"retainTokens",
	"summarizationProvider",
	"summarizationModel",
	"maxTokens",
	"compactionRetries",
	"maxOverflowRetries",
	"modelPolicies",
	"auto"
]);
/** Exact-target override keys preserved from the native engine. */
const MODEL_POLICY_KEYS = Object.freeze([
	"provider",
	"model",
	"thresholdRatio",
	"headroomTokens",
	"retainRatio",
	"retainTokens",
	"summarizationProvider",
	"summarizationModel",
	"maxTokens",
	"compactionRetries",
	"maxOverflowRetries"
]);
/** Enhanced-only keys stripped before the native engine sees the config. */
const ENHANCED_CONFIG_KEYS = Object.freeze([
	"mode",
	"reasoningEffort",
	"cachePriority",
	"customPrompt",
	"summaryImage"
]);
/** Complete accepted top-level key set. */
const CONFIG_KEYS = Object.freeze([
	...ENHANCED_CONFIG_KEYS,
	...NATIVE_CONFIG_KEYS.filter((key) => key !== "auto"),
	"auto"
]);
const CONFIG_KEY_SET = new Set(CONFIG_KEYS);
/** Plain defaults. `maxTokens: null` means "follow headroomTokens". */
const DEFAULTS = Object.freeze({
	mode: "goal",
	auto: true,
	thresholdRatio: .8,
	headroomTokens: 65536,
	retainRatio: .16,
	retainTokens: null,
	summarizationProvider: "",
	summarizationModel: "",
	reasoningEffort: "",
	customPrompt: "",
	cachePriority: true,
	summaryImage: false,
	maxTokens: null,
	compactionRetries: 1,
	maxOverflowRetries: 1,
	modelPolicies: Object.freeze([])
});
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
function ratioSchema(defaultValue) {
	const schema = z.number().min(Number.MIN_VALUE).max(1 - Number.EPSILON);
	return defaultValue === void 0 ? schema : schema.default(defaultValue);
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
	maxOverflowRetries: z.natural()
});
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
const Config = z.object({
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
	modelPolicies: z.array(modelPolicySchema).default([]).volatile()
});
/** Shared cosmokit volatile-reference symbol (identical across package copies). */
const VOLATILE_WRITE = Symbol.for("cosmokit.volatile.write");
/** Whether a value is a cosmokit volatile reference. */
function isVolatileRef(value) {
	return typeof value === "object" && value !== null && typeof value.get === "function" && VOLATILE_WRITE in value;
}
/** Read one field, unwrapping a volatile reference when present. */
function fieldOf(config, key) {
	const value = config?.[key];
	return isVolatileRef(value) ? value.get() : value;
}
/** Whether a value is one of the supported compaction modes. */
function isCompactionMode(value) {
	return MODES.includes(value);
}
/** Reject non-integer or out-of-range numeric values without coercion. */
function requireInteger(value, label, { min = 0, positive = false } = {}) {
	if (typeof value !== "number" || !Number.isSafeInteger(value)) throw new TypeError(`${label} must be a safe integer, got ${String(value)}`);
	if (positive && value <= 0 || !positive && value < min) throw new TypeError(`${label} must be ${positive ? "a positive integer" : `an integer >= ${min}`}, got ${value}`);
	return value;
}
/** Require a finite ratio strictly inside `(0, upper)`. */
function requireRatio(value, label, upper) {
	if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value >= upper) throw new TypeError(`${label} must be a number in (0, ${upper}), got ${String(value)}`);
	return value;
}
/** Detect an explicitly present value (not `undefined`/`null`). */
function present(value) {
	return value !== void 0 && value !== null;
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
function normalizePolicy(source, name, thresholdRatio) {
	if (typeof source !== "object" || source === null || Array.isArray(source)) throw new TypeError(`${name} must be an object`);
	const fields = source;
	const policy = {};
	const hasRatio = present(fields.retainRatio);
	const hasTokens = present(fields.retainTokens);
	if (hasRatio && hasTokens) throw new TypeError(`${name}: retainRatio and retainTokens are mutually exclusive`);
	if (present(fields.thresholdRatio)) policy.thresholdRatio = requireRatio(fields.thresholdRatio, `${name}.thresholdRatio`, 1);
	if (present(fields.headroomTokens)) policy.headroomTokens = requireInteger(fields.headroomTokens, `${name}.headroomTokens`);
	if (hasRatio) policy.retainRatio = requireRatio(fields.retainRatio, `${name}.retainRatio`, 1);
	if (hasTokens) policy.retainTokens = requireInteger(fields.retainTokens, `${name}.retainTokens`);
	const hasProvider = present(fields.summarizationProvider);
	if (hasProvider !== present(fields.summarizationModel)) throw new TypeError(`${name}: summarizationProvider and summarizationModel must be set together as an empty or non-empty pair`);
	if (hasProvider) {
		if (typeof fields.summarizationProvider !== "string" || typeof fields.summarizationModel !== "string") throw new TypeError(`${name}: summarizationProvider and summarizationModel must be strings`);
		if (fields.summarizationProvider.length === 0 !== (fields.summarizationModel.length === 0)) throw new TypeError(`${name}: summarizationProvider and summarizationModel must be set together as an empty or non-empty pair`);
		policy.summarizationProvider = fields.summarizationProvider;
		policy.summarizationModel = fields.summarizationModel;
	}
	if (present(fields.maxTokens)) policy.maxTokens = requireInteger(fields.maxTokens, `${name}.maxTokens`, { positive: true });
	if (present(fields.compactionRetries)) policy.compactionRetries = requireInteger(fields.compactionRetries, `${name}.compactionRetries`);
	if (present(fields.maxOverflowRetries)) policy.maxOverflowRetries = requireInteger(fields.maxOverflowRetries, `${name}.maxOverflowRetries`);
	const ratio = policy.retainRatio;
	if (ratio !== void 0 && ratio >= thresholdRatio) throw new TypeError(`${name}: retainRatio (${ratio}) must be less than the resolved thresholdRatio (${thresholdRatio})`);
	return policy;
}
/** Validate, detach, and reject duplicate exact-target overrides. */
function normalizeModelPolicies(source, thresholdRatio, globalMaxTokensExplicit, globalRetention) {
	if (source === void 0) return [];
	if (!Array.isArray(source)) throw new TypeError("modelPolicies must be an array");
	const seen = /* @__PURE__ */ new Set();
	return source.map((entry, index) => {
		if (typeof entry !== "object" || entry === null || Array.isArray(entry)) throw new TypeError(`modelPolicies[${index}] must be an object`);
		const record = entry;
		for (const key of Object.keys(record)) if (!MODEL_POLICY_KEYS.includes(key)) throw new TypeError(`modelPolicies[${index}]: unknown key "${key}"`);
		if (typeof record.provider !== "string" || record.provider.length === 0) throw new TypeError(`modelPolicies[${index}].provider must be a non-empty string`);
		if (typeof record.model !== "string" || record.model.length === 0) throw new TypeError(`modelPolicies[${index}].model must be a non-empty string`);
		const key = `${record.provider}\u0000${record.model}`;
		if (seen.has(key)) throw new TypeError(`modelPolicies: duplicate model policy for ${record.provider}/${record.model}`);
		seen.add(key);
		const resolvedThreshold = present(record.thresholdRatio) ? requireRatio(record.thresholdRatio, `modelPolicies[${index}].thresholdRatio`, 1) : thresholdRatio;
		const policy = normalizePolicy(entry, `modelPolicies[${index}]`, resolvedThreshold);
		if (policy.retainRatio === void 0 && policy.retainTokens === void 0) {
			if (globalRetention.retainTokens !== null) {} else if (globalRetention.retainRatio !== null && globalRetention.retainRatio >= resolvedThreshold) throw new TypeError(`modelPolicies[${index}]: inherited retainRatio (${globalRetention.retainRatio}) must be less than the resolved thresholdRatio (${resolvedThreshold})`);
		}
		if (policy.maxTokens === void 0 && !globalMaxTokensExplicit && policy.headroomTokens !== void 0) {
			if (!(policy.headroomTokens > 0)) throw new TypeError(`modelPolicies[${index}].maxTokens is required when its headroomTokens is 0: the native engine needs a positive summary output cap`);
			policy.maxTokens = policy.headroomTokens;
		}
		return {
			provider: record.provider,
			model: record.model,
			...policy
		};
	});
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
function readConfig(config) {
	const source = config ?? {};
	if (typeof source !== "object" || source === null || Array.isArray(source)) throw new TypeError("configuration must be an object");
	for (const key of Object.keys(source)) if (!CONFIG_KEY_SET.has(key)) throw new TypeError(`unknown configuration key "${key}"; supported keys: ${CONFIG_KEYS.join(", ")}`);
	const mode = fieldOf(source, "mode") ?? DEFAULTS.mode;
	if (!isCompactionMode(mode)) throw new TypeError(`mode must be one of ${MODES.join(", ")}, got ${String(mode)}`);
	const auto = fieldOf(source, "auto") ?? DEFAULTS.auto;
	if (typeof auto !== "boolean") throw new TypeError(`auto must be a boolean, got ${String(auto)}`);
	const thresholdRatio = requireRatio(fieldOf(source, "thresholdRatio") ?? DEFAULTS.thresholdRatio, "thresholdRatio", 1);
	const headroomTokens = requireInteger(fieldOf(source, "headroomTokens") ?? DEFAULTS.headroomTokens, "headroomTokens");
	const retainRatioValue = fieldOf(source, "retainRatio");
	const retainTokensValue = fieldOf(source, "retainTokens");
	const hasRatio = present(retainRatioValue);
	const hasTokens = present(retainTokensValue);
	if (hasRatio && hasTokens) throw new TypeError("retainRatio and retainTokens are mutually exclusive; clear the one you are not using");
	let retainRatio = null;
	let retainTokens = null;
	if (hasTokens) retainTokens = requireInteger(retainTokensValue, "retainTokens");
	else retainRatio = requireRatio(hasRatio ? retainRatioValue : DEFAULTS.retainRatio, "retainRatio", 1);
	if (retainRatio !== null && retainRatio >= thresholdRatio) throw new TypeError(`retainRatio (${retainRatio}) must be less than thresholdRatio (${thresholdRatio})`);
	const summarizationProvider = fieldOf(source, "summarizationProvider") ?? "";
	const summarizationModel = fieldOf(source, "summarizationModel") ?? "";
	if (typeof summarizationProvider !== "string" || typeof summarizationModel !== "string") throw new TypeError("summarizationProvider and summarizationModel must be strings");
	if (summarizationProvider.length === 0 !== (summarizationModel.length === 0)) throw new TypeError("summarizationProvider and summarizationModel must be set together as an empty or non-empty pair");
	const reasoningEffort = fieldOf(source, "reasoningEffort") ?? "";
	if (typeof reasoningEffort !== "string") throw new TypeError("reasoningEffort must be a string (empty means the selected summary model default)");
	if (reasoningEffort.length > 0 && reasoningEffort.trim().length === 0) throw new TypeError("reasoningEffort must be empty or an exact opaque model effort id");
	const customPrompt = fieldOf(source, "customPrompt") ?? DEFAULTS.customPrompt;
	if (typeof customPrompt !== "string") throw new TypeError("customPrompt must be a string (empty unless mode is custom)");
	if (customPrompt.length > 8e3) throw new TypeError(`customPrompt must be at most ${MAX_CUSTOM_PROMPT_CHARS} characters, got ${customPrompt.length}`);
	if (mode === "custom" && customPrompt.trim().length === 0) throw new TypeError("customPrompt is required when mode is custom; write an instruction or choose another mode");
	const cachePriority = fieldOf(source, "cachePriority") ?? DEFAULTS.cachePriority;
	if (typeof cachePriority !== "boolean") throw new TypeError(`cachePriority must be a boolean, got ${String(cachePriority)}`);
	const summaryImage = fieldOf(source, "summaryImage") ?? DEFAULTS.summaryImage;
	if (typeof summaryImage !== "boolean") throw new TypeError(`summaryImage must be a boolean, got ${String(summaryImage)}`);
	const configuredMaxTokens = fieldOf(source, "maxTokens");
	const globalMaxTokensExplicit = present(configuredMaxTokens);
	let maxTokens;
	if (globalMaxTokensExplicit) maxTokens = requireInteger(configuredMaxTokens, "maxTokens", { positive: true });
	else {
		if (headroomTokens <= 0) throw new TypeError("maxTokens is required when headroomTokens is 0: the native engine needs a positive summary output cap");
		maxTokens = headroomTokens;
	}
	const compactionRetries = requireInteger(fieldOf(source, "compactionRetries") ?? DEFAULTS.compactionRetries, "compactionRetries");
	const maxOverflowRetries = requireInteger(fieldOf(source, "maxOverflowRetries") ?? DEFAULTS.maxOverflowRetries, "maxOverflowRetries");
	const modelPolicies = normalizeModelPolicies(fieldOf(source, "modelPolicies"), thresholdRatio, globalMaxTokensExplicit, {
		retainRatio,
		retainTokens
	});
	return deepFreeze({
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
		modelPolicies
	});
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
function toNativeConfig(snapshot) {
	const retention = snapshot.retainTokens !== null ? { retainTokens: snapshot.retainTokens } : { retainRatio: snapshot.retainRatio };
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
		auto: snapshot.auto
	};
}
/** Whether two normalized configurations are identical. */
function configEquals(left, right) {
	return isDeepStrictEqual(left, right);
}
/** Recursively freeze a plain JSON-shaped value. */
function deepFreeze(value) {
	if (value === null || typeof value !== "object") return value;
	for (const child of Object.values(value)) deepFreeze(child);
	return Object.freeze(value);
}
// src/identity.ts
/**
* Cordis service identity helpers.
*
* Cordis wraps registered services in proxies. The retained-composition lookup
* (`agentPresets.serviceFor`) returns the raw implementation value, so comparing
* it to a service accessor with `!==` can wrongly report "another provider".
* `symbols.original` unwraps the proxy to the implementation for identity
* comparison only; callers still use the proxy for normal calls.
*/
/**
* Read the underlying implementation of a possibly proxied service.
* @param value - service proxy, raw implementation, or undefined.
* @returns the comparable implementation identity, typed as the input.
*/
function serviceIdentity(value) {
	if (value === null || value === void 0) return value;
	if (typeof value !== "object" && typeof value !== "function") return value;
	return value[symbols.original] ?? value;
}
/**
* Whether a service value is this package's enhanced compaction engine.
* @param value - service value to inspect.
* @returns true for a `BetterCompactEngine` implementation.
*/
function isBetterCompactEngine(value) {
	const implementation = serviceIdentity(value);
	if (implementation === null || implementation === void 0) return false;
	if (typeof implementation !== "object" && typeof implementation !== "function") return false;
	return implementation.constructor?.betterCompactEngine === true;
}
// src/budget.ts
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
/** Capacity/retention conflict resolved while preparing a summary call. */
var BudgetConfigError = class extends Error {
	/** Stable machine code carried by every budget conflict. */
	code = "BETTER_COMPACT_BUDGET";
	/** Exact provider/model route whose configuration is unsatisfiable. */
	targetKey;
	/**
	* @param targetKey - exact provider/model route.
	* @param message - actionable configuration failure detail.
	*/
	constructor(targetKey, message) {
		super(message);
		this.name = "BudgetConfigError";
		this.targetKey = targetKey;
	}
};
/**
* Resolve the exact provider/model routed for the latest durable request.
* @param session - session carrying request headers.
* @returns routed target.
*/
function routedTarget(session) {
	const config = session.requestHeader()?.config;
	if (config === void 0 || config.provider.length === 0 || config.model.length === 0) return void 0;
	return {
		provider: config.provider,
		model: config.model
	};
}
/** Resolve a routed target from a plain request header (cold inspection). */
function targetFromHeader(header) {
	const config = header?.config;
	if (config === void 0 || typeof config.provider !== "string" || typeof config.model !== "string") return void 0;
	if (config.provider.length === 0 || config.model.length === 0) return void 0;
	return {
		provider: config.provider,
		model: config.model
	};
}
/**
* Output tokens the routed request reserves, charged to the same window as the
* prompt. The effective envelope's cap wins; otherwise the adapter default.
* @param header - effective request header, including a proposed model switch.
* @param defaultMaxTokens - adapter per-request default.
* @returns reserved completion tokens.
*/
function reservedCompletionTokens(header, defaultMaxTokens) {
	return header?.config.maxTokens ?? defaultMaxTokens ?? 0;
}
/**
* Resolve retention from an override, else the already-resolved global form.
* `readConfig` guarantees exactly one of the two global forms is set.
*/
function resolveOverrideRetention(override, config) {
	if (override?.retainTokens !== void 0) return { retainTokens: override.retainTokens };
	if (override?.retainRatio !== void 0) return { retainRatio: override.retainRatio };
	return config.retainTokens !== null ? { retainTokens: config.retainTokens } : { retainRatio: config.retainRatio };
}
/**
* Merge the exact provider/model override over the normalized global policy.
* @param config - normalized plugin configuration (`readConfig`).
* @param target - exact routed target.
* @returns frozen merged policy before capacity scaling.
*/
function resolveTargetPolicy(config, target) {
	const override = config.modelPolicies.find((policy) => policy.provider === target.provider && policy.model === target.model);
	return Object.freeze({
		target: {
			provider: target.provider,
			model: target.model
		},
		thresholdRatio: override?.thresholdRatio ?? config.thresholdRatio,
		headroomTokens: override?.headroomTokens ?? config.headroomTokens,
		...resolveOverrideRetention(override, config),
		summarizationProvider: override?.summarizationProvider ?? config.summarizationProvider,
		summarizationModel: override?.summarizationModel ?? config.summarizationModel,
		maxTokens: override?.maxTokens ?? config.maxTokens,
		compactionRetries: override?.compactionRetries ?? config.compactionRetries,
		maxOverflowRetries: override?.maxOverflowRetries ?? config.maxOverflowRetries
	});
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
function resolveCompactSpec(policy, contextWindow, reservedTokens) {
	const targetKey = `${policy.target.provider}/${policy.target.model}`;
	if (!Number.isInteger(contextWindow) || contextWindow <= 0) throw new BudgetConfigError(targetKey, `contextWindow (${String(contextWindow)}) must be a positive integer for ${targetKey}`);
	if (!Number.isInteger(reservedTokens) || reservedTokens < 0) throw new BudgetConfigError(targetKey, `reservedCompletionTokens (${String(reservedTokens)}) must be a non-negative integer for ${targetKey}`);
	const messageBudgetTokens = contextWindow - reservedTokens;
	if (messageBudgetTokens <= 0) throw new BudgetConfigError(targetKey, `${targetKey} reserves ${reservedTokens} completion tokens of its ${contextWindow}-token context window, leaving no message budget; configure a larger adapter contextWindow or a smaller maxTokens`);
	const pressureBudgetTokens = messageBudgetTokens - policy.headroomTokens;
	if (pressureBudgetTokens <= 0) throw new BudgetConfigError(targetKey, `${targetKey} reserves ${reservedTokens} completion tokens and ${policy.headroomTokens} headroom tokens of its ${contextWindow}-token context window, leaving no pressure budget; reduce headroomTokens or maxTokens, or use a larger adapter contextWindow`);
	const thresholdTokens = Math.floor(Math.min(contextWindow * policy.thresholdRatio, pressureBudgetTokens));
	const retainTokens = policy.retainTokens === void 0 ? Math.floor(messageBudgetTokens * policy.retainRatio) : policy.retainTokens;
	if (retainTokens >= thresholdTokens) throw new BudgetConfigError(targetKey, `${targetKey} retainTokens (${retainTokens}) must be less than threshold tokens ${thresholdTokens}; lower the retention budget or raise the trigger`);
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
		maxOverflowRetries: policy.maxOverflowRetries
	});
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
function selectCompactableRange(session, measurement, retainTokens) {
	const pricedNodes = measurement.nodes;
	if (pricedNodes.length === 0) return null;
	const surfaceNodes = session.surface.nodes;
	if (surfaceNodes.length !== pricedNodes.length || surfaceNodes.some((seq, index) => seq !== pricedNodes[index]?.seq)) throw new Error("compaction: token-meter surface does not match the current session surface");
	const firstIdx = session.eventAt(surfaceNodes[0])?.type === "system/message" ? 1 : 0;
	let accumulated = 0;
	let keepFromIdx = pricedNodes.length;
	for (let index = pricedNodes.length - 1; index >= 0; index -= 1) {
		accumulated += pricedNodes[index].tokens;
		keepFromIdx = index;
		if (accumulated >= retainTokens) break;
	}
	if (keepFromIdx <= firstIdx) return null;
	while (keepFromIdx > firstIdx) {
		if (toolPairingBalancedBefore(session, surfaceNodes[keepFromIdx])) break;
		keepFromIdx -= 1;
	}
	if (keepFromIdx <= firstIdx) return null;
	return {
		start: surfaceNodes[firstIdx],
		end: surfaceNodes[keepFromIdx - 1]
	};
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
function fixedPrefixTokens(session, measurement, toolsTokens) {
	if (measurement === void 0 || measurement === null) return null;
	let fixed = toolsTokens;
	const first = measurement.nodes[0];
	if (first !== void 0) {
		if (session.eventAt(first.seq)?.type === "system/message") fixed += first.tokens;
	}
	return fixed;
}
/** Map a token-meter baseline to the inspect `measurement` vocabulary. */
function measurementKind(measurement) {
	if (measurement === void 0 || measurement === null) return "unavailable";
	return measurement.baseline?.kind === "usage" ? "measured" : "estimated";
}
// src/prompts.ts
/**
* Structured prompt construction for the goal and handoff enhanced modes.
*
* The text here is new (informed by the design references; no source copied).
* It is appended as the final user message after the replayed conversation
* prefix, so the native warm prefix stays intact and every variable input
* (authoritative goal/todo/job state) sits at the end.
*
* Structure checks are deliberately shallow: required sections and non-empty
* text catch truncation, filtering, and degenerate output, but they are not a
* proof that no fact was lost. Fidelity is exercised by fixed-scenario tests,
* not by this function.
*/
/** Required H2 sections for the goal checkpoint. */
const GOAL_SECTIONS = Object.freeze([
	"## Current Goal and Unresolved Requests",
	"## Constraints, Preferences, and Approved Boundaries",
	"## Decisions and Reasons",
	"## Completed Work",
	"## In Progress",
	"## Blocked, Pending, and Unverified",
	"## Key References",
	"## Next Actions"
]);
/** Required H2 sections for the file-handoff document. */
const HANDOFF_SECTIONS = Object.freeze([
	"## Objective and Unresolved Requests",
	"## Current State",
	"## Constraints and Approved Boundaries",
	"## Decisions and Reasons",
	"## Completed Work",
	"## In Progress",
	"## Blocked, Pending, and Unverified",
	"## Key References",
	"## Next Actions",
	"## Suggested Skills"
]);
/** Marker that identifies a handoff document in a native checkpoint. */
const HANDOFF_TITLE = "# Session Handoff";
const COMMON_RULES = [
	"- Preserve exact file paths, commands, error strings, identifiers, numeric values, function signatures, and syntax fragments verbatim.",
	"- Capture user feedback and explicit instructions faithfully, especially corrections.",
	"- Never mark incomplete work complete and never describe unverified work as verified. If a result has not been proven against current files, command output, tests, or runtime state, list it as unverified.",
	"- Keep pending user questions, running jobs, and running child agents as facts to wait for or collect later. Do not claim to have answered a question, started or stopped a job, or finished a child agent.",
	"- Prefer references to existing specs, plans, diffs, and commits over copying their text.",
	"- Treat the authoritative state block (if present) as current host state that outranks any goal/progress claim inside an older checkpoint. Do not treat an older checkpoint as authoritative and do not let superseded plans accumulate.",
	"- Do not copy secrets, tokens, passwords, credentials, or private keys; redact them.",
	"- Do not mention this summarization request or that the context was compacted.",
	"- Output only the Markdown document: do not call any tool or take any other action."
];
/** Build the fixed goal-checkpoint directive. */
function goalInstruction() {
	return [
		"You are now acting as a compaction engine for this AI coding assistant. Condense the conversation ABOVE into a structured checkpoint that lets the next model resume the work with no loss of essential context.",
		"",
		"Output EXACTLY the Markdown structure below. Keep every section, in order. Use terse bullets, not prose paragraphs. Write \"(none)\" for an empty section — never drop a section.",
		"",
		...GOAL_SECTIONS.flatMap((heading) => [
			heading,
			"- [facts]",
			""
		]),
		"Rules:",
		"- Separate the current authoritative goal and unresolved user requests from completed work.",
		"- Record decisions and their reasons, not only outcomes.",
		"- Separate actually verified results from work that is merely believed done.",
		"- Preserve exact references and error strings instead of copying large plans or file bodies.",
		"- Next Actions must be directly in line with the most recent unresolved request, not an invented roadmap.",
		...COMMON_RULES,
		`- If the conversation already contains a <compacted-summary> block, it is a PRIOR checkpoint: keep still-true facts, drop stale ones, and merge newer information into one consolidated document under the same structure.`
	].join("\n");
}
/** Build the fixed handoff-document directive. */
function handoffInstruction() {
	return [
		"You are now acting as a compaction engine for this AI coding assistant. Write a handoff document for another agent that continues THIS SAME session from the checkpoint you produce. The document is saved to a temporary Markdown file and its full text is embedded in the session checkpoint, so it must be self-contained: assume the next agent sees this document and the retained recent conversation, nothing else.",
		"",
		`Start with the exact title \`${HANDOFF_TITLE}\` and then EXACTLY the Markdown structure below. Keep every section, in order. Use terse bullets, not prose paragraphs. Write "(none)" for an empty section — never drop a section.`,
		"",
		...HANDOFF_SECTIONS.flatMap((heading) => [
			heading,
			"- [facts]",
			""
		]),
		"Rules:",
		"- Write for continuation, not for a human archive: state where the work stands and what the next agent should do first.",
		"- Record decisions and their reasons, not only outcomes.",
		"- Separate actually verified results from work that is merely believed done.",
		"- Reference existing artifacts (files, specs, diffs, commits, commands) instead of copying them.",
		"- Suggested Skills is advisory only: list skills that might help next, and make clear the next agent must not invoke them without authorization.",
		"- Do not create, switch, or name a different session; the next agent continues this same session.",
		...COMMON_RULES
	].join("\n");
}
/** Single-line sanitized label for a state item. */
function clip(value, max = 500) {
	if (typeof value !== "string") return "";
	const text = value.replace(/\s+/g, " ").trim();
	return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}
/** Build one plugin error with its stable `code`. */
function codedError(message, code) {
	return Object.assign(new Error(message), { code });
}
/**
* Render the authoritative state block injected at the end of the instruction.
* Sections are capped so a pathological todo/job list cannot dominate the
* summary request; the caps are reported in the note when they bite.
*
* @param state - collected live authoritative state.
* @param mode - which document is being produced.
* @returns state block.
*/
function renderStateBlock(state, mode) {
	const lines = [];
	const omitted = [];
	const goal = state?.goal ?? null;
	const todos = Array.isArray(state?.todos) ? state.todos : [];
	const questions = Array.isArray(state?.questions) ? state.questions : [];
	const jobs = Array.isArray(state?.jobs) ? state.jobs : [];
	const children = Array.isArray(state?.children) ? state.children : [];
	if (state?.goalError !== void 0) lines.push(`- Goal state unavailable: ${clip(state.goalError)}`);
	else if (goal === null) lines.push("- No authoritative goal is set in this session. Do not infer a goal from prior checkpoint text.");
	else {
		const rounds = Number.isSafeInteger(goal.roundsStarted) && Number.isSafeInteger(goal.maxGoalRounds) ? `, rounds ${goal.roundsStarted}/${goal.maxGoalRounds}` : "";
		lines.push(`- Goal (phase ${goal.phase}${rounds}): ${clip(goal.objective, 2e3)}`);
		if (goal.blockedReason !== void 0) lines.push(`- Goal blocked reason: ${clip(goal.blockedReason.message)}`);
		if (goal.phase === "paused" || goal.phase === "blocked") lines.push("- The goal is paused or blocked. Do not resume it, re-arm it, or claim completion; record the next action for the user or a later explicit resume.");
	}
	const todoLimit = 40;
	if (todos.length > 0) {
		lines.push("", "Todos (authoritative `todo` projection at compaction time):");
		for (const todo of todos.slice(0, todoLimit)) lines.push(`- [${todo.status}] ${clip(todo.content)}`);
		if (todos.length > todoLimit) {
			omitted.push(`${todos.length - todoLimit} additional todos`);
			lines.push(`- (${todos.length - todoLimit} more todos omitted)`);
		}
	}
	if (questions.length > 0) {
		lines.push("", "Pending user questions (still awaiting the user — do not answer on their behalf):");
		for (const question of questions.slice(0, 10)) {
			const text = (Array.isArray(question.questions) ? question.questions : []).map((item) => clip(item.question, 800)).filter(Boolean).join(" | ");
			lines.push(`- callId ${question.callId} (${question.state}): ${text.length > 0 ? text : "(no question text)"}`);
		}
		if (questions.length > 10) omitted.push(`${questions.length - 10} additional pending questions`);
	}
	if (jobs.length > 0) {
		lines.push("", "Running background jobs (owned by this session):");
		for (const job of jobs.slice(0, 20)) lines.push(`- ${job.id} (${job.kind}, ${job.status}): ${clip(job.label)}`);
		if (jobs.length > 20) omitted.push(`${jobs.length - 20} additional running jobs`);
	}
	if (children.length > 0) {
		lines.push("", "Running child agents (the parent still has to collect their results):");
		for (const child of children.slice(0, 20)) lines.push(`- ${child.id}${child.depth === void 0 ? "" : ` (depth ${child.depth})`}: ${clip(child.label ?? "running")}`);
		if (children.length > 20) omitted.push(`${children.length - 20} additional running child agents`);
	}
	if (mode === "handoff") lines.push("", "Handoff note: the temporary file is a convenience copy. The checkpoint itself is self-contained; never instruct the next agent to rely on the file path alone.");
	return deepFreeze({
		text: lines.join("\n"),
		trimmed: omitted.length > 0,
		omitted: Object.freeze([...omitted])
	});
}
/**
* Names of the optional authoritative-state sections present in a state value.
* @param state - collected state.
* @returns human-readable section names.
*/
function omittedStateNames(state) {
	const names = [];
	if (Array.isArray(state?.todos) && state.todos.length > 0) names.push("todos");
	if (Array.isArray(state?.questions) && state.questions.length > 0) names.push("pending questions");
	if (Array.isArray(state?.jobs) && state.jobs.length > 0) names.push("running jobs");
	if (Array.isArray(state?.children) && state.children.length > 0) names.push("running child agents");
	return names;
}
/** Format a ratio as a stable percentage string. */
function percentText(ratio) {
	return `${Math.round(ratio * 1e3) / 10}%`;
}
/** Render one list variable, capped with an explicit omission note. */
function listVariable(items, limit, render, empty, noun) {
	const list = Array.isArray(items) ? items : [];
	if (list.length === 0) return empty;
	const lines = list.slice(0, limit).map(render);
	if (list.length > limit) lines.push(`- (${list.length - limit} more ${noun} omitted)`);
	return lines.join("\n");
}
/**
* Build the value map for the ten custom-mode variables. This is the single
* place where authoritative state becomes prompt text; the custom instruction
* itself receives no automatic state block.
*
* @param state - collected authoritative state.
* @param context - effective route facts.
* @returns variable values.
*/
function customPromptVariables(state, context = {}) {
	const goal = state?.goal ?? null;
	const policy = context.policy ?? null;
	return {
		goal: goal === null ? state?.goalError === void 0 ? "(no authoritative goal)" : `(goal state unavailable: ${clip(state.goalError)})` : clip(goal.objective, 2e3),
		todos: listVariable(state?.todos, 40, (todo) => `- [${todo.status}] ${clip(todo.content)}`, "(no todos)", "todos"),
		questions: listVariable(state?.questions, 10, (question) => {
			const text = (Array.isArray(question.questions) ? question.questions : []).map((item) => clip(item.question, 800)).filter(Boolean).join(" | ");
			return `- callId ${question.callId} (${question.state}): ${text.length > 0 ? text : "(no question text)"}`;
		}, "(no pending questions)", "questions"),
		jobs: listVariable(state?.jobs, 20, (job) => `- ${job.id} (${job.kind}, ${job.status}): ${clip(job.label)}`, "(no running jobs)", "jobs"),
		children: listVariable(state?.children, 20, (child) => `- ${child.id}${child.depth === void 0 ? "" : ` (depth ${child.depth})`}: ${clip(child.label ?? "running")}`, "(no running child agents)", "children"),
		date: (context.now instanceof Date ? context.now : /* @__PURE__ */ new Date()).toISOString(),
		session: context.sessionId ?? "",
		model: context.target === void 0 || context.target === null ? "(unknown summary model)" : `${context.target.provider}/${context.target.model}`,
		trigger: policy !== null && typeof policy.thresholdRatio === "number" && Number.isFinite(policy.thresholdRatio) ? percentText(policy.thresholdRatio) : "(unknown trigger)",
		retain: policy === null ? "(unknown retention)" : policy.retainTokens !== void 0 && policy.retainTokens !== null ? `${policy.retainTokens} tokens` : typeof policy.retainRatio === "number" && Number.isFinite(policy.retainRatio) ? percentText(policy.retainRatio) : "(unknown retention)"
	};
}
/**
* Expand one custom instruction. Known variables are replaced once; unknown
* variables stay literal and values are never recursively expanded.
* @param template - user-authored instruction.
* @param variables - variable values.
* @returns expanded text.
*/
function expandCustomPrompt(template, variables = {}) {
	if (typeof template !== "string") return "";
	return template.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (match, name) => Object.prototype.hasOwnProperty.call(variables, name) && variables[name] !== void 0 ? String(variables[name]) : match);
}
/**
* Build the custom-mode instruction. Unlike goal/handoff, this is exactly the
* expanded prompt: no built-in structure, state block, or safety rules.
* @param template - user-authored instruction.
* @param variables - variable values.
* @returns final instruction text.
* @throws {CodedError} with code `BETTER_COMPACT_PROMPT` when the result is empty.
*/
function buildCustomInstruction(template, variables = {}) {
	const text = expandCustomPrompt(template, variables).trim();
	if (text.length === 0) throw codedError("custom prompt is empty after variable expansion; write an instruction or choose another mode", "BETTER_COMPACT_PROMPT");
	return text;
}
/**
* Assemble the final instruction used as the last user message.
* @param mode - enhanced mode.
* @param stateBlock - state block.
* @param options - budget fallback disclosure.
* @returns instruction text.
*/
function buildInstruction(mode, stateBlock, options = {}) {
	const directive = mode === "handoff" ? handoffInstruction() : goalInstruction();
	const stateText = options.stateOmitted === true ? "" : stateBlock.text;
	const notes = [];
	if (options.stateOmitted === true) notes.push(`Authoritative state was omitted because the summary request does not fit the selected model context budget${options.omittedState?.length ? ` (${options.omittedState.join(", ")})` : ""}. Preserve the goal/next-action facts visible in the conversation and do not invent state.`);
	else if (options.omittedState !== void 0 && options.omittedState.length > 0) {
		const keptList = options.keptState?.length ? options.keptState : ["the goal"];
		const kept = keptList.join(", ");
		notes.push(`Budget note: only ${kept} ${keptList.length === 1 ? "was" : "were"} included; ${options.omittedState.join(", ")} were omitted to fit the selected summary model's context budget. Keep the omitted facts that are still visible in the conversation and do not invent the rest.`);
	}
	if (stateBlock.trimmed) notes.push(`Some authoritative state was capped to fit the model budget (${stateBlock.omitted.join("; ")}). Preserve the goal and next actions; do not invent the omitted items.`);
	return [
		directive,
		"",
		"## Authoritative state at compaction time",
		"",
		stateText.length > 0 ? stateText : "- (state block omitted; see the note above)",
		...notes.length > 0 ? [
			"",
			"## Budget note",
			...notes.map((note) => `- ${note}`)
		] : []
	].join("\n");
}
/**
* Verify the model produced the required structure. This is a fail-closed
* shape check, not a completeness proof.
*
* @param text - combined summary text.
* @param mode - enhanced mode.
* @throws {CodedError} with `code = 'BETTER_COMPACT_STRUCTURE'` when required text is missing.
*/
function assertSummaryStructure(text, mode) {
	if (typeof text !== "string" || text.trim().length === 0) throw codedError("summary output is empty", "BETTER_COMPACT_STRUCTURE");
	if (mode === "custom") return;
	const missing = (mode === "handoff" ? HANDOFF_SECTIONS : GOAL_SECTIONS).filter((heading) => !text.includes(heading));
	if (missing.length > 0) throw codedError(`summary output is missing required sections: ${missing.join(", ")}; the attempt was rejected instead of installing a degenerate checkpoint`, "BETTER_COMPACT_STRUCTURE");
	if (mode === "handoff" && !/^\s*#\s+Session Handoff\b/m.test(text)) throw codedError("handoff output must start with the \"# Session Handoff\" title", "BETTER_COMPACT_STRUCTURE");
}
/**
* Identify which known backend wrote a persisted checkpoint, from its structure
* alone. Unknown/foreign records return `null` instead of guessing.
* @param text - checkpoint summary text.
* @returns provable mode.
*/
function detectSummaryMode(text) {
	if (typeof text !== "string") return null;
	if (text.includes("# Session Handoff") && text.includes("## Suggested Skills")) return "handoff";
	if (text.includes("## Current Goal and Unresolved Requests")) return "goal";
	if (text.includes("## Primary Request and Intent") && text.includes("## Critical Context")) return "native";
	return null;
}
/** Secret/credential patterns redacted conservatively before a handoff file is written. */
const SECRET_PATTERNS = Object.freeze([
	[/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/g, "[REDACTED PRIVATE KEY]"],
	[/\bsk-[A-Za-z0-9_-]{16,}\b/g, "[REDACTED API KEY]"],
	[/\bsk-ant-[A-Za-z0-9_-]{16,}\b/g, "[REDACTED API KEY]"],
	[/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, "[REDACTED GITHUB TOKEN]"],
	[/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, "[REDACTED GITHUB TOKEN]"],
	[/\bAKIA[0-9A-Z]{16}\b/g, "[REDACTED AWS KEY]"],
	[/\baws_secret_access_key\s*[=:]\s*[A-Za-z0-9/+=]{32,}\b/gi, "aws_secret_access_key=[REDACTED]"],
	[/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, "[REDACTED SLACK TOKEN]"],
	[/\bAIza[0-9A-Za-z_-]{30,}\b/g, "[REDACTED GOOGLE KEY]"],
	[/\bBearer\s+[A-Za-z0-9._~+/=-]{16,}\b/g, "Bearer [REDACTED]"],
	[/\b(api[_-]?key|access[_-]?token|auth[_-]?token|password|passwd|secret|client[_-]?secret)\b(\s*[=:]\s*)("[^"\n]{4,}"|'[^'\n]{4,}'|[^\s"',;]{6,})/gi, "$1$2[REDACTED]"]
]);
/**
* Conservatively redact recognizable secrets. Documented as pattern-based, not
* perfect detection: it cannot recognize every credential format.
* @param text - raw text.
* @returns redacted text.
*/
function redactSecrets(text) {
	if (typeof text !== "string") return "";
	let output = text;
	for (const [pattern, replacement] of SECRET_PATTERNS) output = output.replace(pattern, replacement);
	return output;
}
/**
* Redact every text-bearing content block. Used for the handoff summary body
* and for the raw provider output persisted on `compaction/summary`, so a
* secret cannot survive in the trajectory view after the visible summary was
* redacted.
*
* @param blocks - provider output blocks.
* @returns blocks with text/reasoning/tool-call payloads redacted.
*/
function redactContentBlocks(blocks) {
	return blocks.map((block) => {
		const view = block;
		if (view.type === "text" || view.type === "reasoning") return {
			...block,
			text: redactSecrets(view.text)
		};
		if (view.type === "tool-call") return {
			...block,
			arguments: redactSecrets(view.arguments ?? "")
		};
		return block;
	});
}
/**
* Compose the final handoff document: our own deterministic header (with the
* actual path and a self-containedness note), followed by the model's body
* without a duplicate title.
*
* @param input - document inputs.
* @returns complete Markdown document.
*/
function composeHandoffDocument(input) {
	const body = input.body.replace(/^\s*#\s+Session Handoff\s*\n?/m, "").trimStart();
	return [
		HANDOFF_TITLE,
		"",
		`> Handoff file: ${input.path}`,
		`> Session: ${input.sessionId}`,
		`> Created: ${input.createdAt}`,
		"> This temporary file is a convenience copy. The complete document below is also stored in the session checkpoint, so replay does not depend on the file surviving.",
		"",
		body,
		""
	].join("\n");
}
/**
* Build the one ordinary same-session continuation message.
* @param result - committed compaction result.
* @param path - verified handoff path, when written.
* @returns continuation text.
*/
function continuationText(result, path) {
	return [
		`A file-handoff checkpoint just replaced earlier history in this session (${result.shadowedSeqs.length} history items condensed).`,
		...path === null ? [] : [`The temporary handoff document is at ${path}; its full text is already embedded in the checkpoint above.`],
		"Continue the same task in this session from that checkpoint. Do not ask the user to re-provide context the checkpoint already contains. Re-check current state against the repository and tools before trusting remembered details, then take the next action.",
		"Do not create or switch sessions."
	].join("\n");
}
// src/live.ts
/** Live attempts keyed by session id. */
const activeSummaries = /* @__PURE__ */ new Map();
/** Last classified failure keyed by session id. */
const lastFailures = /* @__PURE__ */ new Map();
/** Manual continuation decisions keyed by session id. */
const continuationOutcomes = /* @__PURE__ */ new Map();
/** Summary-budget omissions keyed by session id. */
const budgetFallbacks = /* @__PURE__ */ new Map();
/**
* Read the compaction id of one bracket record.
*
* `compaction/start` and `compaction/end` require an id; a foreign record that
* carries none is normalized to `null` exactly like {@link findLatestCompactionId}.
*/
function compactionIdOf(event) {
	return event.data.compactionId ?? null;
}
/** Find the latest unmatched `compaction/start` in a session log. */
function findOpenCompaction(session) {
	if (session === void 0) return void 0;
	for (let seq = session.seq - 1; seq >= 0; seq -= 1) {
		const event = session.eventAt(seq);
		if (event === void 0) continue;
		if (event.type === "compaction/start") return event;
		if (event.type === "compaction/end") return void 0;
	}
}
/** Find the compaction id of the newest bracket in a session log. */
function findLatestCompactionId(session) {
	if (session === void 0) return null;
	for (let seq = session.seq - 1; seq >= 0; seq -= 1) {
		const event = session.eventAt(seq);
		if (event === void 0) continue;
		if (event.type === "compaction/start" || event.type === "compaction/end") return compactionIdOf(event);
	}
	return null;
}
/**
* Mark the beginning of one summarization attempt. Called from the engine's
* summary hook, which runs while the native `compaction/start` bracket is open.
*/
function markSummaryStart(session, mode) {
	const open = findOpenCompaction(session);
	if (open === void 0) return;
	activeSummaries.set(session.id, {
		compactionId: compactionIdOf(open),
		startedAt: Date.now(),
		mode
	});
}
/** Mark the end of one summarization attempt (success or failure). */
function markSummaryEnd(sessionId) {
	activeSummaries.delete(sessionId);
}
/** Whether a live in-memory summarization attempt owns this compaction id. */
function isSummaryActive(sessionId, compactionId) {
	return activeSummaries.get(sessionId)?.compactionId === compactionId;
}
/** Mode of the live attempt, when one is active (used for diagnostics only). */
function activeSummaryMode(sessionId) {
	return activeSummaries.get(sessionId)?.mode ?? null;
}
/** Record one classified manual/automatic failure for inspect. */
function recordCompactionFailure(session, status, message, compactionId) {
	if (session === void 0) return;
	const id = compactionId ?? findLatestCompactionId(session);
	lastFailures.set(session.id, {
		compactionId: id,
		status,
		message: typeof message === "string" ? message : String(message)
	});
}
/** Read the last process-observed failure for one session. */
function lastCompactionFailure(sessionId) {
	return lastFailures.get(sessionId);
}
/** Record the read-only outcome of the manual handoff continuation decision. */
function recordContinuationOutcome(sessionId, outcome) {
	continuationOutcomes.set(sessionId, Object.freeze({
		compactionId: outcome.compactionId,
		status: outcome.status,
		blockers: Object.freeze([...outcome.blockers ?? []]),
		at: outcome.at ?? Date.now()
	}));
}
/** Read the latest continuation decision for one session, if this process made one. */
function continuationOutcome(sessionId) {
	return continuationOutcomes.get(sessionId) ?? null;
}
/** Record authoritative state omitted from the most recent enhanced summary. */
function recordBudgetFallback(sessionId, omitted) {
	budgetFallbacks.set(sessionId, Object.freeze({
		omitted: Object.freeze([...omitted]),
		at: Date.now()
	}));
}
/** Read the latest summary-budget omission for one session. */
function lastBudgetFallback(sessionId) {
	return budgetFallbacks.get(sessionId) ?? null;
}
// src/shared/services.ts
/**
* Read one optional host service without failing the caller.
* @param ctx - any cordis context.
* @param name - service name.
* @returns the service value, or undefined when absent or unreadable.
*/
function optionalService(ctx, name) {
	try {
		return ctx.get(name) ?? void 0;
	} catch {
		return;
	}
}
export { selectCompactableRange as A, APOLLO_ROW_CONFIG_KEY as B, BudgetConfigError as C, resolveCompactSpec as D, reservedCompletionTokens as E, configEquals as F, MODES as G, ENTRY_ID as H, deepFreeze as I, ROW_CONFIG_KEYS as J, PACKAGE_NAME as K, readConfig as L, isBetterCompactEngine as M, serviceIdentity as N, resolveTargetPolicy as O, Config as P, toNativeConfig as R, renderStateBlock as S, measurementKind as T, INSPECT_PATH as U, ENGINE_ENTRY_ID as V, MODELS_PATH as W, SUMMARY_IMAGE_MODES as X, SUMMARY_IMAGE_CAPTION as Y, customPromptVariables as _, lastBudgetFallback as a, redactContentBlocks as b, markSummaryStart as c, recordContinuationOutcome as d, assertSummaryStructure as f, continuationText as g, composeHandoffDocument as h, isSummaryActive as i, targetFromHeader as j, routedTarget as k, recordBudgetFallback as l, buildInstruction as m, activeSummaryMode as n, lastCompactionFailure as o, buildCustomInstruction as p, ROW_CONFIG_KEY as q, continuationOutcome as r, markSummaryEnd as s, optionalService as t, recordCompactionFailure as u, detectSummaryMode as v, fixedPrefixTokens as w, redactSecrets as x, omittedStateNames as y, APOLLO_LEGACY_ROW_CONFIG_KEY as z };
