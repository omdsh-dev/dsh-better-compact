window.__ModuleLoader__.load({
	id: "dsh-better-compact",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		// \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		let react = require("react");
		react = __toESM(react, 1);
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
		/** Every assembly's `plugins.row.config` key, in dispatch order. */
		const ROW_CONFIG_KEYS = Object.freeze([
			`${PACKAGE_NAME}#${ENTRY_ID}`,
			`dsh-better-dsh#${ENTRY_ID}`,
			`@menghuan1918/dsh-apollo#${ENTRY_ID}`,
			`dsh-apollo#${ENTRY_ID}`
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
		/**
		* Exact fixed-font route pathname: `GET` reports the asset status, `POST`
		* downloads and installs the pinned checkpoint font.
		*/
		const FONT_PATH = "/better-compact/api/font";
		/** Slot namespace the settings row is registered under. */
		const ROW_CONFIG_SLOT = "plugins.row.config";
		/** Locale namespace shared by the client half and the settings slot. */
		const LOCALE_NAMESPACE = "better-compact";
		/**
		* Variables accepted by the custom-mode prompt editor and runtime expander.
		* Keep in sync with the client chip toolbar (both sides import this list).
		*/
		const PROMPT_VARIABLES = Object.freeze([
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
		Object.freeze(["goal", "custom"]);
		// src/client/locales/en.ts
		const en = {
			processrecent: "Recent messages",
			processearlier: "Earlier messages",
			processfixedPrefix: "Fixed prompt / tool prefix",
			processwindow: "Model window",
			processmessage: "Message budget",
			processauto: "Automatic compaction",
			processtriggerHelp: "Compacts when the trigger point is reached, and also on context overflow.",
			processeffective: "Trigger point",
			processretain: "Keep recent text",
			retainRecentShort: "Keep recent text",
			processretainHelp: "The newest complete messages stay verbatim and the rest becomes the summary; the exact count can differ slightly.",
			processbyRatio: "Share of the budget",
			processfixed: "Fixed token count",
			processtokens: "Retain tokens",
			processretained: "Retained text",
			processsummaryCap: "Summary output cap",
			processsummaryBudget: "Summary budget",
			processfollowHeadroom: "Empty follows the headroom value.",
			processcache: "Reuse the session's prompt cache",
			processcacheHelp: "The summary request carries the tool definitions and tool history so the provider can hit the session's cached prefix; off sends a smaller request that is less likely to hit the cache.",
			processoverride: "This session has per-model overrides; the numbers shown are the merged result.",
			processcapacityTitle: "Trigger and retention",
			capacityHintDrag: "Drag a handle on the bar, or type a number.",
			capacityEffect: "Compacts at {trigger}, keeps the latest {retain} verbatim, and reserves {headroom} of headroom.",
			capacityEffectLimited: "Compacts at {trigger} (earlier than the configured ratio because headroom is tight), keeps the latest {retain} verbatim, and reserves {headroom} of headroom.",
			compactionCut: "Trigger point",
			capacityUnknownNote: "The model window is unknown, so the bar is proportional only; select a session to read current usage.",
			capacityEffectUnknown: "Compacts at {trigger} and keeps the latest {retain} verbatim; the model window is unknown, so tokens are not computed.",
			processbarFixed: "Prefix",
			processbarCompressible: "Compressible",
			processbarRetained: "Retained",
			processbarHeadroom: "Headroom",
			draftUnsaved: "Unsaved",
			processcurrentUsage: "Current usage",
			processtriggerHandle: "Trigger ratio",
			processretainHandle: "Retention ratio",
			processreserve: "Output reserve",
			processheadroom: "Headroom",
			processheadroomHelp: "Space kept free above the trigger point for the summary request and its reasoning output.",
			processsessionHelp: "Only reads current usage; never changes saved settings.",
			processconfigBudget: "Configured budget",
			processunknownBudget: "Select a session to read current usage; no token budget is calculated while the model window is unknown.",
			processautoOff: "Automatic compaction is off; only a manual /compact runs.",
			processpromptTitle: "Custom prompt",
			processpromptRequired: "Required",
			processpromptIntro: "Only this prompt goes to the summary model, with no built-in structure or state block; reference the current context with variables.",
			processpromptPlaceholder: "For example: keep unfinished verification steps, failure reasons and the next step; do not list completed files.",
			processpromptCounter: "{count} / 8000 characters",
			processpromptUnknown: "These variables do not exist and will be sent literally: {tokens}",
			processpromptEmpty: "Custom mode needs a prompt.",
			processpromptTooLong: "The custom prompt is limited to 8000 characters.",
			processpromptPrivacy: "The prompt and summary are written to the session record; never put secrets here.",
			svgContinue: "Continue",
			svgRetained: "Recent verbatim retained",
			svgAuto: "Trigger at {ratio} · retain {retain}",
			svgManual: "Automatic compaction off · manual only",
			svgPreview: "Before {before} → upper bound ≤ {after} (estimated from running config)",
			svgProjected: "Summary budget this round {summary}; the next upper bound depends on the actual summary.",
			svgNativeSideTag: "Built in",
			svgGoalSideTag: "Read-only",
			svgHandoffSideTag: "File",
			svgCustomSideTag: "Variables",
			svgPendingTag: "Pending",
			svgKeepTag: "Keep",
			svgWriteTag: "Write",
			svgOriginalTag: "Tail",
			svgNativeTitle: "Host native",
			svgNativeBody: "Earlier messages → native summary",
			svgNativeSide: "Host instruction",
			svgNativeSideBody: "Ignores goals",
			svgNativeResult: "Summary record",
			svgNativeResultBody: "Written as native checkpoint",
			svgNativeFinal: "Checkpoint + recent verbatim continue.",
			svgNativeAria: "Native mode: earlier messages become a native summary, while recent verbatim is retained to form the native checkpoint.",
			svgGoalTitle: "Goal-enhanced summary",
			svgGoalBody: "Earlier + goals and todos",
			svgGoalSide: "Goals and todos",
			svgGoalSideBody: "Read-only · not modified",
			svgGoalResult: "Summary record",
			svgGoalResultBody: "Goals · constraints · progress · next",
			svgGoalFinal: "Checkpoint + recent verbatim continue.",
			svgGoalAria: "Goal-enhanced: earlier messages merge with read-only goals and todos to produce a goals, constraints, progress and next-step summary; recent verbatim is retained.",
			svgHandoffTitle: "Handoff body",
			svgHandoffBody: "Earlier + goals and todos",
			svgHandoffSide: "Temporary handoff file",
			svgHandoffSideBody: "Writes body · same session",
			svgHandoffResult: "Native event record",
			svgHandoffResultBody: "Stores the handoff body",
			svgHandoffFinal: "Handoff body + recent verbatim continue.",
			svgHandoffAria: "File handoff: conversation and state produce this attempt’s temporary handoff file; the body is written to native events and the same session continues, with recent verbatim retained.",
			svgCustomTitle: "Custom summary",
			svgCustomBody: "Earlier + your prompt",
			svgCustomSide: "Your prompt",
			svgCustomSideBody: "Expanded · no added structure",
			svgCustomResult: "Summary record",
			svgCustomResultBody: "No section check",
			svgCustomFinal: "Your summary + recent verbatim continue; no section check.",
			svgCustomAria: "Custom: earlier messages and the expanded prompt produce the summary, with no built-in structure or state block added; recent verbatim is retained.",
			runtimeMessageBudget: "Message budget",
			runtimeSummaryBudget: "Summary output budget",
			safeCutWithBefore: "Compacts messages {start}–{end}: {before} down to at most {upper}.",
			processpromptVariables: "Insert variable",
			processadvancedRules: "Retries and model overrides",
			processadvancedDefault: "Defaults",
			processstrategyTitle: "Compaction strategy",
			processgenerationTitle: "Summary generation",
			processgenerationIntro: "Used only for the compaction request; the conversation model is unchanged.",
			summary: "Trigger and retention, strategy, summary generation, diagnostics",
			title: "Context compaction",
			purpose: "Decide when compaction runs, what the summary keeps, and how much recent text stays verbatim.",
			unknown: "Unknown",
			unset: "Not set",
			selectOption: "Select an option",
			loadingConfig: "Loading configuration…",
			waitingForm: "Waiting for the host configuration form…",
			formUnavailable: "The host exposes no editable form; defaults are not invented.",
			readOnly: "Read-only",
			readOnlyConfig: "Read-only configuration",
			activeDiffers: "Saved configuration differs from the running one",
			viewActiveConfig: "View the running configuration",
			runtimeMode: "Running strategy",
			runtimeSummaryModel: "Running summary model",
			runtimeThreshold: "Running trigger ratio",
			runtimeRetain: "Running retention budget",
			followSession: "Follow the session",
			modeGroup: "Compaction strategy",
			modeNative: "Host native",
			modeGoal: "Goal-aware",
			modeHandoff: "File handoff",
			modeNativeEffect: "Reuses the host's built-in summary structure and instruction",
			modeGoalEffect: "Writes goals and todos into the summary",
			modeHandoffEffect: "Writes a handoff document and continues in the same session",
			modeNativeCaption: "The native engine writes the summary.",
			modeGoalCaption: "Goals and tasks feed the summary.",
			modeHandoffCaption: "The handoff body is also written to the session record.",
			modeCustomCaption: "No built-in structure, state block or safety rules are appended.",
			modeNativeTag: "Built in",
			cacheChip: "Cache reuse",
			modeGoalTag: "Recommended",
			modeHandoffTag: "Writes a file",
			modeCustomTag: "Your prompt",
			modeCustom: "Custom",
			modeCustomEffect: "Sends only the prompt you write to the summary model",
			variableGoal: "Goal",
			variableTodos: "Todos",
			variableQuestions: "Pending questions",
			variableJobs: "Jobs",
			variableChildren: "Subagents",
			variableDate: "Date",
			variableSession: "Session ID",
			variableModel: "Summary model",
			variableTrigger: "Trigger ratio",
			variableRetain: "Retain tokens",
			threshold: "Threshold",
			retainRecent: "Retain recent messages",
			byRatio: "By ratio",
			retainRatio: "Retention ratio",
			retainTokens: "Retain tokens",
			cachePriority: "Reuse prompt cache first",
			summaryImage: "Send the checkpoint as images",
			summaryImageHint: "Only available in goal-aware and custom modes; needs a vision-capable conversation model",
			summaryImageHelp: "Renders the checkpoint into image pages instead of text; the conversation model must accept images.",
			fontChecking: "Reading the font status…",
			fontRow: "Image font",
			fontMissing: "Not installed · about 29 MB",
			fontInstalled: "Installed {family} v{version} · {size}",
			fontDownload: "Download font",
			fontRedownload: "Download again",
			fontDownloading: "Downloading…",
			summaryModel: "Summary model",
			customModelOption: "Custom provider and model…",
			followSessionModel: "Follow the conversation model",
			reasoningEffort: "Reasoning effort",
			modelDefault: "Model default",
			modelDefaultWith: "Model default ({effort})",
			unsupportedEffortOption: "{effort} · not declared",
			effortUnknownPlaceholder: "Model default; capability unknown",
			provider: "Provider",
			model: "Model",
			modelsLoading: "Loading model list…",
			modelsFailed: "Could not read the model list; you can still enter a custom model.",
			advanced: "Advanced settings",
			advancedCount: "{count} items",
			headroom: "Headroom",
			summaryOutputCap: "Summary output cap",
			pressureRetry: "Pressure retries",
			overflowRecovery: "Overflow recoveries",
			followHeadroom: "Follows headroom: {value}",
			policies: "Per-model overrides",
			addRule: "Add rule",
			allModelsGlobal: "Every model uses the global settings.",
			newRule: "New rule",
			sessionProvider: "Session provider",
			sessionModel: "Session model",
			retainMode: "Keep recent text",
			inheritWith: "Inherit {value}",
			byMessageBudgetRatio: "Share of the budget",
			fixedTokenCount: "Fixed token count",
			policySummaryMode: "Summary model",
			policySummaryInherit: "Inherit · {value}",
			policySummarySession: "Follow session model",
			policySummaryCustom: "Specify summary model",
			summaryProvider: "Summary provider",
			deleteRule: "Delete rule {index}",
			deleteRuleShort: "Delete rule",
			timesUnit: "times",
			statusSection: "Session diagnostics",
			statusReadOnly: "Read-only",
			statusEmpty: "Select a session to read its usage and compaction records.",
			diagnosticsFailed: "Diagnostics failed: {message}",
			readingDiagnostics: "Reading diagnostics…",
			engineUnknown: "The engine for this session is not confirmed yet.",
			engineForeign: "Another compaction engine ({owner}) owns this session; only real records are shown.",
			engineOwnerUnknown: "The engine owner is not confirmed; budgets and previews use this plugin's configuration.",
			engineOwner: "Compaction engine: {owner}",
			lastCompaction: "Last compaction",
			noCompaction: "No compaction recorded for this session yet.",
			handoffContinuation: "Handoff continuation",
			continuationScheduled: "A continuation in the same session is scheduled.",
			continuationSkipped: "This continuation was skipped.",
			diagnosticsDetails: "Diagnostics ({count})",
			session: "Reference session",
			selectSessionTitle: "Choose the session whose usage and budget are read",
			loadingSessions: "Loading sessions…",
			noSessions: "No sessions yet",
			selectSession: "Select a session",
			runningSuffix: " · running",
			refreshDiagnostics: "Refresh session diagnostics",
			reading: "Reading…",
			refresh: "Refresh",
			sessionListFailed: "Session list unavailable",
			noSafeCut: "No safely compactable range right now.",
			fixedPrefix: "Fixed prefix",
			runtimeWindow: "Model window",
			currentContext: "Current context",
			runtimeTrigger: "Runtime trigger point",
			measured: "Measured",
			estimated: "Estimated",
			measurementUnknown: "Usage unknown",
			conclusionAutoOff: "Automatic compaction is off",
			conclusionNoUsage: "No context usage yet",
			conclusionRemaining: "Remaining until automatic compaction: {remaining}",
			conclusionReached: "The trigger point is reached",
			statusRunning: "Running",
			statusCompleted: "Completed",
			statusFailed: "Failed",
			statusCancelled: "Cancelled",
			statusPersistenceError: "Persistence failed",
			triggerManual: "Manual",
			triggerAutomatic: "Automatic",
			triggerUnknown: "Trigger unknown",
			strategyLabel: "Strategy",
			duration: "Duration",
			replacedMessages: "Before",
			summaryEstimate: "After (estimated)",
			cacheRead: "Cache read",
			cacheWrite: "Cache write",
			persistenceFailed: "The summary may be written, but the session save failed.",
			saveChanges: "{count} unsaved changes",
			save: "Save settings",
			saving: "Saving…",
			discard: "Discard",
			discardAgain: "Click again to discard",
			reload: "Reload",
			fixErrors: "Fix {count} first",
			saveFailed: "Save failed: {message}. Your changes are kept.",
			saveRejected: "The host rejected this save; your changes are kept. Reload and check the configuration.",
			saveConflict: "The configuration changed in another page; reload before editing.",
			saved: "Saved. Reload DSH to apply.",
			validationMode: "Choose a compaction strategy.",
			validationThreshold: "The trigger ratio must be above 0 and below 100%.",
			validationHeadroom: "Headroom must be a non-negative integer.",
			validationRetainTokens: "Retain tokens must be a non-negative integer.",
			validationRetainRatio: "The retention ratio must be above 0 and below the trigger ratio; empty means 16%.",
			validationSummaryPair: "Fill in both provider and model.",
			validationEffortSpaces: "Reasoning effort cannot contain only spaces.",
			validationMaxTokens: "The summary output cap must be a positive integer; with zero headroom it must be set explicitly.",
			validationRetries: "Retry count must be a non-negative safe integer.",
			validationPolicyModel: "Fill in both provider and model.",
			validationDuplicatePolicy: "This model already has an override.",
			validationSuffixRatio: " must be greater than 0% and less than 100%.",
			validationSuffixPositive: " must be a positive safe integer.",
			validationSuffixNonNegative: " must be a non-negative safe integer.",
			validationPolicyRetainTokens: "Retain tokens must be a non-negative integer.",
			validationPolicyRetainRatio: "The effective retention ratio must be above 0 and below this rule's trigger ratio.",
			validationPolicySummaryPair: "Fill in both summary provider and model.",
			validationPolicyMaxTokens: "With zero headroom the summary output cap must be set.",
			validationGlobalSummaryModel: "Global summary model",
			validationRule: "Rule {provider}/{model}",
			validationFollowedSummaryModel: "Followed session summary model",
			validationEffortUnsupported: "{label} {provider}/{model} does not declare effort \"{effort}\". Adjust the global effort or summary model.",
			routeWarning: "The custom model {provider}/{model} is not in the host catalog; confirm the session can use it.",
			reasonNoCapacity: "Insufficient model capacity",
			reasonNoCapacityHint: "Reduce the session output reserve or choose a larger session model.",
			reasonReserveFull: "Headroom and output reservation fill the window",
			reasonReserveFullHint: "Lower the headroom or the session's output reservation, or use a larger-window model.",
			reasonRetainConflict: "Retention budget conflicts with the trigger line",
			reasonRetainConflictHint: "Lower the retention budget or raise the trigger ratio.",
			reasonNoSafeRangeWithPrefix: "No compactable space after the fixed prefix and recent text",
			reasonNoSafeRange: "No safely compactable range",
			reasonNoSafeRangeHint: "Lower retention or the trigger ratio, or wait for more history.",
			reasonNoRoute: "No model request yet",
			reasonNoRouteHint: "Send one model request in the session first.",
			reasonCapacityUnknown: "Model capacity unknown",
			reasonCapacityUnknownHint: "Check the adapter metadata for this route.",
			reasonBelowTrigger: "The automatic trigger line is not reached yet",
			reasonAutoOff: "Auto compression is off",
			reasonAutoOffHint: "Turn automatic compaction on under Trigger and retention.",
			budgetNoMessageRoom: "The session output reserve fills the window; adjust the session model output cap.",
			budgetHeadroomTooLarge: "Headroom must be smaller than the message budget {message}.",
			budgetRetainTooLarge: "The retained {retain} must be below the trigger point {threshold}."
		};
		// src/client/locales/zh.ts
		/**
		* Chinese dictionary - the key authority for the better-compact namespace.
		*
		* Copied verbatim from the pre-TypeScript client bundle. MessageKey is
		* derived from this object, so adding a key here makes the English dictionary
		* a compile error until it is translated (see ./en.ts).
		*/
		const zh = {
			processrecent: "近期原文",
			processearlier: "较早消息",
			processfixedPrefix: "固定提示 / 工具前缀",
			processwindow: "模型窗口",
			processmessage: "消息预算",
			processauto: "自动压缩",
			processtriggerHelp: "到达触发点自动压缩；上下文溢出时也会触发。",
			processeffective: "触发点",
			processretain: "保留近期原文",
			retainRecentShort: "保留近期原文",
			processretainHelp: "保留最近的完整消息，其余交给摘要；实际条数可能略有出入。",
			processbyRatio: "按预算比例",
			processfixed: "固定 token",
			processtokens: "保留 token",
			processretained: "保留原文",
			processsummaryCap: "摘要输出上限",
			processsummaryBudget: "摘要预算",
			processfollowHeadroom: "留空时等于「压缩余量」。",
			processcache: "复用会话提示缓存",
			processcacheHelp: "摘要请求带上工具定义与工具历史，尽量命中会话缓存的提示前缀；关闭后请求更小，但缓存难命中。",
			processoverride: "该会话有按模型覆盖的规则，这里显示合并后的实际预算。",
			processcapacityTitle: "触发与保留",
			capacityHintDrag: "可拖动容量条上的手柄，也可直接填数字。",
			capacityEffect: "达到 {trigger} 时压缩，保留最近 {retain} 原文，再留 {headroom} 余量。",
			capacityEffectLimited: "达到 {trigger} 时压缩（余量不够，比设定的触发比例更早），保留最近 {retain} 原文，再留 {headroom} 余量。",
			compactionCut: "触发点",
			capacityUnknownNote: "模型窗口未知，只能按比例显示；选择会话后可读取当前用量。",
			capacityEffectUnknown: "达到 {trigger} 时压缩，保留最近 {retain} 原文；模型窗口未知，暂不换算 token。",
			processbarFixed: "固定前缀",
			processbarCompressible: "待压缩",
			processbarRetained: "保留",
			processbarHeadroom: "余量",
			draftUnsaved: "未保存",
			processcurrentUsage: "当前用量",
			processtriggerHandle: "触发比例",
			processretainHandle: "保留比例",
			processreserve: "输出预留",
			processheadroom: "压缩余量",
			processheadroomHelp: "触发点之后额外留出的空间，用来放摘要请求和推理输出。",
			processsessionHelp: "只用来读取当前用量，不改变保存的设置。",
			processconfigBudget: "配置预算",
			processunknownBudget: "选择会话后可读取当前用量；模型窗口未知时不计算 token 预算。",
			processautoOff: "自动压缩已关闭，只有手动 /compact 会压缩。",
			processpromptTitle: "自定义提示词",
			processpromptRequired: "必填",
			processpromptIntro: "只把这段提示词发给摘要模型，不附加内置结构和状态块；用变量引用当前上下文。",
			processpromptPlaceholder: "例如：保留没做完的验证步骤、失败原因和下一步；不要总结已完成的文件清单。",
			processpromptCounter: "{count} / 8000 字符",
			processpromptUnknown: "这些变量不存在，会按原文发送：{tokens}",
			processpromptEmpty: "自定义模式需要提示词。",
			processpromptTooLong: "自定义提示词最多 8000 字符。",
			processpromptPrivacy: "提示词和摘要都会写进会话记录，不要放密钥。",
			svgContinue: "继续对话",
			svgRetained: "近期原文保留",
			svgAuto: "自动触发 {ratio} · 保留 {retain}",
			svgManual: "自动压缩已关闭 · 仅手动",
			svgPreview: "压缩前 {before} → 上界 ≤ {after}（按运行配置估算）",
			svgProjected: "本轮摘要预算 {summary}；下轮上限取决于实际摘要。",
			svgNativeSideTag: "内置",
			svgGoalSideTag: "只读",
			svgHandoffSideTag: "写文件",
			svgCustomSideTag: "变量",
			svgPendingTag: "待压缩",
			svgKeepTag: "保留",
			svgWriteTag: "写入",
			svgOriginalTag: "原文",
			svgNativeTitle: "宿主原生压缩",
			svgNativeBody: "较早消息 → 原生摘要",
			svgNativeSide: "宿主指令",
			svgNativeSideBody: "不读目标",
			svgNativeResult: "摘要记录",
			svgNativeResultBody: "写入原生 checkpoint",
			svgNativeFinal: "摘要记录 + 近期原文继续对话。",
			svgNativeAria: "原生模式：较早消息经原生压缩生成摘要，近期原文保留，组成原生 checkpoint。",
			svgGoalTitle: "目标增强摘要",
			svgGoalBody: "较早 + 目标与待办",
			svgGoalSide: "目标与待办",
			svgGoalSideBody: "只读 · 不修改",
			svgGoalResult: "摘要记录",
			svgGoalResultBody: "目标 · 约束 · 进展 · 下一步",
			svgGoalFinal: "摘要记录 + 近期原文继续对话。",
			svgGoalAria: "目标增强：较早消息与只读的目标和待办合流，生成目标、约束、进展与下一步摘要，近期原文保留。",
			svgHandoffTitle: "交接正文",
			svgHandoffBody: "较早 + 目标与待办",
			svgHandoffSide: "临时交接文件",
			svgHandoffSideBody: "写正文 · 同会话继续",
			svgHandoffResult: "原生事件记录",
			svgHandoffResultBody: "保存交接正文",
			svgHandoffFinal: "交接正文 + 近期原文继续。",
			svgHandoffAria: "文件交接：较早消息与状态生成本次临时交接文件，正文写入原生事件，同会话继续，近期原文保留。",
			svgCustomTitle: "自定义摘要",
			svgCustomBody: "较早 + 你的提示词",
			svgCustomSide: "你的提示词",
			svgCustomSideBody: "变量展开 · 不附加结构",
			svgCustomResult: "摘要记录",
			svgCustomResultBody: "不校验章节",
			svgCustomFinal: "你的摘要 + 近期原文继续；不校验章节。",
			svgCustomAria: "自定义：较早消息与展开后的提示词一起生成摘要，不附加内置结构或状态块，近期原文保留。",
			runtimeMessageBudget: "消息预算",
			runtimeSummaryBudget: "摘要输出预算",
			safeCutWithBefore: "压缩第 {start}–{end} 条消息：从 {before} 降到最多 {upper}。",
			processpromptVariables: "插入变量",
			processadvancedRules: "重试与模型覆盖",
			processadvancedDefault: "默认",
			processstrategyTitle: "压缩策略",
			processgenerationTitle: "摘要生成",
			processgenerationIntro: "只用于压缩请求，不会改变会话模型。",
			summary: "触发与保留、压缩策略、摘要生成、会话诊断",
			title: "上下文压缩",
			purpose: "决定什么时候压缩、压成什么、保留多少原文。",
			unknown: "未知",
			unset: "未设置",
			selectOption: "选择选项",
			loadingConfig: "正在读取配置…",
			waitingForm: "等待宿主配置表单…",
			formUnavailable: "宿主未提供可编辑表单，不填造默认值。",
			readOnly: "只读",
			readOnlyConfig: "只读配置",
			activeDiffers: "保存的配置与运行中的不同",
			viewActiveConfig: "查看运行中的配置",
			runtimeMode: "运行策略",
			runtimeSummaryModel: "运行摘要模型",
			runtimeThreshold: "运行触发比例",
			runtimeRetain: "运行保留预算",
			followSession: "跟随会话",
			modeGroup: "压缩策略",
			modeNative: "宿主原生",
			modeGoal: "目标增强",
			modeHandoff: "文件交接",
			modeNativeEffect: "沿用宿主内置的摘要结构与指令",
			modeGoalEffect: "把目标与待办一起写进摘要",
			modeHandoffEffect: "生成交接文档，同一会话继续",
			modeNativeCaption: "摘要请求由原生引擎处理。",
			modeGoalCaption: "目标与任务作为摘要输入。",
			modeHandoffCaption: "交接正文同时写入会话记录。",
			modeCustomCaption: "不附加内置结构、状态块或安全规则。",
			modeNativeTag: "内置",
			cacheChip: "缓存复用",
			modeGoalTag: "推荐",
			modeHandoffTag: "写文件",
			modeCustomTag: "你的提示词",
			modeCustom: "自定义",
			modeCustomEffect: "只把你写的提示词发给摘要模型",
			variableGoal: "目标",
			variableTodos: "待办",
			variableQuestions: "待答问题",
			variableJobs: "后台任务",
			variableChildren: "子代理",
			variableDate: "日期",
			variableSession: "会话 ID",
			variableModel: "摘要模型",
			variableTrigger: "触发比例",
			variableRetain: "保留 token",
			threshold: "触发比例",
			retainRecent: "近期原文保留",
			byRatio: "按比例",
			retainRatio: "保留比例",
			retainTokens: "保留 token",
			cachePriority: "优先复用提示缓存",
			summaryImage: "压缩结果以图片传给模型",
			summaryImageHint: "仅在目标增强与自定义模式下可选；需要能读图片的会话模型",
			summaryImageHelp: "把压缩记录渲染成图片页代替文本，要求会话模型能读图片。",
			fontChecking: "正在读取字体状态…",
			fontRow: "图片渲染字体",
			fontMissing: "未安装 · 约 29 MB",
			fontInstalled: "已安装 {family} v{version} · {size}",
			fontDownload: "下载字体",
			fontRedownload: "重新下载",
			fontDownloading: "下载中…",
			summaryModel: "摘要模型",
			customModelOption: "自定义服务商与模型…",
			followSessionModel: "跟随会话模型",
			reasoningEffort: "思考强度",
			modelDefault: "模型默认",
			modelDefaultWith: "模型默认（{effort}）",
			unsupportedEffortOption: "{effort} · 未声明支持",
			effortUnknownPlaceholder: "模型默认；能力未知",
			provider: "服务商",
			model: "模型",
			modelsLoading: "读取模型列表…",
			modelsFailed: "模型列表读取失败，可以手动填自定义模型。",
			advanced: "高级设置",
			advancedCount: "{count} 项",
			headroom: "压缩余量",
			summaryOutputCap: "摘要输出上限",
			pressureRetry: "压力重试次数",
			overflowRecovery: "溢出恢复次数",
			followHeadroom: "跟随余量：{value}",
			policies: "按模型覆盖",
			addRule: "添加规则",
			allModelsGlobal: "所有模型都用全局设置。",
			newRule: "新规则",
			sessionProvider: "会话服务商",
			sessionModel: "会话模型",
			retainMode: "保留近期原文",
			inheritWith: "继承 {value}",
			byMessageBudgetRatio: "按预算比例",
			fixedTokenCount: "固定 token",
			policySummaryMode: "摘要模型",
			policySummaryInherit: "继承 · {value}",
			policySummarySession: "跟随会话模型",
			policySummaryCustom: "指定摘要模型",
			summaryProvider: "摘要服务商",
			deleteRule: "删除规则 {index}",
			deleteRuleShort: "删除规则",
			timesUnit: "次",
			statusSection: "会话诊断",
			statusReadOnly: "只读",
			statusEmpty: "先选一个会话，才能读取用量和压缩记录。",
			diagnosticsFailed: "诊断读取失败：{message}",
			readingDiagnostics: "读取诊断…",
			engineUnknown: "还没确认这个会话由哪个引擎压缩。",
			engineForeign: "此会话使用其他压缩引擎（{owner}），仅显示实际压缩记录。",
			engineOwnerUnknown: "引擎归属未确认；预算和预览按本插件配置计算。",
			engineOwner: "压缩引擎：{owner}",
			lastCompaction: "最近一次压缩",
			noCompaction: "这个会话还没有压缩记录。",
			handoffContinuation: "文件交接续作",
			continuationScheduled: "已安排在同一会话续作。",
			continuationSkipped: "这次续作被跳过。",
			diagnosticsDetails: "诊断详情（{count}）",
			session: "参考会话",
			selectSessionTitle: "选择用来读取用量与预算的会话",
			loadingSessions: "加载会话…",
			noSessions: "还没有会话",
			selectSession: "选择会话",
			runningSuffix: " · 运行中",
			refreshDiagnostics: "刷新会话诊断",
			reading: "读取中…",
			refresh: "刷新",
			sessionListFailed: "会话列表读取失败",
			noSafeCut: "当前没有可以安全压缩的选区。",
			fixedPrefix: "固定前缀",
			runtimeWindow: "模型窗口",
			currentContext: "当前上下文",
			runtimeTrigger: "运行触发点",
			measured: "实测",
			estimated: "估算",
			measurementUnknown: "用量未知",
			conclusionAutoOff: "自动压缩已关闭",
			conclusionNoUsage: "还没有上下文用量",
			conclusionRemaining: "距离自动压缩还有 {remaining}",
			conclusionReached: "已经到触发点",
			statusRunning: "进行中",
			statusCompleted: "已完成",
			statusFailed: "生成失败",
			statusCancelled: "已取消",
			statusPersistenceError: "持久化失败",
			triggerManual: "手动",
			triggerAutomatic: "自动",
			triggerUnknown: "触发原因未知",
			strategyLabel: "压缩策略",
			duration: "耗时",
			replacedMessages: "压缩前",
			summaryEstimate: "摘要后估算",
			cacheRead: "缓存读取",
			cacheWrite: "缓存写入",
			persistenceFailed: "摘要可能已写入，但会话保存失败。",
			saveChanges: "{count} 项改动未保存",
			save: "保存设置",
			saving: "保存中…",
			discard: "放弃改动",
			discardAgain: "再点一次放弃",
			reload: "重新读取",
			fixErrors: "需先修正 {count} 项",
			saveFailed: "保存失败：{message}。改动已保留。",
			saveRejected: "宿主拒绝了这次保存，改动已保留，请重新读取后核对。",
			saveConflict: "配置已在其他页面被修改，请重新读取后再改。",
			saved: "已保存，重载 DSH 后生效。",
			validationMode: "请选择压缩策略。",
			validationThreshold: "触发比例须在 0 和 100% 之间。",
			validationHeadroom: "压缩余量须为非负整数。",
			validationRetainTokens: "保留 token 须为非负整数。",
			validationRetainRatio: "保留比例须大于 0 且小于触发比例；留空按 16%。",
			validationSummaryPair: "服务商和模型要一起填。",
			validationEffortSpaces: "思考强度不能仅包含空格。",
			validationMaxTokens: "摘要输出上限须为正整数；压缩余量为 0 时必须单独设置。",
			validationRetries: "重试次数须为非负安全整数。",
			validationPolicyModel: "请填写完整的服务商与模型。",
			validationDuplicatePolicy: "该模型已有覆盖规则。",
			validationSuffixRatio: "须大于 0% 且小于 100%。",
			validationSuffixPositive: "须为正安全整数。",
			validationSuffixNonNegative: "须为非负安全整数。",
			validationPolicyRetainTokens: "保留 token 须为非负整数。",
			validationPolicyRetainRatio: "实际保留比例须大于 0 且低于这条规则的触发比例。",
			validationPolicySummaryPair: "请填写完整的摘要服务商与模型。",
			validationPolicyMaxTokens: "余量为 0 时须设置摘要输出上限。",
			validationGlobalSummaryModel: "全局摘要模型",
			validationRule: "规则 {provider}/{model}",
			validationFollowedSummaryModel: "跟随会话的摘要模型",
			validationEffortUnsupported: "{label} {provider}/{model} 未声明支持强度「{effort}」，请调整全局思考强度或摘要模型。",
			routeWarning: "自定义模型 {provider}/{model} 不在宿主候选里，请确认该会话能用。",
			reasonNoCapacity: "模型容量不足",
			reasonNoCapacityHint: "请降低主会话的输出预留，或选择更大窗口的会话模型。",
			reasonReserveFull: "余量和输出预留占满了窗口",
			reasonReserveFullHint: "降低压缩余量或主会话的输出预留，或换更大窗口的模型。",
			reasonRetainConflict: "保留预算和触发线冲突",
			reasonRetainConflictHint: "降低保留预算，或提高触发比例。",
			reasonNoSafeRangeWithPrefix: "固定前缀和近期原文之后没有可压缩的空间",
			reasonNoSafeRange: "没有可安全压缩的区间",
			reasonNoSafeRangeHint: "降低保留预算或触发比例，或等对话再长一些。",
			reasonNoRoute: "尚无模型路由请求",
			reasonNoRouteHint: "请先在会话中发送一次模型请求。",
			reasonCapacityUnknown: "模型容量未知",
			reasonCapacityUnknownHint: "请检查该路由模型的适配器元数据。",
			reasonBelowTrigger: "还没到自动触发线",
			reasonAutoOff: "自动压缩已关闭（提示）",
			reasonAutoOffHint: "可以在「触发与保留」里打开自动压缩。",
			budgetNoMessageRoom: "会话输出预留已占满窗口，请调整会话模型的输出上限。",
			budgetHeadroomTooLarge: "压缩余量须小于消息预算 {message}。",
			budgetRetainTooLarge: "保留的 {retain} 须小于触发点 {threshold}。"
		};
		// src/client/locales/index.ts
		/**
		* Locale runtime for the settings page.
		*
		* ./zh.ts owns the key set and ./en.ts is checked against it, so this module
		* only has to translate. The host is never value-imported: LocaleFace is the
		* minimal structural face of what this half actually touches, which keeps the
		* browser bundle free of extra module-table entries.
		*/
		/** Namespace this plugin registers its dictionaries under. */
		const NS = LOCALE_NAMESPACE;
		/** Substitute `{name}` placeholders; unknown names stay verbatim. */
		function interpolate(text, params) {
			if (params === void 0 || params === null) return text;
			return String(text).replace(/\{(\w+)\}/g, (match, key) => key in params ? String(params[key]) : match);
		}
		/** The Chinese dictionary indexed for lookup by an untrusted key. */
		const fallback = zh;
		/** Active translator; the Chinese fallback until `bindLocale` binds the host. */
		let translate = (key, params) => interpolate(fallback[key] ?? key, params);
		/**
		* Translate one message key. A key without an entry renders as itself, which is
		* what makes a partially registered namespace degrade instead of blanking out.
		*/
		function t(key, params) {
			return translate(key, params);
		}
		/**
		* Register both dictionaries with the host registry and bind its translate
		* function. A missing, partial, or throwing registry keeps the Chinese
		* fallback, so a composition without a locale service still renders.
		*/
		function bindLocale(ctx) {
			if (ctx.locale === void 0 || ctx.locale === null) return;
			const locale = ctx.locale;
			try {
				const dicts = {
					zh,
					en
				};
				const dispose = typeof locale.register === "function" ? locale.register(NS, dicts) : void 0;
				const effect = ctx.effect;
				if (typeof dispose === "function" && typeof effect === "function") effect(() => dispose, "dsh-better-compact: locale dictionaries");
			} catch {}
			try {
				if (typeof locale.bind === "function") translate = locale.bind(NS);
			} catch {}
		}
		// src/client/draft.ts
		/**
		* Numeric policy fields with their label key and whether they are ratios.
		* Shared by the draft conversion, the validation, and the advanced section.
		*/
		const POLICY_NUMBERS = Object.freeze([
			[
				"thresholdRatio",
				"threshold",
				true
			],
			["headroomTokens", "headroom"],
			["maxTokens", "summaryOutputCap"],
			["compactionRetries", "pressureRetry"],
			["maxOverflowRetries", "overflowRecovery"]
		]);
		/**
		* Retention ratio assumed when the draft leaves it empty. Mirrors the host
		* default (`src/config.ts` DEFAULTS.retainRatio); kept local because the shared
		* contract does not carry host defaults.
		*/
		const DEFAULT_RETAIN_RATIO = .16;
		/** Convert one saved model policy into its editable draft. */
		function policyDraft(value = {}) {
			const source = value;
			const result = {
				provider: source.provider ?? "",
				model: source.model ?? "",
				retainMode: source.retainTokens != null ? "tokens" : source.retainRatio != null ? "ratio" : "inherit",
				retainRatio: source.retainRatio != null ? String(source.retainRatio) : "",
				retainTokens: source.retainTokens != null ? String(source.retainTokens) : "",
				summaryMode: source.summarizationProvider === void 0 ? "inherit" : source.summarizationProvider === "" ? "session" : "custom",
				summarizationProvider: source.summarizationProvider ?? "",
				summarizationModel: source.summarizationModel ?? "",
				thresholdRatio: "",
				headroomTokens: "",
				maxTokens: "",
				compactionRetries: "",
				maxOverflowRetries: ""
			};
			for (const [key] of POLICY_NUMBERS) result[key] = source[key] == null ? "" : String(source[key]);
			return result;
		}
		/** Convert one editable model policy back into its stored shape. */
		function policyValue(draft) {
			const value = {
				provider: draft.provider,
				model: draft.model
			};
			for (const [key] of POLICY_NUMBERS) if (draft[key] !== "") value[key] = Number(draft[key]);
			if (draft.retainMode === "ratio" && draft.retainRatio !== "") value.retainRatio = Number(draft.retainRatio);
			if (draft.retainMode === "tokens" && draft.retainTokens !== "") value.retainTokens = Number(draft.retainTokens);
			if (draft.summaryMode !== "inherit") {
				value.summarizationProvider = draft.summaryMode === "session" ? "" : draft.summarizationProvider;
				value.summarizationModel = draft.summaryMode === "session" ? "" : draft.summarizationModel;
			}
			return value;
		}
		/** Convert one accepted row value into the editable draft. */
		function draftFromValue(value) {
			const source = value !== null && typeof value === "object" ? value : {};
			const hasRetainTokens = source.retainTokens !== void 0 && source.retainTokens !== null;
			return {
				mode: typeof source.mode === "string" ? source.mode : "",
				customPrompt: typeof source.customPrompt === "string" ? source.customPrompt : "",
				provider: typeof source.summarizationProvider === "string" ? source.summarizationProvider : "",
				model: typeof source.summarizationModel === "string" ? source.summarizationModel : "",
				effort: typeof source.reasoningEffort === "string" ? source.reasoningEffort : "",
				thresholdRatio: typeof source.thresholdRatio === "number" ? String(source.thresholdRatio) : "",
				headroomTokens: typeof source.headroomTokens === "number" ? String(source.headroomTokens) : "",
				retainMode: hasRetainTokens ? "tokens" : "ratio",
				retainRatio: typeof source.retainRatio === "number" ? String(source.retainRatio) : "",
				retainTokens: hasRetainTokens ? String(source.retainTokens) : "",
				cachePriority: source.cachePriority === true,
				summaryImage: source.summaryImage === true,
				auto: source.auto === true,
				policies: (Array.isArray(source.modelPolicies) ? source.modelPolicies : []).map(policyDraft),
				maxTokens: typeof source.maxTokens === "number" ? String(source.maxTokens) : "",
				compactionRetries: typeof source.compactionRetries === "number" ? String(source.compactionRetries) : "",
				maxOverflowRetries: typeof source.maxOverflowRetries === "number" ? String(source.maxOverflowRetries) : ""
			};
		}
		/**
		* Compare scalar fields and the ordered model-policy drafts. The retention form
		* the draft does not use is ignored, so a hidden ratio/token value cannot keep
		* the page marked dirty.
		*/
		function equalDraft(left, right) {
			if (left === null || right === null) return left === right;
			const leftRecord = left;
			const rightRecord = right;
			const keys = Object.keys(leftRecord);
			if (keys.length !== Object.keys(rightRecord).length) return false;
			for (const key of keys) {
				if (key === "retainTokens" && left.retainMode !== "tokens" || key === "retainRatio" && left.retainMode !== "ratio") continue;
				if (key === "policies" ? JSON.stringify(left.policies.map(policyValue)) !== JSON.stringify(right.policies.map(policyValue)) : leftRecord[key] !== rightRecord[key]) return false;
			}
			return true;
		}
		/**
		* Validate the editable draft before a save. The host schema remains the final
		* authority; this catches the fields the page can reason about so a user does
		* not have to round-trip a rejected save.
		*/
		function validateDraft(draft) {
			const errors = [];
			const add = (field, message) => errors.push({
				field,
				message
			});
			if (!MODES.includes(draft.mode)) add("mode", t("validationMode"));
			if (draft.mode === "custom" && draft.customPrompt.trim().length === 0) add("customPrompt", t("processpromptEmpty"));
			else if (draft.customPrompt.length > 8e3) add("customPrompt", t("processpromptTooLong"));
			const validRatio = (value) => value !== "" && Number.isFinite(Number(value)) && Number(value) > 0 && Number(value) < 1;
			const validInt = (value, min = 0) => value !== "" && Number.isSafeInteger(Number(value)) && Number(value) >= min;
			if (!validRatio(draft.thresholdRatio)) add("thresholdRatio", t("validationThreshold"));
			if (!validInt(draft.headroomTokens)) add("headroomTokens", t("validationHeadroom"));
			const retainRatio = draft.retainRatio === "" ? DEFAULT_RETAIN_RATIO : Number(draft.retainRatio);
			if (draft.retainMode === "tokens") {
				if (!validInt(draft.retainTokens)) add("retainTokens", t("validationRetainTokens"));
			} else if (!validRatio(String(retainRatio)) || retainRatio >= Number(draft.thresholdRatio)) add("retainRatio", t("validationRetainRatio"));
			if (draft.provider === "" !== (draft.model === "")) add("summarizationModel", t("validationSummaryPair"));
			if (draft.effort !== "" && draft.effort.trim() === "") add("reasoningEffort", t("validationEffortSpaces"));
			if (draft.maxTokens !== "" ? !validInt(draft.maxTokens, 1) : Number(draft.headroomTokens) === 0) add("maxTokens", t("validationMaxTokens"));
			for (const key of ["compactionRetries", "maxOverflowRetries"]) if (!validInt(draft[key])) add(key, t("validationRetries"));
			const seen = /* @__PURE__ */ new Set();
			draft.policies.forEach((policy, index) => {
				const prefix = "policies." + index + ".";
				const identity = JSON.stringify([policy.provider, policy.model]);
				if (!policy.provider || !policy.model) add(prefix + "model", t("validationPolicyModel"));
				else if (seen.has(identity)) add(prefix + "model", t("validationDuplicatePolicy"));
				seen.add(identity);
				for (const [key, labelKey, ratio] of POLICY_NUMBERS) if (policy[key] !== "" && !(ratio ? validRatio(policy[key]) : validInt(policy[key], key === "maxTokens" ? 1 : 0))) add(prefix + key, t(labelKey) + t(ratio ? "validationSuffixRatio" : key === "maxTokens" ? "validationSuffixPositive" : "validationSuffixNonNegative"));
				const threshold = Number(policy.thresholdRatio || draft.thresholdRatio);
				const ratio = policy.retainMode === "ratio" ? Number(policy.retainRatio) : retainRatio;
				if (policy.retainMode === "tokens") {
					if (!validInt(policy.retainTokens)) add(prefix + "retainTokens", t("validationPolicyRetainTokens"));
				} else if (policy.retainMode === "ratio" || draft.retainMode === "ratio") {
					if (!(ratio > 0 && ratio < threshold)) add(prefix + "retainRatio", t("validationPolicyRetainRatio"));
				}
				if (policy.summaryMode === "custom" && (!policy.summarizationProvider || !policy.summarizationModel)) add(prefix + "summarizationModel", t("validationPolicySummaryPair"));
				if (policy.maxTokens === "" && draft.maxTokens === "" && Number(policy.headroomTokens || draft.headroomTokens) === 0) add(prefix + "maxTokens", t("validationPolicyMaxTokens"));
			});
			return errors;
		}
		/**
		* Validate a known-incompatible effort. The allowed-candidate list is host
		* metadata (the subagent model allow-list), not a hard restriction on the
		* summary route, so a route outside that list is never silently deleted and
		* never blocks a save. Native mode does not apply enhanced effort at all.
		*/
		function validateModelSelection(draft, routes, routesKnown, target) {
			if (draft.mode === "native" || draft.effort === "" || !routesKnown) return [];
			const candidates = [];
			if (draft.provider && draft.model) candidates.push({
				provider: draft.provider,
				model: draft.model,
				field: "reasoningEffort",
				label: t("validationGlobalSummaryModel")
			});
			draft.policies.forEach((policy, index) => {
				const provider = policy.summaryMode === "custom" ? policy.summarizationProvider : policy.summaryMode === "session" || !draft.provider ? policy.provider : draft.provider;
				const model = policy.summaryMode === "custom" ? policy.summarizationModel : policy.summaryMode === "session" || !draft.model ? policy.model : draft.model;
				candidates.push({
					provider,
					model,
					field: "policies." + index + ".summarizationModel",
					label: t("validationRule", {
						provider: policy.provider,
						model: policy.model
					})
				});
			});
			if (!draft.provider && target && !draft.policies.some((policy) => policy.provider === target.provider && policy.model === target.model)) candidates.push({
				provider: target.provider,
				model: target.model,
				field: "reasoningEffort",
				label: t("validationFollowedSummaryModel")
			});
			return candidates.flatMap((candidate) => {
				const route = routes.find((entry) => entry.provider === candidate.provider && entry.model === candidate.model);
				return route && !route.efforts.includes(draft.effort) ? [{
					field: candidate.field,
					message: t("validationEffortUnsupported", {
						label: candidate.label,
						provider: candidate.provider,
						model: candidate.model,
						effort: draft.effort
					})
				}] : [];
			});
		}
		/** Non-blocking marker for a saved route outside the candidate metadata. */
		function routeCandidateWarning(draft, routes, routesKnown) {
			if (draft.provider === "" || draft.model === "" || !routesKnown) return null;
			if (routes.some((entry) => entry.provider === draft.provider && entry.model === draft.model)) return null;
			return t("routeWarning", {
				provider: draft.provider,
				model: draft.model
			});
		}
		/** The allowed route matching the draft, when the catalog is known. */
		function routeForDraft(draft, routes) {
			return routes.find((entry) => entry.provider === draft.provider && entry.model === draft.model);
		}
		/**
		* Build one atomic mutation from the draft. Only fields the page owns are
		* written; unchanged model policies are preserved. Retention writes always
		* clear the other form, so a hidden ratio/token conflict cannot survive a save.
		*/
		function buildOps(draft, value) {
			const current = value !== null && typeof value === "object" ? value : {};
			const ops = [];
			const setIfChanged = (path, next, previous) => {
				if (next !== previous) ops.push({
					op: "set",
					path,
					value: next
				});
			};
			setIfChanged(["mode"], draft.mode, current.mode);
			setIfChanged(["customPrompt"], draft.customPrompt, typeof current.customPrompt === "string" ? current.customPrompt : "");
			if (draft.provider !== (typeof current.summarizationProvider === "string" ? current.summarizationProvider : "") || draft.model !== (typeof current.summarizationModel === "string" ? current.summarizationModel : "")) {
				ops.push({
					op: "set",
					path: ["summarizationProvider"],
					value: draft.provider
				});
				ops.push({
					op: "set",
					path: ["summarizationModel"],
					value: draft.model
				});
			}
			setIfChanged(["reasoningEffort"], draft.effort, typeof current.reasoningEffort === "string" ? current.reasoningEffort : "");
			setIfChanged(["thresholdRatio"], Number(draft.thresholdRatio), current.thresholdRatio);
			setIfChanged(["headroomTokens"], Number(draft.headroomTokens), current.headroomTokens);
			if (draft.retainMode === "tokens") {
				ops.push({
					op: "unset",
					path: ["retainRatio"]
				});
				ops.push({
					op: "set",
					path: ["retainTokens"],
					value: Number(draft.retainTokens)
				});
			} else {
				ops.push({
					op: "unset",
					path: ["retainTokens"]
				});
				if (draft.retainRatio === "") {
					if (current.retainRatio !== void 0) ops.push({
						op: "unset",
						path: ["retainRatio"]
					});
				} else ops.push({
					op: "set",
					path: ["retainRatio"],
					value: Number(draft.retainRatio)
				});
			}
			setIfChanged(["cachePriority"], draft.cachePriority, current.cachePriority);
			setIfChanged(["summaryImage"], draft.summaryImage, current.summaryImage);
			setIfChanged(["auto"], draft.auto, current.auto);
			if (draft.maxTokens === "") {
				if (current.maxTokens !== void 0 && current.maxTokens !== null) ops.push({
					op: "unset",
					path: ["maxTokens"]
				});
			} else setIfChanged(["maxTokens"], Number(draft.maxTokens), current.maxTokens);
			setIfChanged(["compactionRetries"], Number(draft.compactionRetries), current.compactionRetries);
			setIfChanged(["maxOverflowRetries"], Number(draft.maxOverflowRetries), current.maxOverflowRetries);
			if (JSON.stringify(draft.policies.map(policyValue)) !== JSON.stringify(draftFromValue(current).policies.map(policyValue))) ops.push({
				op: "set",
				path: ["modelPolicies"],
				value: draft.policies.map(policyValue)
			});
			return ops;
		}
		// src/client/styles.ts
		/**
		* Host-theme CSS for the settings page, injected as one <style> node.
		*
		* One flat surface, one border language (1px solid), one control geometry.
		* Every value comes from a host --dsw-alias-* token mapped to a local --cfg-*
		* name; no component rule hard-codes a colour. See docs/UI-KIT.md.
		*/
		const STYLE = `

/* ── page root and tokens ─────────────────────────────────────────────── */
.dsh-bc-page{--cfg-text:var(--dsw-alias-label-primary);--cfg-muted:var(--dsw-alias-label-secondary);--cfg-subtle:color-mix(in srgb,var(--dsw-alias-label-tertiary) 80%,var(--dsw-alias-label-primary));--cfg-canvas:var(--dsw-alias-bg-layer-1);--cfg-raised:var(--dsw-alias-bg-layer-2);--cfg-overlay:var(--dsw-alias-bg-layer-3);--cfg-sunken:color-mix(in srgb,var(--cfg-text) 4%,var(--cfg-canvas));--cfg-line:var(--dsw-alias-border-l1);--cfg-line-2:var(--dsw-alias-border-l2);--cfg-line-3:var(--dsw-alias-border-l3);--cfg-accent:var(--dsw-alias-state-business-primary,#4176e6);--cfg-accent-text:color-mix(in srgb,var(--cfg-accent) 70%,var(--cfg-text));--cfg-accent-soft:color-mix(in srgb,var(--cfg-accent) 10%,transparent);--cfg-solid:var(--dsw-alias-button-primary-fill,#0f1115);--cfg-on-accent:var(--dsw-alias-label-primary-foreground,#fff);--cfg-danger:color-mix(in srgb,var(--dsw-alias-state-error-primary) 60%,var(--cfg-text));--cfg-warn:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 60%,var(--dsw-alias-label-primary));--cfg-hover:var(--dsw-alias-interactive-bg-hover);--cfg-r-sm:6px;--cfg-r-md:8px;--cfg-r-lg:10px;--cfg-r-xl:12px;--cfg-control:32px;--cfg-dur:140ms;display:flex;flex-direction:column;gap:20px;width:100%;max-width:920px;margin:0 auto;min-width:0;padding-bottom:8px;color:var(--cfg-text);font-size:13px;line-height:20px;font-variant-numeric:tabular-nums;container-type:inline-size;container-name:better-compact;overflow-wrap:anywhere;color-scheme:inherit}
.dsh-bc-page *{box-sizing:border-box}
.dsh-bc-page :is(button,input){appearance:none}
.dsh-bc-page :is(button,input,summary,[role=combobox],[role=radio]):focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--cfg-accent));outline-offset:2px}
.dsh-bc-page :disabled{opacity:.4;cursor:not-allowed}
[data-ds-dark-theme] .dsh-bc-page{--cfg-accent-soft:color-mix(in srgb,var(--cfg-accent) 14%,transparent)}

/* ── page head ────────────────────────────────────────────────────────── */
.dsh-bc-page-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;min-width:0}
.dsh-bc-page-titleBlock{display:flex;flex-direction:column;gap:4px;min-width:0}
.dsh-bc-title{margin:0;font-size:20px;line-height:28px;font-weight:500;letter-spacing:-.01em}
.dsh-bc-page-sub{margin:0;color:var(--cfg-muted);font-size:13px;line-height:20px}
.dsh-bc-page-chips{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}

/* ── type ─────────────────────────────────────────────────────────────── */
.dsh-bc-caption,.dsh-bc-help,.dsh-bc-hint{margin:0;font-size:12px;line-height:18px;color:var(--cfg-subtle)}
.dsh-bc-note{margin:0;font-size:12px;line-height:18px;color:var(--cfg-muted)}
.dsh-bc-error{margin:0;font-size:12px;line-height:18px;color:var(--cfg-danger)}
.dsh-bc-warn{margin:0;font-size:12px;line-height:18px;color:var(--cfg-warn)}
.dsh-bc-mono{font-family:var(--dsw-font-family-mono,ui-monospace,SFMono-Regular,Menlo,monospace);font-variant-numeric:tabular-nums}
.dsh-bc-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}

/* ── section ──────────────────────────────────────────────────────────── */
.dsh-bc-editor{display:flex;flex-direction:column;gap:20px;min-width:0}
.dsh-bc-section{display:flex;flex-direction:column;gap:8px;min-width:0;padding-top:16px;border-top:1px solid var(--cfg-line)}
.dsh-bc-editor>.dsh-bc-section:first-child{padding-top:0;border-top:0}
.dsh-bc-section-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap;min-width:0}
.dsh-bc-h3{margin:0;font-size:12px;line-height:18px;font-weight:500;color:var(--cfg-subtle);letter-spacing:.02em}
.dsh-bc-h4{margin:0;font-size:13px;line-height:20px;font-weight:500;color:var(--cfg-text)}
.dsh-bc-subhead{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;min-width:0}

/* ── setting rows: label left, control right, no dividers ─────────────── */
.dsh-bc-setting-row{display:flex;align-items:center;justify-content:space-between;gap:24px;min-width:0;padding:8px;margin:0 -8px;border-radius:var(--cfg-r-md)}
.dsh-bc-setting-row:hover{background:var(--cfg-hover)}
.dsh-bc-setting-main{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.dsh-bc-setting-label{font-size:13px;line-height:20px;font-weight:500;color:var(--cfg-text)}
.dsh-bc-setting-desc{max-width:560px;font-size:12px;line-height:18px;color:var(--cfg-subtle)}
.dsh-bc-setting-control{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex:none;min-width:0}
.dsh-bc-setting-control .dsh-bc-field{width:100%;min-width:0}
.dsh-bc-rows{display:flex;flex-direction:column;gap:0;min-width:0;margin-top:4px;padding-top:4px;border-top:1px solid var(--cfg-line)}

/* ── inputs ───────────────────────────────────────────────────────────── */
.dsh-bc-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-label{font-size:12px;font-weight:500;line-height:18px;color:var(--cfg-muted)}
.dsh-bc-input{width:100%;height:var(--cfg-control);min-width:0;padding:0 9px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-canvas);color:var(--cfg-text);font:inherit;line-height:20px;transition:border-color var(--cfg-dur) ease}
.dsh-bc-input:hover:not(:disabled){border-color:var(--cfg-line-3)}
.dsh-bc-input:focus-visible{border-color:var(--cfg-accent)}
.dsh-bc-input[aria-invalid=true]{border-color:var(--cfg-danger)}
.dsh-bc-number{position:relative;min-width:0}
.dsh-bc-number .dsh-bc-input{padding-right:26px;text-align:right;appearance:textfield}
.dsh-bc-number input::-webkit-inner-spin-button,.dsh-bc-number input::-webkit-outer-spin-button{appearance:none;margin:0}
.dsh-bc-number-inline{display:flex;align-items:center;gap:6px;flex:none;width:auto}
.dsh-bc-unit{position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--cfg-subtle);font-size:11px;line-height:18px}
.dsh-bc-number-inline .dsh-bc-input{width:96px;padding-right:9px}
.dsh-bc-number-inline .dsh-bc-unit{position:static;transform:none;flex:none}
.dsh-bc-textarea{display:block;width:100%;min-height:180px;padding:10px 12px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-canvas);color:var(--cfg-text);font:inherit;font-size:13px;line-height:1.6;resize:vertical;transition:border-color var(--cfg-dur) ease}
.dsh-bc-textarea:hover:not(:disabled){border-color:var(--cfg-line-3)}
.dsh-bc-textarea[aria-invalid=true]{border-color:var(--cfg-danger)}

/* ── buttons and switch ───────────────────────────────────────────────── */
.dsh-bc-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:var(--cfg-control);min-width:0;padding:0 12px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-canvas);color:var(--cfg-text);font:inherit;font-weight:500;line-height:20px;white-space:nowrap;cursor:pointer;transition:background-color var(--cfg-dur) ease,border-color var(--cfg-dur) ease}
.dsh-bc-btn:hover:not(:disabled){background:var(--cfg-hover);border-color:var(--cfg-line-3)}
.dsh-bc-btn-primary{border-color:transparent;background:var(--cfg-solid);color:var(--cfg-on-accent)}
.dsh-bc-btn-primary:hover:not(:disabled){background:color-mix(in srgb,var(--cfg-solid) 88%,var(--cfg-text))}
.dsh-bc-btn-remove:hover:not(:disabled){color:var(--cfg-danger)}
.dsh-bc-switch{position:relative;flex:none;width:34px;height:20px;margin:0;padding:2px;border:1px solid var(--cfg-line-3);border-radius:999px;background:var(--cfg-sunken);cursor:pointer;transition:background-color var(--cfg-dur) ease,border-color var(--cfg-dur) ease}
.dsh-bc-switch:before{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--cfg-muted);transition:transform var(--cfg-dur) ease,background-color var(--cfg-dur) ease}
.dsh-bc-switch:checked{border-color:var(--cfg-solid);background:var(--cfg-solid)}
.dsh-bc-switch:checked:before{background:var(--cfg-on-accent);transform:translateX(14px)}

/* ── chip, segmented, segmented choice ────────────────────────────────── */
.dsh-bc-chip{display:inline-flex;align-items:center;min-height:20px;padding:0 8px;border:1px solid var(--cfg-line-2);border-radius:999px;background:var(--cfg-canvas);color:var(--cfg-muted);font-size:11px;line-height:18px;white-space:nowrap}
.dsh-bc-chip[data-tone=accent]{border-color:color-mix(in srgb,var(--cfg-accent) 35%,var(--cfg-line-2));background:var(--cfg-accent-soft);color:var(--cfg-accent-text)}
.dsh-bc-segmented{display:flex;flex:none;gap:2px;height:var(--cfg-control);padding:2px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-sunken)}
.dsh-bc-segment{position:relative;display:flex;align-items:center;justify-content:center;min-width:0;padding:0 10px;border:1px solid transparent;border-radius:var(--cfg-r-sm);color:var(--cfg-muted);font-size:12px;line-height:20px;white-space:nowrap;cursor:pointer}
.dsh-bc-segment input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:inherit}
.dsh-bc-segment:hover{background:var(--cfg-hover)}
.dsh-bc-segment[data-checked=true]{border-color:var(--cfg-line-2);background:var(--cfg-raised);color:var(--cfg-accent-text);font-weight:500}
.dsh-bc-segment:has(input:focus-visible){outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--cfg-accent));outline-offset:1px}
.dsh-bc-retain-control{display:flex;align-items:center;gap:8px;min-width:0;flex:none}
.dsh-bc-retain-choice{display:flex;align-items:center;min-width:0;margin:0;padding:0;border:0;flex:none}
.dsh-bc-retain-choice legend{margin:0;padding:0}

/* ── select (combobox) ────────────────────────────────────────────────── */
.dsh-bc-select{position:relative;width:100%;min-width:0;font:inherit}
.dsh-bc-select-trigger{display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left;cursor:pointer}
.dsh-bc-select-trigger[aria-expanded=true]{border-color:var(--cfg-accent)}
.dsh-bc-select-value{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-bc-chevron{flex:none;width:6px;height:6px;margin-right:2px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;color:var(--cfg-muted);transform:translateY(-2px) rotate(45deg);transition:transform var(--cfg-dur) ease}
.dsh-bc-select-trigger[aria-expanded=true] .dsh-bc-chevron{transform:translateY(2px) rotate(225deg)}
.dsh-bc-select-menu{position:absolute;z-index:40;top:calc(100% + 4px);left:0;right:0;min-width:0;overflow:auto;overscroll-behavior:contain;padding:4px;border:1px solid var(--cfg-line-3);border-radius:var(--cfg-r-lg);background:var(--cfg-overlay);font:inherit;box-shadow:0 18px 44px -18px rgb(0 0 0 / .32)}
.dsh-bc-select-menu[data-side=above]{top:auto;bottom:calc(100% + 4px)}
.dsh-bc-select-option{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:30px;padding:4px 8px;border-radius:var(--cfg-r-sm);cursor:pointer;overflow-wrap:anywhere}
.dsh-bc-select-option[data-active=true]{background:var(--cfg-hover)}
.dsh-bc-select-option[aria-selected=true]{background:var(--cfg-accent-soft);color:var(--cfg-accent-text)}
.dsh-bc-option-check{flex:none;width:12px;color:var(--cfg-accent-text)}

/* ── capacity: one bar, one sentence, one row per number ──────────────── */
.dsh-bc-effect{margin:0;font-size:13px;line-height:20px;color:var(--cfg-text)}
.dsh-bc-capacity{display:flex;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-bar{position:relative;min-width:0;background:var(--cfg-sunken)}
.dsh-bc-capacity-bar{height:40px;margin-top:22px;margin-bottom:22px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-sm);overflow:visible}
.dsh-bc-bar-track{display:flex;width:100%;height:100%;overflow:hidden;border-radius:5px}
.dsh-bc-bar-seg{display:flex;align-items:center;justify-content:center;flex:none;min-width:0;height:100%}
.dsh-bc-bar-seg:not(:last-child){border-right:1px solid color-mix(in srgb,var(--cfg-text) 10%,transparent)}
.dsh-bc-bar-label{min-width:0;padding:0 6px;overflow:hidden;color:var(--cfg-text);font-size:11px;line-height:16px;white-space:nowrap;text-overflow:ellipsis}
.dsh-bc-seg-fixed{background:color-mix(in srgb,var(--cfg-subtle) 34%,var(--cfg-raised));color:var(--cfg-muted)}
.dsh-bc-seg-compressible{background:color-mix(in srgb,var(--cfg-accent) 20%,var(--cfg-raised))}
.dsh-bc-seg-retained{background:color-mix(in srgb,var(--cfg-accent) 52%,var(--cfg-raised))}
.dsh-bc-seg-headroom{background:color-mix(in srgb,var(--cfg-subtle) 14%,var(--cfg-raised))}
.dsh-bc-seg-reserved{background:color-mix(in srgb,var(--cfg-line-3) 26%,var(--cfg-raised))}
.dsh-bc-current-line{position:absolute;top:0;bottom:0;z-index:2;border-left:1px solid var(--cfg-text);opacity:.55;pointer-events:none}
.dsh-bc-handle{position:absolute;top:-6px;bottom:-6px;z-index:5;width:20px;padding:0;border:0;background:transparent;cursor:ew-resize;transform:translateX(-50%);touch-action:none}
.dsh-bc-handle-line{position:absolute;top:6px;bottom:6px;left:50%;width:2px;border-radius:1px;background:var(--cfg-accent);transform:translateX(-50%)}
.dsh-bc-handle-chip{position:absolute;bottom:calc(100% + 4px);left:50%;display:inline-flex;align-items:center;min-height:20px;padding:0 7px;border:1px solid var(--cfg-accent);border-radius:999px;background:var(--cfg-overlay);color:var(--cfg-accent-text);font-size:10px;line-height:16px;white-space:nowrap;transform:translateX(-50%);pointer-events:none;opacity:0;transition:opacity var(--cfg-dur) ease}
.dsh-bc-handle[data-handle=retain] .dsh-bc-handle-chip{top:calc(100% + 4px);bottom:auto}
.dsh-bc-handle[data-handle=trigger] .dsh-bc-handle-chip{top:calc(100% + 6px);bottom:auto;opacity:1;border-color:var(--cfg-line-2);color:var(--cfg-muted);background:var(--cfg-canvas)}
.dsh-bc-handle:hover .dsh-bc-handle-chip,.dsh-bc-handle:focus-visible .dsh-bc-handle-chip{opacity:1}
.dsh-bc-retain-pin{position:absolute;top:calc(100% + 4px);z-index:4;display:inline-flex;align-items:center;min-height:18px;padding:0 6px;border:1px solid var(--cfg-line-2);border-radius:999px;background:var(--cfg-canvas);color:var(--cfg-muted);font-size:10px;line-height:16px;white-space:nowrap;transform:translateX(-50%);pointer-events:none}
.dsh-bc-capacity-foot{display:flex;flex-wrap:wrap;gap:2px 12px;min-width:0}
.dsh-bc-capacity-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px 16px;min-width:0;padding-top:2px}
.dsh-bc-cut{position:absolute;top:0;bottom:0;z-index:3;border-left:1px solid var(--cfg-text);opacity:.5;pointer-events:none}
.dsh-bc-cut-chip{position:absolute;bottom:calc(100% + 6px);left:0;transform:translateX(-50%);white-space:nowrap;color:var(--cfg-muted);font-size:10px;line-height:16px}
.dsh-bc-capacity-metrics .dsh-bc-metric{display:flex;flex-direction:row;align-items:baseline;justify-content:space-between;gap:6px;min-width:0}
.dsh-bc-capacity-metrics .dsh-bc-caption{font-size:11px;line-height:18px}
.dsh-bc-capacity-metrics .dsh-bc-metric-value{font-size:11px;line-height:18px}

/* ── strategy ─────────────────────────────────────────────────────────── */
.dsh-bc-strategy-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,400px);gap:24px;align-items:start;min-width:0}
.dsh-bc-strategy-choice,.dsh-bc-strategy-figure{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-strategy-figure{justify-content:center}
.dsh-bc-modes,.dsh-bc-modes-4{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;min-width:0}
.dsh-bc-mode{display:flex;flex-direction:column;gap:4px;min-width:0;padding:10px 12px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-canvas);cursor:pointer;transition:background-color var(--cfg-dur) ease,border-color var(--cfg-dur) ease}
.dsh-bc-mode:hover:not([aria-disabled=true]){background:var(--cfg-hover)}
.dsh-bc-mode[aria-checked=true]{border-color:var(--cfg-accent);background:var(--cfg-accent-soft)}
.dsh-bc-mode[aria-disabled=true]{opacity:.4;cursor:not-allowed}
.dsh-bc-mode-head{display:flex;align-items:center;gap:8px;min-width:0}
.dsh-bc-mode-title{min-width:0;font-size:13px;line-height:20px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-bc-mode-tag{flex:none;margin-left:auto;color:var(--cfg-subtle);font-size:11px;line-height:16px;white-space:nowrap}
.dsh-bc-mode[aria-checked=true] .dsh-bc-mode-tag{color:var(--cfg-accent-text)}
.dsh-bc-mode-description{margin:0;color:var(--cfg-muted);font-size:12px;line-height:18px}
.dsh-bc-radio-dot{position:relative;flex:none;width:14px;height:14px;border:1px solid var(--cfg-line-3);border-radius:50%}
.dsh-bc-mode[aria-checked=true] .dsh-bc-radio-dot{border-color:var(--cfg-accent)}
.dsh-bc-mode[aria-checked=true] .dsh-bc-radio-dot:after{content:"";position:absolute;inset:3px;border-radius:50%;background:var(--cfg-accent)}
.dsh-bc-strategy-extra{display:flex;flex-direction:column;gap:0;min-width:0;margin-top:4px;padding-top:4px;border-top:1px solid var(--cfg-line)}

/* one shared process drawing */
.dsh-bc-strategy-svg{display:block;width:100%;max-width:400px;height:auto;margin:0 auto;color:var(--cfg-muted);overflow:visible}
.dsh-bc-strategy-svg text{fill:currentColor;font-family:inherit}
.dsh-bc-svg-node-title{font-size:15px;font-weight:500;fill:var(--cfg-text)}
.dsh-bc-svg-node-sub{font-size:12px;fill:var(--cfg-subtle)}
.dsh-bc-svg-note{font-size:12px;fill:var(--cfg-subtle)}
.dsh-bc-strategy-svg .dsh-bc-node{fill:var(--cfg-sunken);stroke:var(--cfg-line-2);stroke-width:1}
.dsh-bc-strategy-svg .dsh-bc-node-strong{fill:var(--cfg-raised);stroke:var(--cfg-line-3)}
.dsh-bc-strategy-svg .dsh-bc-node-accent{fill:var(--cfg-accent-soft);stroke:var(--cfg-accent)}
.dsh-bc-strategy-svg .dsh-bc-node-dashed{stroke:var(--cfg-line-3)}
.dsh-bc-strategy-svg .dsh-bc-edge{stroke:var(--cfg-subtle);stroke-width:1;fill:none}
.dsh-bc-svg-tag{fill:var(--cfg-sunken);stroke:var(--cfg-line-2);stroke-width:1}
.dsh-bc-svg-tag-accent{fill:var(--cfg-accent-soft);stroke:var(--cfg-accent)}
.dsh-bc-svg-tag-text{font-size:10px;fill:var(--cfg-muted)}
.dsh-bc-svg-tag-text-accent{fill:var(--cfg-accent-text)}

/* ── generation, custom model ─────────────────────────────────────────── */
.dsh-bc-process-model{display:flex;flex-direction:column;gap:0;min-width:0}
.dsh-bc-setting-control .dsh-bc-select{width:280px;max-width:100%}
.dsh-bc-custom-model{min-width:0;margin:0 0 4px;padding:12px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-md);background:var(--cfg-sunken)}
.dsh-bc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px;min-width:0}

/* ── custom prompt ────────────────────────────────────────────────────── */
.dsh-bc-prompt-toolbar{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0;padding:8px 10px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-md);background:var(--cfg-sunken)}
.dsh-bc-variable{height:26px;padding:0 8px;border-color:var(--cfg-line-2);background:var(--cfg-canvas);color:var(--cfg-text);font-size:11px;cursor:pointer}
.dsh-bc-variable:hover:not(:disabled){border-color:var(--cfg-accent);background:var(--cfg-accent-soft);color:var(--cfg-accent-text)}
.dsh-bc-prompt-foot{display:flex;align-items:baseline;gap:4px 12px;flex-wrap:wrap;min-width:0}

/* ── details (advanced rules, diagnostics) ────────────────────────────── */
.dsh-bc-details{min-width:0;padding-top:8px;border-top:1px solid var(--cfg-line-2)}
.dsh-bc-details>summary{display:flex;align-items:center;gap:8px;min-height:28px;width:fit-content;padding:0;font-size:12px;line-height:18px;font-weight:500;color:var(--cfg-subtle);cursor:pointer;list-style:none}
.dsh-bc-details>summary::-webkit-details-marker{display:none}
.dsh-bc-details>summary:before{content:"";flex:none;width:5px;height:5px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(-45deg)}
.dsh-bc-details[open]>summary:before{transform:translateY(-2px) rotate(45deg)}
.dsh-bc-details-body{display:flex;flex-direction:column;gap:16px;min-width:0;padding-top:12px}
.dsh-bc-explanation{min-width:0;font-size:12px;line-height:18px}
.dsh-bc-explanation>summary{display:flex;align-items:center;gap:8px;min-height:28px;width:fit-content;padding:0;color:var(--cfg-muted);cursor:pointer;list-style:none}
.dsh-bc-explanation>summary::-webkit-details-marker{display:none}
.dsh-bc-explanation>summary:before{content:"";flex:none;width:5px;height:5px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(-45deg)}
.dsh-bc-explanation[open]>summary:before{transform:translateY(-2px) rotate(45deg)}
.dsh-bc-explanation-body{display:flex;flex-direction:column;gap:8px;padding-top:8px;min-width:0}

/* ── read-only facts (runtime budget, last compaction, policies) ──────── */
.dsh-bc-runtime{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-budget-view{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;min-width:0;padding:4px 0}
.dsh-bc-row-label{min-width:0;color:var(--cfg-muted);font-size:12px}
.dsh-bc-row-value{min-width:0;text-align:right;font-size:12px;overflow-wrap:anywhere}
.dsh-bc-status-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 16px}
.dsh-bc-status-record{display:flex;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-status-line{margin:0;font-size:12px;font-weight:500;line-height:18px}
.dsh-bc-status-failed,.dsh-bc-status-persistence-error{color:var(--cfg-danger)}
.dsh-bc-continuation{display:flex;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-reasons,.dsh-bc-bullets{display:flex;flex-direction:column;gap:4px;margin:0;padding-left:18px;color:var(--cfg-muted);font-size:12px;line-height:18px}
.dsh-bc-reasons li{min-width:0;overflow-wrap:anywhere}
.dsh-bc-policy-card{min-width:0;margin-top:8px;padding:10px 12px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-md);background:var(--cfg-canvas)}
.dsh-bc-policy-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;min-width:0}
.dsh-bc-policy-head>span{min-width:0;overflow-wrap:anywhere;font-size:12px;line-height:18px}
.dsh-bc-policy-body{display:flex;flex-direction:column;gap:16px;min-width:0}

/* ── session row, banner, footer ──────────────────────────────────────── */
.dsh-bc-session{display:flex;align-items:center;gap:8px;min-width:0;flex:1}
.dsh-bc-session .dsh-bc-label{flex:none}
.dsh-bc-session .dsh-bc-select{flex:1;min-width:0}
.dsh-bc-session-row{display:flex;align-items:center;gap:8px 12px;flex-wrap:wrap;min-width:0}
.dsh-bc-session-row .dsh-bc-session{flex:1;min-width:240px}
.dsh-bc-session-help{flex-basis:100%}
.dsh-bc-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;min-width:0;padding:8px 0;border-top:1px solid var(--cfg-line)}
.dsh-bc-banner .dsh-bc-chip{white-space:normal;max-width:100%;height:auto;min-height:20px;padding:2px 8px;border-radius:var(--cfg-r-sm);line-height:16px}
.dsh-bc-footer{position:sticky;bottom:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:auto;padding:12px 0;border-top:1px solid var(--cfg-line-2);background:var(--cfg-canvas)}
.dsh-bc-footer-copy{display:flex;flex:1;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-footer-errors{display:flex;flex-direction:column;gap:4px;min-width:0}
.dsh-bc-actions{display:flex;gap:8px;margin-left:auto}
.dsh-bc-save-feedback{position:sticky;bottom:8px;align-self:flex-end;margin:0;padding:6px 10px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-sm);background:var(--cfg-raised);color:var(--cfg-muted);font-size:12px;line-height:18px}

/* ── narrow panes ─────────────────────────────────────────────────────── */
@container better-compact (max-width:760px){
  .dsh-bc-strategy-layout{grid-template-columns:minmax(0,1fr)}
  .dsh-bc-strategy-figure{max-width:480px;margin:0 auto}
  .dsh-bc-setting-control .dsh-bc-select{width:100%}
}
@container better-compact (max-width:640px){
  .dsh-bc-setting-row{align-items:stretch;flex-direction:column;gap:8px}
  .dsh-bc-setting-control{width:100%}
  .dsh-bc-number-inline{width:100%}
  .dsh-bc-number-inline .dsh-bc-input{text-align:right}
  .dsh-bc-strategy-layout{grid-template-columns:minmax(0,1fr)}
  .dsh-bc-grid,.dsh-bc-status-grid{grid-template-columns:1fr}
  .dsh-bc-page :is(button,summary,.dsh-bc-input,.dsh-bc-select-option){min-height:44px}
  .dsh-bc-switch{width:38px;height:22px}
  .dsh-bc-switch:before{width:16px;height:16px}
  .dsh-bc-switch:checked:before{transform:translateX(16px)}
  .dsh-bc-segmented{height:38px}
  .dsh-bc-session-row .dsh-bc-session{flex-basis:100%}
  .dsh-bc-capacity-bar{height:36px}
  .dsh-bc-capacity-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}
  .dsh-bc-number-inline .dsh-bc-input{width:100%}
  .dsh-bc-session-help{flex-basis:auto}
}
@container better-compact (max-width:560px){
  .dsh-bc-title{font-size:18px;line-height:26px}
  .dsh-bc-modes,.dsh-bc-modes-4{grid-template-columns:1fr}
  .dsh-bc-capacity-metrics{grid-template-columns:1fr}
  .dsh-bc-bar-label{font-size:10px;padding:0 4px}
  .dsh-bc-retain-control{flex-wrap:wrap}
  .dsh-bc-textarea{min-height:220px}
  .dsh-bc-svg-node-title{font-size:16px}
  .dsh-bc-svg-node-sub,.dsh-bc-svg-note{font-size:13px}
}
@media (prefers-reduced-motion:reduce){.dsh-bc-page *{transition:none!important;animation:none!important}}

`;
		// src/client/inspect-store.ts
		/**
		* Read-only JSON endpoints and the session list, as React store hooks.
		*
		* The page never writes over HTTP: these are GETs to the plugin's own inspect
		* and models routes, and the picker rows come from the host sessions-list
		* snapshot store. Fetches abort the previous request when the path or refresh
		* token changes, so a stale response never overwrites a newer one.
		*
		* The payload type is the caller's: the page narrows the parsed JSON to the
		* shared contract shapes (`InspectPayload`, `ModelRoutesPayload`) at its own
		* boundary instead of this module inventing a second declaration.
		*/
		/** Empty snapshot: a stable identity so useSyncExternalStore never re-renders. */
		const EMPTY_SESSION_LIST = Object.freeze({
			ids: Object.freeze([]),
			byId: Object.freeze({}),
			phase: "ready",
			projectionsBySession: Object.freeze({})
		});
		/** One-line error message. */
		function errorMessage$1(error) {
			if (error instanceof Error) return error.message;
			return String(error);
		}
		/** The fetch implementation this client may use, if any. */
		function httpFetch() {
			const fetcher = typeof fetch === "function" ? fetch : void 0;
			if (fetcher === void 0) throw new Error("HTTP fetch is unavailable in this client");
			return fetcher;
		}
		/**
		* Read one JSON response and map a failure to an actionable message.
		* @param response - response to read.
		* @returns the parsed JSON object.
		* @throws Error carrying the server message, or the HTTP status.
		*/
		async function readJson(response) {
			let payload;
			try {
				payload = await response.json();
			} catch {
				payload = void 0;
			}
			if (!response.ok) {
				const message = payload !== void 0 && payload !== null && typeof payload === "object" && typeof payload.message === "string" ? payload.message : "HTTP " + response.status;
				throw new Error(message);
			}
			if (payload === void 0 || payload === null || typeof payload !== "object") throw new Error("the response was not JSON");
			return payload;
		}
		/**
		* GET one read-only JSON endpoint; never sends a write verb.
		* @param path - same-origin pathname, query included.
		* @param signal - abort signal for a superseded request.
		* @returns the parsed JSON object.
		*/
		async function getJson(path, signal) {
			return readJson(await httpFetch()(path, {
				method: "GET",
				headers: { accept: "application/json" },
				credentials: "same-origin",
				cache: "no-store",
				...signal === void 0 || signal === null ? {} : { signal }
			}));
		}
		/**
		* POST one JSON body to a same-origin route.
		*
		* The settings page has exactly one write route (the fixed-font install), so
		* this stays a thin, explicit helper instead of a general request builder.
		*
		* @param path - same-origin pathname.
		* @param body - JSON-serializable body.
		* @param signal - abort signal for the request.
		* @returns the parsed JSON object.
		*/
		async function postJson(path, body, signal) {
			return readJson(await httpFetch()(path, {
				method: "POST",
				headers: {
					accept: "application/json",
					"content-type": "application/json"
				},
				credentials: "same-origin",
				cache: "no-store",
				body: JSON.stringify(body),
				...signal === void 0 || signal === null ? {} : { signal }
			}));
		}
		/**
		* Fetch one read-only endpoint and abort the previous request when the path or
		* refresh token changes.
		* @param path - endpoint pathname, or null to stay idle.
		* @param refreshToken - bump to refetch the same path.
		* @returns the request state; `payload` keeps the last good value while refreshing.
		*/
		function useReadOnlyJson(path, refreshToken) {
			const [state, setState] = (0, react.useState)({
				key: null,
				status: "idle",
				payload: null,
				error: null
			});
			(0, react.useEffect)(() => {
				if (path === null) {
					setState({
						key: null,
						status: "idle",
						payload: null,
						error: null
					});
					return;
				}
				const controller = typeof AbortController === "function" ? new AbortController() : null;
				let cancelled = false;
				setState((previous) => ({
					key: path,
					status: previous.key === path && previous.payload !== null ? "refreshing" : "loading",
					payload: previous.key === path ? previous.payload : null,
					error: null
				}));
				getJson(path, controller === null ? void 0 : controller.signal).then((payload) => {
					if (cancelled) return;
					setState({
						key: path,
						status: "ready",
						payload,
						error: null
					});
				}, (error) => {
					if (cancelled || controller !== null && controller.signal.aborted) return;
					setState((previous) => ({
						key: path,
						status: "error",
						payload: previous.key === path ? previous.payload : null,
						error: errorMessage$1(error)
					}));
				});
				return () => {
					cancelled = true;
					if (controller !== null) controller.abort();
				};
			}, [path, refreshToken]);
			if (state.key !== path) return {
				key: path,
				status: path === null ? "idle" : "loading",
				payload: null,
				error: null
			};
			return state;
		}
		/**
		* Subscribe to the client sessions-list snapshot store.
		* @param sessions - the injected `sessions` service, if this composition has one.
		* @returns the current snapshot, or the empty one when the store is absent.
		*/
		function useSessionList(sessions) {
			const store = sessions === null || sessions === void 0 ? void 0 : sessions.list;
			const subscribe = (0, react.useCallback)((onChange) => {
				const candidate = store;
				if (candidate === void 0 || candidate === null || typeof candidate.subscribe !== "function") return () => void 0;
				return candidate.subscribe(onChange);
			}, [store]);
			const getSnapshot = (0, react.useCallback)(() => {
				const candidate = store;
				if (candidate === void 0 || candidate === null || typeof candidate.getSnapshot !== "function") return EMPTY_SESSION_LIST;
				try {
					const snapshot = candidate.getSnapshot();
					return snapshot === null || snapshot === void 0 ? EMPTY_SESSION_LIST : snapshot;
				} catch {
					return EMPTY_SESSION_LIST;
				}
			}, [store]);
			return (0, react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
		}
		/**
		* Flatten the session-list snapshot into ordered picker rows.
		* @param list - the snapshot, possibly absent or partial.
		* @returns one row per known session, titled by its display title.
		*/
		function sessionEntries(list) {
			const byId = list !== null && list !== void 0 && typeof list.byId === "object" && list.byId !== null ? list.byId : {};
			return (Array.isArray(list?.ids) ? list.ids : Object.keys(byId)).map((id) => {
				const row = byId[id];
				return {
					id,
					title: row !== null && row !== void 0 && typeof row.displayTitle === "string" && row.displayTitle.length > 0 ? row.displayTitle : id,
					running: row !== void 0 && row !== null && row.running === true
				};
			}).filter((entry) => typeof entry.id === "string" && entry.id.length > 0);
		}
		// src/client/controls.tsx
		/**
		* dsh-better-compact — generic settings primitives.
		*
		* Every DOM structure, className, aria attribute and user-facing string here is
		* copied verbatim from the pre-TypeScript src/client.js: the stylesheet and the
		* accessibility acceptance tests are written against them. Only types are new.
		*
		* React is imported as a default namespace import (the client bundle is CJS and
		* compiles with the classic JSX runtime).
		*/
		/** Group an integer with commas without depending on the runtime locale. */
		function groupDigits(value) {
			return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
		/** Human token value; a missing or non-finite value is unknown, never 0. */
		function tokensText(value) {
			if (typeof value !== "number" || !Number.isFinite(value)) return t("unknown");
			return groupDigits(Math.round(value)) + " tokens";
		}
		/** Ratio text as a percentage; unknown stays unknown. */
		function ratioText(value) {
			if (typeof value !== "number" || !Number.isFinite(value)) return t("unknown");
			return String(Math.round(value * 1e4) / 100) + "%";
		}
		/** Duration text; unknown stays unknown. */
		function durationText(value) {
			if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return t("unknown");
			if (value < 1e3) return String(Math.round(value)) + " ms";
			return String(Math.round(value / 100) / 10) + " s";
		}
		/** One-line error message. */
		function errorMessage(error) {
			if (error instanceof Error) return error.message;
			return String(error);
		}
		/** Read one "process…" dictionary entry. */
		const processText = (key) => t("process" + key);
		const MODE_META = Object.freeze({
			native: Object.freeze({
				labelKey: "modeNative",
				effectKey: "modeNativeEffect",
				captionKey: "modeNativeCaption",
				tagKey: "modeNativeTag"
			}),
			goal: Object.freeze({
				labelKey: "modeGoal",
				effectKey: "modeGoalEffect",
				captionKey: "modeGoalCaption",
				tagKey: "modeGoalTag"
			}),
			handoff: Object.freeze({
				labelKey: "modeHandoff",
				effectKey: "modeHandoffEffect",
				captionKey: "modeHandoffCaption",
				tagKey: "modeHandoffTag"
			}),
			custom: Object.freeze({
				labelKey: "modeCustom",
				effectKey: "modeCustomEffect",
				captionKey: "modeCustomCaption",
				tagKey: "modeCustomTag"
			})
		});
		/**
		* Look up one mode's metadata for a value that arrived from the Host (a saved
		* config or an inspect record). Unknown modes stay unknown instead of throwing.
		*/
		function modeMeta(key) {
			if (key === null || key === void 0) return void 0;
			return MODE_META[key];
		}
		/** Configuration arithmetic only. Counts and safe cuts remain server-owned. */
		function projectDraftBudget(draft, budget) {
			const target = budget?.target;
			if (!target) return null;
			const contextWindow = budget?.contextWindow;
			const reservedCompletionTokens = budget?.reservedCompletionTokens;
			if (typeof contextWindow !== "number" || !Number.isFinite(contextWindow)) return null;
			if (typeof reservedCompletionTokens !== "number" || !Number.isFinite(reservedCompletionTokens)) return null;
			const policy = draft.policies.find((entry) => entry.provider === target.provider && entry.model === target.model);
			const chosen = (key) => policy && policy[key] !== "" ? Number(policy[key]) : Number(draft[key]);
			const window = contextWindow;
			const reserved = reservedCompletionTokens;
			const message = window - reserved;
			const headroom = chosen("headroomTokens");
			const ratio = chosen("thresholdRatio");
			const pressure = message - headroom;
			const threshold = Math.floor(Math.min(window * ratio, pressure));
			const retainMode = policy && policy.retainMode !== "inherit" ? policy.retainMode : draft.retainMode;
			const retainSource = policy && policy.retainMode !== "inherit" ? policy : draft;
			const retainRatioText = retainSource.retainRatio === "" ? DEFAULT_RETAIN_RATIO : Number(retainSource.retainRatio);
			const retain = retainMode === "tokens" ? Number(retainSource.retainTokens) : Math.floor(message * retainRatioText);
			const summary = policy?.maxTokens !== void 0 && policy.maxTokens !== "" ? Number(policy.maxTokens) : draft.maxTokens !== "" ? Number(draft.maxTokens) : headroom;
			if (![
				window,
				reserved,
				message,
				headroom,
				ratio,
				threshold,
				retain,
				summary
			].every(Number.isFinite)) return null;
			let error = null;
			if (message <= 0) error = t("budgetNoMessageRoom");
			else if (pressure <= 0) error = t("budgetHeadroomTooLarge", { message: tokensText(message) });
			else if (retain >= threshold) error = t("budgetRetainTooLarge", {
				retain: tokensText(retain),
				threshold: tokensText(threshold)
			});
			return {
				window,
				reserved,
				message,
				headroom,
				pressure,
				ratio,
				threshold,
				retain,
				summary,
				policy,
				error
			};
		}
		/** A labelled field; children is a render function receiving the input id. */
		function Field(props) {
			const id = "dsh-bc-" + props.name + "-" + react.default.useId().replace(/[^a-zA-Z0-9_-]/g, "");
			const described = props.error ? id + "-error" : props.hint !== void 0 || props.help !== void 0 ? id + "-help" : void 0;
			return /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-field" }, props.labelledBy === void 0 ? /* @__PURE__ */ react.default.createElement("label", {
				id: id + "-label",
				htmlFor: id,
				className: "dsh-bc-label"
			}, props.label) : null, props.children(id, {
				"aria-labelledby": props.labelledBy ?? id + "-label",
				"aria-invalid": props.error ? true : void 0,
				"aria-describedby": described
			}), props.hint !== void 0 ? /* @__PURE__ */ react.default.createElement("p", {
				id: id + "-help",
				className: "dsh-bc-hint"
			}, props.hint) : props.help !== void 0 ? /* @__PURE__ */ react.default.createElement("p", {
				id: id + "-help",
				className: "dsh-bc-help dsh-bc-sr-only"
			}, props.help) : null, props.error ? /* @__PURE__ */ react.default.createElement("p", {
				id: id + "-error",
				className: "dsh-bc-error",
				role: "alert",
				"data-bc-error": props.name
			}, props.error) : null);
		}
		/** The trigger keeps focus while the listbox previews an uncommitted option. */
		function Select(props) {
			const fallbackId = "dsh-bc-select-" + react.default.useId().replace(/[^a-zA-Z0-9_-]/g, "");
			const id = props.id ?? fallbackId;
			const options = react.default.Children.toArray(props.children).map((option) => option.props);
			const selected = options.findIndex((option) => option.value === props.value);
			const [open, setOpen] = react.default.useState(false);
			const [active, setActive] = react.default.useState(selected < 0 ? 0 : selected);
			const [placement, setPlacement] = react.default.useState({
				above: false,
				height: 240
			});
			const root = react.default.useRef(null);
			const trigger = react.default.useRef(null);
			const search = react.default.useRef({
				text: "",
				at: 0
			});
			const expanded = open && !props.disabled;
			react.default.useEffect(() => {
				if (!expanded || typeof document === "undefined") return;
				const dismiss = (event) => {
					if (!root.current?.contains(event.target)) setOpen(false);
				};
				document.addEventListener("pointerdown", dismiss);
				document.addEventListener("focusin", dismiss);
				return () => {
					document.removeEventListener("pointerdown", dismiss);
					document.removeEventListener("focusin", dismiss);
				};
			}, [expanded]);
			react.default.useEffect(() => {
				if (expanded) root.current?.querySelector("[data-active=\"true\"]")?.scrollIntoView({ block: "nearest" });
			}, [expanded, active]);
			const show = (index = selected < 0 ? 0 : selected) => {
				if (props.disabled) return;
				const rect = trigger.current?.getBoundingClientRect();
				if (rect && typeof window.innerHeight === "number") {
					const below = window.innerHeight - rect.bottom - 8;
					const above = rect.top - 8;
					const placeAbove = below < Math.min(240, options.length * 32 + 8) && above > below;
					setPlacement({
						above: placeAbove,
						height: Math.min(240, Math.max(32, placeAbove ? above : below))
					});
				}
				setActive(index);
				setOpen(true);
			};
			const choose = (index) => {
				const option = options[index];
				if (props.disabled || !option) return;
				props.onChange({ target: { value: option.value } });
				setOpen(false);
				trigger.current?.focus();
			};
			const onKeyDown = (event) => {
				if (props.disabled || event.defaultPrevented) return;
				if (event.key === "Tab") {
					setOpen(false);
					return;
				}
				if (event.key === "Escape" && expanded) {
					event.preventDefault();
					event.stopPropagation();
					setOpen(false);
					return;
				}
				if (event.key === "ArrowDown" || event.key === "ArrowUp") {
					event.preventDefault();
					const step = event.key === "ArrowDown" ? 1 : -1;
					show(expanded ? (active + step + options.length) % options.length : selected < 0 ? 0 : selected);
				} else if (event.key === "Home" || event.key === "End") {
					event.preventDefault();
					show(event.key === "Home" ? 0 : options.length - 1);
				} else if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					if (expanded) choose(active);
					else show();
				} else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
					const now = Date.now();
					const previous = now - search.current.at < 600 ? search.current.text : "";
					const query = previous === event.key.toLocaleLowerCase() ? previous : previous + event.key.toLocaleLowerCase();
					search.current = {
						text: query,
						at: now
					};
					for (let step = 1; step <= options.length; step++) {
						const index = ((expanded ? active : selected) + step + options.length) % options.length;
						const option = options[index];
						if (option && String(option.children).toLocaleLowerCase().startsWith(query)) {
							event.preventDefault();
							show(index);
							break;
						}
					}
				}
			};
			return /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-select",
				ref: root
			}, /* @__PURE__ */ react.default.createElement("button", {
				id,
				ref: trigger,
				name: props.name,
				value: props.value,
				type: "button",
				role: "combobox",
				className: "dsh-bc-input dsh-bc-select-trigger",
				disabled: props.disabled,
				title: props.title,
				"aria-label": props["aria-label"],
				"aria-labelledby": props["aria-labelledby"],
				"aria-describedby": props["aria-describedby"],
				"aria-invalid": props["aria-invalid"],
				"aria-haspopup": "listbox",
				"aria-expanded": expanded,
				"aria-controls": expanded ? id + "-list" : void 0,
				"aria-activedescendant": expanded ? id + "-option-" + active : void 0,
				onClick: () => expanded ? setOpen(false) : show(),
				onKeyDown
			}, /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-select-value" }, options[selected]?.children ?? t("selectOption")), /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-chevron",
				"aria-hidden": true
			})), expanded ? /* @__PURE__ */ react.default.createElement("div", {
				id: id + "-list",
				role: "listbox",
				className: "dsh-bc-select-menu",
				"data-side": placement.above ? "above" : "below",
				style: { maxHeight: placement.height },
				"aria-labelledby": props["aria-labelledby"] ?? id
			}, options.map((option, index) => /* @__PURE__ */ react.default.createElement("div", {
				key: option.value,
				id: id + "-option-" + index,
				role: "option",
				className: "dsh-bc-select-option",
				"aria-selected": index === selected,
				"data-active": index === active,
				"data-value": option.value,
				onPointerMove: () => setActive(index),
				onPointerDown: (event) => event.preventDefault(),
				onClick: () => choose(index)
			}, /* @__PURE__ */ react.default.createElement("span", null, option.children), /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-option-check",
				"aria-hidden": true
			}, index === selected ? "✓" : "")))) : null);
		}
		function NumberField(props) {
			const ratio = props.ratio === true;
			const display = ratio && props.value !== "" ? String(Number((Number(props.value) * 100).toFixed(8))) : props.value;
			return /* @__PURE__ */ react.default.createElement(Field, {
				name: props.name,
				label: props.label,
				hint: props.hint,
				help: props.help,
				error: props.error,
				labelledBy: props.labelledBy
			}, (id, aria) => /* @__PURE__ */ react.default.createElement("div", { className: props.inline === true ? "dsh-bc-number dsh-bc-number-inline" : "dsh-bc-number" }, /* @__PURE__ */ react.default.createElement("input", {
				...aria,
				id,
				name: props.name,
				className: "dsh-bc-input",
				type: "number",
				inputMode: ratio ? "decimal" : "numeric",
				min: props.min ?? 0,
				max: ratio ? 100 : void 0,
				step: ratio ? "any" : 1,
				value: display,
				disabled: props.disabled,
				placeholder: props.placeholder,
				onChange: (event) => props.onChange(event.target.value === "" ? "" : ratio ? String(Number(event.target.value) / 100) : event.target.value)
			}), /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-unit",
				"aria-hidden": true
			}, ratio ? "%" : props.unit ?? "tokens")));
		}
		function collapseDetails(event) {
			if (event.key !== "Escape" || event.defaultPrevented || !event.currentTarget.open) return;
			event.preventDefault();
			event.stopPropagation();
			event.currentTarget.open = false;
			event.currentTarget.querySelector("summary")?.focus();
		}
		function Explain(props) {
			return /* @__PURE__ */ react.default.createElement("details", {
				className: "dsh-bc-explanation",
				open: props.open,
				onKeyDown: collapseDetails,
				"data-bc": props.name
			}, /* @__PURE__ */ react.default.createElement("summary", null, props.title), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-explanation-body" }, props.children));
		}
		function Metric(props) {
			return /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-metric" }, /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-caption" }, props.label), /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-metric-value dsh-bc-mono",
				"data-bc": props.name
			}, props.value));
		}
		/** A section surface with a heading. */
		function Section(props) {
			return /* @__PURE__ */ react.default.createElement("section", {
				className: "dsh-bc-section",
				"data-bc-section": props.name,
				"data-bc": props.dataBc
			}, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-section-head" }, /* @__PURE__ */ react.default.createElement("h3", { className: "dsh-bc-h3" }, props.title), props.aside === void 0 || props.aside === null ? null : props.aside), props.children);
		}
		/** A definition row with a tabular value. */
		function Row(props) {
			return /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-row" }, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-row-label" }, /* @__PURE__ */ react.default.createElement("span", null, props.label), props.help ? /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-help" }, props.help) : null), /* @__PURE__ */ react.default.createElement("span", { className: props.mono === true ? "dsh-bc-row-value dsh-bc-mono" : "dsh-bc-row-value" }, props.value));
		}
		/** One mode card with radio semantics. */
		function ModeCard(props) {
			const meta = MODE_META[props.mode];
			const onKeyDown = (event) => {
				if (props.disabled) return;
				if (event.key === " " || event.key === "Enter") {
					event.preventDefault();
					props.onSelect(props.mode);
					return;
				}
				if (event.key === "ArrowRight" || event.key === "ArrowDown") {
					event.preventDefault();
					props.onMove(1);
					return;
				}
				if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
					event.preventDefault();
					props.onMove(-1);
					return;
				}
				if (event.key === "Home") {
					event.preventDefault();
					props.onMoveTo(0);
					return;
				}
				if (event.key === "End") {
					event.preventDefault();
					props.onMoveTo(MODES.length - 1);
				}
			};
			return /* @__PURE__ */ react.default.createElement("div", {
				ref: props.cardRef,
				className: "dsh-bc-mode",
				role: "radio",
				"aria-checked": props.selected,
				"aria-label": t(meta.labelKey) + " · " + t(meta.effectKey) + " · " + t(meta.tagKey),
				"aria-disabled": props.disabled ? true : void 0,
				tabIndex: props.selected && !props.disabled ? 0 : -1,
				"data-mode": props.mode,
				"data-bc": "mode-card",
				"data-selected": props.selected ? "true" : "false",
				onClick: () => {
					if (!props.disabled) props.onSelect(props.mode);
				},
				onKeyDown
			}, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-mode-head" }, /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-radio-dot",
				"aria-hidden": "true"
			}), /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-mode-title" }, t(meta.labelKey)), /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-mode-tag" }, t(meta.tagKey))), /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-mode-description" }, t(meta.effectKey)));
		}
		/** Four selectable mode cards with an accessible radiogroup. */
		function ModeCards(props) {
			const cardRefs = react.default.useRef({});
			const focusCard = (mode) => {
				const node = cardRefs.current[mode];
				if (node !== null && node !== void 0 && typeof node.focus === "function") try {
					node.focus();
				} catch {}
			};
			const choose = (mode) => {
				if (props.disabled) return;
				props.onChange(mode);
				focusCard(mode);
			};
			const move = (delta) => {
				if (props.disabled) return;
				const index = MODES.indexOf(props.value);
				choose(MODES[(index + delta + MODES.length) % MODES.length]);
			};
			return /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-strategy" }, /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-modes dsh-bc-modes-4",
				role: "radiogroup",
				"aria-label": t("modeGroup"),
				"data-bc": "mode-cards"
			}, MODES.map((mode) => /* @__PURE__ */ react.default.createElement(ModeCard, {
				key: mode,
				mode,
				selected: props.value === mode,
				disabled: props.disabled,
				onSelect: choose,
				onMove: move,
				onMoveTo: (index) => choose(MODES[index]),
				cardRef: (node) => {
					cardRefs.current[mode] = node;
				}
			}))));
		}
		/**
		* One setting: label and consequence on the left, the control right-aligned.
		* The generated label id is handed to the control for `aria-labelledby`.
		*/
		function SettingRow(props) {
			const labelId = "dsh-bc-setting-" + react.default.useId().replace(/[^a-zA-Z0-9_-]/g, "");
			return /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-setting-row" }, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-setting-main" }, /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-setting-label",
				id: labelId
			}, props.label), props.desc === void 0 || props.desc === null ? null : /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-setting-desc" }, props.desc)), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-setting-control" }, props.children(labelId)));
		}
		/** A setting row with a label on the left and a switch control on the right. */
		function Toggle(props) {
			const rawId = react.default.useId();
			const id = "dsh-bc-toggle-" + props.name + "-" + rawId.replace(/[^a-zA-Z0-9_-]/g, "");
			return /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-setting-row",
				"data-bc-setting": props.name
			}, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-setting-main" }, /* @__PURE__ */ react.default.createElement("label", {
				className: "dsh-bc-setting-label",
				htmlFor: id
			}, props.label), props.help === void 0 || props.help === null ? null : /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-setting-desc" }, props.help)), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-setting-control" }, /* @__PURE__ */ react.default.createElement("input", {
				id,
				name: props.name,
				className: "dsh-bc-switch",
				type: "checkbox",
				title: props.title,
				checked: props.checked === true,
				disabled: props.disabled === true,
				onChange: (event) => props.onChange(event.target.checked),
				role: "switch",
				"aria-checked": props.checked === true
			})));
		}
		/** Classify an inspect budget/diagnostic reason and point at the controls. */
		function classifyReason(text) {
			if (typeof text !== "string" || text.length === 0) return null;
			if (/leaving no message budget/i.test(text)) return {
				label: t("reasonNoCapacity"),
				hint: t("reasonNoCapacityHint")
			};
			if (/leaving no pressure budget/i.test(text)) return {
				label: t("reasonReserveFull"),
				hint: t("reasonReserveFullHint")
			};
			if (/must be less than threshold tokens/i.test(text)) return {
				label: t("reasonRetainConflict"),
				hint: t("reasonRetainConflictHint")
			};
			if (/no safe compactable range/i.test(text)) return {
				label: /system prompt|retained tail|tool-call/i.test(text) ? t("reasonNoSafeRangeWithPrefix") : t("reasonNoSafeRange"),
				hint: t("reasonNoSafeRangeHint")
			};
			if (/no routed request/i.test(text)) return {
				label: t("reasonNoRoute"),
				hint: t("reasonNoRouteHint")
			};
			if (/no context capacity/i.test(text) || /model metadata is unavailable/i.test(text)) return {
				label: t("reasonCapacityUnknown"),
				hint: t("reasonCapacityUnknownHint")
			};
			if (/below the automatic trigger/i.test(text)) return {
				label: t("reasonBelowTrigger"),
				hint: null
			};
			if (/automatic compaction is disabled/i.test(text)) return {
				label: t("reasonAutoOff"),
				hint: t("reasonAutoOffHint")
			};
			return null;
		}
		/** Render deduplicated reasons with actionable hints. */
		function ReasonList(props) {
			const seen = /* @__PURE__ */ new Set();
			const items = [];
			for (const raw of props.reasons ?? []) {
				if (typeof raw !== "string" || raw.length === 0 || seen.has(raw)) continue;
				seen.add(raw);
				items.push({
					raw,
					classified: classifyReason(raw)
				});
			}
			if (items.length === 0) return null;
			return /* @__PURE__ */ react.default.createElement("ul", {
				className: "dsh-bc-reasons",
				"data-bc": "reasons"
			}, items.map((item) => /* @__PURE__ */ react.default.createElement("li", {
				key: item.raw,
				className: "dsh-bc-reason"
			}, /* @__PURE__ */ react.default.createElement("span", null, item.classified?.label ?? item.raw), item.classified !== null && item.classified.hint !== null && item.classified.hint !== void 0 ? /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-hint" }, item.classified.hint) : null)));
		}
		// src/client/font.ts
		/**
		* Settings-page state for the fixed checkpoint font.
		*
		* The status comes from the plugin's own GET route and the install from its
		* POST route, so the page reports exactly what the host has on disk instead of
		* guessing from the build. Errors are surfaced verbatim: the route already
		* names the failed registries or the filesystem reason.
		*/
		/**
		* One-line error text.
		* @param error - thrown value.
		* @returns its message, or its string form.
		*/
		function messageOf(error) {
			return error instanceof Error ? error.message : String(error);
		}
		/**
		* Shape-check the route payload before trusting it.
		* @param payload - parsed JSON body.
		* @returns the typed status, or null when the payload is not one.
		*/
		function asStatus(payload) {
			if (typeof payload.installed !== "boolean" || typeof payload.package !== "string" || typeof payload.version !== "string" || typeof payload.family !== "string") return null;
			return {
				installed: payload.installed,
				package: payload.package,
				version: payload.version,
				family: payload.family,
				bytes: typeof payload.bytes === "number" ? payload.bytes : null,
				archiveBytes: typeof payload.archiveBytes === "number" ? payload.archiveBytes : 0,
				source: typeof payload.source === "string" ? payload.source : null,
				downloadedAt: typeof payload.downloadedAt === "string" ? payload.downloadedAt : null
			};
		}
		/**
		* Read the font status on mount and expose the install action.
		* @returns the current asset state plus `install()`.
		*/
		function useFontAsset() {
			const [status, setStatus] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const [installing, setInstalling] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				let cancelled = false;
				getJson(FONT_PATH).then((payload) => {
					if (!cancelled) setStatus(asStatus(payload));
				}, (failure) => {
					if (!cancelled) setError(messageOf(failure));
				}).finally(() => {
					if (!cancelled) setLoading(false);
				});
				return () => {
					cancelled = true;
				};
			}, []);
			return {
				status,
				loading,
				installing,
				error,
				install: (0, react.useCallback)(async (force = false) => {
					setInstalling(true);
					setError(null);
					try {
						const next = asStatus(await postJson(FONT_PATH, { force }));
						if (next === null) throw new Error("the font route returned an unexpected payload");
						setStatus(next);
					} catch (failure) {
						setError(messageOf(failure));
					} finally {
						setInstalling(false);
					}
				}, [])
			};
		}
		// src/client/diagram.tsx
		/**
		* dsh-better-compact — schematic process diagrams.
		*
		* Pure presentation: token values are labelled estimates, never measured usage.
		* Every element, coordinate, className and aria attribute is copied verbatim
		* from the pre-TypeScript src/client.js.
		*/
		/** One bold SVG process drawing for the selected strategy. */
		function CompactionFlow(props) {
			const { mode, draft, projected, preview } = props;
			const ratio = Number(draft.thresholdRatio === "" ? .8 : draft.thresholdRatio);
			const retainRatio = Number(draft.retainRatio === "" ? DEFAULT_RETAIN_RATIO : draft.retainRatio);
			const fixed = typeof props.fixedTokens === "number" && Number.isFinite(props.fixedTokens) ? props.fixedTokens : null;
			const earlier = projected && fixed !== null ? Math.max(0, projected.threshold - projected.retain - fixed) : null;
			const retain = projected ? projected.retain : null;
			const marker = "bc-flow-" + react.default.useId().replace(/[^a-zA-Z0-9_-]/g, "");
			const copy = mode === "native" ? {
				title: t("svgNativeTitle"),
				body: t("svgNativeBody"),
				sideTitle: t("svgNativeSide"),
				sideBody: t("svgNativeSideBody"),
				sideTag: t("svgNativeSideTag"),
				result: t("svgNativeResult"),
				resultBody: t("svgNativeResultBody"),
				final: t("svgNativeFinal"),
				aria: t("svgNativeAria")
			} : mode === "goal" ? {
				title: t("svgGoalTitle"),
				body: t("svgGoalBody"),
				sideTitle: t("svgGoalSide"),
				sideBody: t("svgGoalSideBody"),
				sideTag: t("svgGoalSideTag"),
				result: t("svgGoalResult"),
				resultBody: t("svgGoalResultBody"),
				final: t("svgGoalFinal"),
				aria: t("svgGoalAria")
			} : mode === "handoff" ? {
				title: t("svgHandoffTitle"),
				body: t("svgHandoffBody"),
				sideTitle: t("svgHandoffSide"),
				sideBody: t("svgHandoffSideBody"),
				sideTag: t("svgHandoffSideTag"),
				result: t("svgHandoffResult"),
				resultBody: t("svgHandoffResultBody"),
				final: t("svgHandoffFinal"),
				aria: t("svgHandoffAria")
			} : {
				title: t("svgCustomTitle"),
				body: t("svgCustomBody"),
				sideTitle: t("svgCustomSide"),
				sideBody: t("svgCustomSideBody"),
				sideTag: t("svgCustomSideTag"),
				result: t("svgCustomResult"),
				resultBody: t("svgCustomResultBody"),
				final: t("svgCustomFinal"),
				aria: t("svgCustomAria")
			};
			const node = (id, x, y, width, height, title, sub, tone, tag, tagTone) => /* @__PURE__ */ react.default.createElement("g", { "data-node": id }, /* @__PURE__ */ react.default.createElement("rect", {
				className: "dsh-bc-node " + (tone ?? ""),
				x,
				y,
				width,
				height,
				rx: 6
			}), tag ? /* @__PURE__ */ react.default.createElement("g", { "aria-hidden": true }, /* @__PURE__ */ react.default.createElement("rect", {
				className: "dsh-bc-svg-tag " + (tagTone === "accent" ? "dsh-bc-svg-tag-accent" : ""),
				x: x + width - Math.max(30, tag.length * 10 + 12) - 8,
				y: y + 8,
				width: Math.max(30, tag.length * 10 + 12),
				height: 16,
				rx: 8
			}), /* @__PURE__ */ react.default.createElement("text", {
				x: x + width - Math.max(30, tag.length * 10 + 12) / 2 - 8,
				y: y + 19,
				textAnchor: "middle",
				className: "dsh-bc-svg-tag-text " + (tagTone === "accent" ? "dsh-bc-svg-tag-text-accent" : "")
			}, tag)) : null, /* @__PURE__ */ react.default.createElement("text", {
				x: x + width / 2,
				y: sub ? y + height / 2 - 2 : y + height / 2 + 5,
				textAnchor: "middle",
				className: "dsh-bc-svg-node-title"
			}, title), sub ? /* @__PURE__ */ react.default.createElement("text", {
				x: x + width / 2,
				y: y + height / 2 + 16,
				textAnchor: "middle",
				className: "dsh-bc-svg-node-sub"
			}, sub) : null);
			const edge = (d, from, to) => /* @__PURE__ */ react.default.createElement("path", {
				className: "dsh-bc-edge",
				"data-from": from,
				"data-to": to,
				d,
				markerEnd: "url(#" + marker + ")"
			});
			const fixedText = processText("fixedPrefix") + (draft.cachePriority && mode !== "native" ? " · " + t("cacheChip") : "");
			const previewText = preview && Number.isFinite(preview.beforeTokens) && Number.isFinite(preview.afterUpperBoundTokens) ? t("svgPreview", {
				before: tokensText(preview.beforeTokens),
				after: tokensText(preview.afterUpperBoundTokens)
			}) : projected ? t("svgProjected", { summary: tokensText(projected.summary) }) : null;
			return /* @__PURE__ */ react.default.createElement("svg", {
				className: "dsh-bc-strategy-svg",
				viewBox: "0 0 440 500",
				role: "img",
				"aria-label": copy.aria,
				"data-bc": "compaction-flow",
				"data-mode-flow": mode
			}, /* @__PURE__ */ react.default.createElement("title", null, copy.aria), /* @__PURE__ */ react.default.createElement("desc", null, copy.aria), /* @__PURE__ */ react.default.createElement("defs", null, /* @__PURE__ */ react.default.createElement("marker", {
				id: marker,
				viewBox: "0 0 6 6",
				refX: 6,
				refY: 3,
				markerWidth: 6,
				markerHeight: 6,
				orient: "auto",
				markerUnits: "userSpaceOnUse"
			}, /* @__PURE__ */ react.default.createElement("path", {
				d: "M0 0 L6 3 L0 6 Z",
				fill: "currentColor"
			}))), node("fixed", 16, 12, 408, 36, fixedText, null, "dsh-bc-node-dashed"), node("earlier", 16, 64, 198, 64, processText("earlier"), earlier === null ? "—" : "≈ " + tokensText(earlier), "", t("svgPendingTag"), "accent"), node("recent", 226, 64, 198, 64, processText("recent"), retain === null ? "—" : "≈ " + tokensText(retain), "dsh-bc-node-accent", t("svgKeepTag"), "accent"), edge("M115 128 L115 172", "earlier", "compress"), edge("M325 128 L325 146 L432 146 L432 332 L424 332", "recent", "retained"), node("compress", 16, 172, 198, 88, copy.title, copy.body, "dsh-bc-node-accent"), node("side", 226, 172, 198, 88, copy.sideTitle, copy.sideBody, "dsh-bc-node-dashed", copy.sideTag, "muted"), edge("M226 216 L214 216", "side", "compress"), /* @__PURE__ */ react.default.createElement("text", {
				x: 226,
				y: 282,
				className: "dsh-bc-svg-note"
			}, draft.auto ? t("svgAuto", {
				ratio: ratioText(ratio),
				retain: ratioText(retainRatio)
			}) : t("svgManual")), node("summary", 16, 300, 198, 64, copy.result, copy.resultBody, "dsh-bc-node-accent", t("svgWriteTag"), "accent"), node("retained", 226, 300, 198, 64, t("svgRetained"), retain === null ? "—" : "≈ " + tokensText(retain), "dsh-bc-node-strong", t("svgOriginalTag"), "muted"), edge("M115 260 L115 300", "compress", "summary"), edge("M115 364 L115 410", "summary", "continue"), edge("M325 364 L325 410", "retained", "continue"), /* @__PURE__ */ react.default.createElement("g", { "data-node": "continue" }, /* @__PURE__ */ react.default.createElement("rect", {
				className: "dsh-bc-node dsh-bc-node-strong",
				x: 16,
				y: 410,
				width: 408,
				height: 56,
				rx: 6
			}), /* @__PURE__ */ react.default.createElement("text", {
				x: 220,
				y: 432,
				textAnchor: "middle",
				className: "dsh-bc-svg-node-title"
			}, t("svgContinue")), /* @__PURE__ */ react.default.createElement("text", {
				x: 220,
				y: 451,
				textAnchor: "middle",
				className: "dsh-bc-svg-node-sub",
				"data-bc": "process-result",
				"data-mode-result": mode
			}, copy.final)), previewText ? /* @__PURE__ */ react.default.createElement("text", {
				x: 16,
				y: 488,
				className: "dsh-bc-svg-note"
			}, previewText) : null);
		}
		// src/client/sections.tsx
		/**
		* dsh-better-compact — editable sections of the settings page.
		*
		* Every DOM structure, className, aria attribute and user-facing string here is
		* copied verbatim from the pre-TypeScript src/client.js.
		*/
		/** Goal-mode default instruction; custom mode starts from this template. Keep in sync with goalInstruction(). */
		const DEFAULT_CUSTOM_PROMPT = "You are now acting as a compaction engine for this AI coding assistant. Condense the conversation ABOVE into a structured checkpoint that lets the next model resume the work with no loss of essential context.\n\nOutput EXACTLY the Markdown structure below. Keep every section, in order. Use terse bullets, not prose paragraphs. Write \"(none)\" for an empty section — never drop a section.\n\n## Current Goal and Unresolved Requests\n- [facts]\n\n## Constraints, Preferences, and Approved Boundaries\n- [facts]\n\n## Decisions and Reasons\n- [facts]\n\n## Completed Work\n- [facts]\n\n## In Progress\n- [facts]\n\n## Blocked, Pending, and Unverified\n- [facts]\n\n## Key References\n- [facts]\n\n## Next Actions\n- [facts]\n\nRules:\n- Separate the current authoritative goal and unresolved user requests from completed work.\n- Record decisions and their reasons, not only outcomes.\n- Separate actually verified results from work that is merely believed done.\n- Preserve exact references and error strings instead of copying large plans or file bodies.\n- Next Actions must be directly in line with the most recent unresolved request, not an invented roadmap.\n- Preserve exact file paths, commands, error strings, identifiers, numeric values, function signatures, and syntax fragments verbatim.\n- Capture user feedback and explicit instructions faithfully, especially corrections.\n- Never mark incomplete work complete and never describe unverified work as verified. If a result has not been proven against current files, command output, tests, or runtime state, list it as unverified.\n- Keep pending user questions, running jobs, and running child agents as facts to wait for or collect later. Do not claim to have answered a question, started or stopped a job, or finished a child agent.\n- Prefer references to existing specs, plans, diffs, and commits over copying their text.\n- Treat the authoritative state block (if present) as current host state that outranks any goal/progress claim inside an older checkpoint. Do not treat an older checkpoint as authoritative and do not let superseded plans accumulate.\n- Do not copy secrets, tokens, passwords, credentials, or private keys; redact them.\n- Do not mention this summarization request or that the context was compacted.\n- Output only the Markdown document: do not call any tool or take any other action.\n- If the conversation already contains a <compacted-summary> block, it is a PRIOR checkpoint: keep still-true facts, drop stale ones, and merge newer information into one consolidated document under the same structure.";
		/** Variables inserted by the custom-mode editor; keep in sync with prompts.js. */
		const PROMPT_MAX_CHARS = MAX_CUSTOM_PROMPT_CHARS;
		/** Dictionary key labelling one prompt variable chip (the token list itself is shared contract). */
		const VARIABLE_LABEL_KEYS = Object.freeze({
			goal: "variableGoal",
			todos: "variableTodos",
			questions: "variableQuestions",
			jobs: "variableJobs",
			children: "variableChildren",
			date: "variableDate",
			session: "variableSession",
			model: "variableModel",
			trigger: "variableTrigger",
			retain: "variableRetain"
		});
		const UNKNOWN_PROMPT_TOKEN = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;
		/** One draggable ratio handle on the capacity bar. */
		function CapacityHandle(props) {
			const dragging = react.default.useRef(false);
			const percent = Math.max(1, Math.min(99, props.percent));
			const update = (event) => {
				const rect = props.barRef.current?.getBoundingClientRect?.();
				if (!rect || rect.width <= 0) return;
				const next = Math.max(1, Math.min(99, (event.clientX - rect.left) / rect.width * 100));
				props.onPercent(next);
			};
			const onKeyDown = (event) => {
				if (props.disabled) return;
				const step = event.shiftKey ? 5 : 1;
				let next;
				if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = percent - step;
				else if (event.key === "ArrowRight" || event.key === "ArrowUp") next = percent + step;
				else if (event.key === "Home") next = 1;
				else if (event.key === "End") next = 99;
				else return;
				event.preventDefault();
				props.onPercent(Math.max(1, Math.min(99, next)));
			};
			return /* @__PURE__ */ react.default.createElement("button", {
				type: "button",
				className: "dsh-bc-handle",
				"data-handle": props.kind,
				style: { left: percent + "%" },
				role: "slider",
				tabIndex: 0,
				"aria-label": props.label,
				"aria-valuemin": 1,
				"aria-valuemax": 99,
				"aria-valuenow": Math.round(percent),
				"aria-valuetext": props.valueText,
				"aria-disabled": props.disabled ? true : void 0,
				disabled: props.disabled,
				onPointerDown: (event) => {
					if (props.disabled) return;
					event.preventDefault();
					if (typeof event.currentTarget.setPointerCapture === "function") event.currentTarget.setPointerCapture(event.pointerId);
					dragging.current = true;
					update(event);
				},
				onPointerMove: (event) => {
					if (dragging.current) update(event);
				},
				onPointerUp: (event) => {
					dragging.current = false;
					if (typeof event.currentTarget.releasePointerCapture === "function") event.currentTarget.releasePointerCapture(event.pointerId);
				},
				onPointerCancel: () => {
					dragging.current = false;
				},
				onKeyDown
			}, /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-handle-chip" }, props.label), /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-handle-line",
				"aria-hidden": true
			}));
		}
		/** One bold configuration bar; token arithmetic is rounded for display only. */
		function CapacityBar(props) {
			const { draft, projected, budget, disabled } = props;
			const barRef = react.default.useRef(null);
			const windowTokens = projected?.window ?? budget?.contextWindow ?? null;
			const message = projected?.message ?? null;
			const threshold = projected?.threshold ?? null;
			const retain = projected?.retain ?? null;
			const fixed = typeof budget?.fixedTokens === "number" && Number.isFinite(budget.fixedTokens) ? budget.fixedTokens : 0;
			const current = typeof budget?.currentTokens === "number" && Number.isFinite(budget.currentTokens) ? budget.currentTokens : null;
			const known = [
				windowTokens,
				message,
				threshold,
				retain
			].every((value) => typeof value === "number" && Number.isFinite(value) && value > 0);
			const ratio = Number(draft.thresholdRatio === "" ? .8 : draft.thresholdRatio);
			const retainRatio = Number(draft.retainRatio === "" ? DEFAULT_RETAIN_RATIO : draft.retainRatio);
			const unknown = !known;
			const knownWindow = known && typeof windowTokens === "number" ? windowTokens : 1;
			const knownMessage = known && typeof message === "number" ? message : 1;
			const knownThreshold = known && typeof threshold === "number" ? threshold : 1;
			const knownRetain = known && typeof retain === "number" ? retain : 1;
			const scale = knownWindow;
			const reserved = known ? Math.max(0, knownWindow - knownMessage) : 0;
			const headroom = known ? Math.max(0, knownMessage - knownThreshold) : 0;
			const compressible = known ? Math.max(0, knownThreshold - fixed - knownRetain) : 0;
			const segments = known ? [
				{
					key: "fixed",
					tokens: fixed,
					width: Math.max(0, fixed) / scale * 100
				},
				{
					key: "compressible",
					tokens: compressible,
					width: Math.max(0, compressible) / scale * 100
				},
				{
					key: "retained",
					tokens: knownRetain,
					width: Math.max(0, knownRetain) / scale * 100
				},
				{
					key: "headroom",
					tokens: headroom,
					width: Math.max(0, headroom) / scale * 100
				},
				{
					key: "reserved",
					tokens: reserved,
					width: Math.max(0, reserved) / scale * 100
				}
			] : [
				{
					key: "compressible",
					width: Math.max(0, ratio * 100 - retainRatio * 100)
				},
				{
					key: "retained",
					width: Math.max(0, Math.min(100, retainRatio * 100))
				},
				{
					key: "headroom",
					width: Math.max(0, 100 - ratio * 100)
				}
			];
			const ratioPercent = Math.max(1, Math.min(99, ratio * 100));
			const retainPercent = known ? Math.max(1, Math.min(99, (knownThreshold - knownRetain) / knownWindow * 100)) : Math.max(1, Math.min(99, (1 - retainRatio) * 100));
			const currentPercent = known && current !== null ? Math.max(0, Math.min(100, current / knownWindow * 100)) : null;
			const labelFor = {
				fixed: processText("barFixed"),
				compressible: processText("barCompressible"),
				retained: processText("barRetained"),
				headroom: processText("barHeadroom"),
				reserved: processText("reserve")
			};
			const updateTrigger = (percent) => props.onDraft({ thresholdRatio: String(Math.round(percent) / 100) });
			const updateRetain = (percent) => {
				if (!known) {
					props.onDraft({ retainRatio: String(Number((1 - percent / 100).toFixed(4))) });
					return;
				}
				const next = Math.max(0, Math.min(knownThreshold - 1, Math.round(knownThreshold - percent / 100 * knownWindow)));
				if (draft.retainMode === "tokens") props.onDraft({ retainTokens: String(next) });
				else props.onDraft({ retainRatio: String(Number((next / knownMessage).toFixed(4))) });
			};
			const retainLabel = draft.retainMode === "tokens" ? processText("retained") + " " + tokensText(Number(draft.retainTokens)) : processText("retainHandle") + " " + ratioText(retainRatio);
			return /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-capacity",
				"data-bc": "capacity-bar"
			}, /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-bar dsh-bc-capacity-bar",
				ref: barRef,
				role: "group",
				"aria-label": unknown ? processText("unknownBudget") : processText("configBudget") + ": " + ratioText(ratio) + ", " + retainLabel
			}, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-bar-track" }, segments.map((entry) => /* @__PURE__ */ react.default.createElement("div", {
				key: entry.key,
				className: "dsh-bc-bar-seg dsh-bc-seg-" + entry.key,
				style: { width: entry.width + "%" },
				title: labelFor[entry.key] + " · " + tokensText(entry.tokens)
			}, entry.width >= 12 ? /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-bar-label" }, labelFor[entry.key]) : null))), !unknown && currentPercent !== null ? /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-current-line",
				style: { left: currentPercent + "%" },
				title: processText("currentUsage") + " " + tokensText(current),
				"data-bc": "current-marker"
			}) : null, /* @__PURE__ */ react.default.createElement(CapacityHandle, {
				barRef,
				kind: "trigger",
				percent: ratioPercent,
				label: processText("triggerHandle") + " " + ratioText(ratio),
				valueText: processText("triggerHandle") + " " + ratioText(ratio),
				disabled,
				onPercent: updateTrigger
			}), draft.retainMode === "ratio" ? /* @__PURE__ */ react.default.createElement(CapacityHandle, {
				barRef,
				kind: "retain",
				percent: retainPercent,
				label: retainLabel,
				valueText: retainLabel,
				disabled,
				onPercent: updateRetain
			}) : null, draft.retainMode === "tokens" ? /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-retain-pin",
				style: { left: retainPercent + "%" },
				title: retainLabel,
				"data-bc": "retain-pin"
			}, retainLabel) : null, known && props.limited === true ? /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-cut",
				style: { left: Math.max(0, Math.min(100, knownThreshold / scale * 100)) + "%" },
				"data-bc": "effective-trigger"
			}, /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-cut-chip" }, t("compactionCut") + " " + ratioText(knownThreshold / scale))) : null), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-capacity-foot" }, /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-caption" }, t("capacityHintDrag")), unknown ? /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-caption",
				"data-bc": "budget-incomplete"
			}, t("capacityUnknownNote")) : null));
		}
		/** Capacity, trigger, retention and the visible headroom field. */
		function CapacitySection(props) {
			const { draft, disabled, projected, fieldError, onDraft } = props;
			const ratio = Number(draft.thresholdRatio === "" ? .8 : draft.thresholdRatio);
			const retainRatio = Number(draft.retainRatio === "" ? DEFAULT_RETAIN_RATIO : draft.retainRatio);
			const p = projected ?? null;
			const retainText = draft.retainMode === "tokens" ? tokensText(Number(draft.retainTokens)) : ratioText(retainRatio);
			const effective = p !== null && p.window > 0 ? p.threshold / p.window : null;
			const limited = effective !== null && Math.abs(effective - ratio) > .005;
			const effect = p === null ? t("capacityEffectUnknown", {
				trigger: ratioText(ratio),
				retain: retainText
			}) : t(limited ? "capacityEffectLimited" : "capacityEffect", {
				trigger: ratioText(limited ? effective : ratio),
				retain: tokensText(p.retain),
				headroom: tokensText(p.headroom)
			});
			const current = typeof props.budget?.currentTokens === "number" && Number.isFinite(props.budget.currentTokens) ? props.budget.currentTokens : null;
			const retainedRatioText = draft.retainRatio === "" ? String(DEFAULT_RETAIN_RATIO) : draft.retainRatio;
			return /* @__PURE__ */ react.default.createElement(Section, {
				name: "capacity",
				dataBc: "capacity",
				title: processText("capacityTitle"),
				aside: props.dirty === true ? /* @__PURE__ */ react.default.createElement("span", {
					className: "dsh-bc-chip",
					"data-tone": "accent",
					"data-bc": "draft-chip"
				}, t("draftUnsaved")) : null
			}, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-session-row" }, props.sessionControl, /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-caption dsh-bc-session-help" }, processText("sessionHelp"))), /* @__PURE__ */ react.default.createElement(Toggle, {
				name: "auto",
				label: processText("auto"),
				checked: draft.auto,
				disabled,
				help: draft.auto ? processText("triggerHelp") : processText("autoOff"),
				onChange: (auto) => onDraft({ auto })
			}), draft.auto ? /* @__PURE__ */ react.default.createElement(react.default.Fragment, null, /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-effect",
				"data-bc": "effect-summary"
			}, effect), /* @__PURE__ */ react.default.createElement("div", { "data-bc": projected ? "draft-budget" : void 0 }, /* @__PURE__ */ react.default.createElement(CapacityBar, {
				draft,
				projected,
				budget: props.budget,
				disabled,
				limited,
				onDraft
			})), projected ? /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-capacity-metrics" }, /* @__PURE__ */ react.default.createElement(Metric, {
				label: processText("message"),
				value: tokensText(projected.message),
				name: "draft-message-budget"
			}), /* @__PURE__ */ react.default.createElement(Metric, {
				label: processText("effective"),
				value: tokensText(projected.threshold),
				name: "draft-trigger"
			}), /* @__PURE__ */ react.default.createElement(Metric, {
				label: processText("retained"),
				value: tokensText(projected.retain),
				name: "draft-retain"
			}), /* @__PURE__ */ react.default.createElement(Metric, {
				label: processText("summaryBudget"),
				value: tokensText(projected.summary),
				name: "draft-summary"
			}), current === null ? null : /* @__PURE__ */ react.default.createElement(Metric, {
				label: processText("currentUsage"),
				value: tokensText(current),
				name: "draft-current"
			}), /* @__PURE__ */ react.default.createElement(Metric, {
				label: processText("window"),
				value: tokensText(projected.window),
				name: "draft-window"
			})) : null, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-rows" }, /* @__PURE__ */ react.default.createElement(SettingRow, { label: processText("triggerHandle") }, (labelId) => /* @__PURE__ */ react.default.createElement(NumberField, {
				name: "thresholdRatio",
				label: processText("triggerHandle"),
				ratio: true,
				value: draft.thresholdRatio,
				labelledBy: labelId,
				inline: true,
				disabled,
				error: fieldError("thresholdRatio"),
				onChange: (thresholdRatio) => onDraft({ thresholdRatio })
			})), /* @__PURE__ */ react.default.createElement(SettingRow, {
				label: t("retainRecentShort"),
				desc: processText("retainHelp")
			}, (labelId) => /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-retain-control" }, /* @__PURE__ */ react.default.createElement("fieldset", { className: "dsh-bc-retain-choice" }, /* @__PURE__ */ react.default.createElement("legend", { className: "dsh-bc-sr-only" }, processText("retain")), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-segmented" }, [["ratio", processText("byRatio")], ["tokens", processText("fixed")]].map(([value, label]) => /* @__PURE__ */ react.default.createElement("label", {
				key: value,
				className: "dsh-bc-segment",
				"data-checked": draft.retainMode === value
			}, /* @__PURE__ */ react.default.createElement("input", {
				type: "radio",
				name: "retainMode",
				value,
				checked: draft.retainMode === value,
				disabled,
				onChange: () => onDraft({ retainMode: value })
			}), /* @__PURE__ */ react.default.createElement("span", null, label))))), draft.retainMode === "ratio" ? /* @__PURE__ */ react.default.createElement(NumberField, {
				name: "retainRatio",
				label: processText("retainHandle"),
				ratio: true,
				value: retainedRatioText,
				labelledBy: labelId,
				inline: true,
				disabled,
				error: fieldError("retainRatio"),
				onChange: (retainRatioValue) => onDraft({ retainRatio: retainRatioValue })
			}) : /* @__PURE__ */ react.default.createElement(NumberField, {
				name: "retainTokens",
				label: processText("tokens"),
				value: draft.retainTokens,
				labelledBy: labelId,
				inline: true,
				disabled,
				error: fieldError("retainTokens"),
				onChange: (retainTokens) => onDraft({ retainTokens })
			}))), /* @__PURE__ */ react.default.createElement(SettingRow, {
				label: processText("headroom"),
				desc: processText("headroomHelp")
			}, (labelId) => /* @__PURE__ */ react.default.createElement(NumberField, {
				name: "headroomTokens",
				label: processText("headroom"),
				value: draft.headroomTokens,
				labelledBy: labelId,
				inline: true,
				disabled,
				error: fieldError("headroomTokens"),
				onChange: (headroomTokens) => onDraft({ headroomTokens })
			})))) : null, projected?.policy ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-note",
				"data-bc": "process-override"
			}, processText("override")) : null, projected?.error ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-error",
				role: "alert",
				"data-bc": "budget-constraint"
			}, projected.error) : null);
		}
		/** Custom-mode instruction editor with one-click variable insertion. */
		function PromptEditor(props) {
			const { value, disabled, error } = props;
			const ref = react.default.useRef(null);
			const known = new Set(PROMPT_VARIABLES.map((entry) => entry.token));
			const unknown = [...new Set([...String(value).matchAll(UNKNOWN_PROMPT_TOKEN)].map((match) => match[1]).filter((token) => typeof token === "string" && !known.has(token)))];
			const insert = (token) => {
				const element = ref.current;
				const selectionStart = element === null || element === void 0 ? null : element.selectionStart;
				const selectionEnd = element === null || element === void 0 ? null : element.selectionEnd;
				const start = typeof selectionStart === "number" && Number.isInteger(selectionStart) ? selectionStart : String(value).length;
				const end = typeof selectionEnd === "number" && Number.isInteger(selectionEnd) ? selectionEnd : start;
				const next = String(value).slice(0, start) + token + String(value).slice(end);
				props.onChange(next);
				const position = start + token.length;
				const focus = () => {
					if (element === null || element === void 0) return;
					element.focus?.();
					element.setSelectionRange?.(position, position);
				};
				if (typeof requestAnimationFrame === "function") requestAnimationFrame(focus);
				else focus();
			};
			return /* @__PURE__ */ react.default.createElement(Section, {
				name: "prompt",
				dataBc: "prompt",
				title: processText("promptTitle"),
				aside: /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-chip" }, processText("promptRequired"))
			}, /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-note" }, processText("promptIntro")), /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-prompt-toolbar",
				role: "toolbar",
				"aria-label": processText("promptVariables")
			}, PROMPT_VARIABLES.map((entry) => /* @__PURE__ */ react.default.createElement("button", {
				key: entry.token,
				type: "button",
				className: "dsh-bc-chip dsh-bc-variable",
				"data-bc": "prompt-variable-" + entry.token,
				title: t("processpromptVariables") + " {{" + entry.token + "}}",
				disabled,
				onMouseDown: (event) => event.preventDefault(),
				onClick: () => insert("{{" + entry.token + "}}")
			}, t(VARIABLE_LABEL_KEYS[entry.token]) + " {{" + entry.token + "}}"))), /* @__PURE__ */ react.default.createElement("textarea", {
				ref,
				id: "dsh-bc-custom-prompt",
				name: "customPrompt",
				className: "dsh-bc-textarea",
				rows: 6,
				maxLength: PROMPT_MAX_CHARS,
				value,
				disabled,
				placeholder: processText("promptPlaceholder"),
				"aria-invalid": error ? true : void 0,
				"aria-describedby": error ? "dsh-bc-custom-prompt-error" : void 0,
				onChange: (event) => props.onChange(event.target.value)
			}), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-prompt-foot" }, /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-caption dsh-bc-mono",
				"data-bc": "prompt-counter"
			}, processText("promptCounter").replace("{count}", String(String(value).length))), unknown.length > 0 ? /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-warn",
				role: "status",
				"data-bc": "prompt-warning"
			}, processText("promptUnknown").replace("{tokens}", unknown.map((token) => "{{" + token + "}}").join(", "))) : null), error ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-error",
				id: "dsh-bc-custom-prompt-error",
				role: "alert"
			}, error) : null, /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-caption" }, processText("promptPrivacy")));
		}
		/** Editable compaction surface: capacity, strategy, generation and prompt. */
		function ProcessEditor(props) {
			const { draft, disabled, projection: projected } = props;
			const fieldError = props.fieldError;
			/** The image attachment only applies to the two summarising modes. */
			const summaryImageApplies = draft.mode === "goal" || draft.mode === "custom";
			const changeMode = (mode) => {
				if (mode === "custom" && String(draft.customPrompt).trim() === "") {
					props.onDraft({
						mode,
						customPrompt: DEFAULT_CUSTOM_PROMPT
					});
					return;
				}
				props.onDraft({ mode });
			};
			return /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-editor",
				"data-bc": "process-editor",
				"data-bc-section": "process"
			}, /* @__PURE__ */ react.default.createElement(CapacitySection, {
				...props,
				projected
			}), /* @__PURE__ */ react.default.createElement(Section, {
				name: "strategy",
				dataBc: "strategy",
				title: processText("strategyTitle")
			}, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-strategy-layout" }, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-strategy-choice" }, /* @__PURE__ */ react.default.createElement(ModeCards, {
				value: draft.mode,
				disabled,
				onChange: changeMode
			})), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-strategy-figure" }, /* @__PURE__ */ react.default.createElement(CompactionFlow, {
				mode: draft.mode,
				draft,
				projected,
				preview: props.preview,
				fixedTokens: props.budget?.fixedTokens
			}))), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-strategy-extra" }, draft.mode !== "native" ? /* @__PURE__ */ react.default.createElement(Toggle, {
				name: "cachePriority",
				label: processText("cache"),
				help: processText("cacheHelp"),
				checked: draft.cachePriority,
				disabled,
				onChange: (cachePriority) => props.onDraft({ cachePriority })
			}) : null, /* @__PURE__ */ react.default.createElement(Toggle, {
				name: "summaryImage",
				label: t("summaryImage"),
				title: t("summaryImageHint"),
				help: t("summaryImageHelp"),
				checked: draft.summaryImage,
				disabled: disabled || !summaryImageApplies,
				onChange: (summaryImage) => props.onDraft({ summaryImage })
			}), /* @__PURE__ */ react.default.createElement(SummaryFontControl, null))), /* @__PURE__ */ react.default.createElement(Section, {
				name: "generation",
				dataBc: "generation",
				title: processText("generationTitle")
			}, /* @__PURE__ */ react.default.createElement(ModelSection, {
				draft,
				routes: props.routes ?? [],
				route: props.route,
				target: props.target,
				disabled,
				fieldError,
				onDraft: props.onDraft,
				onProvider: props.onProvider,
				onModel: props.onModel,
				routeWarning: props.routeWarning,
				modelsStatus: props.modelsStatus,
				modelsEnabled: props.modelsEnabled,
				modelsError: props.modelsError
			}), /* @__PURE__ */ react.default.createElement(SettingRow, {
				label: processText("summaryCap"),
				desc: processText("followHeadroom")
			}, (labelId) => /* @__PURE__ */ react.default.createElement(NumberField, {
				name: "maxTokens",
				label: processText("summaryCap"),
				value: draft.maxTokens,
				min: 1,
				labelledBy: labelId,
				inline: true,
				disabled,
				error: fieldError("maxTokens"),
				onChange: (maxTokens) => props.onDraft({ maxTokens })
			}))), draft.mode === "custom" ? /* @__PURE__ */ react.default.createElement(PromptEditor, {
				value: draft.customPrompt,
				disabled,
				error: fieldError("customPrompt"),
				onChange: (customPrompt) => props.onDraft({ customPrompt })
			}) : null);
		}
		function RuntimeBudget(props) {
			const { budget, preview } = props;
			if (props.engineApplies === false) return null;
			const remaining = typeof budget?.thresholdTokens === "number" && Number.isFinite(budget.thresholdTokens) && typeof budget?.currentTokens === "number" && Number.isFinite(budget.currentTokens) ? budget.thresholdTokens - budget.currentTokens : null;
			const conclusion = props.activeConfig?.auto === false ? t("conclusionAutoOff") : remaining === null ? t("conclusionNoUsage") : remaining > 0 ? t("conclusionRemaining", { remaining: tokensText(remaining) }) : t("conclusionReached");
			const measurement = budget?.measurement === "measured" ? t("measured") : budget?.measurement === "estimated" ? t("estimated") : t("measurementUnknown");
			const hasCut = typeof preview?.rangeStart === "number" && typeof preview?.rangeEnd === "number";
			return /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-runtime",
				"data-bc": "runtime-budget"
			}, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-subhead" }, /* @__PURE__ */ react.default.createElement("h4", { className: "dsh-bc-h4" }, conclusion), /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-chip",
				"data-bc": "measurement"
			}, measurement)), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-facts" }, /* @__PURE__ */ react.default.createElement(Metric, {
				label: t("runtimeWindow"),
				value: tokensText(budget?.contextWindow)
			}), /* @__PURE__ */ react.default.createElement(Metric, {
				label: t("currentContext"),
				value: tokensText(budget?.currentTokens),
				name: "current-tokens"
			}), /* @__PURE__ */ react.default.createElement(Metric, {
				label: t("runtimeTrigger"),
				value: tokensText(budget?.thresholdTokens),
				name: "runtime-trigger"
			}), /* @__PURE__ */ react.default.createElement(Metric, {
				label: t("runtimeMessageBudget"),
				value: tokensText(budget?.messageBudgetTokens)
			}), /* @__PURE__ */ react.default.createElement(Metric, {
				label: t("runtimeSummaryBudget"),
				value: tokensText(budget?.summaryMaxTokens)
			})), /* @__PURE__ */ react.default.createElement("div", { "data-bc": "runtime-preview" }, hasCut && preview ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-note",
				"data-bc": "safe-cut"
			}, t("safeCutWithBefore", {
				start: preview.rangeStart,
				end: preview.rangeEnd,
				before: tokensText(preview.beforeTokens),
				upper: tokensText(preview.afterUpperBoundTokens)
			})) : /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-caption",
				"data-bc": "no-safe-cut"
			}, t("noSafeCut"))));
		}
		function ModelSection(props) {
			const { draft, routes, route, disabled } = props;
			const native = draft.mode === "native";
			const custom = draft.provider !== "" && !routes.some((entry) => entry.provider === draft.provider && entry.model === draft.model);
			const [customOpen, setCustomOpen] = react.default.useState(custom);
			const showCustom = custom || customOpen;
			const textField = (name, label, value, onChange) => /* @__PURE__ */ react.default.createElement(Field, {
				name,
				label,
				error: props.fieldError(name)
			}, (id, aria) => /* @__PURE__ */ react.default.createElement("input", {
				...aria,
				id,
				name,
				className: "dsh-bc-input",
				value,
				disabled,
				onChange: (event) => onChange(event.target.value)
			}));
			return /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-process-model" }, /* @__PURE__ */ react.default.createElement(SettingRow, {
				label: t("summaryModel"),
				desc: processText("generationIntro")
			}, (labelId) => /* @__PURE__ */ react.default.createElement(Field, {
				name: "summaryRoute",
				label: t("summaryModel"),
				labelledBy: labelId,
				error: props.fieldError("summarizationModel")
			}, (id, aria) => /* @__PURE__ */ react.default.createElement(Select, {
				...aria,
				id,
				name: "summaryRoute",
				value: custom ? "custom" : draft.provider === "" ? customOpen ? "custom" : "" : JSON.stringify([draft.provider, draft.model]),
				disabled,
				onChange: (event) => {
					if (event.target.value === "custom") {
						setCustomOpen(true);
						return;
					}
					setCustomOpen(false);
					const [provider, model] = event.target.value === "" ? ["", ""] : JSON.parse(event.target.value);
					props.onDraft({
						provider,
						model
					});
				}
			}, /* @__PURE__ */ react.default.createElement("option", { value: "" }, t("followSessionModel") + (props.target ? " · " + props.target.provider + "/" + props.target.model : "")), routes.map((entry) => /* @__PURE__ */ react.default.createElement("option", {
				key: JSON.stringify([entry.provider, entry.model]),
				value: JSON.stringify([entry.provider, entry.model])
			}, entry.provider + "/" + entry.model)), /* @__PURE__ */ react.default.createElement("option", { value: "custom" }, custom ? draft.provider + "/" + draft.model : t("customModelOption"))))), !native ? /* @__PURE__ */ react.default.createElement(SettingRow, { label: t("reasoningEffort") }, (labelId) => /* @__PURE__ */ react.default.createElement(Field, {
				name: "reasoningEffort",
				label: t("reasoningEffort"),
				labelledBy: labelId,
				error: props.fieldError("reasoningEffort")
			}, (id, aria) => route ? /* @__PURE__ */ react.default.createElement(Select, {
				...aria,
				id,
				name: "reasoningEffort",
				value: draft.effort,
				disabled,
				onChange: (event) => props.onDraft({ effort: event.target.value })
			}, /* @__PURE__ */ react.default.createElement("option", { value: "" }, route.defaultEffort ? t("modelDefaultWith", { effort: route.defaultEffort }) : t("modelDefault")), route.efforts.map((effort) => /* @__PURE__ */ react.default.createElement("option", {
				key: effort,
				value: effort
			}, effort)), draft.effort !== "" && !route.efforts.includes(draft.effort) ? /* @__PURE__ */ react.default.createElement("option", { value: draft.effort }, t("unsupportedEffortOption", { effort: draft.effort })) : null) : /* @__PURE__ */ react.default.createElement("input", {
				...aria,
				id,
				name: "reasoningEffort",
				className: "dsh-bc-input",
				value: draft.effort,
				disabled,
				placeholder: t("effortUnknownPlaceholder"),
				onChange: (event) => props.onDraft({ effort: event.target.value })
			}))) : null, showCustom ? /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-custom-model",
				"data-bc": "custom-model"
			}, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-grid" }, textField("summarizationProvider", t("provider"), draft.provider, props.onProvider), textField("summarizationModel", t("model"), draft.model, props.onModel))) : null, props.routeWarning ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-note",
				"data-bc": "route-warning"
			}, props.routeWarning) : null, props.modelsStatus === "loading" || props.modelsStatus === "refreshing" ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-caption",
				role: "status"
			}, t("modelsLoading")) : props.modelsStatus === "error" ? /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-note" }, t("modelsFailed")) : null);
		}
		function AdvancedSection(props) {
			const { draft, disabled } = props;
			const defaults = {
				compactionRetries: "1",
				maxOverflowRetries: "1"
			};
			const names = {
				compactionRetries: t("pressureRetry"),
				maxOverflowRetries: t("overflowRecovery")
			};
			const customized = Object.keys(defaults).filter((key) => draft[key] !== defaults[key]).map((key) => names[key]);
			if (draft.policies.length) customized.push(draft.policies.length + " × " + t("policies"));
			const updatePolicy = (index, patch) => props.onDraft({ policies: draft.policies.map((entry, i) => i === index ? {
				...entry,
				...patch
			} : entry) });
			const draftScalar = (key) => {
				const value = draft[key];
				return typeof value === "string" ? value : "";
			};
			const policyField = (index, key, label, ratio, inherited) => {
				const policy = draft.policies[index];
				return /* @__PURE__ */ react.default.createElement(NumberField, {
					name: "policies." + index + "." + key,
					label,
					ratio,
					value: policy[key],
					disabled,
					help: policy[key] === "" && inherited !== void 0 ? t("inheritWith", { value: ratio ? ratioText(Number(inherited)) : key.includes("Retries") ? inherited + " " + t("timesUnit") : tokensText(Number(inherited)) }) : void 0,
					error: props.fieldError("policies." + index + "." + key),
					onChange: (value) => updatePolicy(index, { [key]: value })
				});
			};
			const policyText = (index, key, label) => {
				const policy = draft.policies[index];
				return /* @__PURE__ */ react.default.createElement(Field, {
					name: "policies." + index + "." + key,
					label,
					error: props.fieldError("policies." + index + "." + key)
				}, (id, aria) => /* @__PURE__ */ react.default.createElement("input", {
					...aria,
					id,
					name: "policies." + index + "." + key,
					className: "dsh-bc-input",
					value: policy[key],
					disabled,
					onChange: (event) => updatePolicy(index, { [key]: event.target.value })
				}));
			};
			return /* @__PURE__ */ react.default.createElement("details", {
				className: "dsh-bc-details",
				onKeyDown: collapseDetails,
				"data-bc": "advanced"
			}, /* @__PURE__ */ react.default.createElement("summary", null, /* @__PURE__ */ react.default.createElement("span", null, processText("advancedRules")), customized.length ? /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-caption",
				"data-bc": "advanced-summary"
			}, t("advancedCount", { count: customized.length }) + " · " + customized.join(" · ")) : /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-caption" }, processText("advancedDefault"))), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-details-body" }, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-grid" }, draft.auto ? /* @__PURE__ */ react.default.createElement(react.default.Fragment, null, /* @__PURE__ */ react.default.createElement(NumberField, {
				name: "compactionRetries",
				label: t("pressureRetry"),
				unit: t("timesUnit"),
				value: draft.compactionRetries,
				disabled,
				error: props.fieldError("compactionRetries"),
				onChange: (compactionRetries) => props.onDraft({ compactionRetries })
			}), /* @__PURE__ */ react.default.createElement(NumberField, {
				name: "maxOverflowRetries",
				label: t("overflowRecovery"),
				unit: t("timesUnit"),
				value: draft.maxOverflowRetries,
				disabled,
				error: props.fieldError("maxOverflowRetries"),
				onChange: (maxOverflowRetries) => props.onDraft({ maxOverflowRetries })
			})) : null), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-subhead" }, /* @__PURE__ */ react.default.createElement("h4", { className: "dsh-bc-h4" }, t("policies")), /* @__PURE__ */ react.default.createElement("button", {
				type: "button",
				className: "dsh-bc-btn",
				disabled,
				"data-bc": "add-policy",
				onClick: () => props.onDraft({ policies: [...draft.policies, policyDraft()] })
			}, t("addRule"))), draft.policies.length === 0 ? /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-caption" }, t("allModelsGlobal")) : null, draft.policies.map((policy, index) => /* @__PURE__ */ react.default.createElement("div", {
				key: index,
				className: "dsh-bc-policy-card",
				"data-bc-policy": index
			}, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-policy-head" }, /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-mono" }, policy.provider && policy.model ? policy.provider + "/" + policy.model : t("newRule")), /* @__PURE__ */ react.default.createElement("button", {
				type: "button",
				className: "dsh-bc-btn dsh-bc-btn-remove",
				disabled,
				"aria-label": t("deleteRule", { index: index + 1 }),
				onClick: () => props.onDraft({ policies: draft.policies.filter((_, i) => i !== index) })
			}, t("deleteRuleShort"))), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-policy-body" }, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-grid" }, policyText(index, "provider", t("sessionProvider")), policyText(index, "model", t("sessionModel")), POLICY_NUMBERS.filter(([key]) => draft.auto || ![
				"thresholdRatio",
				"compactionRetries",
				"maxOverflowRetries"
			].includes(key)).map(([key, labelKey, ratio]) => /* @__PURE__ */ react.default.createElement(react.default.Fragment, { key }, policyField(index, key, t(labelKey), ratio === true, key === "maxTokens" ? draft.maxTokens || policy.headroomTokens || draft.headroomTokens : draftScalar(key)))), draft.auto ? /* @__PURE__ */ react.default.createElement(react.default.Fragment, null, /* @__PURE__ */ react.default.createElement(Field, {
				name: "policies." + index + ".retainMode",
				label: t("retainRecent")
			}, (id, aria) => /* @__PURE__ */ react.default.createElement(Select, {
				...aria,
				id,
				name: "policies." + index + ".retainMode",
				value: policy.retainMode,
				disabled,
				onChange: (event) => updatePolicy(index, { retainMode: event.target.value })
			}, /* @__PURE__ */ react.default.createElement("option", { value: "inherit" }, t("inheritWith", { value: draft.retainMode === "tokens" ? tokensText(Number(draft.retainTokens)) : ratioText(draft.retainRatio === "" ? DEFAULT_RETAIN_RATIO : Number(draft.retainRatio)) })), /* @__PURE__ */ react.default.createElement("option", { value: "ratio" }, t("byMessageBudgetRatio")), /* @__PURE__ */ react.default.createElement("option", { value: "tokens" }, t("fixedTokenCount")))), policy.retainMode !== "inherit" ? policyField(index, policy.retainMode === "ratio" ? "retainRatio" : "retainTokens", policy.retainMode === "ratio" ? t("retainRatio") : t("retainTokens"), policy.retainMode === "ratio", policy.retainMode === "ratio" ? draft.retainRatio || String(.16) : void 0) : props.fieldError("policies." + index + ".retainRatio") ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-error",
				role: "alert"
			}, props.fieldError("policies." + index + ".retainRatio")) : null) : null, /* @__PURE__ */ react.default.createElement(Field, {
				name: "policies." + index + ".summaryMode",
				label: t("policySummaryMode")
			}, (id, aria) => /* @__PURE__ */ react.default.createElement(Select, {
				...aria,
				id,
				name: "policies." + index + ".summaryMode",
				value: policy.summaryMode,
				disabled,
				onChange: (event) => updatePolicy(index, { summaryMode: event.target.value })
			}, /* @__PURE__ */ react.default.createElement("option", { value: "inherit" }, t("policySummaryInherit", { value: draft.provider ? draft.provider + "/" + draft.model : t("followSessionModel") })), /* @__PURE__ */ react.default.createElement("option", { value: "session" }, t("policySummarySession")), /* @__PURE__ */ react.default.createElement("option", { value: "custom" }, t("policySummaryCustom")))), policy.summaryMode === "custom" ? /* @__PURE__ */ react.default.createElement(react.default.Fragment, null, policyText(index, "summarizationProvider", t("summaryProvider")), policyText(index, "summarizationModel", t("summaryModel"))) : null))))));
		}
		const STATUS_KEYS = Object.freeze({
			running: "statusRunning",
			completed: "statusCompleted",
			failed: "statusFailed",
			cancelled: "statusCancelled",
			"persistence-error": "statusPersistenceError"
		});
		/** One-line engine ownership statement. */
		function engineNote(engine) {
			if (engine === null || engine === void 0) return t("engineUnknown");
			if (engine.inspectApplies === false) return t("engineForeign", { owner: engine.owner });
			if (engine.owner === "unknown") return t("engineOwnerUnknown");
			return t("engineOwner", { owner: engine.owner });
		}
		/** The status of the last real native compaction bracket. */
		function LastCompaction(props) {
			const record = props.record;
			if (!record) return /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-caption",
				"data-bc": props.emptyName ?? "last-compaction-empty"
			}, props.emptyText);
			const trigger = record.trigger === "manual" ? t("triggerManual") : record.trigger === "automatic" ? t("triggerAutomatic") : t("triggerUnknown");
			const recordMode = modeMeta(record.mode);
			return /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-status-record",
				"data-bc": "last-compaction",
				"data-status": record.status
			}, /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-status-line dsh-bc-status-" + record.status }, t(STATUS_KEYS[record.status] ?? "unknown") + " · " + trigger), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-status-grid" }, /* @__PURE__ */ react.default.createElement(Row, {
				label: t("strategyLabel"),
				value: recordMode ? t(recordMode.labelKey) : t("unknown")
			}), /* @__PURE__ */ react.default.createElement(Row, {
				label: t("duration"),
				value: durationText(record.durationMs)
			}), /* @__PURE__ */ react.default.createElement(Row, {
				label: t("replacedMessages"),
				value: tokensText(record.beforeTokens)
			}), /* @__PURE__ */ react.default.createElement(Row, {
				label: t("summaryEstimate"),
				value: tokensText(record.afterTokens)
			}), /* @__PURE__ */ react.default.createElement(Row, {
				label: t("cacheRead"),
				value: tokensText(record.cacheReadTokens)
			}), /* @__PURE__ */ react.default.createElement(Row, {
				label: t("cacheWrite"),
				value: tokensText(record.cacheWriteTokens)
			})), record.status === "persistence-error" ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-error",
				role: "alert",
				"data-bc": "persistence-error"
			}, t("persistenceFailed")) : null, record.error ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-error",
				role: "alert"
			}, record.error) : null);
		}
		function StatusSection(props) {
			const reasons = [...new Set([...props.diagnostics ?? [], ...props.reasons ?? []].filter((entry) => typeof entry === "string" && entry !== ""))];
			return /* @__PURE__ */ react.default.createElement("details", {
				className: "dsh-bc-details",
				"data-bc": "diagnostics",
				"data-bc-section": "diagnostics",
				onKeyDown: collapseDetails
			}, /* @__PURE__ */ react.default.createElement("summary", null, /* @__PURE__ */ react.default.createElement("span", null, t("statusSection")), /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-caption" }, t("statusReadOnly"))), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-details-body" }, props.inspectError ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-error",
				role: "alert"
			}, t("diagnosticsFailed", { message: props.inspectError })) : props.inspectLoading ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-note",
				role: "status",
				"aria-busy": true
			}, t("readingDiagnostics")) : props.sessionId === "" ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-caption",
				"data-bc": "status-empty"
			}, t("statusEmpty")) : /* @__PURE__ */ react.default.createElement(react.default.Fragment, null, /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-caption",
				"data-bc": "engine-note"
			}, engineNote(props.engine)), /* @__PURE__ */ react.default.createElement(RuntimeBudget, props), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-budget-view" }, /* @__PURE__ */ react.default.createElement("h4", { className: "dsh-bc-h4" }, t("lastCompaction")), /* @__PURE__ */ react.default.createElement(LastCompaction, {
				record: props.record,
				emptyText: t("noCompaction")
			})), props.continuation ? /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-continuation",
				"data-bc": "handoff-continuation"
			}, /* @__PURE__ */ react.default.createElement("h4", { className: "dsh-bc-h4" }, t("handoffContinuation")), /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-note" }, props.continuation.status === "scheduled" ? t("continuationScheduled") : t("continuationSkipped")), props.continuation.blockers?.length ? /* @__PURE__ */ react.default.createElement("ul", { className: "dsh-bc-bullets" }, props.continuation.blockers.map((item, index) => /* @__PURE__ */ react.default.createElement("li", { key: index }, item))) : null) : null), reasons.length ? /* @__PURE__ */ react.default.createElement(Explain, {
				name: "diagnostics-details",
				title: t("diagnosticsDetails", { count: reasons.length })
			}, /* @__PURE__ */ react.default.createElement(ReasonList, { reasons })) : null));
		}
		function SessionPicker(props) {
			const id = "dsh-bc-session-" + react.default.useId().replace(/[^a-zA-Z0-9_-]/g, "");
			return /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-session",
				"data-bc": "session-picker"
			}, /* @__PURE__ */ react.default.createElement("label", {
				id: id + "-label",
				htmlFor: id,
				className: "dsh-bc-label"
			}, t("session")), /* @__PURE__ */ react.default.createElement(Select, {
				id,
				name: "inspectSession",
				"aria-labelledby": id + "-label",
				value: props.selectedId,
				disabled: props.phase === "pending" || props.entries.length === 0,
				onChange: (event) => props.onSelect(event.target.value),
				title: t("selectSessionTitle")
			}, /* @__PURE__ */ react.default.createElement("option", { value: "" }, props.phase === "pending" ? t("loadingSessions") : props.entries.length === 0 ? t("noSessions") : t("selectSession")), props.entries.map((entry) => /* @__PURE__ */ react.default.createElement("option", {
				key: entry.id,
				value: entry.id
			}, entry.title + (entry.running ? t("runningSuffix") : "")))), /* @__PURE__ */ react.default.createElement("button", {
				type: "button",
				className: "dsh-bc-btn",
				onClick: props.onRefresh,
				disabled: props.refresh,
				"aria-busy": props.refresh,
				"aria-label": t("refreshDiagnostics")
			}, props.refresh ? t("reading") : t("refresh")), props.listError ? /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-error" }, t("sessionListFailed")) : null);
		}
		function ActiveConfigBanner(props) {
			const active = props.activeConfig;
			if (props.requiresReload !== true) return null;
			const activeMode = active ? modeMeta(active.mode) : void 0;
			return /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-banner",
				"data-bc": "active-config",
				"data-requires-reload": String(props.requiresReload)
			}, /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-chip",
				"data-tone": "accent"
			}, t("activeDiffers")), /* @__PURE__ */ react.default.createElement(Explain, { title: t("viewActiveConfig") }, active ? /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-status-grid" }, /* @__PURE__ */ react.default.createElement(Row, {
				label: t("runtimeMode"),
				value: activeMode ? t(activeMode.labelKey) : active.mode
			}), /* @__PURE__ */ react.default.createElement(Row, {
				label: t("runtimeSummaryModel"),
				value: active.summarizationProvider ? active.summarizationProvider + "/" + active.summarizationModel : t("followSession"),
				mono: true
			}), /* @__PURE__ */ react.default.createElement(Row, {
				label: t("runtimeThreshold"),
				value: ratioText(active.thresholdRatio)
			}), /* @__PURE__ */ react.default.createElement(Row, {
				label: t("runtimeRetain"),
				value: active.retainTokens != null ? tokensText(active.retainTokens) : ratioText(active.retainRatio)
			})) : null));
		}
		function SaveFooter(props) {
			const [discardTarget, setDiscardTarget] = react.default.useState(null);
			const discardArmed = discardTarget === props.draft;
			const saving = props.saving || props.saveState.kind === "saving";
			const disabled = props.disabled || saving || props.conflict || !props.writable || !props.dirty || props.errors.length > 0;
			const failure = props.saveState.kind === "transport" ? t("saveFailed", { message: props.saveState.message }) : props.saveState.kind === "rejected" ? t("saveRejected") : props.conflict ? t("saveConflict") : null;
			if (!props.dirty && !props.conflict) return null;
			return /* @__PURE__ */ react.default.createElement("footer", {
				className: "dsh-bc-footer",
				"data-bc": "save-footer",
				"aria-busy": saving
			}, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-footer-copy" }, failure ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-error",
				role: "alert",
				"data-bc": props.conflict ? "revision-conflict" : props.saveState.kind === "rejected" ? "save-rejected" : "save-transport"
			}, failure) : /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-note",
				role: "status",
				"data-bc": !props.writable ? "read-only" : props.saveState.kind === "saved" ? "save-saved" : "save-status"
			}, !props.writable ? t("readOnlyConfig") : t("saveChanges", { count: props.changeCount })), props.errors.length ? /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-footer-errors",
				role: "alert",
				"data-bc": "save-errors"
			}, /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-error" }, t("fixErrors", { count: props.errors.length })), /* @__PURE__ */ react.default.createElement("ul", { className: "dsh-bc-reasons" }, props.errors.map((message, index) => /* @__PURE__ */ react.default.createElement("li", { key: index }, message)))) : null), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-actions" }, /* @__PURE__ */ react.default.createElement("button", {
				type: "button",
				className: "dsh-bc-btn",
				onClick: () => {
					if (props.changeCount > 3 && !discardArmed) setDiscardTarget(props.draft);
					else props.onReload();
				},
				disabled: saving || !props.dirty && !props.conflict
			}, discardArmed ? t("discardAgain") : props.conflict ? t("reload") : t("discard")), /* @__PURE__ */ react.default.createElement("button", {
				type: "button",
				className: "dsh-bc-btn dsh-bc-btn-primary",
				onClick: props.onSave,
				disabled,
				"data-bc": "save-button",
				"aria-busy": saving
			}, saving ? t("saving") : t("save"))));
		}
		/**
		* Fixed-font control: the installed state plus the one action that installs it.
		*
		* It lives next to the summary-image switch because that switch is why the face
		* exists: with `summaryImage` on, compaction draws the checkpoint with this face
		* and fails closed until it is installed.
		* @returns the status line, the action button and any failure.
		*/
		function SummaryFontControl() {
			const font = useFontAsset();
			const installed = font.status?.installed === true;
			const busy = font.installing;
			const status = font.loading ? t("fontChecking") : installed ? t("fontInstalled", {
				family: font.status?.family ?? "",
				version: font.status?.version ?? "",
				size: megabytes(font.status?.bytes ?? null)
			}) : t("fontMissing");
			return /* @__PURE__ */ react.default.createElement("div", { "data-bc": "summary-font" }, /* @__PURE__ */ react.default.createElement(SettingRow, {
				label: t("fontRow"),
				desc: /* @__PURE__ */ react.default.createElement("span", { "data-bc": "font-status" }, status)
			}, () => /* @__PURE__ */ react.default.createElement("button", {
				type: "button",
				className: "dsh-bc-btn",
				"data-bc": "font-download",
				disabled: busy || font.loading,
				"aria-busy": busy,
				onClick: () => {
					font.install(installed);
				}
			}, busy ? t("fontDownloading") : installed ? t("fontRedownload") : t("fontDownload"))), font.error === null ? null : /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-caption dsh-bc-font-error",
				role: "alert",
				"data-bc": "font-error"
			}, font.error));
		}
		/**
		* Format a byte count for the status line.
		* @param bytes - installed font size, or null.
		* @returns a one-decimal megabyte figure, or an em dash.
		*/
		function megabytes(bytes) {
			if (bytes === null || !Number.isFinite(bytes) || bytes <= 0) return "—";
			return (bytes / 1048576).toFixed(1) + " MB";
		}
		// src/client/page.tsx
		/**
		* dsh-better-compact — the settings page.
		*
		* The Host owns the configuration form (form.state + form.mutate CAS) and this
		* module renders the visual editor around it. Saving goes exclusively through
		* form.mutate(ops, revision): there is no plugin-owned write HTTP route.
		*
		* Behaviour is byte-for-byte the pre-TypeScript src/client.js; only types are new.
		*/
		/** Compare the draft with the saved value field by field (page-level change count). */
		function countChangedFields(draft, current) {
			if (draft === null) return 0;
			const left = draft;
			const right = current;
			return Object.keys(left).filter((key) => JSON.stringify(left[key]) !== JSON.stringify(right[key])).length;
		}
		function BetterCompactPage(props) {
			const form = props.form;
			const state = form !== void 0 && form !== null ? form.state : void 0;
			const formStatus = state !== void 0 && state !== null && typeof state.status === "string" ? state.status : "missing";
			const writable = state !== void 0 && state !== null && state.writable === true;
			const sessionList = useSessionList(props.sessions ?? null);
			const entries = react.default.useMemo(() => sessionEntries(sessionList), [sessionList]);
			const [pickedId, setPickedId] = react.default.useState(null);
			const availableIds = react.default.useMemo(() => new Set(entries.map((entry) => entry.id)), [entries]);
			const selectedId = pickedId === null ? entries.length > 0 ? entries[0]?.id ?? "" : "" : availableIds.has(pickedId) ? pickedId : "";
			const [refreshToken, setRefreshToken] = react.default.useState(0);
			const [draft, setDraft] = react.default.useState(() => formStatus === "ready" ? draftFromValue(state?.value) : null);
			const [draftRevision, setDraftRevision] = react.default.useState(() => formStatus === "ready" ? state?.revision ?? null : null);
			const baseValueRef = react.default.useRef(formStatus === "ready" ? state?.value ?? {} : null);
			const [conflict, setConflict] = react.default.useState(false);
			const [saveState, setSaveState] = react.default.useState({ kind: "idle" });
			const [saving, setSaving] = react.default.useState(false);
			const pluginInspect = useReadOnlyJson(INSPECT_PATH, refreshToken);
			const sessionInspect = useReadOnlyJson(selectedId === "" ? null : INSPECT_PATH + "?sessionId=" + encodeURIComponent(selectedId), refreshToken);
			const modelsInspect = useReadOnlyJson(MODELS_PATH, refreshToken);
			react.default.useEffect(() => {
				if (formStatus !== "ready" || state === void 0 || state === null) return;
				const value = state.value ?? {};
				const revision = state.revision ?? null;
				if (draft === null) {
					baseValueRef.current = value;
					setDraft(draftFromValue(value));
					setDraftRevision(revision);
					return;
				}
				if (revision === draftRevision) return;
				const incoming = draftFromValue(value);
				const untouched = equalDraft(draft, draftFromValue(baseValueRef.current ?? {}));
				if (equalDraft(draft, incoming) || untouched) {
					baseValueRef.current = value;
					setDraft(incoming);
					setDraftRevision(revision);
					setConflict(false);
					return;
				}
				setConflict(true);
			}, [
				formStatus,
				state,
				draft,
				draftRevision
			]);
			const activePayload = pluginInspect.payload;
			const dataPayload = selectedId === "" ? pluginInspect.payload : sessionInspect.payload;
			const activeConfig = activePayload !== null && activePayload !== void 0 ? activePayload.activeConfig ?? null : null;
			const requiresReload = activePayload !== null && activePayload !== void 0 && typeof activePayload.requiresReload === "boolean" ? activePayload.requiresReload : null;
			const inspectError = selectedId === "" ? pluginInspect.status === "error" ? pluginInspect.error : null : sessionInspect.status === "error" ? sessionInspect.error : pluginInspect.status === "error" ? pluginInspect.error : null;
			const inspectLoading = selectedId === "" ? pluginInspect.status === "loading" || pluginInspect.status === "refreshing" : sessionInspect.status === "loading" || sessionInspect.status === "refreshing";
			const engine = dataPayload !== null && dataPayload !== void 0 ? dataPayload.engine ?? null : null;
			const engineApplies = engine !== null && engine.inspectApplies === false ? false : null;
			const budget = engineApplies === false ? null : dataPayload !== null && dataPayload !== void 0 ? dataPayload.budget ?? null : null;
			const preview = engineApplies === false ? null : dataPayload !== null && dataPayload !== void 0 ? dataPayload.preview ?? null : null;
			const lastCompaction = dataPayload !== null && dataPayload !== void 0 ? dataPayload.lastCompaction ?? null : null;
			const handoffContinuation = dataPayload !== null && dataPayload !== void 0 ? dataPayload.handoffContinuation ?? null : null;
			const diagnostics = dataPayload !== null && dataPayload !== void 0 && Array.isArray(dataPayload.diagnostics) ? dataPayload.diagnostics : [];
			const modelsReady = modelsInspect.status === "ready" && modelsInspect.payload !== null && modelsInspect.payload !== void 0;
			const modelsPayload = modelsInspect.payload;
			const routes = (modelsReady && modelsPayload !== null && modelsPayload !== void 0 && Array.isArray(modelsPayload.routes) ? modelsPayload.routes : []).filter((entry) => entry !== null && typeof entry === "object" && typeof entry.provider === "string" && entry.provider.length > 0 && typeof entry.model === "string" && entry.model.length > 0).map((entry) => ({
				provider: entry.provider,
				model: entry.model,
				efforts: Array.isArray(entry.efforts) ? entry.efforts.filter((effort) => typeof effort === "string" && effort.length > 0) : [],
				defaultEffort: typeof entry.defaultEffort === "string" ? entry.defaultEffort : ""
			}));
			const modelsEnabled = modelsReady && modelsPayload !== null && modelsPayload !== void 0 && modelsPayload.enabled === true;
			const modelsError = modelsInspect.status === "error" ? modelsInspect.error : null;
			const budgetTarget = budget?.target ?? null;
			const currentDraft = draftFromValue(formStatus === "ready" && state !== void 0 && state !== null ? state.value ?? {} : {});
			const dirty = draft !== null && !equalDraft(draft, currentDraft);
			const draftErrors = draft === null ? [] : validateDraft(draft);
			const projection = draft !== null && draftErrors.length === 0 && engineApplies !== false && inspectError === null && !inspectLoading ? projectDraftBudget(draft, budget) : null;
			const baseErrors = [...draftErrors];
			if (projection !== null && projection.error !== null && draft !== null) {
				const index = projection.policy ? draft.policies.indexOf(projection.policy) : -1;
				baseErrors.push({
					field: (index < 0 ? "" : "policies." + index + ".") + (projection.pressure <= 0 ? "headroomTokens" : projection.policy?.retainMode === "tokens" || (!projection.policy || projection.policy.retainMode === "inherit") && draft.retainMode === "tokens" ? "retainTokens" : "retainRatio"),
					message: projection.error
				});
			}
			const modelErrors = draft === null ? [] : validateModelSelection(draft, routes, modelsReady && modelsEnabled === true, budgetTarget);
			const errors = [...baseErrors.map((entry) => entry.message), ...modelErrors.map((entry) => entry.message)];
			const fieldError = (field) => {
				const found = [...baseErrors, ...modelErrors].find((entry) => entry.field === field);
				return found === void 0 ? void 0 : found.message;
			};
			const draftRoute = draft === null ? void 0 : routeForDraft(draft, routes) ?? (draft.provider === "" && budgetTarget ? routes.find((entry) => entry.provider === budgetTarget.provider && entry.model === budgetTarget.model) : void 0);
			const routeWarning = draft === null ? null : routeCandidateWarning(draft, routes, modelsReady && modelsEnabled === true);
			const savingNow = saving || saveState.kind === "saving";
			const updateDraft = (patch) => {
				setDraft((previous) => previous === null ? previous : {
					...previous,
					...patch
				});
				setSaveState({ kind: "idle" });
			};
			const reloadHost = () => {
				if (formStatus !== "ready" || state === void 0 || state === null) return;
				baseValueRef.current = state.value ?? {};
				setDraft(draftFromValue(state.value ?? {}));
				setDraftRevision(state.revision ?? null);
				setConflict(false);
				setSaveState({ kind: "idle" });
			};
			const save = async () => {
				if (draft === null || state === void 0 || state === null || !writable || savingNow) return;
				if (conflict || (state.revision ?? null) !== draftRevision) {
					setConflict(true);
					return;
				}
				if (equalDraft(draft, draftFromValue(state.value ?? {}))) {
					setSaveState({ kind: "idle" });
					return;
				}
				if (errors.length > 0) {
					setSaveState({
						kind: "invalid",
						errors
					});
					return;
				}
				const ops = buildOps(draft, state.value ?? {});
				if (ops.length === 0) {
					setSaveState({ kind: "idle" });
					return;
				}
				const mutate = form !== void 0 && form !== null ? form.mutate : void 0;
				if (form === void 0 || form === null || typeof mutate !== "function") {
					setSaveState({
						kind: "transport",
						message: "the Host form does not expose mutate()"
					});
					return;
				}
				setSaving(true);
				setSaveState({ kind: "saving" });
				try {
					if (await mutate.call(form, ops, draftRevision) === false) {
						setSaveState({ kind: "rejected" });
						setRefreshToken((token) => token + 1);
						return;
					}
					setSaveState({ kind: "saved" });
					setRefreshToken((token) => token + 1);
				} catch (error) {
					setSaveState({
						kind: "transport",
						message: errorMessage(error)
					});
				} finally {
					setSaving(false);
				}
			};
			react.default.useEffect(() => {
				if (saveState.kind !== "saved" || typeof setTimeout !== "function") return;
				const timer = setTimeout(() => setSaveState({ kind: "idle" }), 4e3);
				return () => clearTimeout(timer);
			}, [saveState.kind]);
			const refresh = () => setRefreshToken((token) => token + 1);
			const listError = sessionList?.error ?? null;
			const sessionControl = /* @__PURE__ */ react.default.createElement(SessionPicker, {
				entries,
				selectedId,
				onSelect: setPickedId,
				phase: sessionList.phase ?? "ready",
				listError,
				refresh: inspectLoading,
				onRefresh: refresh
			});
			const statusProps = {
				sessionId: selectedId,
				engine,
				engineApplies,
				activeConfig,
				budget,
				preview,
				record: lastCompaction,
				continuation: handoffContinuation,
				diagnostics,
				inspectError,
				inspectLoading,
				reasons: preview?.reason && !diagnostics.includes(preview.reason) ? [preview.reason] : []
			};
			const pageStyle = /* @__PURE__ */ react.default.createElement("style", { key: "dsh-bc-style" }, STYLE);
			const title = /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-page-head",
				key: "head"
			}, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-page-titleBlock" }, /* @__PURE__ */ react.default.createElement("h2", { className: "dsh-bc-title" }, t("title")), /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-page-sub" }, t("purpose"))), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-page-chips" }, formStatus === "ready" && !writable ? /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-chip",
				"data-bc": "read-only-chip"
			}, t("readOnly")) : null));
			if (formStatus === "missing" || formStatus === "loading") return /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-page",
				"data-better-compact": "page",
				"data-settings-dirty": dirty,
				"data-settings-busy": savingNow
			}, pageStyle, title, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-section" }, /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-note",
				role: "status"
			}, formStatus === "loading" ? t("loadingConfig") : t("waitingForm"))));
			if (formStatus !== "ready" || state === null || state === void 0) return /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-page",
				"data-better-compact": "page",
				"data-settings-dirty": dirty,
				"data-settings-busy": savingNow
			}, pageStyle, title, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-section" }, /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-note",
				"data-bc": "form-unavailable"
			}, t("formUnavailable")), /* @__PURE__ */ react.default.createElement(ActiveConfigBanner, {
				activeConfig,
				requiresReload,
				dirty
			}), sessionControl), /* @__PURE__ */ react.default.createElement(StatusSection, statusProps));
			const disabled = !writable || savingNow || formStatus !== "ready";
			return /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-page",
				"data-better-compact": "page",
				"data-settings-dirty": dirty,
				"data-settings-busy": savingNow
			}, pageStyle, title, /* @__PURE__ */ react.default.createElement(ActiveConfigBanner, {
				activeConfig,
				requiresReload,
				dirty
			}), /* @__PURE__ */ react.default.createElement(ProcessEditor, {
				draft: draft ?? draftFromValue({}),
				disabled,
				fieldError,
				onDraft: updateDraft,
				projection,
				budget,
				preview,
				sessionControl,
				sessionId: selectedId,
				dirty,
				draftInvalid: draftErrors.length > 0,
				engineApplies,
				inspectLoading,
				inspectError,
				routes,
				modelsStatus: modelsInspect.status,
				modelsEnabled,
				modelsError,
				route: draftRoute,
				target: budgetTarget,
				routeWarning,
				onProvider: (value) => updateDraft(value === "" ? {
					provider: "",
					model: ""
				} : { provider: value }),
				onModel: (value) => updateDraft(value === "" ? {
					provider: "",
					model: ""
				} : { model: value })
			}), /* @__PURE__ */ react.default.createElement(AdvancedSection, {
				draft: draft ?? draftFromValue({}),
				disabled,
				fieldError,
				onDraft: updateDraft
			}), /* @__PURE__ */ react.default.createElement(StatusSection, statusProps), saveState.kind === "saved" ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-save-feedback",
				role: "status",
				"data-bc": "save-saved"
			}, t("saved")) : null, /* @__PURE__ */ react.default.createElement(SaveFooter, {
				draft,
				changeCount: countChangedFields(draft, currentDraft),
				saveState,
				errors,
				conflict,
				disabled,
				saving: savingNow,
				writable,
				revision: draftRevision,
				dirty,
				onSave: save,
				onReload: reloadHost
			}));
		}
		/** One stable row-config entry shared by every assembly key. */
		function BetterCompactConfigEntry(props) {
			if (props.view === "summary") return /* @__PURE__ */ react.default.createElement("span", { "data-better-compact": "summary" }, t("summary"));
			return /* @__PURE__ */ react.default.createElement(BetterCompactPage, {
				form: props.form,
				sessions: props.sessions ?? null
			});
		}
		/** Bind the Host sessions service once, for the registered page component. */
		function createConfigEntry(sessions) {
			return function BoundBetterCompactConfigEntry(props) {
				if (props.view === "summary") return /* @__PURE__ */ react.default.createElement("span", { "data-better-compact": "summary" }, t("summary"));
				return /* @__PURE__ */ react.default.createElement(BetterCompactPage, {
					form: props.form,
					sessions
				});
			};
		}
		// src/client/index.tsx
		/** Services this client half consumes. */
		const inject = [
			"slots",
			"sessions",
			"locale"
		];
		/** Register the same row page under every assembly key. */
		function apply(ctx) {
			bindLocale(ctx);
			const Entry = createConfigEntry(ctx.sessions ?? null);
			ctx.effect(() => ctx.slots.inject(ROW_CONFIG_SLOT, () => {
				const disposers = ROW_CONFIG_KEYS.map((key) => ctx.slots.register({
					name: ROW_CONFIG_SLOT,
					key,
					locale: NS
				}, Entry));
				return () => {
					for (const dispose of disposers) dispose();
				};
			}), "dsh-better-compact: row config entry");
		}
		exports.BetterCompactConfigEntry = BetterCompactConfigEntry;
		exports.ROW_CONFIG_KEYS = ROW_CONFIG_KEYS;
		exports.apply = apply;
		exports.createConfigEntry = createConfigEntry;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map