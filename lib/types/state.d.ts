/**
 * Read-only live-state collection shared by enhanced summaries and the
 * handoff continuation guard.
 *
 * Optional services may be absent. A registered projection read must succeed:
 * treating an unreadable pending question as empty could wrongly auto-continue.
 * The plugin never mutates goals, todos, questions, jobs, or child agents.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { AgentView, SessionProjectionsService } from './shared/services.ts';
import type { AuthoritativeState, GoalSnapshot, RunningChildSnapshot, RunningJobSnapshot } from './shared/contract.ts';
/** The projection values one authoritative-state cut reads. */
export type AuthoritativeProjectionValues = Awaited<ReturnType<SessionProjectionsService['snapshot']>>['values'];
/** The goal half of one authoritative-state read. */
export interface GoalReadResult {
    readonly goal: GoalSnapshot | null;
    /** Present when the goal service was registered but unreadable. */
    readonly goalError?: string;
}
/** Blockers plus the state they were derived from. */
export interface ContinuationGuard {
    readonly blockers: string[];
    readonly state: AuthoritativeState;
}
/** Read jobs owned by this exact session that are still running. */
export declare function readRunningJobs(ctx: Context, agent: AgentView): RunningJobSnapshot[];
/** Read live child agents of this agent that are currently running a turn. */
export declare function readRunningChildren(ctx: Context, agent: AgentView): RunningChildSnapshot[];
/**
 * Collect the authoritative state injected into an enhanced summary.
 *
 * The projection lookup is deliberately not routed through
 * {@link optionalService}: an unreadable registered projection must fail the
 * whole collection instead of masquerading as "no pending work".
 *
 * @param ctx - engine context.
 * @param agent - target live agent.
 * @returns state.
 */
export declare function collectAuthoritativeState(ctx: Context, agent: AgentView): AuthoritativeState;
/**
 * Reasons the handoff mode must NOT schedule an automatic continuation.
 * An empty array means continuing is allowed by the read-only state.
 *
 * @param ctx - engine context.
 * @param agent - target live agent.
 * @returns blockers plus collected state.
 */
export declare function handoffContinuationBlockers(ctx: Context, agent: AgentView): ContinuationGuard;
