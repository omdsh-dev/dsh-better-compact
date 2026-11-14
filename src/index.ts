/**
 * dsh-better-compact — HOST COMPANION row.
 *
 * This row owns no compaction service. It provides:
 *   1. the volatile configuration schema (`Config`, re-exported for the
 *      Loader) and the `betterCompactConfig` service with both the live value
 *      (`current()`) and the frozen load-time snapshot (`snapshot()`) that the
 *      engine actually holds;
 *   2. the read-only GET `/better-compact/api/inspect` and
 *      GET `/better-compact/api/models` routes on the Host webserver, behind
 *      the Host connection trust fence when that service is present; and
 *   3. the browser module package entry (`./client`), mounted by the client
 *      module loader from `dsh.client` in package.json.
 *
 * The engine row (`dsh-better-compact/engine`) reads the snapshot through this
 * service. It never re-registers compaction, goal, session, or history state.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
// Type-only: bring the `webServer` and `connection` Context augmentations into
// the program. Runtime reads stay property reads on the injected services.
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-client-connection'
import { Config, ENTRY_ID, PACKAGE_NAME, deepFreeze, readConfig } from './config.ts'
import { INSPECT_PATH, InspectError, inspectPlugin } from './inspect.ts'
import { MODELS_PATH, collectModelRoutes } from './models.ts'
import { optionalService } from './shared/services.ts'
import type { ConnectionService, SettingsService } from './shared/services.ts'
import type { ConfigSnapshot } from './shared/contract.ts'

export { Config } from './config.ts'
export {
  APOLLO_LEGACY_ROW_CONFIG_KEY,
  APOLLO_ROW_CONFIG_KEY,
  ENGINE_ENTRY_ID,
  MODES,
  ROW_CONFIG_KEY,
  ROW_CONFIG_KEYS,
} from './config.ts'
export { INSPECT_PATH } from './inspect.ts'
export { MODELS_PATH } from './models.ts'

/** Cordis function-plugin name (also the client module identity). */
export const name = PACKAGE_NAME

/** Maximum accepted `sessionId` query value length. */
const MAX_SESSION_ID_LENGTH = 256

/** The `betterCompactConfig` service this row provides. */
export interface BetterCompactConfigService {
  /** Frozen load-time configuration the running engine holds. */
  snapshot(): ConfigSnapshot
  /** Live volatile configuration of the current settings save. */
  current(): ConfigSnapshot
  /** Host companion row id. */
  readonly rowId: string
  /** npm package name. */
  readonly packageName: string
}

/** Parsed query: the accepted `sessionId` or the exact rejection reason. */
type ParsedQuery = { readonly sessionId: string | null } | { readonly error: string }

/** Injected context face for the optional host settings service. */
type SettingsContext = Context & { readonly settings: SettingsService }

/**
 * JSON response; live facts are never cacheable.
 * @param res - response owning the reply.
 * @param status - HTTP status code.
 * @param payload - JSON-serializable body.
 */
function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
}

/**
 * Method-not-allowed response for the read-only route.
 * @param res - response owning the reply.
 * @param allow - exact methods the route accepts.
 */
function sendMethodNotAllowed(res: ServerResponse, allow: string): void {
  res.statusCode = 405
  res.setHeader('allow', allow)
  res.setHeader('cache-control', 'no-store')
  res.end()
}

/**
 * Bad-query response.
 * @param res - response owning the reply.
 * @param message - actionable rejection detail.
 */
function sendBadQuery(res: ServerResponse, message: string): void {
  sendJson(res, 400, { code: 'INVALID_QUERY', message })
}

/**
 * Parse the optional `sessionId` query.
 * @param req - request whose URL is read.
 * @returns the accepted session id (null when absent), or the rejection reason.
 */
function parseQuery(req: IncomingMessage): ParsedQuery {
  let url: URL
  try {
    url = new URL(String(req.url ?? '/'), 'http://localhost')
  } catch {
    return { error: 'the request URL could not be parsed' }
  }
  const params = url.searchParams
  for (const key of params.keys()) {
    if (key !== 'sessionId') return { error: `unknown query parameter "${key}"; only "sessionId" is accepted` }
  }
  const values = params.getAll('sessionId')
  if (values.length > 1) return { error: 'sessionId may be supplied at most once' }
  if (values.length === 0) return { sessionId: null }
  const sessionId = values[0]
  if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
    return { error: 'sessionId must be a non-empty string' }
  }
  if (sessionId.length > MAX_SESSION_ID_LENGTH) {
    return { error: `sessionId is longer than the ${MAX_SESSION_ID_LENGTH}-character limit` }
  }
  return { sessionId }
}

/**
 * Apply the Host trust fence shared by every read-only route.
 *
 * The route is only registered when the Host webserver and `connection` fence
 * both exist; a fence that disappears later must still fail closed. The
 * connection service is the composition's authenticated/trusted Web boundary
 * (Host/Origin fence + browser authentication); this plugin adds no write API,
 * cross-origin allowance, or trust switch of its own.
 *
 * @param ctx - host context.
 * @param req - request being authorized.
 * @param res - response owning the rejection.
 * @param unavailableCode - wire code used when the fence is absent.
 * @returns true when the request was rejected and a response sent.
 */
function rejectUntrustedRead(
  ctx: Context,
  req: IncomingMessage,
  res: ServerResponse,
  unavailableCode: string,
): boolean {
  const connection = optionalService<ConnectionService>(ctx, 'connection')
  if (typeof connection?.requestRejection !== 'function') {
    sendJson(res, 503, {
      code: unavailableCode,
      message: 'the host connection trust fence is unavailable; the read-only API route is disabled',
    })
    return true
  }
  let rejection: number | undefined
  try {
    rejection = connection.requestRejection(req)
  } catch (error) {
    sendJson(res, 503, {
      code: 'CONNECTION_FENCE_UNAVAILABLE',
      message: `the host connection fence failed: ${error instanceof Error ? error.message : String(error)}`,
    })
    return true
  }
  if (rejection !== undefined) {
    res.statusCode = rejection
    res.setHeader('cache-control', 'no-store')
    res.end()
    return true
  }
  return false
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
export async function handleInspect(
  ctx: Context,
  companion: BetterCompactConfigService,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (rejectUntrustedRead(ctx, req, res, 'INSPECT_UNAVAILABLE')) return
  if (req.method !== 'GET') {
    sendMethodNotAllowed(res, 'GET')
    return
  }
  const query = parseQuery(req)
  if ('error' in query) {
    sendBadQuery(res, query.error)
    return
  }
  try {
    const payload = await inspectPlugin(ctx, companion, query.sessionId)
    sendJson(res, 200, payload)
  } catch (error) {
    if (error instanceof InspectError) {
      sendJson(res, error.status, { code: error.code, message: error.message })
      return
    }
    sendJson(res, 500, {
      code: 'INSPECT_FAILED',
      message: `inspection failed: ${error instanceof Error ? error.message : String(error)}`,
    })
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
export async function handleModels(
  ctx: Context,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (rejectUntrustedRead(ctx, req, res, 'MODELS_UNAVAILABLE')) return
  if (req.method !== 'GET') {
    sendMethodNotAllowed(res, 'GET')
    return
  }
  try {
    sendJson(res, 200, await collectModelRoutes(ctx))
  } catch (error) {
    sendJson(res, 500, {
      code: 'MODELS_FAILED',
      message: `model route projection failed: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}

/**
 * Mount the companion row.
 * @param ctx - host context.
 * @param config - live volatile row configuration.
 * @throws when the configuration is invalid; the Loader reports the failed row.
 */
export function apply(ctx: Context, config: unknown = {}): void {
  // Validate at load and freeze the exact snapshot the engine will use. A
  // later settings save updates the volatile references (current()), not this
  // snapshot: the running engine keeps one coherent configuration and the
  // inspect route reports `requiresReload`.
  const snapshot = deepFreeze(readConfig(config))
  const companion: BetterCompactConfigService = Object.freeze({
    snapshot: () => snapshot,
    current: () => readConfig(config),
    rowId: ENTRY_ID,
    packageName: PACKAGE_NAME,
  })
  ctx.provide('betterCompactConfig', companion)

  // The full S3 visual page owns its settings form; suppress the generic
  // auto-generated page for this row (the volatile fields still drive the
  // native settings ledger and CAS revisions).
  ctx.inject(['settings'], (inner) => {
    try {
      const dispose = (inner as SettingsContext).settings.configure({ auto: false }, ctx.fiber)
      inner.effect(() => dispose, 'dsh-better-compact: settings presentation')
    } catch (error) {
      inner.logger?.warn?.(`dsh-better-compact: could not configure the settings page: ${String(error)}`)
    }
  })

  // Optional Web surface: headless compositions have no webserver and no
  // connection fence, so the read-only routes are simply not registered.
  // Waiting for both services makes "no connection" fail closed instead of
  // exposing an unauthenticated read route.
  ctx.inject(['webServer', 'connection'], (inner) => {
    if (typeof inner.connection?.requestRejection !== 'function') {
      inner.logger?.warn?.('dsh-better-compact: read-only API routes disabled because the Host connection fence is unavailable')
      return
    }
    inner.effect(
      () =>
        inner.webServer.register({
          kind: 'exact',
          path: INSPECT_PATH,
          handler: (req, res) => handleInspect(inner, companion, req, res),
        }),
      `dsh-better-compact: GET ${INSPECT_PATH}`,
    )
    inner.effect(
      () =>
        inner.webServer.register({
          kind: 'exact',
          path: MODELS_PATH,
          handler: (req, res) => handleModels(inner, req, res),
        }),
      `dsh-better-compact: GET ${MODELS_PATH}`,
    )
  })
}

export default { name, apply, Config }
