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
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Context } from '@deepseek-ai/cordis';
import type { ConfigSnapshot } from './shared/contract.ts';
export { Config } from './config.ts';
export { APOLLO_LEGACY_ROW_CONFIG_KEY, APOLLO_ROW_CONFIG_KEY, ENGINE_ENTRY_ID, MODES, ROW_CONFIG_KEY, ROW_CONFIG_KEYS, } from './config.ts';
export { INSPECT_PATH } from './inspect.ts';
export { MODELS_PATH } from './models.ts';
/** Cordis function-plugin name (also the client module identity). */
export declare const name = "dsh-better-compact";
/** The `betterCompactConfig` service this row provides. */
export interface BetterCompactConfigService {
    /** Frozen load-time configuration the running engine holds. */
    snapshot(): ConfigSnapshot;
    /** Live volatile configuration of the current settings save. */
    current(): ConfigSnapshot;
    /** Host companion row id. */
    readonly rowId: string;
    /** npm package name. */
    readonly packageName: string;
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
export declare function handleInspect(ctx: Context, companion: BetterCompactConfigService, req: IncomingMessage, res: ServerResponse): Promise<void>;
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
export declare function handleModels(ctx: Context, req: IncomingMessage, res: ServerResponse): Promise<void>;
/**
 * Mount the companion row.
 * @param ctx - host context.
 * @param config - live volatile row configuration.
 * @throws when the configuration is invalid; the Loader reports the failed row.
 */
export declare function apply(ctx: Context, config?: unknown): void;
declare const _default: {
    name: string;
    apply: typeof apply;
    Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        mode: import("@deepseek-ai/schemastery").default<"native" | "goal" | "handoff" | "custom", "native" | "goal" | "handoff" | "custom", "volatile-defined">;
        auto: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        thresholdRatio: import("@deepseek-ai/schemastery").default<number, number, "volatile">;
        headroomTokens: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        retainRatio: import("@deepseek-ai/schemastery").default<number, number, "volatile">;
        retainTokens: import("@deepseek-ai/schemastery").default<number, number, "volatile">;
        summarizationProvider: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        summarizationModel: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        reasoningEffort: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        customPrompt: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        cachePriority: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        summaryImage: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        maxTokens: import("@deepseek-ai/schemastery").default<number, number, "volatile">;
        compactionRetries: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        maxOverflowRetries: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        modelPolicies: import("@deepseek-ai/schemastery").default<NoInfer<({
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
            provider: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            model: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            thresholdRatio: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            headroomTokens: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            retainRatio: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            retainTokens: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            summarizationProvider: import("@deepseek-ai/schemastery").default<string, string, "plain">;
            summarizationModel: import("@deepseek-ai/schemastery").default<string, string, "plain">;
            maxTokens: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            compactionRetries: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            maxOverflowRetries: import("@deepseek-ai/schemastery").default<number, number, "plain">;
        }>>[]>, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        mode: import("@deepseek-ai/schemastery").default<"native" | "goal" | "handoff" | "custom", "native" | "goal" | "handoff" | "custom", "volatile-defined">;
        auto: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        thresholdRatio: import("@deepseek-ai/schemastery").default<number, number, "volatile">;
        headroomTokens: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        retainRatio: import("@deepseek-ai/schemastery").default<number, number, "volatile">;
        retainTokens: import("@deepseek-ai/schemastery").default<number, number, "volatile">;
        summarizationProvider: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        summarizationModel: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        reasoningEffort: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        customPrompt: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        cachePriority: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        summaryImage: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        maxTokens: import("@deepseek-ai/schemastery").default<number, number, "volatile">;
        compactionRetries: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        maxOverflowRetries: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        modelPolicies: import("@deepseek-ai/schemastery").default<NoInfer<({
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
            provider: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            model: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            thresholdRatio: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            headroomTokens: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            retainRatio: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            retainTokens: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            summarizationProvider: import("@deepseek-ai/schemastery").default<string, string, "plain">;
            summarizationModel: import("@deepseek-ai/schemastery").default<string, string, "plain">;
            maxTokens: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            compactionRetries: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            maxOverflowRetries: import("@deepseek-ai/schemastery").default<number, number, "plain">;
        }>>[]>, "volatile-defined">;
    }>>, "plain">;
};
export default _default;
