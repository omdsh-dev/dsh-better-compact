/**
 * Read-only live-state collection shared by enhanced summaries and the
 * handoff continuation guard.
 *
 * Optional services may be absent. A registered projection read must succeed:
 * treating an unreadable pending question as empty could wrongly auto-continue.
 * The plugin never mutates goals, todos, questions, jobs, or child agents.
 */

import type { Context } from '@deepseek-ai/cordis'
import { optionalService } from './shared/services.ts'
import type {
  AgentView,
  AgentsService,
  GoalsService,
  JobsService,
  SessionProjectionsService,
} from './shared/services.ts'
import type {
  AuthoritativeState,
  GoalSnapshot,
  PendingQuestion,
  RunningChildSnapshot,
  RunningJobSnapshot,
  TodoSnapshot,
} from './shared/contract.ts'

/** The projection values one authoritative-state cut reads. */
export type AuthoritativeProjectionValues = Awaited<
  ReturnType<SessionProjectionsService['snapshot']>
>['values']

/** One question inside a pending group. */
type PendingQuestionItem = PendingQuestion['questions'][number]

/** The goal half of one authoritative-state read. */
export interface GoalReadResult {
  readonly goal: GoalSnapshot | null
  /** Present when the goal service was registered but unreadable. */
  readonly goalError?: string
}

/** Blockers plus the state they were derived from. */
export interface ContinuationGuard {
  readonly blockers: string[]
  readonly state: AuthoritativeState
}

/**
 * Read the goal with its exact live-agent identity, or a diagnostic.
 *
 * The lookup is deliberately not routed through {@link optionalService}: an
 * unreadable goal service must surface as `goalError` (and thus as a prompt
 * diagnostic), not look like "this session has no goal".
 */
function readGoal(ctx: Context, agent: AgentView): GoalReadResult {
  try {
    const goals = ctx.get('goals') as GoalsService | undefined
    if (goals === undefined) return { goal: null }
    const goal = goals.get(agent)
    if (goal === undefined) return { goal: null }
    return {
      goal: {
        id: goal.id,
        revision: goal.revision,
        objective: goal.objective,
        phase: goal.phase,
        roundsStarted: goal.roundsStarted,
        maxGoalRounds: goal.maxGoalRounds,
        ...(goal.blockedReason === undefined ? {} : { blockedReason: goal.blockedReason }),
      },
    }
  } catch (error) {
    return {
      goal: null,
      goalError: error instanceof Error ? error.message : String(error),
    }
  }
}

/** Read the native todo projection from the owning session. */
function readTodos(values: AuthoritativeProjectionValues): TodoSnapshot[] {
  const todos = values.todos
  return Array.isArray(todos) ? todos.map((todo) => ({ content: todo.content, status: todo.status })) : []
}

/** Read pending user questions (all still-answerable entries, read-only). */
function readQuestions(values: AuthoritativeProjectionValues): PendingQuestion[] {
  try {
    const active = values.userQuestions?.active
    if (!Array.isArray(active)) return []
    return active.map((question) => {
      const items: readonly PendingQuestionItem[] = Array.isArray(question.questions) ? question.questions : []
      return {
        callId: question.callId,
        state: question.state,
        questions: items.map((item) => ({
          id: item.id,
          question: item.question,
          ...(item.header === undefined ? {} : { header: item.header }),
        })),
      }
    })
  } catch {
    return []
  }
}

/** Read jobs owned by this exact session that are still running. */
export function readRunningJobs(ctx: Context, agent: AgentView): RunningJobSnapshot[] {
  try {
    const jobs = optionalService<JobsService>(ctx, 'jobs')
    if (jobs === undefined) return []
    return jobs
      .list(agent.id)
      .filter((job) => job.owner === agent.id && (job.status === 'running' || job.status === 'stopping'))
      .map((job) => ({ id: job.id, kind: job.kind, label: job.label, status: job.status }))
  } catch {
    return []
  }
}

/** Read live child agents of this agent that are currently running a turn. */
export function readRunningChildren(ctx: Context, agent: AgentView): RunningChildSnapshot[] {
  try {
    const agents = optionalService<AgentsService>(ctx, 'agents')
    if (agents === undefined) return []
    const all = agents.list()
    const byId = new Map<string, AgentView>(all.map((candidate) => [candidate.id, candidate]))
    const running: RunningChildSnapshot[] = []
    for (const candidate of all) {
      if (candidate.id === agent.id || candidate.status !== 'running') continue
      let cursor: AgentView | undefined = candidate
      let depth = 0
      let matched = false
      const seen = new Set<string>()
      while (cursor !== undefined && depth < 64) {
        const parentId = cursor.session?.header?.parentSession
        if (parentId === undefined) break
        depth += 1
        if (parentId === agent.id) {
          matched = true
          break
        }
        if (seen.has(parentId)) break
        seen.add(parentId)
        cursor = byId.get(parentId)
      }
      if (matched) {
        running.push({
          id: candidate.id,
          depth,
          ...(candidate.session?.header?.agentPreset === undefined
            ? {}
            : { label: `child preset ${candidate.session.header.agentPreset}` }),
        })
      }
    }
    return running
  } catch {
    return []
  }
}

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
export function collectAuthoritativeState(ctx: Context, agent: AgentView): AuthoritativeState {
  const { goal, goalError } = readGoal(ctx, agent)
  // Read the public wire views at one complete, synchronous cut. Unlike the
  // deprecated cachedSnapshot/stateOf faces this includes unmaterialized state.
  let values: AuthoritativeProjectionValues = {}
  const projections = ctx.get('sessionProjections') as SessionProjectionsService | undefined
  if (projections !== undefined) {
    values = projections.snapshot(agent.session, new Set(['todos', 'userQuestions'])).values
  }
  return {
    goal,
    ...(goalError === undefined ? {} : { goalError }),
    todos: readTodos(values),
    questions: readQuestions(values),
    jobs: readRunningJobs(ctx, agent),
    children: readRunningChildren(ctx, agent),
  }
}

/**
 * Reasons the handoff mode must NOT schedule an automatic continuation.
 * An empty array means continuing is allowed by the read-only state.
 *
 * @param ctx - engine context.
 * @param agent - target live agent.
 * @returns blockers plus collected state.
 */
export function handoffContinuationBlockers(ctx: Context, agent: AgentView): ContinuationGuard {
  const state = collectAuthoritativeState(ctx, agent)
  const blockers: string[] = []
  if (agent.status !== 'idle') blockers.push(`agent status is ${String(agent.status)}, not idle`)
  const inbox = agent.inbox
  if (inbox !== undefined && (inbox.nextTurn.length > 0 || inbox.nextStep.length > 0)) {
    blockers.push('the agent has queued input; that input owns the next turn')
  }
  if (state.goal !== null && (state.goal.phase === 'paused' || state.goal.phase === 'blocked')) {
    blockers.push(`the goal is ${state.goal.phase}; a handoff continuation must not resume it`)
  }
  if (state.questions.length > 0) blockers.push('a user question is still pending')
  if (state.jobs.length > 0) blockers.push('a background job owned by this session is still running')
  if (state.children.length > 0) blockers.push('a child agent is still running')
  return { blockers, state }
}
