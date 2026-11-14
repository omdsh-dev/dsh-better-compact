/**
 * Structured prompt construction for the goal and handoff enhanced modes.
 *
 * The text here is new (informed by the design references; no source copied).
 * It is appended as the final user message after the replayed conversation
 * prefix, so the native warm prefix stays intact and every variable input
 * (authoritative goal/todo/job state) sits at the end.
 *
 * Structure checks are deliberately shallow: required sections and non-empty
 * text catch truncation, filtering, and degenerate output, but they are not a
 * proof that no fact was lost. Fidelity is exercised by fixed-scenario tests,
 * not by this function.
 */

import { deepFreeze } from './config.ts'
import type {
  AuthoritativeState,
  CompactionMode,
  EnhancedMode,
  PendingQuestion,
  PromptVariableValues,
  RunningChildSnapshot,
  RunningJobSnapshot,
  StateBlock,
  TodoSnapshot,
} from './shared/contract.ts'

export { PROMPT_VARIABLES } from './shared/contract.ts'

/** Required H2 sections for the goal checkpoint. */
export const GOAL_SECTIONS = Object.freeze([
  '## Current Goal and Unresolved Requests',
  '## Constraints, Preferences, and Approved Boundaries',
  '## Decisions and Reasons',
  '## Completed Work',
  '## In Progress',
  '## Blocked, Pending, and Unverified',
  '## Key References',
  '## Next Actions',
] as const)
/** One required goal-checkpoint heading. */
export type GoalSection = (typeof GOAL_SECTIONS)[number]

/** Required H2 sections for the file-handoff document. */
export const HANDOFF_SECTIONS = Object.freeze([
  '## Objective and Unresolved Requests',
  '## Current State',
  '## Constraints and Approved Boundaries',
  '## Decisions and Reasons',
  '## Completed Work',
  '## In Progress',
  '## Blocked, Pending, and Unverified',
  '## Key References',
  '## Next Actions',
  '## Suggested Skills',
] as const)
/** One required handoff-document heading. */
export type HandoffSection = (typeof HANDOFF_SECTIONS)[number]

/** Marker that identifies a handoff document in a native checkpoint. */
export const HANDOFF_TITLE = '# Session Handoff'

const COMMON_RULES = [
  '- Preserve exact file paths, commands, error strings, identifiers, numeric values, function signatures, and syntax fragments verbatim.',
  '- Capture user feedback and explicit instructions faithfully, especially corrections.',
  '- Never mark incomplete work complete and never describe unverified work as verified. If a result has not been proven against current files, command output, tests, or runtime state, list it as unverified.',
  '- Keep pending user questions, running jobs, and running child agents as facts to wait for or collect later. Do not claim to have answered a question, started or stopped a job, or finished a child agent.',
  '- Prefer references to existing specs, plans, diffs, and commits over copying their text.',
  '- Treat the authoritative state block (if present) as current host state that outranks any goal/progress claim inside an older checkpoint. Do not treat an older checkpoint as authoritative and do not let superseded plans accumulate.',
  '- Do not copy secrets, tokens, passwords, credentials, or private keys; redact them.',
  '- Do not mention this summarization request or that the context was compacted.',
  '- Output only the Markdown document: do not call any tool or take any other action.',
]

/**
 * Authoritative state as the renderers accept it: the collected projection
 * when available, a partial one, or nothing at all. Every collection is
 * optional because callers may hand in a state value built before a service
 * was readable.
 */
export type StateInput = Partial<AuthoritativeState> | null | undefined

/** Build the fixed goal-checkpoint directive. */
export function goalInstruction(): string {
  return [
    'You are now acting as a compaction engine for this AI coding assistant. Condense the conversation ABOVE into a structured checkpoint that lets the next model resume the work with no loss of essential context.',
    '',
    'Output EXACTLY the Markdown structure below. Keep every section, in order. Use terse bullets, not prose paragraphs. Write "(none)" for an empty section — never drop a section.',
    '',
    ...GOAL_SECTIONS.flatMap((heading) => [heading, '- [facts]', '']),
    'Rules:',
    '- Separate the current authoritative goal and unresolved user requests from completed work.',
    '- Record decisions and their reasons, not only outcomes.',
    '- Separate actually verified results from work that is merely believed done.',
    '- Preserve exact references and error strings instead of copying large plans or file bodies.',
    '- Next Actions must be directly in line with the most recent unresolved request, not an invented roadmap.',
    ...COMMON_RULES,
    `- If the conversation already contains a <compacted-summary> block, it is a PRIOR checkpoint: keep still-true facts, drop stale ones, and merge newer information into one consolidated document under the same structure.`,
  ].join('\n')
}

/** Build the fixed handoff-document directive. */
export function handoffInstruction(): string {
  return [
    'You are now acting as a compaction engine for this AI coding assistant. Write a handoff document for another agent that continues THIS SAME session from the checkpoint you produce. The document is saved to a temporary Markdown file and its full text is embedded in the session checkpoint, so it must be self-contained: assume the next agent sees this document and the retained recent conversation, nothing else.',
    '',
    `Start with the exact title \`${HANDOFF_TITLE}\` and then EXACTLY the Markdown structure below. Keep every section, in order. Use terse bullets, not prose paragraphs. Write "(none)" for an empty section — never drop a section.`,
    '',
    ...HANDOFF_SECTIONS.flatMap((heading) => [heading, '- [facts]', '']),
    'Rules:',
    '- Write for continuation, not for a human archive: state where the work stands and what the next agent should do first.',
    '- Record decisions and their reasons, not only outcomes.',
    '- Separate actually verified results from work that is merely believed done.',
    '- Reference existing artifacts (files, specs, diffs, commits, commands) instead of copying them.',
    '- Suggested Skills is advisory only: list skills that might help next, and make clear the next agent must not invoke them without authorization.',
    '- Do not create, switch, or name a different session; the next agent continues this same session.',
    ...COMMON_RULES,
  ].join('\n')
}

/** Single-line sanitized label for a state item. */
function clip(value: unknown, max = 500): string {
  if (typeof value !== 'string') return ''
  const text = value.replace(/\s+/g, ' ').trim()
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`
}

/** Render one key-value line, skipping missing values. */
function line(label: string, value: unknown): string | null {
  const text = clip(value)
  return text.length === 0 ? null : `- ${label}: ${text}`
}

/** A plugin error carrying a machine-readable `code`. */
export interface CodedError extends Error {
  readonly code: string
}

/** Build one plugin error with its stable `code`. */
function codedError(message: string, code: string): CodedError {
  return Object.assign(new Error(message), { code })
}

/**
 * Render the authoritative state block injected at the end of the instruction.
 * Sections are capped so a pathological todo/job list cannot dominate the
 * summary request; the caps are reported in the note when they bite.
 *
 * @param state - collected live authoritative state.
 * @param mode - which document is being produced.
 * @returns state block.
 */
export function renderStateBlock(state: StateInput, mode: EnhancedMode): StateBlock {
  const lines: string[] = []
  const omitted: string[] = []
  const goal = state?.goal ?? null
  const todos: readonly TodoSnapshot[] = Array.isArray(state?.todos) ? state.todos : []
  const questions: readonly PendingQuestion[] = Array.isArray(state?.questions) ? state.questions : []
  const jobs: readonly RunningJobSnapshot[] = Array.isArray(state?.jobs) ? state.jobs : []
  const children: readonly RunningChildSnapshot[] = Array.isArray(state?.children) ? state.children : []

  if (state?.goalError !== undefined) {
    lines.push(`- Goal state unavailable: ${clip(state.goalError)}`)
  } else if (goal === null) {
    lines.push('- No authoritative goal is set in this session. Do not infer a goal from prior checkpoint text.')
  } else {
    const rounds =
      Number.isSafeInteger(goal.roundsStarted) && Number.isSafeInteger(goal.maxGoalRounds)
        ? `, rounds ${goal.roundsStarted}/${goal.maxGoalRounds}`
        : ''
    lines.push(`- Goal (phase ${goal.phase}${rounds}): ${clip(goal.objective, 2000)}`)
    if (goal.blockedReason !== undefined) {
      lines.push(`- Goal blocked reason: ${clip(goal.blockedReason.message)}`)
    }
    if (goal.phase === 'paused' || goal.phase === 'blocked') {
      lines.push('- The goal is paused or blocked. Do not resume it, re-arm it, or claim completion; record the next action for the user or a later explicit resume.')
    }
  }

  const todoLimit = 40
  if (todos.length > 0) {
    lines.push('', 'Todos (authoritative `todo` projection at compaction time):')
    for (const todo of todos.slice(0, todoLimit)) {
      lines.push(`- [${todo.status}] ${clip(todo.content)}`)
    }
    if (todos.length > todoLimit) {
      omitted.push(`${todos.length - todoLimit} additional todos`)
      lines.push(`- (${todos.length - todoLimit} more todos omitted)`)
    }
  }

  if (questions.length > 0) {
    lines.push('', 'Pending user questions (still awaiting the user — do not answer on their behalf):')
    for (const question of questions.slice(0, 10)) {
      const items = Array.isArray(question.questions) ? question.questions : []
      const text = items.map((item) => clip(item.question, 800)).filter(Boolean).join(' | ')
      lines.push(`- callId ${question.callId} (${question.state}): ${text.length > 0 ? text : '(no question text)'}`)
    }
    if (questions.length > 10) omitted.push(`${questions.length - 10} additional pending questions`)
  }

  if (jobs.length > 0) {
    lines.push('', 'Running background jobs (owned by this session):')
    for (const job of jobs.slice(0, 20)) {
      lines.push(`- ${job.id} (${job.kind}, ${job.status}): ${clip(job.label)}`)
    }
    if (jobs.length > 20) omitted.push(`${jobs.length - 20} additional running jobs`)
  }

  if (children.length > 0) {
    lines.push('', 'Running child agents (the parent still has to collect their results):')
    for (const child of children.slice(0, 20)) {
      lines.push(
        `- ${child.id}${child.depth === undefined ? '' : ` (depth ${child.depth})`}: ${clip(child.label ?? 'running')}`,
      )
    }
    if (children.length > 20) omitted.push(`${children.length - 20} additional running child agents`)
  }

  if (mode === 'handoff') {
    lines.push(
      '',
      'Handoff note: the temporary file is a convenience copy. The checkpoint itself is self-contained; never instruct the next agent to rely on the file path alone.',
    )
  }

  return deepFreeze<StateBlock>({
    text: lines.join('\n'),
    trimmed: omitted.length > 0,
    omitted: Object.freeze([...omitted]),
  })
}

/**
 * Names of the optional authoritative-state sections present in a state value.
 * @param state - collected state.
 * @returns human-readable section names.
 */
export function omittedStateNames(state: StateInput): string[] {
  const names: string[] = []
  if (Array.isArray(state?.todos) && state.todos.length > 0) names.push('todos')
  if (Array.isArray(state?.questions) && state.questions.length > 0) names.push('pending questions')
  if (Array.isArray(state?.jobs) && state.jobs.length > 0) names.push('running jobs')
  if (Array.isArray(state?.children) && state.children.length > 0) names.push('running child agents')
  return names
}

/** Format a ratio as a stable percentage string. */
function percentText(ratio: number): string {
  return `${Math.round(ratio * 1000) / 10}%`
}

/** Render one list variable, capped with an explicit omission note. */
function listVariable<T>(
  items: readonly T[] | undefined,
  limit: number,
  render: (item: T) => string,
  empty: string,
  noun: string,
): string {
  const list: readonly T[] = Array.isArray(items) ? items : []
  if (list.length === 0) return empty
  const lines = list.slice(0, limit).map(render)
  if (list.length > limit) lines.push(`- (${list.length - limit} more ${noun} omitted)`)
  return lines.join('\n')
}

/** Resolved summary target facts exposed as prompt variables. */
export interface PromptTargetView {
  readonly provider: string
  readonly model: string
}

/** Resolved effective policy facts exposed as prompt variables. */
export interface PromptPolicyView {
  readonly thresholdRatio?: number
  readonly retainRatio?: number
  readonly retainTokens?: number | null
}

/** Effective route facts for {@link customPromptVariables}. */
export interface CustomPromptContext {
  /** Resolved summary target. */
  readonly target?: PromptTargetView | null
  /** Resolved effective policy. */
  readonly policy?: PromptPolicyView | null
  /** Current session id. */
  readonly sessionId?: string
  /** Clock seam for tests. */
  readonly now?: Date
}

/**
 * Build the value map for the ten custom-mode variables. This is the single
 * place where authoritative state becomes prompt text; the custom instruction
 * itself receives no automatic state block.
 *
 * @param state - collected authoritative state.
 * @param context - effective route facts.
 * @returns variable values.
 */
export function customPromptVariables(state: StateInput, context: CustomPromptContext = {}): PromptVariableValues {
  const goal = state?.goal ?? null
  const policy = context.policy ?? null
  return {
    goal:
      goal === null
        ? state?.goalError === undefined
          ? '(no authoritative goal)'
          : `(goal state unavailable: ${clip(state.goalError)})`
        : clip(goal.objective, 2000),
    todos: listVariable(
      state?.todos,
      40,
      (todo) => `- [${todo.status}] ${clip(todo.content)}`,
      '(no todos)',
      'todos',
    ),
    questions: listVariable(
      state?.questions,
      10,
      (question) => {
        const items = Array.isArray(question.questions) ? question.questions : []
        const text = items.map((item) => clip(item.question, 800)).filter(Boolean).join(' | ')
        return `- callId ${question.callId} (${question.state}): ${text.length > 0 ? text : '(no question text)'}`
      },
      '(no pending questions)',
      'questions',
    ),
    jobs: listVariable(
      state?.jobs,
      20,
      (job) => `- ${job.id} (${job.kind}, ${job.status}): ${clip(job.label)}`,
      '(no running jobs)',
      'jobs',
    ),
    children: listVariable(
      state?.children,
      20,
      (child) => `- ${child.id}${child.depth === undefined ? '' : ` (depth ${child.depth})`}: ${clip(child.label ?? 'running')}`,
      '(no running child agents)',
      'children',
    ),
    date: (context.now instanceof Date ? context.now : new Date()).toISOString(),
    session: context.sessionId ?? '',
    model:
      context.target === undefined || context.target === null
        ? '(unknown summary model)'
        : `${context.target.provider}/${context.target.model}`,
    trigger:
      policy !== null && typeof policy.thresholdRatio === 'number' && Number.isFinite(policy.thresholdRatio)
        ? percentText(policy.thresholdRatio)
        : '(unknown trigger)',
    retain:
      policy === null
        ? '(unknown retention)'
        : policy.retainTokens !== undefined && policy.retainTokens !== null
          ? `${policy.retainTokens} tokens`
          : typeof policy.retainRatio === 'number' && Number.isFinite(policy.retainRatio)
            ? percentText(policy.retainRatio)
            : '(unknown retention)',
  }
}

/**
 * Expand one custom instruction. Known variables are replaced once; unknown
 * variables stay literal and values are never recursively expanded.
 * @param template - user-authored instruction.
 * @param variables - variable values.
 * @returns expanded text.
 */
export function expandCustomPrompt(template: unknown, variables: Readonly<Record<string, string>> = {}): string {
  if (typeof template !== 'string') return ''
  return template.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (match: string, name: string) =>
    Object.prototype.hasOwnProperty.call(variables, name) && variables[name] !== undefined
      ? String(variables[name])
      : match,
  )
}

/**
 * Build the custom-mode instruction. Unlike goal/handoff, this is exactly the
 * expanded prompt: no built-in structure, state block, or safety rules.
 * @param template - user-authored instruction.
 * @param variables - variable values.
 * @returns final instruction text.
 * @throws {CodedError} with code `BETTER_COMPACT_PROMPT` when the result is empty.
 */
export function buildCustomInstruction(template: string, variables: Readonly<Record<string, string>> = {}): string {
  const text = expandCustomPrompt(template, variables).trim()
  if (text.length === 0) {
    throw codedError(
      'custom prompt is empty after variable expansion; write an instruction or choose another mode',
      'BETTER_COMPACT_PROMPT',
    )
  }
  return text
}

/** Budget fallback disclosure for {@link buildInstruction}. */
export interface BuildInstructionOptions {
  /** Whether the whole state block was dropped. */
  readonly stateOmitted?: boolean
  /** Optional state sections dropped to fit. */
  readonly omittedState?: readonly string[]
  /** Sections that were still included. */
  readonly keptState?: readonly string[]
}

/**
 * Assemble the final instruction used as the last user message.
 * @param mode - enhanced mode.
 * @param stateBlock - state block.
 * @param options - budget fallback disclosure.
 * @returns instruction text.
 */
export function buildInstruction(mode: EnhancedMode, stateBlock: StateBlock, options: BuildInstructionOptions = {}): string {
  const directive = mode === 'handoff' ? handoffInstruction() : goalInstruction()
  const stateText = options.stateOmitted === true ? '' : stateBlock.text
  const notes: string[] = []
  if (options.stateOmitted === true) {
    notes.push(
      `Authoritative state was omitted because the summary request does not fit the selected model context budget${options.omittedState?.length ? ` (${options.omittedState.join(', ')})` : ''}. Preserve the goal/next-action facts visible in the conversation and do not invent state.`,
    )
  } else if (options.omittedState !== undefined && options.omittedState.length > 0) {
    const keptList = options.keptState?.length ? options.keptState : ['the goal']
    const kept = keptList.join(', ')
    notes.push(
      `Budget note: only ${kept} ${keptList.length === 1 ? 'was' : 'were'} included; ${options.omittedState.join(', ')} were omitted to fit the selected summary model's context budget. Keep the omitted facts that are still visible in the conversation and do not invent the rest.`,
    )
  }
  if (stateBlock.trimmed) {
    notes.push(
      `Some authoritative state was capped to fit the model budget (${stateBlock.omitted.join('; ')}). Preserve the goal and next actions; do not invent the omitted items.`,
    )
  }
  return [
    directive,
    '',
    '## Authoritative state at compaction time',
    '',
    stateText.length > 0 ? stateText : '- (state block omitted; see the note above)',
    ...(notes.length > 0 ? ['', '## Budget note', ...notes.map((note) => `- ${note}`)] : []),
  ].join('\n')
}

/**
 * Verify the model produced the required structure. This is a fail-closed
 * shape check, not a completeness proof.
 *
 * @param text - combined summary text.
 * @param mode - enhanced mode.
 * @throws {CodedError} with `code = 'BETTER_COMPACT_STRUCTURE'` when required text is missing.
 */
export function assertSummaryStructure(text: unknown, mode: CompactionMode): void {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw codedError('summary output is empty', 'BETTER_COMPACT_STRUCTURE')
  }
  // Custom mode deliberately accepts any non-empty text; the user owns the
  // instruction and there is no built-in section contract to enforce.
  if (mode === 'custom') return
  const required = mode === 'handoff' ? HANDOFF_SECTIONS : GOAL_SECTIONS
  const missing = required.filter((heading) => !text.includes(heading))
  if (missing.length > 0) {
    throw codedError(
      `summary output is missing required sections: ${missing.join(', ')}; the attempt was rejected instead of installing a degenerate checkpoint`,
      'BETTER_COMPACT_STRUCTURE',
    )
  }
  if (mode === 'handoff' && !/^\s*#\s+Session Handoff\b/m.test(text)) {
    throw codedError('handoff output must start with the "# Session Handoff" title', 'BETTER_COMPACT_STRUCTURE')
  }
}

/**
 * Identify which known backend wrote a persisted checkpoint, from its structure
 * alone. Unknown/foreign records return `null` instead of guessing.
 * @param text - checkpoint summary text.
 * @returns provable mode.
 */
export function detectSummaryMode(text: unknown): CompactionMode | null {
  if (typeof text !== 'string') return null
  if (text.includes(HANDOFF_TITLE) && text.includes('## Suggested Skills')) return 'handoff'
  if (text.includes('## Current Goal and Unresolved Requests')) return 'goal'
  if (text.includes('## Primary Request and Intent') && text.includes('## Critical Context')) return 'native'
  return null
}

/** One secret pattern and its redaction replacement. */
type SecretPattern = readonly [RegExp, string]

/** Secret/credential patterns redacted conservatively before a handoff file is written. */
const SECRET_PATTERNS: readonly SecretPattern[] = Object.freeze([
  // Private-key blocks (PEM).
  [/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/g, '[REDACTED PRIVATE KEY]'],
  // OpenAI/Anthropic-style keys and generic sk- tokens.
  [/\bsk-[A-Za-z0-9_-]{16,}\b/g, '[REDACTED API KEY]'],
  [/\bsk-ant-[A-Za-z0-9_-]{16,}\b/g, '[REDACTED API KEY]'],
  // GitHub tokens.
  [/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, '[REDACTED GITHUB TOKEN]'],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, '[REDACTED GITHUB TOKEN]'],
  // AWS access key ids and common secret forms.
  [/\bAKIA[0-9A-Z]{16}\b/g, '[REDACTED AWS KEY]'],
  [/\baws_secret_access_key\s*[=:]\s*[A-Za-z0-9/+=]{32,}\b/gi, 'aws_secret_access_key=[REDACTED]'],
  // Slack and Google API keys.
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, '[REDACTED SLACK TOKEN]'],
  [/\bAIza[0-9A-Za-z_-]{30,}\b/g, '[REDACTED GOOGLE KEY]'],
  // Authorization headers.
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{16,}\b/g, 'Bearer [REDACTED]'],
  // Assignment-style credentials in commands/config snippets.
  [
    /\b(api[_-]?key|access[_-]?token|auth[_-]?token|password|passwd|secret|client[_-]?secret)\b(\s*[=:]\s*)("[^"\n]{4,}"|'[^'\n]{4,}'|[^\s"',;]{6,})/gi,
    '$1$2[REDACTED]',
  ],
])

/**
 * Conservatively redact recognizable secrets. Documented as pattern-based, not
 * perfect detection: it cannot recognize every credential format.
 * @param text - raw text.
 * @returns redacted text.
 */
export function redactSecrets(text: unknown): string {
  if (typeof text !== 'string') return ''
  let output = text
  for (const [pattern, replacement] of SECRET_PATTERNS) output = output.replace(pattern, replacement)
  return output
}

/** The text-bearing fields of one provider output block. */
export interface ContentBlockView {
  readonly type?: string
  readonly text?: string
  readonly arguments?: string
}

/**
 * Redact every text-bearing content block. Used for the handoff summary body
 * and for the raw provider output persisted on `compaction/summary`, so a
 * secret cannot survive in the trajectory view after the visible summary was
 * redacted.
 *
 * @param blocks - provider output blocks.
 * @returns blocks with text/reasoning/tool-call payloads redacted.
 */
export function redactContentBlocks<T>(blocks: readonly T[]): T[] {
  return blocks.map((block) => {
    const view = block as ContentBlockView
    if (view.type === 'text' || view.type === 'reasoning') {
      return { ...block, text: redactSecrets(view.text) } as T
    }
    if (view.type === 'tool-call') {
      return { ...block, arguments: redactSecrets(view.arguments ?? '') } as T
    }
    return block
  })
}

/** Inputs for {@link composeHandoffDocument}. */
export interface HandoffDocumentInput {
  /** Redacted model output. */
  readonly body: string
  /** Actual verified file path. */
  readonly path: string
  /** ISO timestamp. */
  readonly createdAt: string
  /** Session identity shown for correlation. */
  readonly sessionId: string
}

/**
 * Compose the final handoff document: our own deterministic header (with the
 * actual path and a self-containedness note), followed by the model's body
 * without a duplicate title.
 *
 * @param input - document inputs.
 * @returns complete Markdown document.
 */
export function composeHandoffDocument(input: HandoffDocumentInput): string {
  const body = input.body.replace(/^\s*#\s+Session Handoff\s*\n?/m, '').trimStart()
  return [
    HANDOFF_TITLE,
    '',
    `> Handoff file: ${input.path}`,
    `> Session: ${input.sessionId}`,
    `> Created: ${input.createdAt}`,
    '> This temporary file is a convenience copy. The complete document below is also stored in the session checkpoint, so replay does not depend on the file surviving.',
    '',
    body,
    '',
  ].join('\n')
}

/** The committed compaction result facts the continuation message states. */
export interface ContinuationResultView {
  /** Inclusively shadowed history positions. */
  readonly shadowedSeqs: readonly number[]
}

/**
 * Build the one ordinary same-session continuation message.
 * @param result - committed compaction result.
 * @param path - verified handoff path, when written.
 * @returns continuation text.
 */
export function continuationText(result: ContinuationResultView, path: string | null): string {
  return [
    `A file-handoff checkpoint just replaced earlier history in this session (${result.shadowedSeqs.length} history items condensed).`,
    ...(path === null
      ? []
      : [`The temporary handoff document is at ${path}; its full text is already embedded in the checkpoint above.`]),
    'Continue the same task in this session from that checkpoint. Do not ask the user to re-provide context the checkpoint already contains. Re-check current state against the repository and tools before trusting remembered details, then take the next action.',
    'Do not create or switch sessions.',
  ].join('\n')
}
