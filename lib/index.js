import { $ as ROW_CONFIG_KEYS, A as reservedCompletionTokens, B as deepFreeze, F as targetFromHeader, G as ENGINE_ENTRY_ID, I as isBetterCompactEngine, J as INSPECT_PATH, K as ENTRY_ID, L as serviceIdentity, M as resolveTargetPolicy, O as fixedPrefixTokens, P as selectCompactableRange, Q as ROW_CONFIG_KEY, R as Config, S as detectSummaryMode, U as APOLLO_LEGACY_ROW_CONFIG_KEY, V as readConfig, W as APOLLO_ROW_CONFIG_KEY, X as MODES, Y as MODELS_PATH, Z as PACKAGE_NAME, c as isSummaryActive, i as installFont, j as resolveCompactSpec, k as measurementKind, l as lastBudgetFallback, n as FontInstallError, q as FONT_PATH, r as fontStatus, s as continuationOutcome, t as optionalService, u as lastCompactionFailure, z as configEquals } from "./chunks/services.js";
import { Session } from "@deepseek-ai/dsh-session";
import { ROLE_OVERHEAD, estimateContent, estimateMessage, estimateToolsTokens } from "@deepseek-ai/dsh-token-meter/estimate";
/** Fixed replacement framing tokens included in the preview upper bound. */
const NATIVE_CHECKPOINT_FRAMING_TOKENS = estimateContent([{
	type: "text",
	text: `This is an automatically generated checkpoint condensing an earlier span of the conversation to free up context. Treat the captured context as established background and build on it without restating it. Continue the task directly from the messages that follow, without acknowledging this checkpoint.\n\n<compacted-summary>`
}, {
	type: "text",
	text: "</compacted-summary>"
}]) + ROLE_OVERHEAD;
/** Structured failure the HTTP layer maps to a status. */
var InspectError = class extends Error {
	/** HTTP status the route answers with. */
	status;
	/** Stable machine code for the failure. */
	code;
	/**
	* @param status - HTTP status.
	* @param code - stable machine code.
	* @param message - human-readable detail.
	*/
	constructor(status, code, message) {
		super(message);
		this.name = "InspectError";
		this.status = status;
		this.code = code;
	}
};
/** Read one optional service without failing inspection. */
function service$1(ctx, name) {
	try {
		return ctx.get(name);
	} catch {
		return;
	}
}
/** Build the stable inspect payload for a resolved session. */
function emptyPayload(activeConfig, requiresReload, sessionId = null) {
	return {
		activeConfig,
		requiresReload,
		sessionId,
		engine: null,
		diagnostics: [],
		budget: null,
		preview: null,
		lastCompaction: null,
		handoffContinuation: null
	};
}
/**
* Determine which compaction engine actually serves a session, so inspect
* never presents better-compact's configuration/budget for a session running
* another preset's native engine.
*/
function engineOwnership(ctx, resolved) {
	if (resolved.agent === void 0) return {
		owner: "unknown",
		inspectApplies: true,
		reason: resolved.session === null ? "no live agent or replayable session is available; engine ownership cannot be proven" : "the session is not live; engine ownership cannot be proven, so budget/preview use the active configuration"
	};
	let presets;
	try {
		presets = ctx.get("agentPresets");
	} catch {
		presets = void 0;
	}
	let mounted;
	if (presets !== void 0 && typeof presets.serviceFor === "function") try {
		mounted = presets.serviceFor(resolved.agent, "compaction");
	} catch {
		mounted = void 0;
	}
	if (mounted !== void 0) {
		if (isBetterCompactEngine(mounted)) return {
			owner: "better-compact-preset",
			inspectApplies: true,
			reason: null
		};
		return {
			owner: "foreign-preset",
			inspectApplies: false,
			reason: `the session preset owns a different compaction engine (${serviceIdentity(mounted)?.constructor?.name ?? "unknown"}); better-compact configuration and budget preview do not apply to it`
		};
	}
	let hostEngine;
	try {
		hostEngine = ctx.get("compaction");
	} catch {
		hostEngine = void 0;
	}
	if (hostEngine !== void 0 && isBetterCompactEngine(hostEngine)) return {
		owner: "host",
		inspectApplies: true,
		reason: null
	};
	return {
		owner: "unknown",
		inspectApplies: true,
		reason: "no better-compact engine is mounted for this session; budget/preview use the active plugin configuration"
	};
}
/** Collect the session's own log events without mutating it. */
function eventsOf(session) {
	const events = [];
	for (let seq = 0; seq < session.seq; seq += 1) {
		const event = session.eventAt(seq);
		if (event !== void 0) events.push(event);
	}
	return events;
}
/** Find the latest request header event in a log. */
function latestHeader(events) {
	for (let index = events.length - 1; index >= 0; index -= 1) {
		const event = events[index];
		if (event.type === "request/header") return event.data.header;
	}
}
/** Project one compaction summary's text from its blocks. */
function summaryText(summary) {
	if (!Array.isArray(summary)) return "";
	return summary.filter((block) => block.type === "text").map((block) => block.text).join("\n");
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
function projectLastCompaction(events, sessionId, options = {}) {
	const estimate = options.estimate ?? estimateMessage;
	let latestStart;
	const summaries = /* @__PURE__ */ new Map();
	const ends = /* @__PURE__ */ new Map();
	const replacements = /* @__PURE__ */ new Map();
	for (const event of events) switch (event.type) {
		case "compaction/start":
			latestStart = event;
			break;
		case "compaction/summary":
			summaries.set(event.data.compactionId, event);
			break;
		case "compaction/end":
			ends.set(event.data.compactionId, event);
			break;
		case "user/message": if (event.data.source?.kind === "compact-checkpoint") replacements.set(event.data.source.compactionId, event);
	}
	if (latestStart === void 0) return null;
	const id = latestStart.data.compactionId;
	const summary = summaries.get(id);
	const end = ends.get(id);
	const replacement = replacements.get(id);
	const observedFailure = lastCompactionFailure(sessionId);
	const failureMatches = observedFailure?.compactionId === id;
	let status;
	if (end === void 0) status = isSummaryActive(sessionId, id) ? "running" : "failed";
	else if (failureMatches && observedFailure.status === "persistence-error") status = "persistence-error";
	else if (end.data.error !== void 0) status = /abort|cancel/i.test(end.data.error) ? "cancelled" : "failed";
	else status = "completed";
	const mode = summary === void 0 ? null : detectSummaryMode(summaryText(summary.data.summary));
	const error = end?.data.error ?? (failureMatches && status !== "completed" ? observedFailure.message : void 0) ?? null;
	return {
		id,
		trigger: latestStart.data.turn === null ? "manual" : "automatic",
		status,
		mode,
		beforeTokens: summary?.data.shadowedTokenCount ?? null,
		afterTokens: replacement === void 0 ? null : estimate(replacement.data),
		durationMs: end === void 0 ? null : end.time - latestStart.time,
		cacheReadTokens: summary?.data.usage?.cacheReadTokens ?? null,
		cacheWriteTokens: summary?.data.usage?.cacheWriteTokens ?? null,
		error
	};
}
/**
* Build the budget/preview section for one session.
* @param input - resolved inspection inputs.
* @returns sections.
*/
function buildBudgetPreview(input) {
	const { session, events, activeConfig } = input;
	const header = latestHeader(events);
	const target = targetFromHeader(header);
	const diagnostics = [];
	const info = input.modelInfo;
	const measurement = input.measurement;
	const toolsTokens = estimateToolsTokens(header);
	const contextWindow = info?.context?.contextWindow ?? null;
	let spec;
	let policy;
	let budgetReason;
	if (target === void 0) budgetReason = "no routed request exists yet, so the pressure threshold cannot be resolved; send one request or configure summarizationProvider/Model";
	else if (contextWindow === null) budgetReason = input.modelInfoError ?? `no context capacity is known for ${target.provider}/${target.model}; configure contextWindow on that adapter model`;
	else {
		policy = resolveTargetPolicy(activeConfig, target);
		const reserved = reservedCompletionTokens(header, info?.defaultMaxTokens);
		try {
			spec = resolveCompactSpec(policy, contextWindow, reserved);
		} catch (error) {
			budgetReason = error instanceof Error ? error.message : String(error);
		}
	}
	if (budgetReason !== void 0) diagnostics.push(budgetReason);
	const reservedCompletion = target === void 0 ? null : reservedCompletionTokens(header, info?.defaultMaxTokens);
	const budget = {
		target: target ?? null,
		contextWindow,
		reservedCompletionTokens: reservedCompletion,
		messageBudgetTokens: contextWindow === null || reservedCompletion === null ? null : contextWindow - reservedCompletion,
		headroomTokens: policy?.headroomTokens ?? null,
		pressureBudgetTokens: policy === void 0 || contextWindow === null || reservedCompletion === null ? null : contextWindow - reservedCompletion - policy.headroomTokens,
		ratioThresholdTokens: policy === void 0 || contextWindow === null ? null : Math.floor(contextWindow * policy.thresholdRatio),
		currentTokens: measurement?.totalTokens ?? null,
		measurement: measurementKind(measurement),
		fixedTokens: session !== null && measurement !== void 0 ? fixedPrefixTokens(session, measurement, toolsTokens) : null,
		thresholdTokens: spec?.thresholdTokens ?? null,
		retainTokens: spec?.retainTokens ?? null,
		summaryMaxTokens: policy?.maxTokens ?? activeConfig.maxTokens
	};
	if (session === null || measurement === void 0) return {
		budget,
		preview: null,
		diagnostics: [...diagnostics, measurement === void 0 ? "token measurement is unavailable for this session" : "session surface is unavailable; token measurement could not be projected"]
	};
	let range = null;
	let selectionError;
	if (budgetReason === void 0) try {
		range = selectCompactableRange(session, measurement, spec.retainTokens);
	} catch (error) {
		selectionError = error instanceof Error ? error.message : String(error);
	}
	if (budgetReason !== void 0 || selectionError !== void 0) {
		if (selectionError !== void 0) diagnostics.push(selectionError);
		return {
			budget,
			preview: {
				beforeTokens: measurement.totalTokens,
				afterUpperBoundTokens: null,
				rangeStart: null,
				rangeEnd: null,
				reason: budgetReason ?? selectionError
			},
			diagnostics
		};
	}
	if (range === null) return {
		budget,
		preview: {
			beforeTokens: measurement.totalTokens,
			afterUpperBoundTokens: null,
			rangeStart: null,
			rangeEnd: null,
			reason: "no safe compactable range: the session has no older balanced span left after the system prompt and retained tail, or every candidate would split a tool-call/result pair"
		},
		diagnostics
	};
	const endIndex = session.surface.nodes.indexOf(range.end);
	let tailTokens = 0;
	if (endIndex >= 0) for (let index = endIndex + 1; index < measurement.nodes.length; index += 1) tailTokens += measurement.nodes[index].tokens;
	const afterUpperBoundTokens = (budget.fixedTokens ?? 0) + tailTokens + spec.maxTokens + NATIVE_CHECKPOINT_FRAMING_TOKENS;
	const belowTrigger = measurement.totalTokens >= spec.thresholdTokens ? null : `current ${measurement.totalTokens} tokens are below the automatic trigger ${spec.thresholdTokens}; this is the candidate range, not a running compaction`;
	const autoDisabled = activeConfig.auto === false ? "automatic compaction is disabled (auto=false); this preview is informational only" : null;
	const reason = belowTrigger === null && autoDisabled === null ? null : [belowTrigger, autoDisabled].filter((part) => part !== null).join("; ");
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
			reason
		},
		diagnostics
	};
}
/** Map a session-query failure to an inspect error. */
function mapSessionQueryError(error) {
	const failed = error;
	const code = typeof failed?.code === "string" ? failed.code : "";
	if (code === "SESSION_QUERY_SESSION_NOT_FOUND") return new InspectError(404, "SESSION_NOT_FOUND", `session "${String(failed?.sessionId ?? "")}" was not found or is not visible to this host`.trim());
	if (code === "SESSION_QUERY_PERSISTENCE_FAILED") return new InspectError(503, "SESSION_QUERY_UNAVAILABLE", `session persistence is unavailable: ${String(failed?.message)}`);
	if (code === "SESSION_QUERY_ABORTED") return new InspectError(503, "INSPECTION_ABORTED", String(failed?.message));
	return new InspectError(503, "SESSION_QUERY_UNAVAILABLE", `session inspection failed: ${error instanceof Error ? error.message : String(error)}`);
}
/**
* Resolve a live or cold session into a replay object plus its events.
*/
async function resolveSession(ctx, sessionId) {
	const liveAgent = service$1(ctx, "agents")?.get(sessionId);
	if (liveAgent !== void 0) return {
		session: liveAgent.session,
		events: eventsOf(liveAgent.session),
		agent: liveAgent,
		cold: false
	};
	const sessions = service$1(ctx, "sessions");
	const liveSession = sessions?.get(sessionId);
	if (liveSession !== void 0) return {
		session: liveSession,
		events: eventsOf(liveSession),
		agent: void 0,
		cold: false
	};
	const sessionQuery = service$1(ctx, "sessionQuery");
	if (sessionQuery === void 0) throw new InspectError(503, "SESSION_QUERY_UNAVAILABLE", "this host has no session-query service, so a non-live session cannot be inspected; the live session remains inspectable");
	let observation;
	try {
		observation = await sessionQuery.observeSession(sessionId);
	} catch (error) {
		throw mapSessionQueryError(error);
	}
	try {
		const events = [...observation.events];
		let session = null;
		try {
			const projections = sessions?.messageProjections ?? [];
			session = Session.create(observation.header.id, observation.events, observation.header, observation.inheritedEventCount, projections);
		} catch {
			session = null;
		}
		return {
			session,
			events,
			agent: void 0,
			cold: true
		};
	} finally {
		try {
			observation[Symbol.dispose]?.();
		} catch {}
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
async function inspectPlugin(ctx, companion, sessionId = null) {
	const activeConfig = companion.snapshot();
	let requiresReload;
	try {
		requiresReload = !configEquals(companion.current(), activeConfig);
	} catch {
		requiresReload = true;
	}
	if (sessionId === null) return emptyPayload(activeConfig, requiresReload);
	const resolved = await resolveSession(ctx, sessionId);
	const events = resolved.events;
	const lastCompaction = projectLastCompaction(events, sessionId);
	const engine = engineOwnership(ctx, resolved);
	const handoffContinuation = continuationOutcome(sessionId);
	if (!engine.inspectApplies) return {
		activeConfig,
		requiresReload,
		sessionId,
		engine,
		diagnostics: [engine.reason].filter((value) => value !== null),
		budget: null,
		preview: null,
		lastCompaction,
		handoffContinuation
	};
	const tokenMeter = service$1(ctx, "tokenMeter");
	let measurement;
	let measurementFailure;
	if (resolved.session !== null && tokenMeter !== void 0) try {
		measurement = tokenMeter.measure(resolved.session);
	} catch (error) {
		measurementFailure = error instanceof Error ? error.message : String(error);
	}
	const header = latestHeader(events);
	const target = targetFromHeader(header);
	let info;
	let modelInfoError;
	if (target !== void 0) {
		const llm = service$1(ctx, "llm");
		if (llm !== void 0) try {
			info = await llm.resolveModelInfo(target.provider, target.model);
		} catch (error) {
			modelInfoError = `model metadata is unavailable for ${target.provider}/${target.model}: ${error instanceof Error ? error.message : String(error)}`;
			measurementFailure ??= modelInfoError;
		}
	}
	const sections = buildBudgetPreview({
		ctx,
		session: resolved.session,
		events,
		activeConfig,
		measurement,
		modelInfo: info,
		modelInfoError
	});
	const diagnostics = [...sections.diagnostics];
	if (measurementFailure !== void 0) diagnostics.push(measurementFailure);
	const fallback = lastBudgetFallback(sessionId);
	if (fallback !== null) diagnostics.push(`the last enhanced summary omitted authoritative state to fit the model budget: ${fallback.omitted.join("; ")}`);
	if (engine.reason !== null) diagnostics.push(engine.reason);
	return {
		activeConfig,
		requiresReload,
		sessionId,
		engine,
		diagnostics: [...new Set(diagnostics.filter((entry) => typeof entry === "string" && entry.length > 0))],
		budget: sections.budget,
		preview: sections.preview,
		lastCompaction,
		handoffContinuation
	};
}
// src/models.ts
/** Whether a value is a plain object (not an array/null). */
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** Read one optional host service without failing the route. */
function service(ctx, name) {
	try {
		return ctx.get(name);
	} catch {
		return;
	}
}
/**
* Project the host's allowed model routes with their advertised efforts.
*
* Mirrors the small `collectTierRoutes` pattern in `dsh-better-subagent`:
* `subagentModelSelection.current().allowedModels` is the candidate source and
* `ctx.llm.resolveModelInfo(provider, model)` supplies the opaque effort ids.
* A failed per-route capability lookup only empties that route's effort list;
* it never hides the route or invents an effort.
*
* @param ctx - host companion context.
* @returns the read-only models payload.
*/
async function collectModelRoutes(ctx) {
	let selection;
	try {
		selection = service(ctx, "subagentModelSelection")?.current?.();
	} catch {
		selection = void 0;
	}
	if (!isRecord(selection) || !Array.isArray(selection.allowedModels)) return {
		enabled: false,
		routes: []
	};
	const llm = service(ctx, "llm");
	const seen = /* @__PURE__ */ new Set();
	const routes = [];
	for (const entry of selection.allowedModels) {
		if (!isRecord(entry) || typeof entry.provider !== "string" || entry.provider.length === 0 || typeof entry.model !== "string" || entry.model.length === 0) continue;
		const key = `${entry.provider}\u0000${entry.model}`;
		if (seen.has(key)) continue;
		seen.add(key);
		let efforts = [];
		let defaultEffort = "";
		if (llm !== void 0 && typeof llm.resolveModelInfo === "function") try {
			const reasoning = (await llm.resolveModelInfo(entry.provider, entry.model))?.reasoning;
			efforts = Array.isArray(reasoning?.efforts) ? reasoning.efforts.map((effort) => effort?.id).filter((id) => typeof id === "string" && id !== "") : [];
			const advertised = reasoning?.defaultEffort;
			defaultEffort = typeof advertised === "string" && efforts.includes(advertised) ? advertised : "";
		} catch {
			efforts = [];
			defaultEffort = "";
		}
		routes.push({
			provider: entry.provider,
			model: entry.model,
			efforts,
			defaultEffort
		});
	}
	return {
		enabled: selection.enabled === true,
		routes
	};
}
// src/index.ts
/** Cordis function-plugin name (also the client module identity). */
const name = PACKAGE_NAME;
/** Maximum accepted `sessionId` query value length. */
const MAX_SESSION_ID_LENGTH = 256;
/**
* JSON response; live facts are never cacheable.
* @param res - response owning the reply.
* @param status - HTTP status code.
* @param payload - JSON-serializable body.
*/
function sendJson(res, status, payload) {
	res.statusCode = status;
	res.setHeader("content-type", "application/json; charset=utf-8");
	res.setHeader("cache-control", "no-store");
	res.end(JSON.stringify(payload));
}
/**
* Method-not-allowed response for the read-only route.
* @param res - response owning the reply.
* @param allow - exact methods the route accepts.
*/
function sendMethodNotAllowed(res, allow) {
	res.statusCode = 405;
	res.setHeader("allow", allow);
	res.setHeader("cache-control", "no-store");
	res.end();
}
/**
* Bad-query response.
* @param res - response owning the reply.
* @param message - actionable rejection detail.
*/
function sendBadQuery(res, message) {
	sendJson(res, 400, {
		code: "INVALID_QUERY",
		message
	});
}
/**
* Parse the optional `sessionId` query.
* @param req - request whose URL is read.
* @returns the accepted session id (null when absent), or the rejection reason.
*/
function parseQuery(req) {
	let url;
	try {
		url = new URL(String(req.url ?? "/"), "http://localhost");
	} catch {
		return { error: "the request URL could not be parsed" };
	}
	const params = url.searchParams;
	for (const key of params.keys()) if (key !== "sessionId") return { error: `unknown query parameter "${key}"; only "sessionId" is accepted` };
	const values = params.getAll("sessionId");
	if (values.length > 1) return { error: "sessionId may be supplied at most once" };
	if (values.length === 0) return { sessionId: null };
	const sessionId = values[0];
	if (typeof sessionId !== "string" || sessionId.trim().length === 0) return { error: "sessionId must be a non-empty string" };
	if (sessionId.length > MAX_SESSION_ID_LENGTH) return { error: `sessionId is longer than the ${MAX_SESSION_ID_LENGTH}-character limit` };
	return { sessionId };
}
/**
* Apply the Host trust fence shared by every route, read or write.
*
* The route is only registered when the Host webserver and `connection` fence
* both exist; a fence that disappears later must still fail closed. The
* connection service is the composition's authenticated/trusted Web boundary
* (Host/Origin fence + browser authentication); this plugin adds no
* cross-origin allowance or trust switch of its own, and its one write (the
* font install) is a fixed, integrity-checked artifact under that same fence.
*
* @param ctx - host context.
* @param req - request being authorized.
* @param res - response owning the rejection.
* @param unavailableCode - wire code used when the fence is absent.
* @returns true when the request was rejected and a response sent.
*/
function rejectUntrustedRequest(ctx, req, res, unavailableCode) {
	const connection = optionalService(ctx, "connection");
	if (typeof connection?.requestRejection !== "function") {
		sendJson(res, 503, {
			code: unavailableCode,
			message: "the host connection trust fence is unavailable; the read-only API route is disabled"
		});
		return true;
	}
	let rejection;
	try {
		rejection = connection.requestRejection(req);
	} catch (error) {
		sendJson(res, 503, {
			code: "CONNECTION_FENCE_UNAVAILABLE",
			message: `the host connection fence failed: ${error instanceof Error ? error.message : String(error)}`
		});
		return true;
	}
	if (rejection !== void 0) {
		res.statusCode = rejection;
		res.setHeader("cache-control", "no-store");
		res.end();
		return true;
	}
	return false;
}
/**
* One inspect request. Read-only: no LLM generation, compaction, CLI, goal
* change, or file write is performed here or in `inspectPlugin`.
*
* Exported as a test seam for the Host-fence (401/403) and wire-validation
* branches; production only reaches it through the registered GET route.
*
* @param ctx - host context.
* @param companion - `betterCompactConfig` provider.
* @param req - incoming request.
* @param res - response owning the reply.
*/
async function handleInspect(ctx, companion, req, res) {
	if (rejectUntrustedRequest(ctx, req, res, "INSPECT_UNAVAILABLE")) return;
	if (req.method !== "GET") {
		sendMethodNotAllowed(res, "GET");
		return;
	}
	const query = parseQuery(req);
	if ("error" in query) {
		sendBadQuery(res, query.error);
		return;
	}
	try {
		sendJson(res, 200, await inspectPlugin(ctx, companion, query.sessionId));
	} catch (error) {
		if (error instanceof InspectError) {
			sendJson(res, error.status, {
				code: error.code,
				message: error.message
			});
			return;
		}
		sendJson(res, 500, {
			code: "INSPECT_FAILED",
			message: `inspection failed: ${error instanceof Error ? error.message : String(error)}`
		});
	}
}
/**
* One read-only models request: the host's allowed summary-model candidates
* plus advertised efforts. No session, no provider I/O, no CLI, no writes.
*
* Exported as a test seam for the fence and method branches; production only
* reaches it through the registered GET route.
*
* @param ctx - host context.
* @param req - incoming request.
* @param res - response owning the reply.
*/
async function handleModels(ctx, req, res) {
	if (rejectUntrustedRequest(ctx, req, res, "MODELS_UNAVAILABLE")) return;
	if (req.method !== "GET") {
		sendMethodNotAllowed(res, "GET");
		return;
	}
	try {
		sendJson(res, 200, await collectModelRoutes(ctx));
	} catch (error) {
		sendJson(res, 500, {
			code: "MODELS_FAILED",
			message: `model route projection failed: ${error instanceof Error ? error.message : String(error)}`
		});
	}
}
/** Largest JSON body the font route accepts; the only field is `force`. */
const MAX_FONT_BODY_BYTES = 65536;
/** A rejected request body, carrying the status the route must answer with. */
var BodyRejection = class extends Error {
	/** HTTP status this rejection maps to. */
	status;
	/**
	* @param status - HTTP status to answer with.
	* @param message - actionable detail.
	*/
	constructor(status, message) {
		super(message);
		this.name = "BodyRejection";
		this.status = status;
	}
};
/**
* Read one bounded JSON body, or nothing.
* @param req - request whose body is read.
* @returns the parsed body, or an empty object when the body is empty.
* @throws {BodyRejection} 413 past the cap, 400 when the JSON does not parse.
*/
async function readJsonBody(req) {
	const chunks = [];
	let total = 0;
	for await (const chunk of req) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		total += buffer.byteLength;
		if (total > MAX_FONT_BODY_BYTES) throw new BodyRejection(413, `the request body exceeds ${MAX_FONT_BODY_BYTES} bytes`);
		chunks.push(buffer);
	}
	if (total === 0) return {};
	try {
		return JSON.parse(Buffer.concat(chunks).toString("utf8"));
	} catch {
		throw new BodyRejection(400, "the request body is not valid JSON");
	}
}
/** Production store: the pinned npm artifact and the resolved DSH home. */
const defaultFontStore = {
	status: () => fontStatus(),
	install: (options) => installFont({ force: options.force })
};
/**
* One font request: `GET` reports the installed state, `POST` installs the
* pinned face. This is the plugin's only write route; the artifact, its URL,
* its integrity and its destination are all fixed here, and the request body
* can only ask for a redownload.
*
* Exported as a test seam for the fence, method, media-type and body branches;
* production only reaches it through the registered GET|POST route.
*
* @param ctx - host context.
* @param store - font operations, injected in tests.
* @param req - incoming request.
* @param res - response owning the reply.
*/
async function handleFont(ctx, store, req, res) {
	if (rejectUntrustedRequest(ctx, req, res, "FONT_UNAVAILABLE")) return;
	if (req.method === "GET") {
		try {
			sendJson(res, 200, await store.status());
		} catch (error) {
			sendJson(res, 500, {
				code: "FONT_FAILED",
				message: `font status failed: ${error instanceof Error ? error.message : String(error)}`
			});
		}
		return;
	}
	if (req.method !== "POST") {
		sendMethodNotAllowed(res, "GET, POST");
		return;
	}
	if (String(req.headers["content-type"] ?? "").split(";")[0]?.trim().toLowerCase() !== "application/json") {
		sendJson(res, 415, {
			code: "UNSUPPORTED_MEDIA_TYPE",
			message: "the font install route accepts application/json only"
		});
		return;
	}
	let body;
	try {
		body = await readJsonBody(req);
	} catch (error) {
		if (error instanceof BodyRejection) {
			sendJson(res, error.status, {
				code: error.status === 413 ? "BODY_TOO_LARGE" : "INVALID_BODY",
				message: error.message
			});
			return;
		}
		sendJson(res, 400, {
			code: "INVALID_BODY",
			message: `the request body could not be read: ${error instanceof Error ? error.message : String(error)}`
		});
		return;
	}
	if (body === null || typeof body !== "object" || Array.isArray(body)) {
		sendJson(res, 400, {
			code: "INVALID_BODY",
			message: "the request body must be a JSON object"
		});
		return;
	}
	const record = body;
	const unknown = Object.keys(record).filter((key) => key !== "force");
	if (unknown.length > 0) {
		sendJson(res, 400, {
			code: "INVALID_BODY",
			message: `unknown field(s): ${unknown.join(", ")}; only "force" is accepted`
		});
		return;
	}
	const force = record.force;
	if (force !== void 0 && typeof force !== "boolean") {
		sendJson(res, 400, {
			code: "INVALID_BODY",
			message: "\"force\" must be a boolean"
		});
		return;
	}
	try {
		sendJson(res, 200, await store.install({ force: force === true }));
	} catch (error) {
		if (error instanceof FontInstallError) {
			sendJson(res, 502, {
				code: error.code,
				message: error.message
			});
			return;
		}
		sendJson(res, 500, {
			code: "FONT_FAILED",
			message: `font install failed: ${error instanceof Error ? error.message : String(error)}`
		});
	}
}
/**
* Mount the companion row.
* @param ctx - host context.
* @param config - live volatile row configuration.
* @throws when the configuration is invalid; the Loader reports the failed row.
*/
function apply(ctx, config = {}) {
	const snapshot = deepFreeze(readConfig(config));
	const companion = Object.freeze({
		snapshot: () => snapshot,
		current: () => readConfig(config),
		rowId: ENTRY_ID,
		packageName: PACKAGE_NAME
	});
	ctx.provide("betterCompactConfig", companion);
	ctx.inject(["settings"], (inner) => {
		try {
			const dispose = inner.settings.configure({ auto: false }, ctx.fiber);
			inner.effect(() => dispose, "dsh-better-compact: settings presentation");
		} catch (error) {
			inner.logger?.warn?.(`dsh-better-compact: could not configure the settings page: ${String(error)}`);
		}
	});
	ctx.inject(["webServer", "connection"], (inner) => {
		if (typeof inner.connection?.requestRejection !== "function") {
			inner.logger?.warn?.("dsh-better-compact: read-only API routes disabled because the Host connection fence is unavailable");
			return;
		}
		inner.effect(() => inner.webServer.register({
			kind: "exact",
			path: INSPECT_PATH,
			handler: (req, res) => handleInspect(inner, companion, req, res)
		}), `dsh-better-compact: GET ${INSPECT_PATH}`);
		inner.effect(() => inner.webServer.register({
			kind: "exact",
			path: MODELS_PATH,
			handler: (req, res) => handleModels(inner, req, res)
		}), `dsh-better-compact: GET ${MODELS_PATH}`);
		inner.effect(() => inner.webServer.register({
			kind: "exact",
			path: FONT_PATH,
			handler: (req, res) => handleFont(inner, defaultFontStore, req, res)
		}), `dsh-better-compact: GET|POST ${FONT_PATH}`);
	});
}
var src_default = {
	name,
	apply,
	Config
};
export { APOLLO_LEGACY_ROW_CONFIG_KEY, APOLLO_ROW_CONFIG_KEY, Config, ENGINE_ENTRY_ID, FONT_PATH, INSPECT_PATH, MODELS_PATH, MODES, ROW_CONFIG_KEY, ROW_CONFIG_KEYS, apply, src_default as default, handleFont, handleInspect, handleModels, name };
