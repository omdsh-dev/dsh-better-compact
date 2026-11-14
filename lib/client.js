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
			processhandoffBody: "Handoff body",
			processgoalSummary: "Goals and tasks summary",
			processsummary: "History summary",
			processrecent: "Recent messages",
			processearlier: "Earlier messages",
			processfixedPrefix: "Fixed prompt / tool prefix",
			processanatomy: "Content composition",
			processtitle: "Compaction flow",
			processintro: "Adjust when to compact, how to summarize, and what to keep directly in the flow.",
			processdefaults: "Global defaults",
			processcontext: "Conversation context",
			processcontextHelp: "Fixed instructions stay unchanged. Earlier messages become a summary; recent messages stay separate.",
			processwindow: "Model window",
			processreserved: "Conversation output reserve",
			processmessage: "Available message budget",
			processcapacity: "Window − output reserve",
			processtrigger: "When to compact",
			processauto: "Automatic compaction",
			processthreshold: "Window trigger ratio",
			processtriggerHelp: "Compact automatically at this share of the window; limited space can trigger it earlier.",
			processmanual: "Manual compaction only",
			processeffective: "Effective trigger",
			processsummarize: "Create a summary",
			processsummaryHelp: "Earlier messages → summary",
			processgoalHelp: "Earlier messages + current goals and tasks → summary",
			processhandoffHelp: "Earlier messages + current goals and tasks → handoff file",
			processretain: "Keep recent messages during automatic compaction",
			processretainHelp: "Keep recent messages whole; the actual amount can be slightly larger.",
			processbyRatio: "Share of message budget",
			processfixed: "Fixed tokens",
			processratio: "Retention ratio",
			processtokens: "Retained tokens",
			processretained: "Recent-message target",
			processsummaryCap: "Summary output limit",
			processsummaryBudget: "Effective summary output budget",
			processfollowHeadroom: "Leave blank to use extra headroom",
			processresult: "Continue the conversation",
			processresultNative: "Fixed instructions + history summary + recent messages",
			processresultGoal: "Fixed instructions + goal-aware summary + recent messages",
			processresultHandoff: "Handoff body in the session record + recent messages",
			processhandoffResult: "Also save a local handoff file and continue in this session.",
			processresultHelp: "Composition only. Summary length and the resulting total depend on actual messages.",
			processcache: "Prefer prompt cache reuse",
			processcacheHelp: "Reuse tool definitions and history; cache hits depend on the model service.",
			processoverride: "This conversation has model overrides. Budgets include those overrides; global controls do not change them.",
			processbudgetUnknown: "Open Session diagnostics below and select a conversation to see its token budgets.",
			processbudgetInvalid: "Fix the configuration to see budgets.",
			processbudgetForeign: "This session uses another compaction engine.",
			processbudgetLoading: "Reading model capacity…",
			processbudgetError: "Budgets will be available when diagnostics recover.",
			processpolicyScope: "Effective budgets use this conversation model",
			processsummaryScope: "The summary model is selected separately and does not change the conversation window.",
			processrules: "How budgets are calculated",
			processrulesBody: "The trigger is the smaller of the window ratio and message budget minus headroom. Retention is a share of the message budget, not current usage.",
			processbudgetLabel: "Draft budget",
			processminimum: "Retention is a minimum, summary output a maximum; the two do not add up.",
			processcapacityTitle: "Capacity and trigger",
			processcapacityIntro: "Drag the bar or type a number; both edit the same draft.",
			processbarFixed: "Prefix",
			processbarCompressible: "Compressible",
			processbarRetained: "Retained",
			processbarHeadroom: "Headroom",
			draftLabel: "Draft",
			processcurrentUsage: "Current usage",
			processtriggerHandle: "Trigger ratio",
			processretainHandle: "Retention ratio",
			processreserve: "Output reserve",
			processheadroom: "Extra headroom",
			processheadroomHelp: "Extra room; with 0 you must set an explicit summary cap.",
			processsession: "Reference session",
			processsessionHelp: "Reads usage and budget only; it does not change the configuration.",
			processconfigBudget: "Configured budget",
			processunknownBudget: "Select a session to read current usage; no token budget is calculated while the model window is unknown.",
			processautoOff: "Automatic compaction is off; a manual compaction chooses its own retained content.",
			ratioOnly: "Only the configured proportions are shown.",
			ratioOnlyLabel: "Ratio preview",
			processpromptTitle: "Custom prompt",
			processpromptRequired: "Required",
			processpromptIntro: "Sent as the only instruction; no built-in structure or state block is appended. Use variables to reference current context.",
			processpromptPlaceholder: "For example: keep unfinished verification steps, failure reasons and the next action; do not summarize completed file lists.",
			processpromptCounter: "{count} / 8000 characters",
			processpromptUnknown: "Unknown variables are sent literally: {tokens}",
			processpromptEmpty: "Custom mode needs a prompt.",
			processpromptTooLong: "The custom prompt is limited to 8000 characters.",
			processpromptScope: "Used only by custom mode; switching modes keeps the draft and never changes the three built-in modes.",
			processpromptPrivacy: "The prompt and summary are stored in the session record; do not include secrets.",
			flowFollowCap: "Follow headroom",
			flowHint: "Built-ins use fixed instructions; custom sends only your prompt.",
			flowAuto: "Compact automatically at {ratio} and retain the most recent {retain}.",
			flowManual: "Automatic compaction is off; compact manually only.",
			flowNativePath: "Earlier messages go to the native summarizer.",
			flowGoalPath: "Earlier messages + goals and todos (read-only) → goal-enhanced summary.",
			flowHandoffPath: "Earlier messages + goals and todos (read-only) → handoff body, also written to a temp file.",
			flowCustomPath: "Earlier messages + your prompt (expanded) → custom summary.",
			flowResultSaved: "Checkpoint + recent verbatim continue the conversation.",
			flowResultHandoff: "Handoff body + recent verbatim continue; a manual compaction may resume this session.",
			flowResultCustom: "Your summary + recent verbatim continue; no section check.",
			flowNativeMeta: "The native engine chooses the summary model and structure.",
			flowModelMeta: "Summary model: {model} · Effort: {effort} · Output cap: {cap}",
			flowPreview: "Before {before} → upper bound ≤ {after} (estimated from running config)",
			flowProjected: "Summary budget this round {summary}; the next upper bound depends on the actual summary.",
			svgContinue: "Continue",
			svgRetained: "Recent verbatim retained",
			svgAuto: "Trigger at {ratio} · retain {retain}",
			svgManual: "Automatic compaction off · manual only",
			svgPreview: "Before {before} → upper bound ≤ {after} (estimated from running config)",
			svgProjected: "Summary budget this round {summary}; the next upper bound depends on the actual summary.",
			svgNativeSideTag: "Native",
			svgGoalSideTag: "Read-only",
			svgHandoffSideTag: "Temp",
			svgCustomSideTag: "Vars",
			svgPendingTag: "Pending",
			svgKeepTag: "Keep",
			svgWriteTag: "Write",
			svgOriginalTag: "Tail",
			svgNativeTitle: "Native compression",
			svgNativeBody: "Earlier messages → native summary",
			svgNativeSide: "Native directive",
			svgNativeSideBody: "No goal read",
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
			safeCutWithBefore: "Range {start}–{end} · before {before} → upper bound ≤ {upper}",
			processpromptVariables: "Insert variable",
			processcustomModeHelp: "Custom mode sends only the expanded prompt; ask the model to produce a summary that can continue the work.",
			processadvancedRules: "Advanced rules · retries and per-model overrides",
			processadvancedDefault: "Defaults",
			processstrategyTitle: "Compaction strategy",
			processstrategyIntro: "Choose how to compact; retention controls the recent original text.",
			strategyChoiceLabel: "Choose",
			strategyFigureLabel: "Diagram",
			processgenerationTitle: "Summary generation",
			processgenerationIntro: "The summary model is used only for compaction and does not change the conversation model.",
			processcustomSummary: "Custom summary",
			processcustomHelp: "Earlier messages + your prompt → custom summary",
			processresultCustom: "Your prompt's summary + recent original text",
			processcustomResult: "No state block and no section validation; ask the model to preserve goals, progress, blockers and next actions.",
			processstrategyNote: "The three built-in modes keep their fixed instructions; custom mode sends only your prompt, with no structure or state block.",
			summary: "Compaction strategy, context budget and session diagnostics",
			title: "Compaction",
			purpose: "Control when to compact, how to summarize, and how much recent text to keep.",
			unknown: "Unknown",
			unset: "Not set",
			selectOption: "Select an option",
			loadingConfig: "Loading configuration…",
			waitingForm: "Waiting for the host configuration form…",
			formUnavailable: "The host exposes no editable form; defaults are not invented.",
			readOnly: "Read-only",
			readOnlyConfig: "Read-only config",
			reloadRequired: "Reload required",
			savedReload: "Saved. Reload DSH to apply.",
			activeDiffers: "Saved configuration differs from runtime",
			viewActiveConfig: "View runtime configuration",
			runtimeMode: "Runtime strategy",
			runtimeSummaryModel: "Runtime summary model",
			runtimeThreshold: "Runtime trigger",
			runtimeRetain: "Runtime retention",
			followSession: "Session",
			modeGroup: "Compaction mode",
			modeNative: "Native",
			modeGoal: "Goal-aware",
			modeHandoff: "File handoff",
			modeNativeEffect: "History summary and recent messages",
			modeGoalEffect: "Summarize with goals and tasks",
			modeHandoffEffect: "Save a handoff file and continue",
			modeNativeCaption: "The native engine writes the summary.",
			modeGoalCaption: "Goals and tasks feed the summary.",
			modeHandoffCaption: "The handoff body is also written to the session record.",
			modeCustomCaption: "No built-in structure, state block or safety rules are appended.",
			modeNativeTag: "Host-native",
			cacheChip: "Cache reuse",
			modeGoalTag: "Recommended",
			modeHandoffTag: "Archived copy",
			modeCustomTag: "Fully custom",
			modeCustom: "Custom",
			modeCustomEffect: "Send only your prompt",
			goalState: "Goals and todos",
			customState: "Your prompt",
			nativeNote: "Native directive",
			goalNote: "Written as checkpoint",
			handoffNote: "Session + temp file",
			customNote: "No section check",
			modeDetails: "Mode details",
			variableGoal: "Goal",
			variableTodos: "Todos",
			variableQuestions: "Pending questions",
			variableJobs: "Jobs",
			variableChildren: "Subagents",
			variableDate: "Date",
			variableSession: "Session ID",
			variableModel: "Summary model",
			variableTrigger: "Trigger ratio",
			variableRetain: "Retention budget",
			variableGroupContext: "Context",
			variableGroupMeta: "Meta",
			budgetSection: "Auto compression and retention",
			autoCompression: "Auto compression",
			threshold: "Threshold",
			retainRecent: "Retain recent messages",
			byRatio: "By ratio",
			fixedTokens: "Fixed tokens",
			retainRatio: "Retain ratio",
			retainTokens: "Retain tokens",
			retainRatioHelp: "Blank uses 16%",
			cachePriority: "Reuse prompt cache first",
			summaryImage: "Attach summary as image",
			summaryImageHint: "Applies to the Goal-enhanced and Custom modes only",
			modelSection: "Summary generation",
			summaryModel: "Summary model",
			customModelOption: "Custom model…",
			followSessionModel: "Follow session model",
			reasoningEffort: "Reasoning effort",
			modelDefault: "Model default",
			modelDefaultWith: "Model default · {effort}",
			unsupportedEffortOption: "{effort} · not declared",
			effortUnknownPlaceholder: "Model default; capability unknown",
			customSummaryModel: "Custom summary model",
			provider: "Provider",
			model: "Model",
			modelsLoading: "Loading model list…",
			modelsFailed: "Model list unavailable; enter a custom model.",
			advanced: "Advanced settings",
			advancedCount: "{count} items",
			headroom: "Headroom",
			summaryOutputCap: "Summary output cap",
			pressureRetry: "Pressure retries",
			overflowRecovery: "Overflow recovery",
			followHeadroom: "Follow headroom: {value}",
			policies: "Model overrides",
			addRule: "Add rule",
			allModelsGlobal: "All models use the global settings.",
			policyBlankInherit: "Blank values inherit global settings; when no summary cap is set, extra headroom also caps the summary.",
			newRule: "New rule",
			sessionProvider: "Session provider",
			sessionModel: "Session model",
			retainMode: "Retain recent messages",
			inheritWith: "Inherit · {value}",
			byMessageBudgetRatio: "By message budget ratio",
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
			statusEmpty: "Select a session to inspect usage and compaction records.",
			diagnosticsFailed: "Diagnostics failed: {message}",
			readingDiagnostics: "Reading diagnostics…",
			engineUnknown: "Compaction engine not confirmed.",
			engineForeign: "Another compaction engine ({owner}) owns this session; only real records are shown.",
			engineOwnerUnknown: "Engine ownership unknown; budget and preview use this plugin runtime config.",
			engineOwner: "Compaction engine: {owner}",
			lastCompaction: "Last compaction",
			noCompaction: "No compaction records in this session.",
			handoffContinuation: "Handoff continuation",
			continuationScheduled: "A same-session continuation is scheduled.",
			continuationSkipped: "This continuation was skipped.",
			diagnosticsDetails: "Diagnostic details ({count})",
			session: "Session",
			selectSessionTitle: "Select the session used for budget and diagnostics",
			loadingSessions: "Loading sessions…",
			noSessions: "No sessions yet",
			selectSession: "Select a session",
			runningSuffix: " · running",
			refreshDiagnostics: "Refresh session diagnostics",
			reading: "Reading…",
			refresh: "Refresh",
			sessionListFailed: "Session list unavailable",
			draftBudget: "Draft budget",
			messageBudget: "Message budget",
			effectiveTrigger: "Effective trigger",
			retainBudget: "Recent retention",
			budgetIncomplete: "Fix the configuration to see the budget.",
			budgetForeignEngine: "Another compaction engine owns this session.",
			budgetLoading: "Reading model window…",
			budgetError: "Restore diagnostics to calculate the budget.",
			budgetNoSession: "Select a diagnostic session to see token budgets.",
			budgetUnknown: "Window unknown; draft budget unavailable.",
			triggerBefore: "Before trigger",
			ratioSlack: "Ratio slack",
			extraHeadroom: "Headroom",
			sessionOutput: "Session output",
			compositionBefore: "Before",
			compositionAfter: "After upper bound",
			safeCut: "Range {start}–{end} · upper bound ≤ {upper}",
			noSafeCut: "No safe compaction range.",
			fixedPrefix: "Fixed prefix",
			compressibleMessages: "Compressible messages",
			actualRetained: "Retained original",
			summaryBudgetFraming: "Summary budget and framing",
			runtimePreview: "Compaction preview",
			runtimeWindow: "Model window",
			currentContext: "Current context",
			runtimeTrigger: "Runtime trigger",
			measured: "Usage measured",
			estimated: "Estimated",
			measurementUnknown: "Usage unknown",
			conclusionAutoOff: "Auto compression is off",
			conclusionNoUsage: "No context usage yet",
			conclusionRemaining: "{remaining} until auto compression",
			conclusionReached: "Automatic trigger reached",
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
			replacedMessages: "Replaced messages",
			summaryEstimate: "Summary estimate",
			cacheRead: "Cache read",
			cacheWrite: "Cache write",
			persistenceFailed: "The summary may be written, but the session save failed.",
			saveChanges: "{count} unsaved changes",
			save: "Save settings",
			saving: "Saving…",
			discard: "Discard",
			discardAgain: "Click again to discard",
			reload: "Reload",
			fixErrors: "Fix {count} items",
			saveFailed: "Save failed: {message}. Draft kept.",
			saveRejected: "The host rejected the save; draft kept. Reload and check the configuration.",
			saveConflict: "Configuration changed elsewhere; reload before editing.",
			saved: "Saved. Reload DSH to apply.",
			validationMode: "Choose a compaction strategy.",
			validationThreshold: "Threshold must be greater than 0% and less than 100%.",
			validationHeadroom: "Headroom must be a non-negative safe integer.",
			validationRetainTokens: "Retain tokens must be a non-negative safe integer.",
			validationRetainRatio: "Retain ratio must be greater than 0 and below the threshold; blank uses 16%.",
			validationSummaryPair: "Provider and summary model must be filled together.",
			validationEffortSpaces: "Reasoning effort cannot contain only spaces.",
			validationMaxTokens: "Summary output cap must be a positive safe integer; set it when headroom is 0.",
			validationRetries: "Retry count must be a non-negative safe integer.",
			validationPolicyModel: "Fill in both provider and model.",
			validationDuplicatePolicy: "This model already has an override.",
			validationSuffixRatio: " must be greater than 0% and less than 100%.",
			validationSuffixPositive: " must be a positive safe integer.",
			validationSuffixNonNegative: " must be a non-negative safe integer.",
			validationPolicyRetainTokens: "Retain tokens must be a non-negative safe integer.",
			validationPolicyRetainRatio: "Effective retain ratio must be greater than 0 and below the rule threshold.",
			validationPolicySummaryPair: "Fill in both summary provider and model.",
			validationPolicyMaxTokens: "Set a summary output cap when headroom is 0.",
			validationGlobalSummaryModel: "Global summary model",
			validationRule: "Rule {provider}/{model}",
			validationFollowedSummaryModel: "Followed session summary model",
			validationEffortUnsupported: "{label} {provider}/{model} does not declare effort \"{effort}\". Adjust the global effort or summary model.",
			routeWarning: "Custom model {provider}/{model} is not in the host catalog; confirm it is available.",
			reasonNoCapacity: "Insufficient model capacity",
			reasonNoCapacityHint: "Reduce the session output reserve or choose a larger session model.",
			reasonReserveFull: "Headroom and output reserve fill the window",
			reasonReserveFullHint: "Reduce headroom or the session output reserve, or choose a larger session model.",
			reasonRetainConflict: "Retention conflicts with the trigger",
			reasonRetainConflictHint: "Reduce retention or raise the threshold.",
			reasonNoSafeRangeWithPrefix: "No safe range after prefix and retention",
			reasonNoSafeRange: "No safe compactable range",
			reasonNoSafeRangeHint: "Reduce retention or threshold, or wait for more history.",
			reasonNoRoute: "No model request yet",
			reasonNoRouteHint: "Send one model request in the session first.",
			reasonCapacityUnknown: "Model capacity unknown",
			reasonCapacityUnknownHint: "Check the adapter metadata for this route.",
			reasonBelowTrigger: "Below the automatic trigger",
			reasonAutoOff: "Auto compression is off",
			reasonAutoOffHint: "Enable auto compression in the context budget.",
			budgetNoMessageRoom: "The session output reserve fills the window; adjust the session model output cap.",
			budgetHeadroomTooLarge: "Headroom must be less than the message budget {message}.",
			budgetRetainTooLarge: "Effective retention {retain} must be below the trigger {threshold}.",
			draftWindowAria: "Draft window: trigger {trigger}, headroom {headroom}, session output reserve {reserved}.",
			runtimeWindowAria: "Current context {current}; runtime trigger {trigger}; window {window}.",
			beforeBarAria: "{fixed}, {history}, {tail}.",
			afterBarAria: "{fixed}, {summary}, {tail}.",
			currentBarAria: "Current context {current}.",
			diagramNativeLabel: "DSH native: earlier history becomes a native summary, recent messages are kept, and the fixed prompt and tools stay separate.",
			diagramGoalLabel: "Goal aware: earlier history merges with the read-only Goal / Todo state to summarize goals, constraints, progress and next steps; recent messages stay unchanged.",
			diagramHandoffLabel: "File handoff: the conversation and state create this temporary handoff file, write its body as a native event, then continue in the same session; recent messages stay.",
			diagramFixedPrefix: "Fixed prefix",
			diagramEarlierHistory: "History",
			diagramRecentOriginal: "Recent",
			diagramNativeCompaction: "Native",
			diagramNativeSummary: "Native summary",
			diagramRetainedOriginal: "Retained",
			diagramSummaryRecord: "Record",
			diagramGoalsTasks: "Goals & tasks",
			diagramAuthority: "Authority",
			diagramRecentMessages: "Recent",
			diagramGoalConstraints: "Goals",
			diagramProgressNext: "Next steps",
			diagramWriteSummary: "Write summary",
			diagramConversation: "Conversation",
			diagramAndState: "State",
			diagramTempFile: "Temp file",
			diagramThisHandoff: "Handoff",
			diagramSessionRecord: "Session",
			diagramSaveHandoff: "Handoff body",
			diagramContinue: "Continue"
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
			processhandoffBody: "交接正文",
			processgoalSummary: "目标与任务摘要",
			processsummary: "历史摘要",
			processrecent: "近期原文",
			processearlier: "较早消息",
			processfixedPrefix: "固定提示 / 工具前缀",
			processanatomy: "内容组成示意",
			processtitle: "压缩流程",
			processintro: "在流程中调整触发时机、摘要方式与保留内容。",
			processdefaults: "全局默认设置",
			processcontext: "会话上下文",
			processcontextHelp: "固定提示保持不变；较早消息生成摘要，近期原文单独保留。",
			processwindow: "模型窗口",
			processreserved: "会话输出预留",
			processmessage: "可用消息预算",
			processcapacity: "窗口 − 输出预留",
			processtrigger: "何时压缩",
			processauto: "自动压缩",
			processthreshold: "窗口触发比例",
			processtriggerHelp: "达到占用比例时自动压缩；空间不足会提前触发。",
			processmanual: "仅手动压缩",
			processeffective: "有效触发点",
			processsummarize: "生成摘要",
			processsummaryHelp: "较早消息 → 摘要",
			processgoalHelp: "较早消息 + 当前目标与任务 → 摘要",
			processhandoffHelp: "较早消息 + 当前目标与任务 → 交接文件",
			processretain: "自动压缩时保留近期消息",
			processretainHelp: "保留最近完整消息；实际数量可能略多。",
			processbyRatio: "按消息预算比例",
			processfixed: "固定 tokens",
			processratio: "保留比例",
			processtokens: "保留量",
			processretained: "原文保留目标",
			processsummaryCap: "摘要输出上限",
			processsummaryBudget: "有效摘要输出预算",
			processfollowHeadroom: "留空跟随额外余量",
			processresult: "继续对话",
			processresultNative: "固定提示 + 历史摘要 + 近期原文",
			processresultGoal: "固定提示 + 目标增强摘要 + 近期原文",
			processresultHandoff: "交接正文写入会话记录 + 近期原文",
			processhandoffResult: "同时保存本地交接文件，在当前会话继续。",
			processresultHelp: "组成示意；摘要长度与压缩后总量取决于实际消息。",
			processcache: "优先复用提示缓存",
			processcacheHelp: "复用工具定义与工具历史；缓存命中由模型服务决定。",
			processoverride: "此会话存在模型覆盖规则；图中预算为合并后的有效值，全局控件不会改写覆盖规则。",
			processbudgetUnknown: "展开下方「会话诊断」并选择会话，可查看具体预算。",
			processbudgetInvalid: "修正配置后可查看预算。",
			processbudgetForeign: "该会话使用其他压缩引擎。",
			processbudgetLoading: "读取模型窗口…",
			processbudgetError: "诊断恢复后可计算预算。",
			processpolicyScope: "有效预算对应会话模型",
			processsummaryScope: "摘要模型单独选择，不改变会话模型窗口。",
			processrules: "预算计算方式",
			processrulesBody: "触发点取窗口比例与消息预算减去余量的较小值；保留比例基于消息预算，而非当前用量。",
			processbudgetLabel: "草稿预算",
			processminimum: "保留是原文下限，摘要是输出上限；两者不能相加。",
			processcapacityTitle: "容量与触发",
			processcapacityIntro: "拖动大图或直接输入；两处修改同一份草稿。",
			processbarFixed: "固定前缀",
			processbarCompressible: "待压缩",
			processbarRetained: "保留",
			processbarHeadroom: "余量",
			draftLabel: "草稿配置",
			processcurrentUsage: "当前用量",
			processtriggerHandle: "触发比例",
			processretainHandle: "保留比例",
			processreserve: "输出预留",
			processheadroom: "额外余量",
			processheadroomHelp: "额外余量；0 时须单独设置摘要输出上限。",
			processsession: "参考会话",
			processsessionHelp: "只读取用量与预算，不改变配置。",
			processconfigBudget: "配置预算",
			processunknownBudget: "选择会话后可读取当前用量；模型窗口未知时不计算 token 预算。",
			processautoOff: "自动压缩已关闭；手动压缩由引擎自行选择保留内容。",
			ratioOnly: "当前仅显示比例示意。",
			ratioOnlyLabel: "比例示意",
			processpromptTitle: "自定义提示词",
			processpromptRequired: "必填",
			processpromptIntro: "作为唯一指令发送；不附加内置结构或状态块。用变量引用当前上下文。",
			processpromptPlaceholder: "例如：保留未完成的验证步骤、失败原因与下一步；不要总结已完成的文件清单。",
			processpromptCounter: "{count} / 8000 字符",
			processpromptUnknown: "未知变量将按原文发送：{tokens}",
			processpromptEmpty: "自定义模式需要提示词。",
			processpromptTooLong: "自定义提示词最多 8000 字符。",
			processpromptScope: "仅自定义模式使用；切换模式会保留草稿，但不影响内置三种模式。",
			processpromptPrivacy: "提示词与摘要会进入会话记录，请勿写入密钥。",
			flowFollowCap: "跟随余量",
			flowHint: "内置模式使用固定指令；自定义只发送你的提示词。",
			flowAuto: "达到触发比例 {ratio} 时自动压缩；保留最近 {retain} 原文。",
			flowManual: "自动压缩已关闭；只在手动压缩时执行。",
			flowNativePath: "较早消息交给宿主原生摘要。",
			flowGoalPath: "较早消息 + 目标与待办（只读）→ 目标增强摘要。",
			flowHandoffPath: "较早消息 + 目标与待办（只读）→ 交接正文，同时写临时文件。",
			flowCustomPath: "较早消息 + 你的提示词（变量展开）→ 自定义摘要。",
			flowResultSaved: "摘要记录 + 近期原文继续对话。",
			flowResultHandoff: "交接正文 + 近期原文继续；手动压缩后可继续本会话。",
			flowResultCustom: "你的摘要 + 近期原文继续；不校验章节。",
			flowNativeMeta: "摘要模型与结构由宿主原生引擎决定。",
			flowModelMeta: "摘要模型：{model} · 思考强度：{effort} · 输出上限：{cap}",
			flowPreview: "压缩前 {before} → 压缩后上界 ≤ {after}（按运行配置估算）",
			flowProjected: "本轮摘要预算 {summary}；下轮上限取决于实际摘要。",
			svgContinue: "继续对话",
			svgRetained: "近期原文保留",
			svgAuto: "自动触发 {ratio} · 保留 {retain}",
			svgManual: "自动压缩已关闭 · 仅手动",
			svgPreview: "压缩前 {before} → 上界 ≤ {after}（按运行配置估算）",
			svgProjected: "本轮摘要预算 {summary}；下轮上限取决于实际摘要。",
			svgNativeSideTag: "原生",
			svgGoalSideTag: "只读",
			svgHandoffSideTag: "临时",
			svgCustomSideTag: "变量",
			svgPendingTag: "待压缩",
			svgKeepTag: "保留",
			svgWriteTag: "写入",
			svgOriginalTag: "原文",
			svgNativeTitle: "原生压缩",
			svgNativeBody: "较早消息 → 原生摘要",
			svgNativeSide: "宿主原生指令",
			svgNativeSideBody: "不读取目标",
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
			safeCutWithBefore: "选区 {start}–{end} · 压缩前 {before} → 上界 ≤ {upper}",
			processpromptVariables: "插入变量",
			processcustomModeHelp: "自定义模式发送的最终指令只有展开后的提示词；请自行要求模型输出可继续工作的摘要。",
			processadvancedRules: "高级规则 · 重试与按模型覆盖",
			processadvancedDefault: "默认值",
			processstrategyTitle: "压缩策略",
			processstrategyIntro: "选择压缩方式；近期原文由保留设置决定。",
			strategyChoiceLabel: "选择",
			strategyFigureLabel: "示意图",
			processgenerationTitle: "摘要生成",
			processgenerationIntro: "摘要模型只用于压缩请求，不改变会话模型。",
			processcustomSummary: "自定义摘要",
			processcustomHelp: "较早消息 + 你的提示词 → 自定义摘要",
			processresultCustom: "你的提示词生成的摘要 + 近期原文",
			processcustomResult: "不附加状态块，也不校验章节；请要求模型保留目标、进度、阻塞与下一步。",
			processstrategyNote: "内置三种模式使用各自固定的摘要指令；自定义模式只发送你的提示词，不附加结构或状态块。",
			summary: "压缩策略、上下文预算与会话诊断",
			title: "上下文压缩",
			purpose: "控制何时压缩、如何摘要，以及保留多少近期原文。",
			unknown: "未知",
			unset: "未设置",
			selectOption: "选择选项",
			loadingConfig: "正在读取配置…",
			waitingForm: "等待宿主配置表单…",
			formUnavailable: "宿主未提供可编辑表单，不填造默认值。",
			readOnly: "只读",
			readOnlyConfig: "只读配置",
			reloadRequired: "需重载",
			savedReload: "已保存，重载 DSH 后生效。",
			activeDiffers: "已保存配置与运行配置不同",
			viewActiveConfig: "查看运行配置",
			runtimeMode: "运行策略",
			runtimeSummaryModel: "运行摘要模型",
			runtimeThreshold: "运行触发比例",
			runtimeRetain: "运行保留预算",
			followSession: "跟随会话",
			modeGroup: "压缩模式",
			modeNative: "原生",
			modeGoal: "目标增强",
			modeHandoff: "文件交接",
			modeNativeEffect: "历史摘要与近期原文",
			modeGoalEffect: "结合目标与任务生成摘要",
			modeHandoffEffect: "保存交接文件，在本会话继续",
			modeNativeCaption: "摘要请求由原生引擎处理。",
			modeGoalCaption: "目标与任务作为摘要输入。",
			modeHandoffCaption: "交接正文同时写入会话记录。",
			modeCustomCaption: "不附加内置结构、状态块或安全规则。",
			modeNativeTag: "宿主内置",
			cacheChip: "缓存复用",
			modeGoalTag: "推荐默认",
			modeHandoffTag: "双写归档",
			modeCustomTag: "完全自定义",
			modeCustom: "自定义",
			modeCustomEffect: "只发送你的提示词",
			goalState: "目标与待办",
			customState: "你的提示词",
			nativeNote: "宿主原生指令",
			goalNote: "写入摘要记录",
			handoffNote: "写入会话 + 临时文件",
			customNote: "不校验章节",
			modeDetails: "模式说明",
			variableGoal: "目标",
			variableTodos: "待办",
			variableQuestions: "待答问题",
			variableJobs: "后台任务",
			variableChildren: "子代理",
			variableDate: "日期",
			variableSession: "会话 ID",
			variableModel: "摘要模型",
			variableTrigger: "触发比例",
			variableRetain: "保留预算",
			variableGroupContext: "上下文",
			variableGroupMeta: "元信息",
			budgetSection: "自动压缩与保留",
			autoCompression: "自动压缩",
			threshold: "触发比例",
			retainRecent: "近期原文保留",
			byRatio: "按比例",
			fixedTokens: "固定 tokens",
			retainRatio: "保留比例",
			retainTokens: "保留量",
			retainRatioHelp: "留空使用 16%",
			cachePriority: "优先复用提示缓存",
			summaryImage: "摘要以图片附加",
			summaryImageHint: "仅在目标增强与自定义模式下生效",
			modelSection: "摘要生成",
			summaryModel: "摘要模型",
			customModelOption: "自定义模型…",
			followSessionModel: "跟随会话模型",
			reasoningEffort: "思考强度",
			modelDefault: "模型默认",
			modelDefaultWith: "模型默认 · {effort}",
			unsupportedEffortOption: "{effort} · 未声明支持",
			effortUnknownPlaceholder: "模型默认；能力未知",
			customSummaryModel: "自定义摘要模型",
			provider: "服务商",
			model: "模型",
			modelsLoading: "读取模型列表…",
			modelsFailed: "模型列表读取失败，可填写自定义模型。",
			advanced: "高级设置",
			advancedCount: "{count} 项",
			headroom: "额外余量",
			summaryOutputCap: "摘要输出上限",
			pressureRetry: "压力残留重试",
			overflowRecovery: "超限恢复次数",
			followHeadroom: "跟随余量：{value}",
			policies: "按模型覆盖",
			addRule: "添加规则",
			allModelsGlobal: "所有模型使用全局设置。",
			policyBlankInherit: "空白数值继承全局；未指定摘要输出上限时，额外余量同时作为上限。",
			newRule: "新规则",
			sessionProvider: "会话服务商",
			sessionModel: "会话模型",
			retainMode: "近期原文保留",
			inheritWith: "继承 · {value}",
			byMessageBudgetRatio: "按消息预算比例",
			fixedTokenCount: "固定 token 数",
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
			statusEmpty: "选择会话查看用量与压缩记录。",
			diagnosticsFailed: "诊断读取失败：{message}",
			readingDiagnostics: "读取诊断…",
			engineUnknown: "尚未确认压缩引擎。",
			engineForeign: "此会话使用其他压缩引擎（{owner}），仅显示实际压缩记录。",
			engineOwnerUnknown: "引擎归属未确认；预算与预览按本插件运行配置计算。",
			engineOwner: "压缩引擎：{owner}",
			lastCompaction: "最近一次压缩",
			noCompaction: "此会话暂无压缩记录。",
			handoffContinuation: "文件交接续作",
			continuationScheduled: "已安排一次同会话续作。",
			continuationSkipped: "本次续作已跳过。",
			diagnosticsDetails: "诊断详情（{count}）",
			session: "会话",
			selectSessionTitle: "选择用于预算与诊断的会话",
			loadingSessions: "加载会话…",
			noSessions: "还没有会话",
			selectSession: "选择会话",
			runningSuffix: " · 运行中",
			refreshDiagnostics: "刷新会话诊断",
			reading: "读取中…",
			refresh: "刷新",
			sessionListFailed: "会话列表读取失败",
			draftBudget: "草稿预算",
			messageBudget: "消息预算",
			effectiveTrigger: "有效触发点",
			retainBudget: "近期原文预算",
			budgetIncomplete: "修正配置后可查看预算。",
			budgetForeignEngine: "该会话使用其他压缩引擎。",
			budgetLoading: "读取模型窗口…",
			budgetError: "诊断恢复后可计算预算。",
			budgetNoSession: "选择诊断会话后可查看具体 token 预算。",
			budgetUnknown: "模型窗口或输出预留未知，暂无法计算草稿预算。",
			triggerBefore: "触发前",
			ratioSlack: "比例留白",
			extraHeadroom: "额外余量",
			sessionOutput: "会话输出",
			compositionBefore: "压缩前",
			compositionAfter: "压缩后上界",
			safeCut: "选区 {start}–{end} · 压缩后预算上界 ≤ {upper}",
			noSafeCut: "当前无安全压缩选区。",
			fixedPrefix: "固定前缀",
			compressibleMessages: "可压缩消息",
			actualRetained: "实际保留原文",
			summaryBudgetFraming: "摘要预算与封装",
			runtimePreview: "压缩预览",
			runtimeWindow: "模型窗口",
			currentContext: "当前上下文",
			runtimeTrigger: "运行触发点",
			measured: "用量已校准",
			estimated: "估算",
			measurementUnknown: "用量未知",
			conclusionAutoOff: "自动压缩已关闭",
			conclusionNoUsage: "尚无上下文用量",
			conclusionRemaining: "距离自动压缩还有 {remaining}",
			conclusionReached: "已到达自动触发点",
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
			replacedMessages: "已替换消息",
			summaryEstimate: "摘要消息估算",
			cacheRead: "缓存读取",
			cacheWrite: "缓存写入",
			persistenceFailed: "摘要可能已写入，但会话保存失败。",
			saveChanges: "{count} 项更改待保存",
			save: "保存设置",
			saving: "保存中…",
			discard: "放弃更改",
			discardAgain: "再次点击放弃",
			reload: "重新读取",
			fixErrors: "需修正 {count} 项",
			saveFailed: "保存失败：{message}。草稿已保留。",
			saveRejected: "宿主拒绝保存，草稿已保留。请重新读取并核对配置。",
			saveConflict: "配置已被其他页面更新，请重新读取后编辑。",
			saved: "已保存，重载 DSH 后生效。",
			validationMode: "请选择压缩策略。",
			validationThreshold: "触发比例须大于 0% 且小于 100%。",
			validationHeadroom: "额外余量须为非负安全整数。",
			validationRetainTokens: "保留量须为非负安全整数。",
			validationRetainRatio: "保留比例须大于 0，且低于触发比例；留空使用 16%。",
			validationSummaryPair: "服务商与摘要模型须成对填写。",
			validationEffortSpaces: "思考强度不能仅包含空格。",
			validationMaxTokens: "摘要输出上限须为正安全整数；额外余量为 0 时须单独设置。",
			validationRetries: "重试次数须为非负安全整数。",
			validationPolicyModel: "请填写完整的服务商与模型。",
			validationDuplicatePolicy: "该模型已有覆盖规则。",
			validationSuffixRatio: "须大于 0% 且小于 100%。",
			validationSuffixPositive: "须为正安全整数。",
			validationSuffixNonNegative: "须为非负安全整数。",
			validationPolicyRetainTokens: "保留量须为非负安全整数。",
			validationPolicyRetainRatio: "有效保留比例须大于 0，且低于该规则的触发比例。",
			validationPolicySummaryPair: "请填写完整的摘要服务商与模型。",
			validationPolicyMaxTokens: "余量为 0 时须设置摘要输出上限。",
			validationGlobalSummaryModel: "全局摘要模型",
			validationRule: "规则 {provider}/{model}",
			validationFollowedSummaryModel: "跟随会话的摘要模型",
			validationEffortUnsupported: "{label} {provider}/{model} 未声明支持强度「{effort}」，请调整全局思考强度或摘要模型。",
			routeWarning: "自定义模型 {provider}/{model} 未列于宿主候选中，请确认会话可用。",
			reasonNoCapacity: "模型容量不足",
			reasonNoCapacityHint: "请降低主会话的输出预留，或选择更大窗口的会话模型。",
			reasonReserveFull: "额外预留与输出预留占满窗口",
			reasonReserveFullHint: "请降低额外余量或主会话的输出预留，或选择更大窗口的会话模型。",
			reasonRetainConflict: "保留预算与触发线冲突",
			reasonRetainConflictHint: "请降低保留预算或提高阈值比例。",
			reasonNoSafeRangeWithPrefix: "固定前缀 / 近期保留未留出安全区间",
			reasonNoSafeRange: "无安全可压缩区间",
			reasonNoSafeRangeHint: "请降低保留预算 / 阈值，或等待更多可压缩历史。",
			reasonNoRoute: "尚无模型路由请求",
			reasonNoRouteHint: "请先在会话中发送一次模型请求。",
			reasonCapacityUnknown: "模型容量未知",
			reasonCapacityUnknownHint: "请检查该路由模型的适配器元数据。",
			reasonBelowTrigger: "尚未到达自动触发线（提示）",
			reasonAutoOff: "自动压缩已关闭（提示）",
			reasonAutoOffHint: "可在上下文预算中开启自动压缩。",
			budgetNoMessageRoom: "会话输出预留已占满窗口，请调整会话模型的输出上限。",
			budgetHeadroomTooLarge: "额外余量须小于消息预算 {message}。",
			budgetRetainTooLarge: "有效保留量 {retain} 须小于触发点 {threshold}。",
			draftWindowAria: "草稿窗口分配：触发点 {trigger}，额外余量 {headroom}，会话输出预留 {reserved}。",
			runtimeWindowAria: "当前上下文 {current}；运行触发点 {trigger}；窗口 {window}。",
			beforeBarAria: "{fixed}、{history}、{tail}。",
			afterBarAria: "{fixed}、{summary}、{tail}。",
			currentBarAria: "当前上下文 {current}。",
			diagramNativeLabel: "DSH 原生：较早历史经原生压缩生成原生摘要，近期原文保留，组成原生 checkpoint；固定提示与工具前缀独立。",
			diagramGoalLabel: "Goal 增强：较早历史与只读权威 Goal / Todo 合流，生成目标、约束、进展、下一步摘要；近期原文保留，不修改目标或轮次。",
			diagramHandoffLabel: "文件 Handoff：对话与状态生成本次临时交接文件，正文写入原生事件，再在同会话继续；近期原文保留。文件不是唯一恢复来源。",
			diagramFixedPrefix: "固定提示 / 工具前缀",
			diagramEarlierHistory: "较早历史",
			diagramRecentOriginal: "近期原文",
			diagramNativeCompaction: "原生压缩",
			diagramNativeSummary: "原生摘要",
			diagramRetainedOriginal: "原文保留",
			diagramSummaryRecord: "摘要记录",
			diagramGoalsTasks: "目标与任务",
			diagramAuthority: "权威状态",
			diagramRecentMessages: "近期消息",
			diagramGoalConstraints: "目标·约束",
			diagramProgressNext: "进展·下一步",
			diagramWriteSummary: "写入会话摘要记录",
			diagramConversation: "对话",
			diagramAndState: "与状态",
			diagramTempFile: "临时文件",
			diagramThisHandoff: "本次交接",
			diagramSessionRecord: "会话记录",
			diagramSaveHandoff: "保存交接正文",
			diagramContinue: "同会话继续"
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
		* Copied verbatim from the pre-TypeScript client bundle: the injection point
		* (one <style key="dsh-bc-style">) is unchanged, so no CSS loading path
		* moves. Only host --dsw-alias-* tokens are referenced.
		*/
		const STYLE = `

/* Flat settings surface; all borders are 1px solid, no gradients or shadows outside overlays. */
.dsh-bc-page{--cfg-text:var(--dsw-alias-label-primary);--cfg-muted:var(--dsw-alias-label-secondary);--cfg-subtle:color-mix(in srgb,var(--dsw-alias-label-tertiary) 80%,var(--dsw-alias-label-primary));--cfg-canvas:var(--dsw-alias-bg-layer-1);--cfg-raised:var(--dsw-alias-bg-layer-2);--cfg-overlay:var(--dsw-alias-bg-layer-3);--cfg-sunken:color-mix(in srgb,var(--cfg-text) 4%,var(--cfg-canvas));--cfg-line:var(--dsw-alias-border-l1);--cfg-line-2:var(--dsw-alias-border-l2);--cfg-control-line:var(--dsw-alias-border-l2);--cfg-line-3:var(--dsw-alias-border-l3);--cfg-accent:var(--dsw-alias-state-business-primary,#4176e6);--cfg-accent-text:color-mix(in srgb,var(--cfg-accent) 70%,var(--cfg-text));--cfg-accent-soft:color-mix(in srgb,var(--cfg-accent) 10%,transparent);--cfg-solid:var(--dsw-alias-button-primary-fill,#0f1115);--cfg-on-accent:var(--dsw-alias-label-primary-foreground,#fff);--cfg-danger:color-mix(in srgb,var(--dsw-alias-state-error-primary) 60%,var(--cfg-text));--cfg-warn:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 60%,var(--dsw-alias-label-primary));--cfg-hover:var(--dsw-alias-interactive-bg-hover);--cfg-r-sm:6px;--cfg-r-md:8px;--cfg-r-lg:10px;--cfg-r-xl:12px;--cfg-control:32px;--cfg-control-sm:28px;--cfg-dur:140ms;display:flex;flex-direction:column;gap:24px;width:100%;max-width:920px;margin:0 auto;min-width:0;color:var(--cfg-text);font-size:13px;line-height:20px;font-variant-numeric:tabular-nums;container-type:inline-size;container-name:better-compact;overflow-wrap:anywhere;color-scheme:inherit}
.dsh-bc-page *{box-sizing:border-box}
.dsh-bc-page :is(button,input){appearance:none}
[data-ds-dark-theme] .dsh-bc-page{--cfg-accent-soft:color-mix(in srgb,var(--cfg-accent) 14%,transparent)}
.dsh-bc-page-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0;flex-wrap:wrap}
.dsh-bc-page-chips{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
.dsh-bc-title{margin:0;font-size:20px;line-height:28px;font-weight:500;letter-spacing:-.01em}
.dsh-bc-chip{display:inline-flex;align-items:center;min-height:20px;padding:0 8px;border:1px solid var(--cfg-line-2);border-radius:999px;background:var(--cfg-raised);color:var(--cfg-muted);font-size:11px;line-height:18px;white-space:nowrap}
.dsh-bc-chip[data-tone=accent]{border-color:color-mix(in srgb,var(--cfg-accent) 35%,var(--cfg-line-2));background:var(--cfg-accent-soft);color:var(--cfg-accent-text)}
.dsh-bc-section{display:flex;flex-direction:column;gap:4px;min-width:0;padding-top:12px;border-top:1px solid var(--cfg-line-2)}
.dsh-bc-section-head,.dsh-bc-subhead{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;min-width:0}
.dsh-bc-section-head{padding-bottom:8px;border-bottom:1px solid var(--cfg-line);margin-bottom:2px}
.dsh-bc-h3,.dsh-bc-h4{margin:0;font-size:12px;line-height:18px;font-weight:500;color:var(--cfg-subtle);letter-spacing:.02em}
.dsh-bc-h4{font-size:13px;color:var(--cfg-text)}
.dsh-bc-caption,.dsh-bc-help{margin:0;font-size:12px;line-height:18px;color:var(--cfg-subtle)}
.dsh-bc-note{margin:0;font-size:12px;line-height:18px;color:var(--cfg-muted)}
.dsh-bc-hint{margin:0;font-size:12px;line-height:18px;color:var(--cfg-subtle)}
.dsh-bc-error{margin:0;font-size:12px;line-height:18px;color:var(--cfg-danger);overflow-wrap:anywhere}
.dsh-bc-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
.dsh-bc-strong{font-weight:500}
.dsh-bc-mono{font-variant-numeric:tabular-nums;font-family:var(--dsw-font-family-mono,ui-monospace,SFMono-Regular,Menlo,monospace)}
.dsh-bc-modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.dsh-bc-mode{display:flex;flex-direction:column;gap:8px;min-width:0;padding:12px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-lg);background:var(--cfg-raised);color:var(--cfg-text);cursor:pointer;transition:background-color var(--cfg-dur) ease,border-color var(--cfg-dur) ease}
.dsh-bc-mode:hover:not([aria-disabled=true]){background:color-mix(in srgb,var(--cfg-text) 3%,var(--cfg-raised))}
.dsh-bc-mode[aria-checked=true]{border-color:var(--cfg-accent);background:var(--cfg-accent-soft)}
.dsh-bc-mode[aria-disabled=true],.dsh-bc-page :disabled{opacity:.4;cursor:not-allowed}
.dsh-bc-mode-head{display:flex;align-items:center;gap:8px;min-width:0}
.dsh-bc-mode-title{font-size:13px;line-height:20px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-bc-radio-dot{display:block;position:relative;flex:none;width:14px;height:14px;border:1px solid var(--cfg-line-3);border-radius:50%}
.dsh-bc-mode[aria-checked=true] .dsh-bc-radio-dot{border-color:var(--cfg-accent)}
.dsh-bc-mode[aria-checked=true] .dsh-bc-radio-dot:after{content:"";position:absolute;inset:3px;border-radius:50%;background:var(--cfg-accent)}
.dsh-bc-mode-description{margin:0;color:var(--cfg-muted);font-size:12px;line-height:18px;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.dsh-bc-diagram-wrap{min-width:0;margin-top:auto}
.dsh-bc-diagram{display:block;width:100%;max-width:180px;height:auto;margin:8px auto 0;color:var(--cfg-subtle)}
.dsh-bc-diagram text{fill:currentColor;font-family:inherit;font-size:11px}
.dsh-bc-mode[aria-checked=true] .dsh-bc-diagram{color:var(--cfg-accent-text)}
.dsh-bc-node{fill:var(--cfg-sunken);stroke:var(--cfg-line-2);stroke-width:1}
.dsh-bc-node-strong{fill:var(--cfg-raised);stroke:var(--cfg-line-3)}
.dsh-bc-node-accent{fill:var(--cfg-accent-soft);stroke:var(--cfg-accent)}
.dsh-bc-node-dashed{stroke:var(--cfg-line-3)}
.dsh-bc-edge{stroke:currentColor;stroke-width:1;fill:none}
.dsh-bc-strategy-foot{margin-top:2px}
.dsh-bc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px}
.dsh-bc-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-setting-row{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:10px 0;border-bottom:1px solid var(--cfg-line)}
.dsh-bc-setting-row:last-child{border-bottom:0}
.dsh-bc-setting-main{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.dsh-bc-setting-label{font-size:13px;line-height:20px;font-weight:500;color:var(--cfg-text)}
.dsh-bc-setting-desc{font-size:12px;line-height:18px;color:var(--cfg-subtle)}
.dsh-bc-setting-control{display:flex;align-items:center;gap:8px;flex:none}
.dsh-bc-threshold{display:flex;flex-direction:column;gap:4px}
.dsh-bc-thresholdHead{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}
.dsh-bc-number{position:relative;min-width:0}
.dsh-bc-number .dsh-bc-input{padding-right:24px;appearance:textfield}
.dsh-bc-number input::-webkit-inner-spin-button,.dsh-bc-number input::-webkit-outer-spin-button{appearance:none;margin:0}
.dsh-bc-number-inline{flex:none;width:76px}
.dsh-bc-number-inline .dsh-bc-input{height:28px;text-align:right}
.dsh-bc-unit{position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--cfg-subtle);font-size:11px;line-height:18px}
.dsh-bc-switch{appearance:none;position:relative;flex:none;width:34px;height:20px;margin:0;padding:0;border:1px solid var(--cfg-line-3);border-radius:999px;background:var(--cfg-sunken);cursor:pointer;transition:background-color var(--cfg-dur) ease,border-color var(--cfg-dur) ease}
.dsh-bc-switch:before{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--cfg-muted);transition:transform var(--cfg-dur) ease,background-color var(--cfg-dur) ease}
.dsh-bc-switch:checked{border-color:var(--cfg-solid);background:var(--cfg-solid)}
.dsh-bc-switch:checked:before{background:var(--cfg-on-accent);transform:translateX(14px)}
.dsh-bc-range-wrap{position:relative;display:flex;align-items:center;height:28px;min-width:0}
.dsh-bc-range-wrap:before{content:"";position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);height:4px;border-radius:2px;background:var(--cfg-line)}
.dsh-bc-range-fill{position:absolute;left:0;top:50%;transform:translateY(-50%);height:4px;border-radius:2px;background:var(--cfg-accent)}
.dsh-bc-range{appearance:none;position:relative;z-index:1;display:block;width:100%;height:28px;margin:0;background:transparent;cursor:pointer}
.dsh-bc-range::-webkit-slider-runnable-track{height:4px;background:transparent}
.dsh-bc-range::-moz-range-track{height:4px;background:transparent}
.dsh-bc-range::-webkit-slider-thumb{appearance:none;width:14px;height:14px;margin-top:-5px;border:2px solid var(--cfg-accent);border-radius:50%;background:var(--cfg-raised)}
.dsh-bc-range::-moz-range-thumb{width:10px;height:10px;border:2px solid var(--cfg-accent);border-radius:50%;background:var(--cfg-raised)}
.dsh-bc-scale{display:flex;justify-content:space-between;font-size:11px;line-height:16px;color:var(--cfg-subtle)}
.dsh-bc-label{font-size:12px;font-weight:500;line-height:18px;color:var(--cfg-muted)}
.dsh-bc-input,.dsh-bc-btn{height:var(--cfg-control);min-width:0;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-raised);color:var(--cfg-text);font:inherit;line-height:20px}
.dsh-bc-input{width:100%;padding:0 9px;transition:border-color var(--cfg-dur) ease}
.dsh-bc-input:hover:not(:disabled){border-color:var(--cfg-line-3)}
.dsh-bc-input:focus-visible{border-color:var(--cfg-accent);outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--cfg-accent));outline-offset:1px}
.dsh-bc-input[aria-invalid=true]{border-color:var(--cfg-danger)}
.dsh-bc-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;white-space:nowrap;cursor:pointer;font-weight:500;transition:background-color var(--cfg-dur) ease,border-color var(--cfg-dur) ease}
.dsh-bc-btn:hover:not(:disabled){background:var(--cfg-hover)}
.dsh-bc-btn:active:not(:disabled){background:color-mix(in srgb,var(--cfg-text) 6%,var(--cfg-raised))}
.dsh-bc-btn-primary{border-color:transparent;background:var(--cfg-solid);color:var(--cfg-on-accent)}
.dsh-bc-btn-primary:hover:not(:disabled){background:color-mix(in srgb,var(--cfg-solid) 88%,var(--cfg-text))}
.dsh-bc-btn-remove:hover:not(:disabled){color:var(--cfg-danger)}
.dsh-bc-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;min-width:0;padding:6px 0;border-bottom:1px solid var(--cfg-line)}
.dsh-bc-row:last-child{border-bottom:0}
.dsh-bc-row-label{min-width:0;color:var(--cfg-muted);font-size:12px}
.dsh-bc-row-value{min-width:0;text-align:right;font-size:12px;overflow-wrap:anywhere}
.dsh-bc-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;min-width:0}
.dsh-bc-metric{display:flex;flex-direction:column;gap:2px;min-width:0}
.dsh-bc-metric-value{font-size:13px;line-height:20px;font-weight:500;overflow-wrap:anywhere}
.dsh-bc-budget-view{display:flex;flex-direction:column;gap:10px;min-width:0}
.dsh-bc-retention{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:12px 16px;align-items:start;min-width:0}
.dsh-bc-composition{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-bar{position:relative;min-width:0;height:20px;border:1px solid var(--cfg-line-2);border-radius:4px;overflow:hidden;background:var(--cfg-sunken)}
.dsh-bc-bar-track{display:flex;width:100%;height:100%}
.dsh-bc-bar-seg{flex:none;height:100%;border-right:1px solid var(--cfg-line)}
.dsh-bc-seg-fixed,.dsh-bc-swatch-fixed{background:var(--cfg-subtle);opacity:.45}
.dsh-bc-seg-history,.dsh-bc-swatch-history{background:var(--cfg-accent);opacity:.3}
.dsh-bc-seg-tail,.dsh-bc-swatch-tail{background:var(--cfg-accent)}
.dsh-bc-seg-summary,.dsh-bc-swatch-summary{background:var(--cfg-accent);opacity:.6}
.dsh-bc-seg-headroom,.dsh-bc-swatch-headroom{background:var(--cfg-line-3);opacity:.8}
.dsh-bc-seg-free{background:transparent}
.dsh-bc-trigger,.dsh-bc-current-line{position:absolute;top:0;bottom:0;pointer-events:none;max-width:100%;transform:translateX(-1px);border-left:1px solid var(--cfg-text)}
.dsh-bc-current-line{border-color:var(--cfg-accent)}
.dsh-bc-legend{display:flex;flex-wrap:wrap;gap:4px 12px;margin:0;padding:0;list-style:none;color:var(--cfg-subtle);font-size:11px;line-height:18px}
.dsh-bc-legend li{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-bc-swatch{display:block;flex:none;width:10px;height:10px;border:1px solid var(--cfg-line-2);border-radius:2px}
.dsh-bc-retain-choice{display:flex;flex-direction:column;gap:6px;min-width:0;margin:0;padding:0;border:0}
.dsh-bc-retain-choice legend{margin:0 0 6px;padding:0}
.dsh-bc-segmented{display:flex;gap:2px;height:32px;padding:2px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-sunken)}
.dsh-bc-segment{position:relative;display:flex;align-items:center;justify-content:center;flex:1;min-width:0;padding:0 8px;border:1px solid transparent;border-radius:var(--cfg-r-sm);color:var(--cfg-muted);font-size:12px;line-height:20px;cursor:pointer;white-space:nowrap}
.dsh-bc-segment input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:inherit}
.dsh-bc-segment:hover{background:var(--cfg-hover)}
.dsh-bc-segment[data-checked=true]{background:var(--cfg-raised);border-color:var(--cfg-line-2);color:var(--cfg-accent-text);font-weight:500}
.dsh-bc-segment:has(input:focus-visible){outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--cfg-accent));outline-offset:2px}
.dsh-bc-segment:has(input:disabled){opacity:.4;cursor:not-allowed}
.dsh-bc-explanation{min-width:0;font-size:12px;line-height:18px}
.dsh-bc-explanation>summary{display:flex;align-items:center;gap:8px;min-height:28px;width:fit-content;padding:0;color:var(--cfg-muted);cursor:pointer;list-style:none}
.dsh-bc-explanation>summary::-webkit-details-marker{display:none}
.dsh-bc-explanation>summary:before{content:"";flex:none;width:5px;height:5px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(-45deg)}
.dsh-bc-explanation[open]>summary:before{transform:translateY(-2px) rotate(45deg)}
.dsh-bc-explanation-body{display:flex;flex-direction:column;gap:8px;padding-top:8px;min-width:0}
.dsh-bc-details{min-width:0;border-top:1px solid var(--cfg-line-2);padding-top:12px}
.dsh-bc-details>summary{display:flex;align-items:center;gap:8px;min-height:28px;padding:0;font-size:12px;line-height:18px;font-weight:500;color:var(--cfg-subtle);cursor:pointer;list-style:none}
.dsh-bc-details>summary::-webkit-details-marker{display:none}
.dsh-bc-details>summary:before{content:"";flex:none;width:5px;height:5px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(-45deg)}
.dsh-bc-details[open]>summary:before{transform:translateY(-2px) rotate(45deg)}
.dsh-bc-details-body,.dsh-bc-policy-body{display:flex;flex-direction:column;gap:16px;min-width:0;padding-top:12px}
.dsh-bc-policy{min-width:0;border-top:1px solid var(--cfg-line)}
.dsh-bc-policy>summary{padding:10px 0;font-size:12px;overflow-wrap:anywhere;cursor:pointer}
.dsh-bc-policy-body{padding-top:4px;padding-bottom:12px}
.dsh-bc-status-record{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-status-line{margin:0;font-size:12px;font-weight:500;line-height:18px}
.dsh-bc-status-failed,.dsh-bc-status-persistence-error{color:var(--cfg-danger)}
.dsh-bc-status-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 16px}
.dsh-bc-continuation{display:flex;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-reasons,.dsh-bc-bullets{display:flex;flex-direction:column;gap:4px;margin:0;padding-left:18px;color:var(--cfg-muted);font-size:12px;line-height:18px}
.dsh-bc-reasons li{min-width:0;overflow-wrap:anywhere}
.dsh-bc-session{display:flex;align-items:center;gap:8px;min-width:0;width:100%}
.dsh-bc-session .dsh-bc-label{flex:none}
.dsh-bc-session .dsh-bc-select{flex:1;min-width:0}
.dsh-bc-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;min-width:0;padding:8px 0;border-top:1px solid var(--cfg-line-2)}
.dsh-bc-banner .dsh-bc-chip{white-space:normal;max-width:100%;height:auto;min-height:20px;padding:2px 8px;border-radius:var(--cfg-r-sm);line-height:16px}
.dsh-bc-banner-title{font-size:12px;line-height:18px;color:var(--cfg-muted)}
.dsh-bc-runtime{display:flex;flex-direction:column;gap:12px;min-width:0}
.dsh-bc-preview{display:flex;flex-direction:column;gap:8px;padding-top:12px;border-top:1px solid var(--cfg-line);min-width:0}
.dsh-bc-preview-arrow{height:16px;line-height:16px;text-align:center;color:var(--cfg-subtle)}
.dsh-bc-preview-line{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0;padding-top:8px;border-top:1px solid var(--cfg-line);font-size:12px;line-height:18px;color:var(--cfg-muted)}
.dsh-bc-preview-line .dsh-bc-preview-arrow{height:auto;line-height:18px;color:var(--cfg-subtle)}
.dsh-bc-workbench{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:start;min-width:0}
.dsh-bc-workbench[data-has-preview=true]{grid-template-columns:minmax(0,1fr) 280px}
.dsh-bc-main{display:flex;flex-direction:column;gap:12px;min-width:0}
.dsh-bc-rail{position:sticky;top:0;min-width:0}
.dsh-bc-rail .dsh-bc-budget-view{padding:12px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-lg);background:var(--cfg-raised)}
.dsh-bc-rail .dsh-bc-metrics{grid-template-columns:1fr;gap:6px}
.dsh-bc-rail .dsh-bc-metric{flex-direction:row;align-items:baseline;justify-content:space-between;gap:8px}
.dsh-bc-rail .dsh-bc-legend{gap:4px 12px}
.dsh-bc-footer{position:static;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 0;border-top:1px solid var(--cfg-line-2);background:var(--cfg-canvas);margin-top:auto}
.dsh-bc-footer-copy{display:flex;flex:1;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-actions{display:flex;gap:8px;margin-left:auto}
.dsh-bc-save-feedback{position:sticky;bottom:8px;align-self:flex-end;margin:0;padding:6px 10px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-sm);background:var(--cfg-raised);color:var(--cfg-muted);font-size:12px;line-height:18px}
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
.dsh-bc-page :is(button,input,summary,[role=combobox],[role=radio]):focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--cfg-accent));outline-offset:2px}
@container better-compact (max-width:860px){.dsh-bc-workbench[data-has-preview=true]{grid-template-columns:minmax(0,1fr)}.dsh-bc-rail{position:static;max-height:none;overflow:visible}}
@container better-compact (max-width:640px){.dsh-bc-page :is(button,summary),.dsh-bc-input,.dsh-bc-range,.dsh-bc-select-option{min-height:44px}.dsh-bc-range-wrap{height:44px}.dsh-bc-segmented{height:auto;min-height:44px}.dsh-bc-segment{min-height:38px}.dsh-bc-setting-row:has(.dsh-bc-switch){flex-direction:row;align-items:center}.dsh-bc-setting-control:has(.dsh-bc-switch){width:auto;min-height:44px;min-width:44px;justify-content:center}.dsh-bc-switch:after{content:"";position:absolute;inset:-13px -6px}.dsh-bc-modes{grid-template-columns:1fr}.dsh-bc-setting-row{align-items:stretch;flex-direction:column;gap:8px}.dsh-bc-setting-control{width:100%}.dsh-bc-grid,.dsh-bc-status-grid,.dsh-bc-retention{grid-template-columns:1fr}.dsh-bc-metrics{grid-template-columns:1fr;gap:6px}.dsh-bc-metric{flex-direction:row;align-items:baseline;justify-content:space-between;gap:12px}.dsh-bc-session{flex-wrap:wrap}.dsh-bc-session .dsh-bc-label{flex-basis:100%}.dsh-bc-footer-copy{flex-basis:100%}.dsh-bc-actions{margin-left:auto}}
@container better-compact (max-width:560px){.dsh-bc-title{font-size:18px;line-height:26px}.dsh-bc-modes{grid-template-columns:1fr}.dsh-bc-mode{display:flex;flex-direction:column}.dsh-bc-grid,.dsh-bc-status-grid,.dsh-bc-retention{grid-template-columns:1fr}.dsh-bc-metrics{grid-template-columns:1fr;gap:6px}.dsh-bc-metric{flex-direction:row;align-items:baseline;justify-content:space-between;gap:12px}.dsh-bc-section{padding-top:10px}.dsh-bc-setting-row{align-items:stretch;flex-direction:column;gap:8px}.dsh-bc-setting-control{width:100%}.dsh-bc-session{flex-wrap:wrap}.dsh-bc-session .dsh-bc-label{flex-basis:100%}.dsh-bc-footer-copy{flex-basis:100%}.dsh-bc-actions{margin-left:auto}.dsh-bc-details-body,.dsh-bc-policy-body{padding-top:10px}}
@media (max-width:640px), (pointer:coarse){.dsh-bc-page :is(button,summary),.dsh-bc-input,.dsh-bc-range,.dsh-bc-select-option{min-height:44px}.dsh-bc-range-wrap{height:44px}.dsh-bc-segmented{height:auto;min-height:44px}.dsh-bc-segment{min-height:38px}.dsh-bc-setting-row:has(.dsh-bc-switch){flex-direction:row;align-items:center}.dsh-bc-setting-control:has(.dsh-bc-switch){width:auto;min-height:44px;min-width:44px;justify-content:center}.dsh-bc-switch:after{content:"";position:absolute;inset:-13px -6px}}
@media (prefers-reduced-motion:reduce){.dsh-bc-page *{transition:none!important;animation:none!important}}

/* One editable process surface; stages keep their connections on narrow panels. */
.dsh-bc-process{display:flex;flex-direction:column;gap:16px;min-width:0}
.dsh-bc-process-heading{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap}
.dsh-bc-process-heading .dsh-bc-h4{font-size:16px;line-height:24px}
.dsh-bc-process-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px 24px;min-width:0}
.dsh-bc-process-stage{position:relative;display:flex;flex-direction:column;gap:16px;min-width:0;padding:20px;border:1px solid var(--cfg-line);border-radius:12px;background:var(--cfg-raised)}
.dsh-bc-stage-head{display:flex;align-items:center;gap:10px}
.dsh-bc-stage-head .dsh-bc-h3{color:var(--cfg-text);font-size:14px;line-height:22px}
.dsh-bc-stage-number{display:grid;place-items:center;flex:none;min-width:28px;height:28px;border:1px solid var(--cfg-control-line);border-radius:6px;color:var(--cfg-muted);font-size:12px}
.dsh-bc-stage-context,.dsh-bc-stage-trigger,.dsh-bc-stage-result{grid-column:1/-1}
.dsh-bc-stage-context:after{content:'↓';position:absolute;top:100%;left:50%;height:40px;line-height:40px;text-align:center;color:var(--cfg-muted)}
.dsh-bc-stage-trigger:after{content:'';position:absolute;top:100%;left:50%;height:20px;border-left:1px solid var(--cfg-control-line)}
.dsh-bc-stage-summary:before{content:'';position:absolute;bottom:calc(100% + 19px);left:50%;width:calc(100% + 24px);border-top:1px solid var(--cfg-control-line)}
.dsh-bc-stage-summary:after,.dsh-bc-stage-retention:before{content:'↓';position:absolute;bottom:100%;left:50%;height:20px;line-height:20px;text-align:center;color:var(--cfg-muted)}
.dsh-bc-stage-result{background:var(--cfg-sunken)}
.dsh-bc-stage-result:before{content:'';position:absolute;bottom:calc(100% + 20px);left:25%;width:50%;height:20px;border-left:1px solid var(--cfg-control-line);border-right:1px solid var(--cfg-control-line);border-bottom:1px solid var(--cfg-control-line)}
.dsh-bc-stage-result:after{content:'↓';position:absolute;bottom:100%;left:50%;height:20px;line-height:20px;color:var(--cfg-muted)}
.dsh-bc-anatomy{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-anatomy-parts{display:flex;gap:8px;list-style:none;margin:0;padding:0;min-width:0}
.dsh-bc-anatomy-part{display:flex;align-items:center;justify-content:center;flex:1;min-width:0;min-height:48px;padding:10px 12px;border:1px solid var(--cfg-control-line);border-radius:6px;background:var(--cfg-raised);text-align:center;font-size:13px;line-height:20px}
.dsh-bc-anatomy-part[data-part=earlier],.dsh-bc-anatomy-part[data-part=summary],.dsh-bc-anatomy-part[data-part=goalSummary],.dsh-bc-anatomy-part[data-part=handoffBody]{background:var(--cfg-accent-soft);border-color:var(--cfg-accent)}
.dsh-bc-process-metrics{display:flex;flex-direction:column;gap:8px}
.dsh-bc-process-metrics .dsh-bc-metric{flex-direction:row;align-items:baseline;justify-content:space-between;gap:12px}
.dsh-bc-process-cache,.dsh-bc-process-model{display:flex;flex-direction:column;gap:10px;min-width:0}
.dsh-bc-process-model .dsh-bc-grid{grid-template-columns:1fr}
.dsh-bc-process-path{margin:0;padding:10px 12px;background:var(--cfg-sunken);border:1px solid var(--cfg-line);border-radius:6px;font-size:12px;line-height:20px}
.dsh-bc-process-result{margin:0;font-size:16px;line-height:26px;font-weight:500}
.dsh-bc-process .dsh-bc-modes{gap:6px}
.dsh-bc-process .dsh-bc-mode{padding:10px 8px;border-radius:6px;gap:6px}
.dsh-bc-process .dsh-bc-mode-head{gap:6px}
.dsh-bc-process .dsh-bc-mode-title{font-size:12px}
.dsh-bc-process .dsh-bc-radio-dot{width:12px;height:12px}
.dsh-bc-process .dsh-bc-mode-description{font-size:11px;line-height:17px}
.dsh-bc-process .dsh-bc-strategy-foot{margin:0}
.dsh-bc-process .dsh-bc-range-wrap,.dsh-bc-process .dsh-bc-range{height:44px}
.dsh-bc-process .dsh-bc-range::-webkit-slider-thumb{width:16px;height:24px;margin-top:-10px;border:1px solid var(--cfg-accent);border-radius:4px}
.dsh-bc-process .dsh-bc-range::-moz-range-thumb{width:16px;height:24px;border:1px solid var(--cfg-accent);border-radius:4px}
.dsh-bc-process .dsh-bc-segmented{height:auto;min-height:36px}
.dsh-bc-process .dsh-bc-segment{padding:6px 8px;line-height:18px;text-align:center}
@container better-compact (max-width:680px){.dsh-bc-process-grid{grid-template-columns:minmax(0,1fr);gap:28px}.dsh-bc-process-stage{grid-column:auto;padding:16px}.dsh-bc-process-stage:before{display:none}.dsh-bc-process-stage:after{content:'↓';position:absolute;top:100%;bottom:auto;left:50%;width:auto;height:28px;line-height:28px;border:0;background:none;transform:translateX(-50%);color:var(--cfg-muted)}.dsh-bc-stage-result:after{display:none}.dsh-bc-process .dsh-bc-mode{display:flex}.dsh-bc-process .dsh-bc-mode-head{grid-column:auto}.dsh-bc-process .dsh-bc-modes{grid-template-columns:repeat(3,minmax(0,1fr))}.dsh-bc-anatomy-part{padding:10px 6px}}
/* ── 2026 visual pass: capacity, four strategies, prompt editor ───────── */
.dsh-bc-page{max-width:1000px;gap:20px}
.dsh-bc-page-titleBlock{display:flex;flex-direction:column;gap:4px;min-width:0}
.dsh-bc-page-sub{margin:0;color:var(--cfg-muted);font-size:13px;line-height:20px}
.dsh-bc-editor{display:flex;flex-direction:column;gap:24px;min-width:0}
.dsh-bc-section{border-top:0;padding:0;gap:12px}
.dsh-bc-section-head{border-bottom:0;padding-bottom:0;align-items:baseline;margin-bottom:0}
.dsh-bc-row{border-bottom:0;padding:4px 0}
.dsh-bc-caption,.dsh-bc-help{color:var(--cfg-subtle)}
.dsh-bc-warn{margin:0;color:var(--cfg-warn);font-size:12px;line-height:18px}

.dsh-bc-modes-4{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.dsh-bc-mode{padding:12px;border-radius:var(--cfg-r-lg);gap:8px;background:var(--cfg-raised)}
.dsh-bc-mode-head{flex-wrap:wrap;row-gap:4px;align-items:center}
.dsh-bc-mode-title{font-size:13px}
.dsh-bc-mode-tag{margin-left:auto;display:inline-flex;align-items:center;min-height:20px;padding:0 7px;border:1px solid var(--cfg-control-line);border-radius:999px;color:var(--cfg-muted);font-size:10px;line-height:16px;white-space:nowrap}
.dsh-bc-mode[aria-checked=true] .dsh-bc-mode-tag{border-color:color-mix(in srgb,var(--cfg-accent) 40%,transparent);color:var(--cfg-accent-text)}
.dsh-bc-mode-description{margin:0;color:var(--cfg-muted);font-size:12px;line-height:18px;min-height:36px}
.dsh-bc-mode-caption{margin:auto 0 0;color:var(--cfg-subtle);font-size:11px;line-height:16px}
.dsh-bc-flow{display:flex;flex-direction:column;gap:4px;min-width:0;margin-top:6px}
.dsh-bc-flow-prefix{display:flex;align-items:center;justify-content:space-between;gap:6px;min-height:24px;padding:2px 7px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-sm);background:var(--cfg-sunken);color:var(--cfg-muted);font-size:10px;line-height:16px}
.dsh-bc-flow-chip{padding:0 5px;border:1px solid var(--cfg-control-line);border-radius:999px;font-size:9px;white-space:nowrap}
.dsh-bc-flow-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:4px;min-width:0}
.dsh-bc-flow-node{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:0;min-height:46px;padding:4px;border:1px solid var(--cfg-control-line);border-radius:var(--cfg-r-sm);background:var(--cfg-raised);text-align:center}
.dsh-bc-flow-node strong{font-size:10px;line-height:15px;font-weight:500;overflow-wrap:anywhere}
.dsh-bc-flow-node span{color:var(--cfg-subtle);font-size:9px;line-height:14px;overflow-wrap:anywhere}
.dsh-bc-flow-state{background:var(--cfg-accent-soft);border-color:color-mix(in srgb,var(--cfg-accent) 55%,var(--cfg-control-line))}
.dsh-bc-flow-tail{border-color:var(--cfg-accent);background:var(--cfg-accent-soft)}
.dsh-bc-flow-arrow{text-align:center;color:var(--cfg-subtle);font-size:11px;line-height:14px}
.dsh-bc-flow-result{display:flex;flex-direction:column;align-items:center;gap:1px;min-height:36px;padding:4px 6px;border:1px solid var(--cfg-accent);border-radius:var(--cfg-r-sm);background:var(--cfg-accent-soft);text-align:center}
.dsh-bc-flow-result strong{font-size:10px;line-height:15px;font-weight:500}
.dsh-bc-flow-result span{color:var(--cfg-muted);font-size:9px;line-height:14px}
.dsh-bc-strategy-note{margin-top:2px}
.dsh-bc-strategy-extra{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-cache-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.dsh-bc-cache-row .dsh-bc-setting-main{flex:1;min-width:200px}
.dsh-bc-process-path{margin:0;padding:8px 10px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-sm);background:var(--cfg-sunken);font-size:12px;line-height:20px}
.dsh-bc-process-result{margin:0;font-size:15px;line-height:24px;font-weight:500}
.dsh-bc-prompt-hint{margin:0}

.dsh-bc-capacity{display:flex;flex-direction:column;gap:12px;min-width:0;padding:14px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-lg);background:var(--cfg-raised)}
.dsh-bc-capacity-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap}
.dsh-bc-capacity-bar{height:52px;margin-top:18px;overflow:visible;border-radius:var(--cfg-r-sm);background:var(--cfg-sunken)}
.dsh-bc-capacity-bar .dsh-bc-bar-track{overflow:hidden;border-radius:var(--cfg-r-sm)}
.dsh-bc-capacity-bar .dsh-bc-bar-seg{display:flex;align-items:center;justify-content:center;min-width:0;border-right:0;color:var(--cfg-text);font-size:11px;line-height:16px;white-space:nowrap}
.dsh-bc-capacity-bar .dsh-bc-bar-seg:not(:last-child){border-right:1px solid color-mix(in srgb,var(--cfg-text) 10%,transparent)}
.dsh-bc-bar-label{min-width:0;overflow:hidden;padding:0 6px;text-overflow:ellipsis}
.dsh-bc-seg-fixed{background:color-mix(in srgb,var(--cfg-subtle) 34%,var(--cfg-raised));color:var(--cfg-muted)}
.dsh-bc-seg-compressible{background:color-mix(in srgb,var(--cfg-accent) 20%,var(--cfg-raised))}
.dsh-bc-seg-retained{background:color-mix(in srgb,var(--cfg-accent) 52%,var(--cfg-raised))}
.dsh-bc-seg-headroom{background:color-mix(in srgb,var(--cfg-subtle) 14%,var(--cfg-raised))}
.dsh-bc-seg-reserved{background:color-mix(in srgb,var(--cfg-line-3) 26%,var(--cfg-raised));color:var(--cfg-muted)}
.dsh-bc-trigger{position:absolute;top:0;bottom:0;z-index:3;border-left:2px solid var(--cfg-warn);pointer-events:none;transform:translateX(-1px)}
.dsh-bc-current-line{position:absolute;top:0;bottom:0;z-index:2;border-left:1px solid var(--cfg-text);opacity:.55;pointer-events:none}
.dsh-bc-handle{position:absolute;top:-10px;z-index:5;width:20px;height:72px;padding:0;border:0;background:transparent;cursor:ew-resize;transform:translateX(-50%);touch-action:none}
.dsh-bc-handle:disabled{opacity:.4;cursor:not-allowed}
.dsh-bc-handle-line{position:absolute;top:12px;bottom:12px;left:50%;width:2px;border-radius:1px;background:var(--cfg-accent);transform:translateX(-50%)}
.dsh-bc-handle-chip{position:absolute;bottom:calc(100% + 2px);left:50%;display:inline-flex;align-items:center;min-height:22px;padding:0 7px;border:1px solid var(--cfg-accent);border-radius:999px;background:var(--cfg-overlay);color:var(--cfg-accent-text);font-size:10px;line-height:16px;white-space:nowrap;transform:translateX(-50%);pointer-events:none}
.dsh-bc-handle[data-handle=retain] .dsh-bc-handle-chip{top:calc(100% + 2px);bottom:auto}
.dsh-bc-retain-pin{position:absolute;top:calc(100% + 2px);z-index:4;display:inline-flex;align-items:center;min-height:20px;padding:0 6px;border:1px solid var(--cfg-control-line);border-radius:999px;background:var(--cfg-overlay);color:var(--cfg-muted);font-size:10px;line-height:16px;white-space:nowrap;transform:translateX(-50%);pointer-events:none}
.dsh-bc-capacity-labels{display:flex;flex-wrap:wrap;gap:4px 16px;color:var(--cfg-subtle);font-size:11px;line-height:18px}
.dsh-bc-capacity-legend{display:flex;flex-wrap:wrap;gap:4px 14px;margin:0;padding:0;list-style:none;color:var(--cfg-subtle);font-size:11px;line-height:18px}
.dsh-bc-capacity-legend li{display:flex;align-items:center;gap:5px}
.dsh-bc-swatch-compressible{background:color-mix(in srgb,var(--cfg-accent) 20%,var(--cfg-raised))}
.dsh-bc-swatch-retained{background:color-mix(in srgb,var(--cfg-accent) 52%,var(--cfg-raised))}
.dsh-bc-swatch-headroom{background:color-mix(in srgb,var(--cfg-subtle) 14%,var(--cfg-raised))}
.dsh-bc-capacity-summary{display:flex;align-items:baseline;gap:6px 12px;flex-wrap:wrap;min-width:0;font-size:13px;line-height:20px}
.dsh-bc-capacity-summary strong{font-weight:500}
.dsh-bc-savings{display:inline-flex;align-items:center;min-height:20px;padding:0 7px;border-radius:999px;background:var(--cfg-accent-soft);color:var(--cfg-accent-text);font-size:11px;line-height:16px}
.dsh-bc-capacity-metrics{display:flex;flex-wrap:wrap;gap:2px 16px;min-width:0;padding:0;border-top:0}
.dsh-bc-capacity-metrics .dsh-bc-metric{flex-direction:row;align-items:baseline;gap:4px}
.dsh-bc-capacity-metrics .dsh-bc-metric-value{font-size:11px}
.dsh-bc-capacity-metrics .dsh-bc-caption{font-size:11px}
.dsh-bc-capacity-controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 16px;min-width:0}
.dsh-bc-capacity-controls .dsh-bc-scale{display:none}
.dsh-bc-retain-control{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-auto-row{display:flex;align-items:flex-start;gap:8px 20px;flex-wrap:wrap}
.dsh-bc-auto-row .dsh-bc-setting-main{flex:none}
.dsh-bc-auto-help{flex:1;min-width:240px;padding-top:6px}
.dsh-bc-session-row{display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap;min-width:0}
.dsh-bc-session-row .dsh-bc-session{flex:1;min-width:220px}
.dsh-bc-session-help{flex-basis:100%}

.dsh-bc-chip{display:inline-flex;align-items:center;min-height:22px;padding:0 7px;border:1px solid var(--cfg-control-line);border-radius:999px;color:var(--cfg-muted);font-size:11px;line-height:16px;white-space:nowrap}
.dsh-bc-prompt-toolbar{display:flex;flex-direction:column;gap:8px;min-width:0;padding:10px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-md);background:var(--cfg-sunken)}
.dsh-bc-prompt-group{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
.dsh-bc-prompt-group>.dsh-bc-caption{min-width:38px}
.dsh-bc-variable{height:26px;padding:0 8px;border-color:var(--cfg-control-line);background:var(--cfg-raised);color:var(--cfg-text);font-size:11px;cursor:pointer}
.dsh-bc-variable:hover:not(:disabled){border-color:var(--cfg-accent);background:var(--cfg-accent-soft);color:var(--cfg-accent-text)}
.dsh-bc-textarea{display:block;width:100%;min-height:170px;padding:10px 12px;border:1px solid var(--cfg-control-line);border-radius:var(--cfg-r-md);background:var(--cfg-raised);color:var(--cfg-text);font:inherit;font-size:13px;line-height:1.6;resize:vertical}
.dsh-bc-textarea:hover:not(:disabled){border-color:var(--cfg-line-3)}
.dsh-bc-textarea[aria-invalid=true]{border-color:var(--cfg-danger)}
.dsh-bc-prompt-foot{display:flex;align-items:baseline;gap:4px 12px;flex-wrap:wrap;min-width:0}

@media (max-width:900px){.dsh-bc-modes-4{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container better-compact (max-width:700px){.dsh-bc-modes-4{grid-template-columns:repeat(2,minmax(0,1fr))}.dsh-bc-capacity-controls{grid-template-columns:1fr}.dsh-bc-mode{display:flex}.dsh-bc-mode-head,.dsh-bc-mode-description{grid-column:auto}}
@container better-compact (max-width:560px){.dsh-bc-modes-4{grid-template-columns:1fr}.dsh-bc-capacity{padding:12px}.dsh-bc-capacity-bar{height:46px;margin-top:30px;margin-bottom:28px}.dsh-bc-handle{width:24px}.dsh-bc-capacity-bar .dsh-bc-bar-label{display:none}.dsh-bc-handle-chip{font-size:9px;padding:0 5px}.dsh-bc-prompt-toolbar{padding:8px}.dsh-bc-textarea{min-height:200px}.dsh-bc-session-row .dsh-bc-session{min-width:0;flex-basis:100%}}

/* clearer single process, compact cards, no nested policy folds */
.dsh-bc-mode-description{min-height:0}
.dsh-bc-mode{padding:12px}
.dsh-bc-flowmap{display:flex;flex-direction:column;gap:0;min-width:0;padding:10px 14px;border:1px solid var(--cfg-line);border-radius:10px;background:var(--cfg-raised)}
.dsh-bc-step{display:grid;grid-template-columns:26px minmax(0,1fr);gap:10px;min-width:0;padding:11px 0}
.dsh-bc-step-number{display:flex;align-items:center;justify-content:center;width:24px;height:24px;border:1px solid var(--cfg-control-line);border-radius:50%;color:var(--cfg-muted);font-size:10px;line-height:16px;font-variant-numeric:tabular-nums}
.dsh-bc-step-body{min-width:0}
.dsh-bc-step-body h4{margin:0 0 4px;font-size:13px;line-height:20px;font-weight:500}
.dsh-bc-step-body p{margin:0;color:var(--cfg-muted);font-size:12px;line-height:18px}
.dsh-bc-step-body p+p{margin-top:3px}
.dsh-bc-flow-arrow{text-align:left;padding-left:10px;color:var(--cfg-subtle);font-size:12px;line-height:20px}
.dsh-bc-flowChips{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}
.dsh-bc-flowChip{display:inline-flex;align-items:baseline;gap:6px;padding:3px 8px;border:1px solid var(--cfg-control-line);border-radius:6px;background:var(--cfg-sunken);font-size:11px;line-height:18px;min-width:0}
.dsh-bc-flowChip strong{font-weight:500;color:var(--cfg-muted)}
.dsh-bc-flowChip span{color:var(--cfg-text);font-variant-numeric:tabular-nums}
.dsh-bc-flowChip[data-tone=compressible]{background:color-mix(in srgb,var(--cfg-accent) 10%,var(--cfg-raised))}
.dsh-bc-flowChip[data-tone=retained]{background:var(--cfg-accent-soft);border-color:color-mix(in srgb,var(--cfg-accent) 40%,var(--cfg-control-line))}
.dsh-bc-custom-model{margin-top:8px;padding:10px;border:1px solid var(--cfg-line);border-radius:8px;background:var(--cfg-sunken)}
.dsh-bc-policy-card{margin-top:8px;padding:10px;border:1px solid var(--cfg-line);border-radius:8px;background:var(--cfg-raised)}
.dsh-bc-policy-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;min-width:0}
.dsh-bc-policy-head>span{min-width:0;overflow-wrap:anywhere;font-size:12px;line-height:18px}
.dsh-bc-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 16px;min-width:0;padding:8px 0}
.dsh-bc-facts .dsh-bc-metric{gap:2px}
.dsh-bc-facts .dsh-bc-metric-value{font-size:12px}
.dsh-bc-prompt-toolbar{flex-direction:row;flex-wrap:wrap;align-items:center;gap:6px;padding:8px}
.dsh-bc-prompt-toolbar .dsh-bc-caption{flex-basis:100%}
@container better-compact (max-width:700px){.dsh-bc-facts{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container better-compact (max-width:560px){.dsh-bc-facts{grid-template-columns:1fr}.dsh-bc-flowmap{padding:8px 10px}.dsh-bc-step{grid-template-columns:22px minmax(0,1fr);gap:8px;padding:9px 0}.dsh-bc-step-number{width:20px;height:20px;font-size:9px}.dsh-bc-prompt-toolbar{padding:8px}}

/* single bold SVG process */
.dsh-bc-strategy-svg{display:block;width:100%;max-width:560px;height:auto;margin:10px auto 0;color:var(--cfg-muted);overflow:visible}
.dsh-bc-strategy-svg text{fill:currentColor;font-family:inherit}
.dsh-bc-svg-node-title{font-size:15px;font-weight:500;fill:var(--cfg-text)}
.dsh-bc-svg-node-sub{font-size:12px;fill:var(--cfg-subtle)}
.dsh-bc-svg-note{font-size:12px;fill:var(--cfg-subtle)}
.dsh-bc-strategy-svg .dsh-bc-node{fill:var(--cfg-sunken);stroke:var(--cfg-control-line);stroke-width:1}
.dsh-bc-strategy-svg .dsh-bc-node-strong{fill:var(--cfg-raised);stroke:var(--cfg-line-3)}
.dsh-bc-strategy-svg .dsh-bc-node-accent{fill:var(--cfg-accent-soft);stroke:var(--cfg-accent)}.dsh-bc-svg-tag{fill:var(--cfg-sunken);stroke:var(--cfg-control-line);stroke-width:1}
.dsh-bc-svg-tag-accent{fill:var(--cfg-accent-soft);stroke:var(--cfg-accent)}
.dsh-bc-svg-tag-text{font-size:10px;fill:var(--cfg-muted)}
.dsh-bc-svg-tag-text-accent{fill:var(--cfg-accent-text)}

.dsh-bc-strategy-svg .dsh-bc-node-dashed{stroke:var(--cfg-line-3)}
.dsh-bc-strategy-svg .dsh-bc-edge{stroke:var(--cfg-subtle);stroke-width:1;fill:none}
.dsh-bc-strategy-layout{display:grid;grid-template-columns:minmax(230px,.8fr) minmax(0,1.2fr);gap:24px;align-items:start;min-width:0}
.dsh-bc-strategy-choice,.dsh-bc-strategy-figure{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-strategy-layout .dsh-bc-modes{grid-template-columns:minmax(0,1fr)}
.dsh-bc-strategy-figure .dsh-bc-strategy-svg{max-width:400px;margin:0}
@container better-compact (max-width:680px){.dsh-bc-strategy-layout{grid-template-columns:1fr}.dsh-bc-strategy-layout .dsh-bc-modes{grid-template-columns:repeat(2,minmax(0,1fr))}.dsh-bc-strategy-figure .dsh-bc-strategy-svg{max-width:560px}}
@container better-compact (max-width:560px){.dsh-bc-strategy-layout .dsh-bc-modes{grid-template-columns:1fr}}


@container better-compact (max-width:560px){.dsh-bc-svg-node-title{font-size:16px}.dsh-bc-svg-node-sub{font-size:13px}.dsh-bc-svg-note{font-size:13px}}

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
		/**
		* GET one read-only JSON endpoint; never sends a write verb.
		* @param path - same-origin pathname, query included.
		* @param signal - abort signal for a superseded request.
		* @returns the parsed JSON object.
		*/
		async function getJson(path, signal) {
			const fetcher = typeof fetch === "function" ? fetch : void 0;
			if (fetcher === void 0) throw new Error("HTTP fetch is unavailable in this client");
			const response = await fetcher(path, {
				method: "GET",
				headers: { accept: "application/json" },
				credentials: "same-origin",
				cache: "no-store",
				...signal === void 0 || signal === null ? {} : { signal }
			});
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
			if (payload === void 0 || payload === null || typeof payload !== "object") throw new Error("the read-only response was not JSON");
			return payload;
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
			return /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-field" }, /* @__PURE__ */ react.default.createElement("label", {
				id: id + "-label",
				htmlFor: id,
				className: "dsh-bc-label"
			}, props.label), props.children(id, {
				"aria-labelledby": id + "-label",
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
				error: props.error
			}, (id, aria) => /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-number" }, /* @__PURE__ */ react.default.createElement("input", {
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
			const triggerPercent = known ? Math.max(0, Math.min(100, knownThreshold / knownWindow * 100)) : 0;
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
			}, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-capacity-head" }, /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-caption" }, processText("configBudget")), /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-caption dsh-bc-mono",
				"data-bc": "capacity-ratio"
			}, ratioText(ratio) + " · " + (known ? tokensText(threshold) : t("unknown")))), /* @__PURE__ */ react.default.createElement("div", {
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
			}) : null, known ? /* @__PURE__ */ react.default.createElement("span", {
				className: "dsh-bc-trigger",
				style: { left: triggerPercent + "%" },
				title: processText("effective") + " " + ratioText(triggerPercent / 100),
				"data-bc": "effective-trigger"
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
			}, retainLabel) : null), /* @__PURE__ */ react.default.createElement("ul", {
				className: "dsh-bc-capacity-legend",
				"aria-hidden": true
			}, [
				["compressible", labelFor.compressible],
				["retained", labelFor.retained],
				["headroom", labelFor.headroom]
			].map(([key, label]) => /* @__PURE__ */ react.default.createElement("li", { key }, /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-swatch dsh-bc-swatch-" + key }), label))), unknown ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-caption",
				"data-bc": "budget-incomplete"
			}, processText("unknownBudget") + " " + t("ratioOnly")) : null, known ? /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-capacity-labels" }, /* @__PURE__ */ react.default.createElement("span", null, processText("currentUsage") + ": " + (current === null ? t("unknown") : tokensText(current))), /* @__PURE__ */ react.default.createElement("span", null, processText("window") + ": " + tokensText(windowTokens)), /* @__PURE__ */ react.default.createElement("span", null, processText("effective") + ": " + tokensText(threshold)), /* @__PURE__ */ react.default.createElement("span", null, processText("retained") + ": " + tokensText(retain))) : null);
		}
		/** Capacity, trigger, retention and the visible headroom field. */
		function CapacitySection(props) {
			const { draft, disabled, projected, preview, fieldError, onDraft } = props;
			Number(draft.thresholdRatio === "" ? .8 : draft.thresholdRatio);
			Number(draft.retainRatio === "" ? DEFAULT_RETAIN_RATIO : draft.retainRatio);
			const saved = preview && typeof preview.beforeTokens === "number" && Number.isFinite(preview.beforeTokens) && typeof preview.afterUpperBoundTokens === "number" && Number.isFinite(preview.afterUpperBoundTokens) ? preview.beforeTokens - preview.afterUpperBoundTokens : null;
			const savedPercent = saved !== null && preview && typeof preview.beforeTokens === "number" && preview.beforeTokens > 0 ? saved / preview.beforeTokens * 100 : null;
			return /* @__PURE__ */ react.default.createElement(Section, {
				name: "capacity",
				dataBc: "capacity",
				title: processText("capacityTitle"),
				aside: /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-caption" }, t("draftLabel"))
			}, /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-note" }, processText("capacityIntro")), props.sessionControl ? /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-session-row" }, props.sessionControl, /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-caption dsh-bc-session-help" }, processText("sessionHelp"))) : null, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-auto-row" }, /* @__PURE__ */ react.default.createElement(Toggle, {
				name: "auto",
				label: processText("auto"),
				checked: draft.auto,
				disabled,
				onChange: (auto) => onDraft({ auto })
			}), /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-help dsh-bc-auto-help" }, draft.auto ? processText("triggerHelp") : processText("autoOff"))), draft.auto ? /* @__PURE__ */ react.default.createElement(react.default.Fragment, null, /* @__PURE__ */ react.default.createElement("div", { "data-bc": projected ? "draft-budget" : void 0 }, /* @__PURE__ */ react.default.createElement(CapacityBar, {
				draft,
				projected,
				budget: props.budget,
				disabled,
				onDraft
			})), /* @__PURE__ */ react.default.createElement("div", {
				className: "dsh-bc-capacity-summary",
				"data-bc": "capacity-summary"
			}, saved !== null && preview && typeof preview.afterUpperBoundTokens === "number" ? /* @__PURE__ */ react.default.createElement(react.default.Fragment, null, /* @__PURE__ */ react.default.createElement("strong", null, processText("before") + " " + tokensText(preview.beforeTokens) + " → " + processText("after") + " ≤ " + tokensText(preview.afterUpperBoundTokens)), savedPercent !== null ? /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-savings" }, processText("savings") + " " + tokensText(Math.max(0, saved)) + " (" + ratioText(savedPercent / 100) + ")") : null) : projected ? /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-caption" }, processText("effective") + " " + tokensText(projected.threshold) + " · " + processText("retained") + " " + tokensText(projected.retain)) : null, projected ? /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-caption" }, processText("resultHelp")) : null), projected ? /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-capacity-metrics" }, /* @__PURE__ */ react.default.createElement(Metric, {
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
			})) : null, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-capacity-controls" }, /* @__PURE__ */ react.default.createElement(NumberField, {
				name: "thresholdRatio",
				label: processText("triggerHandle"),
				ratio: true,
				value: draft.thresholdRatio,
				disabled,
				error: fieldError("thresholdRatio"),
				onChange: (thresholdRatio) => onDraft({ thresholdRatio })
			}), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-retain-control" }, /* @__PURE__ */ react.default.createElement("fieldset", { className: "dsh-bc-retain-choice" }, /* @__PURE__ */ react.default.createElement("legend", { className: "dsh-bc-label" }, processText("retain")), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-segmented" }, [["ratio", processText("byRatio")], ["tokens", processText("fixed")]].map(([value, label]) => /* @__PURE__ */ react.default.createElement("label", {
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
				value: draft.retainRatio === "" ? String(DEFAULT_RETAIN_RATIO) : draft.retainRatio,
				disabled,
				error: fieldError("retainRatio"),
				onChange: (retainRatioValue) => onDraft({ retainRatio: retainRatioValue })
			}) : /* @__PURE__ */ react.default.createElement(NumberField, {
				name: "retainTokens",
				label: processText("tokens"),
				value: draft.retainTokens,
				disabled,
				error: fieldError("retainTokens"),
				onChange: (retainTokens) => onDraft({ retainTokens })
			})), /* @__PURE__ */ react.default.createElement(NumberField, {
				name: "headroomTokens",
				label: processText("headroom"),
				value: draft.headroomTokens,
				disabled,
				error: fieldError("headroomTokens"),
				onChange: (headroomTokens) => onDraft({ headroomTokens })
			})), /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-caption" }, processText("retainHelp") + " " + processText("headroomHelp"))) : /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-note",
				"data-bc": "auto-off"
			}, processText("autoOff")), projected?.policy ? /* @__PURE__ */ react.default.createElement("p", {
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
			}, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-strategy-layout" }, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-strategy-choice" }, /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-caption" }, t("strategyChoiceLabel")), /* @__PURE__ */ react.default.createElement(ModeCards, {
				value: draft.mode,
				disabled,
				onChange: changeMode
			})), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-strategy-figure" }, /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-caption" }, t("strategyFigureLabel")), /* @__PURE__ */ react.default.createElement(CompactionFlow, {
				mode: draft.mode,
				draft,
				projected,
				preview: props.preview,
				fixedTokens: props.budget?.fixedTokens
			}))), /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-strategy-extra" }, draft.mode !== "native" ? /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-cache-row" }, /* @__PURE__ */ react.default.createElement(Toggle, {
				name: "cachePriority",
				label: processText("cache"),
				checked: draft.cachePriority,
				disabled,
				onChange: (cachePriority) => props.onDraft({ cachePriority })
			}), /* @__PURE__ */ react.default.createElement("p", { className: "dsh-bc-caption" }, processText("cacheHelp"))) : null, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-cache-row" }, /* @__PURE__ */ react.default.createElement(Toggle, {
				name: "summaryImage",
				label: t("summaryImage"),
				title: t("summaryImageHint"),
				checked: draft.summaryImage,
				disabled: disabled || !summaryImageApplies,
				onChange: (summaryImage) => props.onDraft({ summaryImage })
			})))), /* @__PURE__ */ react.default.createElement(Section, {
				name: "generation",
				dataBc: "generation",
				title: processText("generationTitle"),
				aside: /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-caption" }, processText("generationIntro"))
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
			}), /* @__PURE__ */ react.default.createElement(NumberField, {
				name: "maxTokens",
				label: processText("summaryCap"),
				value: draft.maxTokens,
				min: 1,
				disabled,
				help: processText("followHeadroom"),
				error: fieldError("maxTokens"),
				onChange: (maxTokens) => props.onDraft({ maxTokens })
			}), projected ? /* @__PURE__ */ react.default.createElement("p", {
				className: "dsh-bc-caption",
				"data-bc": "draft-summary-note"
			}, processText("summaryBudget") + ": " + tokensText(projected.summary)) : null), draft.mode === "custom" ? /* @__PURE__ */ react.default.createElement(PromptEditor, {
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
			return /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-process-model" }, /* @__PURE__ */ react.default.createElement("div", { className: "dsh-bc-grid" }, /* @__PURE__ */ react.default.createElement(Field, {
				name: "summaryRoute",
				label: t("summaryModel"),
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
			}, entry.provider + "/" + entry.model)), /* @__PURE__ */ react.default.createElement("option", { value: "custom" }, custom ? draft.provider + "/" + draft.model : t("customModelOption")))), !native ? /* @__PURE__ */ react.default.createElement(Field, {
				name: "reasoningEffort",
				label: t("reasoningEffort"),
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
			})) : null), showCustom ? /* @__PURE__ */ react.default.createElement("div", {
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
			return /* @__PURE__ */ react.default.createElement(Section, {
				name: "diagnostics",
				dataBc: "diagnostics",
				title: t("statusSection"),
				aside: /* @__PURE__ */ react.default.createElement("span", { className: "dsh-bc-caption" }, t("statusReadOnly"))
			}, props.inspectError ? /* @__PURE__ */ react.default.createElement("p", {
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
			}, /* @__PURE__ */ react.default.createElement(ReasonList, { reasons })) : null);
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