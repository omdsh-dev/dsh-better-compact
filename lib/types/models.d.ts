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
import { MODELS_PATH } from './shared/contract.ts';
import type { ModelRoutesPayload } from './shared/contract.ts';
export { MODELS_PATH };
/** Minimal `ctx.get` face; every host service below is optional. */
interface ContextReader {
    get(name: string): unknown;
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
export declare function collectModelRoutes(ctx: ContextReader): Promise<ModelRoutesPayload>;
