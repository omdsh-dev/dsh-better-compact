/**
 * Optional host-service faces used by dsh-better-compact.
 *
 * Every service here is OPTIONAL: headless compositions simply do not have it.
 * `ctx.get(name)` throws for unknown names in some compositions and returns
 * `undefined` in others, so all reads go through `optionalService`, which
 * normalizes both to `undefined`.
 *
 * These are minimal structural faces, not the host's own declarations: the
 * plugin consumes only what it needs, so a host adding fields never breaks it.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { GoalSnapshot, PendingQuestion, TodoSnapshot } from './contract.ts';
/**
 * Read one optional host service without failing the caller.
 * @param ctx - any cordis context.
 * @param name - service name.
 * @returns the service value, or undefined when absent or unreadable.
 */
export declare function optionalService<T>(ctx: Context, name: string): T | undefined;
/** `goals` service face (`get(agent)` returns the live goal or undefined). */
export interface GoalsService {
    get(agent: unknown): GoalSnapshot | undefined;
}
/** `jobs` service face. */
export interface JobsService {
    list(ownerId: string): readonly {
        readonly id: string;
        readonly kind: string;
        readonly label: string;
        readonly status: string;
        readonly owner: string;
    }[];
}
/** Minimal live-agent face shared by `agents` and the engine callbacks. */
export interface AgentView {
    readonly id: string;
    readonly status: string;
    readonly session: SessionView;
    readonly inbox?: {
        readonly nextTurn: readonly unknown[];
        readonly nextStep: readonly unknown[];
    };
    readonly options?: {
        readonly provider?: string;
        readonly model?: string;
    };
}
/** `agents` service face. */
export interface AgentsService {
    list(): readonly AgentView[];
    get(id: string): AgentView | undefined;
}
/** Minimal session face used for projections and inspection. */
export interface SessionView {
    readonly id: string;
    readonly header?: {
        readonly parentSession?: string;
        readonly agentPreset?: string;
    };
}
/** `sessionProjections` service face. */
export interface SessionProjectionsService {
    snapshot(session: unknown, keys: ReadonlySet<string>): {
        readonly values: {
            readonly todos?: readonly TodoSnapshot[];
            readonly userQuestions?: {
                readonly active?: readonly PendingQuestion[];
            };
        };
    };
}
/** `tokenMeter` service face (only what inspect projects). */
export interface TokenMeterService {
    measure(session: unknown): {
        readonly totalTokens: number;
        readonly nodes: readonly {
            readonly seq: number;
            readonly tokens: number;
        }[];
        readonly baseline?: {
            readonly kind?: string;
        };
    };
}
/** `llm` service face. */
export interface LlmService {
    resolveModelInfo(provider: string, model: string, signal?: AbortSignal): Promise<{
        readonly provider?: string;
        readonly id?: string;
        readonly context?: {
            readonly contextWindow?: number;
        };
        readonly defaultMaxTokens?: number;
        readonly reasoning?: {
            readonly efforts: readonly {
                readonly id: string;
            }[];
            readonly defaultEffort?: string;
        };
    }>;
}
/** `agentPresets` service face. */
export interface AgentPresetsService {
    serviceFor(agent: unknown, service: string): unknown;
}
/** `connection` trust-fence face. */
export interface ConnectionService {
    requestRejection(req: unknown): number | undefined;
}
/** `webServer` route registration face. */
export interface WebServerService {
    register(route: {
        readonly kind: 'exact';
        readonly path: string;
        readonly handler: (req: unknown, res: unknown) => void;
    }): () => void;
}
/** `settings` service face (auto page suppression only). */
export interface SettingsService {
    configure(options: {
        readonly auto: boolean;
    }, fiber: unknown): () => void;
}
