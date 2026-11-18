/**
 * dsh-better-compact engine — one native-compatible compaction provider.
 *
 * This class extends `BasicCompactionEngine` and customizes only its public
 * `summarize()` hook (plus the manual entry's post-success continuation and a
 * cross-realm guard). Selection, retention, the durable compaction transaction,
 * locking, flush, overflow recovery, and retry bounds all stay in the inherited
 * native implementation: successful compactions still produce exactly the
 * native `compaction/start` → `compaction/summary` → checkpoint replacement →
 * `compaction/end` sequence.
 *
 * The enhanced modes reuse the native one-shot request shape (replayed
 * system/tool/history prefix + a final user instruction) so the provider's warm
 * prefix stays reusable; only the instruction, authoritative state, reasoning
 * effort, and post-output validation differ. Native mode delegates to the
 * inherited implementation untouched.
 *
 * The `BETTER_COMPACT_ROUTE` and `BETTER_COMPACT_BUDGET` failure codes are this
 * plugin's own inspect classification vocabulary, carried on `LlmError` because
 * that is the failure type the compaction seam already surfaces. Upstream types
 * its code parameter as the builtin set only, and the constructor does not
 * validate it, so those two literals are asserted once at each site.
 */

import z from '@deepseek-ai/schemastery'
import type { Context, EventOptions } from '@deepseek-ai/cordis'
import { BasicCompactionEngine } from '@deepseek-ai/dsh-compaction-basic'
import { ManualCompactionError } from '@deepseek-ai/dsh-compaction'
import type { CompactionResult, CompactionTrigger } from '@deepseek-ai/dsh-compaction'
import type { CommandId } from '@deepseek-ai/dsh-commands/brand'
import type { Agent } from '@deepseek-ai/dsh-agent'
import {
  BlockAssembler,
  LlmError,
  contentHasImage,
  createUserMessage,
  errorChain,
} from '@deepseek-ai/dsh-llm'
import type {
  BuiltinLlmFailureCode,
  ContentBlock,
  FinishReason,
  GenerateOptions,
  LlmResolvedModelInfo,
  Message,
  ReasoningEffortId,
  RequestMessage,
  RequestUserInput,
} from '@deepseek-ai/dsh-llm'
import { estimateMessage, estimateToolsTokens } from '@deepseek-ai/dsh-token-meter/estimate'
import { configEquals, deepFreeze, toNativeConfig } from './config.ts'
import {
  SUMMARY_IMAGE_CAPTION,
  SUMMARY_IMAGE_MODES,
} from './shared/contract.ts'
import type {
  CompactionMode,
  ConfigSnapshot,
  EnhancedMode,
  SummaryImagePage,
  SummaryImageRequest,
} from './shared/contract.ts'
import { renderSummaryImages } from './summary-image.ts'
import { BudgetConfigError, resolveTargetPolicy, routedTarget } from './budget.ts'
import {
  assertSummaryStructure,
  buildCustomInstruction,
  buildInstruction,
  composeHandoffDocument,
  continuationText,
  customPromptVariables,
  redactContentBlocks,
  redactSecrets,
  omittedStateNames,
  renderStateBlock,
} from './prompts.ts'
import type { PromptPolicyView } from './prompts.ts'
import { writeHandoffFile } from './handoff.ts'
import { collectAuthoritativeState, handoffContinuationBlockers } from './state.ts'
import {
  activeSummaryMode,
  lastCompactionFailure,
  markSummaryEnd,
  markSummaryStart,
  recordBudgetFallback,
  recordCompactionFailure,
  recordContinuationOutcome,
} from './live.ts'
import { serviceIdentity } from './identity.ts'
import { optionalService } from './shared/services.ts'
import type { AgentPresetsService } from './shared/services.ts'

/** Empty engine row config: every setting lives on the host companion row. */
const EMPTY_CONFIG: z = z.object({})

/**
 * Upstream request image pixel budget (2048×2048). A request carrying more
 * total image pixels than this has its images offloaded to placeholder text by
 * the adapter, which would drop the checkpoint content the model needs.
 */
const REQUEST_IMAGE_PIXEL_BUDGET = 2048 * 2048

/**
 * Run one summary-image step, mapping any failure to the fail-closed code. A
 * checkpoint the operator asked to rasterize never degrades to text silently.
 * @param what - readable description of the failed step.
 * @param run - step to execute.
 * @returns the step result.
 * @throws {LlmError} with code BETTER_COMPACT_IMAGE when the step rejects.
 */
async function imageStep<T>(what: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (error) {
    throw new LlmError(
      `better-compact: ${what}: ${errorChain(error)}`,
      'BETTER_COMPACT_IMAGE' as BuiltinLlmFailureCode,
    )
  }
}

/** Verified handoff path per session, consumed by the manual entry point. */
const handoffBySession = new Map<string, { readonly path: string; readonly bytes: number }>()
/** Manual compactions that already scheduled their one continuation. */
const continuedCompactions = new Set<string>()

/**
 * The summarizer hook is protected on the inherited class, so its argument and
 * result types are derived from it rather than rebuilt here.
 */
type SummarizeArguments = Parameters<BasicCompactionEngine['summarize']>
/** Replayed conversation prefix handed to the summarizer. */
type SummarizationInput = SummarizeArguments[0]
/** Owner of the summarized session. */
type SummarizeAgent = SummarizeArguments[1]
/** Summary blocks plus the exact auxiliary call envelope. */
type SummaryResult = Awaited<ReturnType<BasicCompactionEngine['summarize']>>

/** One routed summary target. */
interface SummaryTarget {
  readonly provider: string
  readonly model: string
}

/** Effective policy resolved for one routed target. */
type ResolvedPolicy = ReturnType<typeof resolveTargetPolicy>

/**
 * The snapshot-derived fallback when no request was routed yet. Only these
 * fields exist in that branch, and only these are read from it.
 */
type SummaryRoutePolicy = Pick<ResolvedPolicy, 'summarizationProvider' | 'summarizationModel' | 'maxTokens'>

/** One instruction candidate considered by the summary budget. */
interface InstructionCandidate {
  readonly block: { readonly text: string; readonly trimmed: boolean; readonly omitted: readonly string[] }
  readonly stateOmitted?: true
  readonly omittedState: readonly string[]
  readonly keptState: readonly string[]
}

/** The exact argument the tool-schema estimator accepts; only its `tools` field is priced. */
type ToolsHeader = Parameters<typeof estimateToolsTokens>[0]

/** The host companion row's frozen configuration face, as the engine reads it. */
interface CompanionService {
  snapshot(): ConfigSnapshot
}

/** One durable image reference, as the summary content blocks carry it. */
type SummaryImageRef = Extract<ContentBlock, { type: 'image' }>['attachment']

/**
 * The `attachments` face this engine needs: durably store the rendered pages
 * and get back the references the checkpoint content cites.
 */
interface AttachmentsService {
  saveImages(
    inputs: readonly {
      readonly data: Uint8Array
      readonly mediaType: 'image/png'
      readonly name?: string
    }[],
  ): Promise<readonly SummaryImageRef[]>
}

/** First dispatch argument shared by every event this engine's gate wraps. */
interface GatedEventPayload {
  readonly agent: Agent
}

/** One waterfall continuation as the dispatch passes it. */
type NextContinuation = () => unknown

/** A cordis listener addressed dynamically by the registration gate. */
type DynamicListener = (this: unknown, ...args: any[]) => any

/** `ctx.on` addressed by event name resolved at runtime. */
type DynamicOn = (
  event: string,
  listener: DynamicListener,
  options?: boolean | EventOptions,
) => () => boolean

/** Keep process-local auxiliary maps bounded. */
function remember<K, V>(map: Map<K, V>, key: K, value: V): void {
  map.delete(key)
  map.set(key, value)
  while (map.size > 200) map.delete(map.keys().next().value as K)
}

/**
 * The instruction the auxiliary request ends with, priced as a user message.
 * `estimateMessage` reads only `role` and `content`, so the identity fields a
 * durable message also carries cannot change the estimate.
 * @param text - rendered instruction.
 * @returns one user-role message carrying exactly that text.
 */
function instructionMessage(text: string): Message {
  return createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } })
}

/**
 * Whether an error is a cancellation/abort rather than a content failure.
 * @param error - caught value.
 * @returns true for code or message naming an abort/cancellation.
 */
function isCancellation(error: unknown): boolean {
  const carrier = error as { code?: unknown; message?: unknown } | null | undefined
  const code = typeof carrier?.code === 'string' ? carrier.code : ''
  const message = typeof carrier?.message === 'string' ? carrier.message : String(error)
  return /abort|cancel/i.test(code) || /abort|cancel/i.test(message)
}

/**
 * Map a terminal summarization finish to the native fail-closed error.
 * @param finish - assembler finish reason.
 * @returns the error to raise, or undefined when the finish is usable.
 */
function finishError(finish: FinishReason): Error | undefined {
  switch (finish.kind) {
    case 'error':
    case 'aborted':
      return new LlmError(
        finish.failure.message,
        finish.failure.code as BuiltinLlmFailureCode,
        finish.failure,
      )
    case 'max-tokens': {
      const error = new Error(
        'summarization truncated at the token cap (incomplete checkpoint)',
      ) as Error & { code: string }
      error.code = 'MAX_TOKENS'
      return error
    }
    default:
      return undefined
  }
}

/**
 * Classify a failure for the inspect status vocabulary.
 * @param error - caught value.
 * @returns the inspect status for that failure.
 */
function classifyFailure(error: unknown): 'cancelled' | 'persistence-error' | 'failed' {
  if (error instanceof ManualCompactionError) {
    if (error.code === 'cancelled') return 'cancelled'
    if (error.code === 'persistence') return 'persistence-error'
    return 'failed'
  }
  return isCancellation(error) ? 'cancelled' : 'failed'
}

/**
 * Build the target-resolution failure used when no route exists.
 * @returns the actionable route failure.
 */
function noTargetError(): LlmError {
  return new LlmError(
    'no provider/model available for summarization: set both summarizationProvider and summarizationModel, route one request, or set both AgentOptions fields',
    'BETTER_COMPACT_ROUTE' as BuiltinLlmFailureCode,
  )
}

/**
 * Fall back to the AgentOptions pair when no request was routed yet.
 * @param agent - agent whose routing options are read.
 * @returns the configured target, or undefined when either side is empty.
 */
function routeFromAgentOptions(agent: Agent): SummaryTarget | undefined {
  const provider = agent.options?.provider
  const model = agent.options?.model
  if (typeof provider !== 'string' || provider.length === 0) return undefined
  if (typeof model !== 'string' || model.length === 0) return undefined
  return { provider, model }
}

export class BetterCompactEngine extends BasicCompactionEngine {
  static override inject = [...BasicCompactionEngine.inject, 'betterCompactConfig']
  static override Config: z = EMPTY_CONFIG
  /** Marker used by tests and diagnostics; never a behavioral branch. */
  static betterCompactEngine = true

  // Declared (not defined) fields: the constructor assigns them after `super()`,
  // exactly as the pre-TypeScript source did, so the class emits no field
  // initializers of its own.
  /** Frozen load-time configuration actually in force. */
  declare readonly snapshot: ConfigSnapshot
  /** Enhanced mode in force for this engine instance. */
  declare readonly mode: CompactionMode
  /** True when this row config is the shipped empty config. */
  declare readonly rowConfigEmpty: boolean

  /**
   * @param ctx - engine context.
   * @param rowConfig - engine row config (always empty in shipped patches).
   */
  constructor(ctx: Context, rowConfig: Record<string, unknown> = {}) {
    const companion: CompanionService | undefined = ctx.get('betterCompactConfig')
    if (companion === undefined) {
      throw new Error(
        'dsh-better-compact/engine: the host companion row "dsh-better-compact" is not mounted; the engine cannot read its configuration snapshot',
      )
    }
    const snapshot = companion.snapshot()
    // Gate the native listeners at their public registration boundary. In rc.2
    // model-switch pressure no longer dispatches through compactIfNeeded(), so
    // guarding that method alone lets the host compact another preset's session.
    // Keep native callbacks (including proposed-header pricing) unchanged.
    let engine: BetterCompactEngine
    const engineCtx = ctx.extend({
      on(event: string, listener: DynamicListener, options?: boolean | EventOptions): () => boolean {
        if (!['agent/pre-step', 'agent/request', 'agent/request-error'].includes(event)) {
          return (ctx.on as DynamicOn)(event, listener, options)
        }
        return (ctx.on as DynamicOn)(event, function (this: unknown, payload: GatedEventPayload, next: NextContinuation) {
          if (engine._supersededByPreset(payload.agent)) return next()
          return listener.call(this, payload, next)
        }, options)
      },
    })
    super(engineCtx, toNativeConfig(snapshot))
    engine = this
    this.snapshot = snapshot
    this.mode = snapshot.mode
    this.rowConfigEmpty = Object.keys(rowConfig ?? {}).length === 0
  }

  /**
   * Summarize the replayed conversation region.
   * Native mode delegates entirely to the inherited implementation.
   * @param input - replayed conversation prefix to condense.
   * @param agent - owner of the summarized session.
   * @param signal - optional cancellation forwarded to the adapter.
   * @returns safe text summary blocks and the exact auxiliary call envelope.
   */
  override async summarize(
    input: SummarizationInput,
    agent: SummarizeAgent,
    signal?: AbortSignal,
  ): Promise<SummaryResult> {
    // Native attempts are marked too, so inspect can distinguish a live
    // in-flight attempt from an orphaned durable bracket.
    markSummaryStart(agent.session, this.mode)
    try {
      if (this.mode === 'native') return await super.summarize(input, agent, signal)
      return await this._summarizeEnhanced(input, agent, signal)
    } finally {
      markSummaryEnd(agent.session.id)
    }
  }

  /**
   * Automatic pressure/overflow entry. A Web session that selected a preset
   * gets its own isolated `compaction` service, and that preset engine receives
   * the same agent-scoped events. The host-plane engine must stay out of the
   * way instead of double-compacting; a preset with no compaction group has no
   * preset service and correctly falls back to this row.
   * @param agent - agent whose latest routed request is measured.
   * @param trigger - normal step-boundary pressure or overflow recovery.
   * @param signal - live turn cancellation signal.
   * @returns the compaction result, or null when nothing was compacted.
   */
  override async compactIfNeeded(
    agent: Agent,
    trigger: CompactionTrigger,
    signal: AbortSignal,
  ): Promise<CompactionResult | null> {
    if (this._supersededByPreset(agent)) return null
    try {
      return await super.compactIfNeeded(agent, trigger, signal)
    } catch (error) {
      recordCompactionFailure(agent.session, classifyFailure(error), errorChain(error))
      throw error
    }
  }

  /**
   * Manual idle compaction. On a live successful handoff compaction it
   * schedules exactly one ordinary same-session follow-up, subject to the
   * documented read-only safety checks.
   * @param agent - idle agent whose next-turn admission this call reserves.
   * @param signal - cancellation scoped to this compaction request.
   * @param sourceCommandId - initiating command identity for presentation.
   * @returns the committed result, or null when no safe useful range exists.
   */
  override async compactNow(
    agent: Agent,
    signal: AbortSignal,
    sourceCommandId?: CommandId,
  ): Promise<CompactionResult | null> {
    try {
      const result = await super.compactNow(agent, signal, sourceCommandId)
      if (result !== null) {
        if (this.mode === 'handoff') {
          await this._maybeContinue(agent, result, signal)
        } else {
          handoffBySession.delete(agent.session.id)
        }
      }
      return result
    } catch (error) {
      if (!(error instanceof ManualCompactionError && error.code === 'busy')) {
        recordCompactionFailure(agent.session, classifyFailure(error), errorChain(error))
      }
      throw error
    }
  }

  /**
   * Whether a preset-owned engine supersedes this host-plane instance.
   * @param agent - agent whose isolated compaction service is inspected.
   * @returns true when another engine owns this agent's compaction.
   */
  _supersededByPreset(agent: Agent): boolean {
    const presets = optionalService<AgentPresetsService>(this.ctx, 'agentPresets')
    if (presets === undefined) return false
    try {
      const mounted = presets.serviceFor(agent, 'compaction')
      return mounted !== undefined && serviceIdentity(mounted) !== serviceIdentity(this)
    } catch {
      return false
    }
  }

  /**
   * Resolve the summary route exactly like the native engine.
   * @param agent - agent whose routed target and options are read.
   * @returns the resolved target and its effective policy.
   * @throws with code BETTER_COMPACT_ROUTE when no route exists.
   */
  _resolveRoute(agent: Agent): { target: SummaryTarget; policy: ResolvedPolicy | SummaryRoutePolicy } {
    const snapshot = this.snapshot
    const conversationTarget = routedTarget(agent.session) ?? routeFromAgentOptions(agent)
    const policy = conversationTarget === undefined
      ? {
          summarizationProvider: snapshot.summarizationProvider,
          summarizationModel: snapshot.summarizationModel,
          maxTokens: snapshot.maxTokens,
        }
      : resolveTargetPolicy(snapshot, conversationTarget)
    const configured = policy.summarizationProvider.length > 0
      ? { provider: policy.summarizationProvider, model: policy.summarizationModel }
      : undefined
    const latest = routedTarget(agent.session)
    const target = configured ?? latest ?? routeFromAgentOptions(agent)
    if (target === undefined) throw noTargetError()
    return { target, policy }
  }

  /**
   * Validate the saved effort against the exact summary model's capabilities.
   * @param info - resolved model facts for the summary target.
   * @returns the supported effort, or undefined when none is configured.
   * @throws with code UNSUPPORTED_REASONING_EFFORT when the model cannot honor it.
   */
  _resolveEffort(info: LlmResolvedModelInfo): ReasoningEffortId | undefined {
    const effort = this.snapshot.reasoningEffort
    if (effort.length === 0) return undefined
    const reasoning = info.reasoning
    if (reasoning === undefined || !reasoning.efforts.some((candidate) => candidate.id === effort)) {
      throw new LlmError(
        `provider "${info.provider}" model "${info.id}" does not support reasoning effort "${effort}"; choose a supported effort or clear reasoningEffort (no substitution is performed)`,
        'UNSUPPORTED_REASONING_EFFORT',
      )
    }
    return effort as ReasoningEffortId
  }

  /**
   * Estimate the auxiliary request size under the fixed token-meter heuristic.
   * @param input - replayed conversation prefix.
   * @param instruction - rendered instruction added as the final user message.
   * @param effortIgnored - reserved argument kept from the previous signature.
   * @returns estimated prompt tokens for that request.
   */
  _estimateRequest(input: SummarizationInput, instruction: string, effortIgnored?: unknown): number {
    let tokens = 0
    for (const message of input.messages) tokens += estimateMessage(message)
    tokens += estimateMessage(instructionMessage(instruction))
    if (this.snapshot.cachePriority && input.tools !== undefined) {
      // Only the tool schemas are priced; the estimator ignores every other
      // envelope field, so a tools-only value stands in for the full header.
      tokens += estimateToolsTokens({ tools: [...input.tools] } as ToolsHeader)
    }
    return tokens
  }

  /**
   * Choose an instruction that fits the model context. Ordering keeps compact
   * pending work (questions/jobs/children) before the often-large todo list, so
   * a continuation checkpoint does not silently lose "wait for this" facts.
   * Every omission is disclosed in the instruction and recorded for inspect.
   * @param input - replayed conversation prefix.
   * @param state - collected authoritative state.
   * @param info - resolved model facts for the summary target.
   * @param maxTokens - generation cap reserved for the summary.
   * @param sessionId - session the omission record belongs to.
   * @returns the instruction text to send.
   * @throws with code BETTER_COMPACT_BUDGET when nothing fits.
   */
  _chooseInstruction(
    input: SummarizationInput,
    state: ReturnType<typeof collectAuthoritativeState>,
    info: LlmResolvedModelInfo,
    maxTokens: number,
    sessionId: string,
  ): string {
    const mode = this.mode as EnhancedMode
    const contextWindow = info.context?.contextWindow
    const present = omittedStateNames(state)
    const full = renderStateBlock(state, mode)
    const withoutTodos = present.includes('todos')
      ? renderStateBlock({ ...state, todos: [] }, mode)
      : null
    const goalOnly = renderStateBlock(
      {
        goal: state.goal,
        ...(state.goalError === undefined ? {} : { goalError: state.goalError }),
        todos: [],
        questions: [],
        jobs: [],
        children: [],
      },
      mode,
    )
    const empty: InstructionCandidate['block'] = { text: '', trimmed: false, omitted: [] }
    const candidates: InstructionCandidate[] = [
      { block: full, omittedState: [], keptState: present },
      ...(withoutTodos === null
        ? []
        : [{
            block: withoutTodos,
            omittedState: ['todos'],
            keptState: ['the goal', ...present.filter((name) => name !== 'todos')],
          }]),
      { block: goalOnly, omittedState: present, keptState: ['the goal'] },
      { block: empty, stateOmitted: true, omittedState: present, keptState: [] },
    ]
    const seen = new Set<string>()
    const unique = candidates.filter((candidate) => {
      const key = `${candidate.stateOmitted === true ? 'omitted' : 'included'}\u0000${candidate.block.text}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    const record = (candidate: InstructionCandidate): void => {
      const omitted = [
        ...new Set([...candidate.omittedState, ...(candidate.block.trimmed ? candidate.block.omitted : [])]),
      ]
      if (omitted.length === 0) return
      recordBudgetFallback(sessionId, omitted)
      this.ctx.logger.warn(
        `better-compact: summary budget omitted authoritative state (${omitted.join('; ')}); the checkpoint instruction discloses the omission`,
      )
    }
    if (contextWindow === undefined) {
      record(unique[0]!)
      return buildInstruction(mode, full)
    }
    for (const candidate of unique) {
      const instruction = buildInstruction(mode, candidate.block, {
        stateOmitted: candidate.stateOmitted === true,
        omittedState: candidate.omittedState,
        keptState: candidate.keptState,
      })
      const estimated = this._estimateRequest(input, instruction)
      if (estimated + maxTokens <= contextWindow) {
        record(candidate)
        return instruction
      }
    }
    throw new LlmError(
      `the summary request does not fit ${info.provider}/${info.id}: the replayed conversation plus maxTokens ${maxTokens} exceeds the ${contextWindow}-token context window; compact a smaller span, lower maxTokens, or choose a larger summary model`,
      'BETTER_COMPACT_BUDGET' as BuiltinLlmFailureCode,
    )
  }

  /**
   * Build the custom-mode instruction; the expanded prompt is the whole request.
   * @param input - replayed conversation prefix.
   * @param state - collected authoritative state.
   * @param info - resolved model facts for the summary target.
   * @param maxTokens - generation cap reserved for the summary.
   * @param sessionId - session identity exposed as a prompt variable.
   * @param target - resolved summary target.
   * @param policy - effective policy for that target.
   * @returns the expanded instruction text.
   * @throws with code BETTER_COMPACT_BUDGET when the request does not fit.
   */
  _customInstruction(
    input: SummarizationInput,
    state: ReturnType<typeof collectAuthoritativeState>,
    info: LlmResolvedModelInfo,
    maxTokens: number,
    sessionId: string,
    target: SummaryTarget,
    policy: ResolvedPolicy | SummaryRoutePolicy,
  ): string {
    // Only the readable policy subset reaches the prompt variables; the
    // snapshot fallback simply carries none of them, exactly as before.
    const variables = customPromptVariables(state, {
      target,
      policy: policy as PromptPolicyView,
      sessionId,
    })
    const instruction = buildCustomInstruction(this.snapshot.customPrompt, variables)
    const contextWindow = info?.context?.contextWindow
    if (contextWindow !== undefined) {
      const estimated = this._estimateRequest(input, instruction)
      if (estimated + maxTokens > contextWindow) {
        throw new LlmError(
          `the custom prompt plus the replayed conversation plus maxTokens ${maxTokens} exceeds the ${contextWindow}-token context window of ${target.provider}/${target.model}; shorten the prompt, lower maxTokens, or choose a larger summary model`,
          'BETTER_COMPACT_BUDGET' as BuiltinLlmFailureCode,
        )
      }
    }
    return instruction
  }

  /**
   * Enhanced-mode summarization (goal, handoff, or custom).
   * @param input - replayed conversation prefix to condense.
   * @param agent - owner of the summarized session.
   * @param signal - optional cancellation forwarded to the adapter.
   * @returns safe summary blocks and the exact auxiliary call envelope.
   */
  async _summarizeEnhanced(
    input: SummarizationInput,
    agent: SummarizeAgent,
    signal?: AbortSignal,
  ): Promise<SummaryResult> {
    const { target, policy } = this._resolveRoute(agent)
    const maxTokens = policy.maxTokens
    const info = await this.ctx.llm.resolveModelInfo(target.provider, target.model, signal)
    const effort = this._resolveEffort(info)
    const state = collectAuthoritativeState(this.ctx, agent)
    const instruction = this.mode === 'custom'
      ? this._customInstruction(input, state, info, maxTokens, agent.session.id, target, policy)
      : this._chooseInstruction(input, state, info, maxTokens, agent.session.id)
    const finalMessage: RequestUserInput = deepFreeze({
      role: 'user',
      content: [{ type: 'text', text: instruction }],
    })
    const messages: RequestMessage[] = [...input.messages, finalMessage]
    const options: GenerateOptions = {
      provider: target.provider,
      model: target.model,
      messages,
      maxTokens,
      sessionId: agent.session.id,
      purpose: 'compaction',
      ...(effort === undefined ? {} : { reasoningEffort: effort }),
      ...(signal === undefined ? {} : { signal }),
    }
    if (this.snapshot.cachePriority) {
      options.toolHistory = agent.session.toolHistory()
      if (input.tools !== undefined) options.tools = [...input.tools]
    }
    const assembler = new BlockAssembler()
    for await (const chunk of this.ctx.llm.stream(options)) assembler.push(chunk)
    const error = finishError(assembler.finish)
    if (error !== undefined) throw error
    const rawOutput = assembler.blocks()
    if (contentHasImage(rawOutput)) {
      throw new LlmError('compaction summary cannot contain image output', 'UNSUPPORTED_CONTENT')
    }
    const textBlocks = rawOutput.filter((block): block is Extract<ContentBlock, { type: 'text' }> => block.type === 'text')
    const text = textBlocks.map((block) => block.text).join('\n')
    assertSummaryStructure(text, this.mode as EnhancedMode)

    let finalText = text
    if (this.mode === 'handoff') {
      const redacted = redactSecrets(text)
      const createdAt = new Date().toISOString()
      const written = await writeHandoffFile({
        sessionId: agent.session.id,
        createdAt,
        makeBody: (path: string) =>
          composeHandoffDocument({
            body: redacted,
            path,
            sessionId: agent.session.id,
            createdAt,
          }),
      })
      remember(handoffBySession, agent.session.id, { path: written.path, bytes: written.bytes })
      finalText = written.body
    }

    // Handoff mode never rasterizes: its checkpoint must stay a verbatim
    // document in the durable summary. SUMMARY_IMAGE_MODES already excludes it.
    const summary: ContentBlock[] = this.snapshot.summaryImage && SUMMARY_IMAGE_MODES.includes(this.mode)
      ? await this.summaryImageBlocks(finalText, agent, signal)
      : [{ type: 'text', text: finalText }]

    return {
      summary,
      // The provider output is persisted on compaction/summary and rendered by
      // the trajectory UI. Handoff output must be redacted there too, not only
      // in the visible checkpoint summary.
      rawOutput: this.mode === 'handoff' ? redactContentBlocks(rawOutput) : rawOutput,
      llmStreamCall: true,
      provider: target.provider,
      model: target.model,
      maxTokens,
      ...(assembler.usage === undefined ? {} : { usage: assembler.usage }),
    }
  }

  /**
   * Render the checkpoint as image attachment(s) and cite them in place of the
   * text block. Fail-closed: a missing attachment store, a renderer failure, and
   * a storage failure all reject, so a session never silently keeps a text
   * checkpoint that the operator asked to rasterize.
   * @param text - final checkpoint text to rasterize.
   * @param agent - owner of the compacted session, named in the page title.
   * @param signal - cancellation forwarded to model-capability resolution.
   * @returns the caption block followed by one image block per rendered page.
   * @throws {LlmError} with code BETTER_COMPACT_IMAGE on any failure.
   */
  async summaryImageBlocks(
    text: string,
    agent: Agent,
    signal?: AbortSignal,
  ): Promise<ContentBlock[]> {
    const attachments = optionalService<AttachmentsService>(this.ctx, 'attachments')
    if (attachments === undefined) {
      throw new LlmError(
        'better-compact: summaryImage is enabled but the host attachments service is unavailable; the checkpoint cannot carry rendered images',
        'BETTER_COMPACT_IMAGE' as BuiltinLlmFailureCode,
      )
    }
    await this.assertConversationAcceptsImages(agent, signal)
    const request: SummaryImageRequest = {
      text,
      title: `better-compact ${this.mode} checkpoint · ${agent.session.id}`,
    }
    const pages = await imageStep('could not render the summary image checkpoint', () =>
      renderSummaryImages(request))
    const refs = await imageStep('could not store the rendered summary image checkpoint', () =>
      attachments.saveImages(pages.map((page) => ({
        data: page.data,
        mediaType: page.mediaType,
        name: page.name,
      }))))
    const totalBytes = pages.reduce((total, page) => total + page.data.byteLength, 0)
    const totalPixels = pages.reduce((total, page) => total + page.width * page.height, 0)
    this.ctx.logger.info(
      `better-compact: attached ${pages.length} summary image page(s), ${totalBytes} bytes, ${totalPixels} pixels total`,
    )
    if (totalPixels > REQUEST_IMAGE_PIXEL_BUDGET) {
      this.ctx.logger.warn(
        `better-compact: the attached summary image(s) total ${totalPixels} pixels, above the ${REQUEST_IMAGE_PIXEL_BUDGET}-pixel request budget; the adapter may offload them to placeholder text and drop the checkpoint content`,
      )
    }
    return [
      { type: 'text', text: SUMMARY_IMAGE_CAPTION },
      ...refs.map((attachment): ContentBlock => ({ type: 'image', attachment })),
    ]
  }

  /**
   * Reject a rendered checkpoint the conversation's own model could not read.
   *
   * The image blocks land in the compacted session, so the very next request
   * carries them; an adapter that refuses image input fails that request after
   * the checkpoint was already committed, which leaves the session unable to
   * continue. The check therefore uses the conversation target, not the summary
   * target. An undisclosed modality list stays fail-open: absence means unknown,
   * and aborting compaction over an unknown capability would be worse than the
   * rendering attempt itself.
   * @param agent - owner of the compacted session.
   * @param signal - cancellation forwarded to model resolution.
   * @throws {LlmError} with code BETTER_COMPACT_IMAGE when the model is text-only.
   */
  async assertConversationAcceptsImages(agent: Agent, signal?: AbortSignal): Promise<void> {
    const conversationTarget = routedTarget(agent.session) ?? routeFromAgentOptions(agent)
    if (conversationTarget === undefined) return
    const { provider, model } = conversationTarget
    const info = await this.ctx.llm.resolveModelInfo(provider, model, signal)
    const inputModalities = info.inputModalities
    if (inputModalities === undefined) {
      this.ctx.logger.warn(
        `better-compact: image input capability unknown for ${provider}/${model}; attaching the rendered checkpoint anyway`,
      )
      return
    }
    if (inputModalities.includes('image')) return
    throw new LlmError(
      `the conversation model ${provider}/${model} does not accept image input, so summaryImage cannot be used; turn it off or switch to a vision-capable model`,
      'BETTER_COMPACT_IMAGE' as BuiltinLlmFailureCode,
    )
  }

  /**
   * Schedule the one documented continuation after a successful manual handoff.
   * @param agent - agent whose manual compaction just committed.
   * @param result - committed compaction result.
   * @param signal - cancellation scoped to the manual request.
   */
  async _maybeContinue(
    agent: Agent,
    result: CompactionResult,
    signal?: AbortSignal,
  ): Promise<void> {
    const attempt = handoffBySession.get(agent.session.id) ?? null
    handoffBySession.delete(agent.session.id)
    if (continuedCompactions.has(result.compactionId)) return
    const record = (status: 'scheduled' | 'skipped', blockers: readonly string[]): void =>
      recordContinuationOutcome(agent.session.id, {
        compactionId: result.compactionId,
        status,
        blockers,
      })
    if (signal !== undefined && signal.aborted) {
      record('skipped', ['the manual compaction request was cancelled'])
      this.ctx.logger.info('better-compact: handoff continuation skipped because the request was cancelled')
      return
    }
    if (this.ctx.get('agents')?.get(agent.id) !== agent) {
      record('skipped', ['the agent is no longer live'])
      this.ctx.logger.warn('better-compact: handoff continuation skipped because the agent is no longer live')
      return
    }
    const { blockers } = handoffContinuationBlockers(this.ctx, agent)
    if (blockers.length > 0) {
      record('skipped', blockers)
      this.ctx.logger.info(`better-compact: handoff continuation not scheduled (${blockers.join('; ')}); the handoff checkpoint and file remain available`)
      return
    }
    try {
      agent.followup(
        createUserMessage({
          content: [{ type: 'text', text: continuationText(result, attempt?.path ?? null) }],
          source: { kind: 'user' },
        }),
      )
      continuedCompactions.add(result.compactionId)
      while (continuedCompactions.size > 200) {
        continuedCompactions.delete(continuedCompactions.values().next().value as string)
      }
      record('scheduled', [])
    } catch (error) {
      record('skipped', [`could not queue the continuation: ${errorChain(error)}`])
      this.ctx.logger.warn(`better-compact: could not queue the handoff continuation: ${errorChain(error)}`)
      return
    }
    try {
      await this.ctx.sessions.flush(agent.session)
    } catch (error) {
      this.ctx.logger.warn(
        `better-compact: the handoff continuation was queued but its inbox splice could not be flushed: ${errorChain(error)}; the turn may still start in this process`,
      )
    }
  }

  /** Test/inspection helper: the mode this exact engine instance holds. */
  get activeMode(): CompactionMode {
    return this.mode
  }

  /**
   * Test/inspection helper: last process-observed failure for a session.
   * @param sessionId - session identity.
   * @returns the recorded failure, or undefined.
   */
  failureFor(sessionId: string): ReturnType<typeof lastCompactionFailure> {
    return lastCompactionFailure(sessionId)
  }

  /**
   * Test/inspection helper: whether a live summary attempt owns a session.
   * @param sessionId - session identity.
   * @returns the running attempt's mode, or null.
   */
  activeSummaryFor(sessionId: string): CompactionMode | null {
    return activeSummaryMode(sessionId)
  }

  /**
   * Test helper: compare the frozen snapshot with a candidate config.
   * @param candidate - configuration value to compare.
   * @returns true when both normalize identically.
   */
  snapshotEquals(candidate: unknown): boolean {
    return configEquals(this.snapshot, candidate)
  }
}

/** Re-exported for tests that assert the budget error type. */
export { BudgetConfigError }

export default BetterCompactEngine
