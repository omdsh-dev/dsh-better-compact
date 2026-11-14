/**
 * Read-only model-route projection for the S3 settings page.
 *
 * The visual form needs an *allowed candidate* list for the summary
 * provider/model pair and, when the host can resolve it, the reasoning efforts
 * each route advertises. The host's optional `subagentModelSelection` service
 * already owns that allow-list (the same one the task/subagent tools use), so
 * this route reports it instead of introducing a second catalog or probing
 * providers.
 *
 * This is metadata only: no provider I/O, no CLI invocation, no model
 * enumeration, and no write path. A missing service or an unresolved model
 * capability yields the documented `{ enabled: false, routes: [] }` /
 * `{ enabled: ..., efforts: [], defaultEffort: '' }` shape, which tells the
 * form to keep its free-text fields and mark the capability as unknown.
 *
 * The wire shape is owned by `shared/contract.ts` so the host route and the
 * settings page cannot drift.
 */

import { MODELS_PATH } from './shared/contract.ts'
import type { ModelRoute, ModelRoutesPayload } from './shared/contract.ts'

export { MODELS_PATH }

/** Minimal `ctx.get` face; every host service below is optional. */
interface ContextReader {
  get(name: string): unknown
}

/** `subagentModelSelection` face (the host allow-list owner). */
interface SelectionFace {
  current?(): unknown
}

/** `llm` face: only the opaque per-route capability metadata is read. */
interface LlmFace {
  resolveModelInfo(
    provider: string,
    model: string,
  ): Promise<{
    readonly reasoning?: {
      readonly efforts?: readonly { readonly id?: string }[] | undefined
      readonly defaultEffort?: string | undefined
    } | undefined
  }>
}

/** Whether a value is a plain object (not an array/null). */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Read one optional host service without failing the route. */
function service<T>(ctx: ContextReader, name: string): T | undefined {
  try {
    return ctx.get(name) as T | undefined
  } catch {
    return undefined
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
export async function collectModelRoutes(ctx: ContextReader): Promise<ModelRoutesPayload> {
  let selection: unknown
  try {
    selection = service<SelectionFace>(ctx, 'subagentModelSelection')?.current?.()
  } catch {
    selection = undefined
  }
  if (!isRecord(selection) || !Array.isArray(selection.allowedModels)) {
    return { enabled: false, routes: [] }
  }

  const llm = service<LlmFace>(ctx, 'llm')
  const seen = new Set<string>()
  const routes: ModelRoute[] = []
  for (const entry of selection.allowedModels) {
    if (
      !isRecord(entry) ||
      typeof entry.provider !== 'string' ||
      entry.provider.length === 0 ||
      typeof entry.model !== 'string' ||
      entry.model.length === 0
    ) {
      continue
    }
    const key = `${entry.provider}\u0000${entry.model}`
    if (seen.has(key)) continue
    seen.add(key)

    let efforts: string[] = []
    let defaultEffort = ''
    if (llm !== undefined && typeof llm.resolveModelInfo === 'function') {
      try {
        const info = await llm.resolveModelInfo(entry.provider, entry.model)
        const reasoning = info?.reasoning
        efforts = Array.isArray(reasoning?.efforts)
          ? reasoning.efforts
              .map((effort) => effort?.id)
              .filter((id): id is string => typeof id === 'string' && id !== '')
          : []
        const advertised = reasoning?.defaultEffort
        // Only a default the route actually advertises is reported; `undefined`
        // can never be a member of `efforts`, so this matches the previous
        // `efforts.includes(reasoning?.defaultEffort)` test exactly.
        defaultEffort =
          typeof advertised === 'string' && efforts.includes(advertised) ? advertised : ''
      } catch {
        // Capability metadata is optional; the route remains a valid candidate
        // and the UI shows "unknown" instead of fabricating an effort.
        efforts = []
        defaultEffort = ''
      }
    }
    routes.push({ provider: entry.provider, model: entry.model, efforts, defaultEffort })
  }
  return { enabled: selection.enabled === true, routes }
}
