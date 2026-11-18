/**
 * dsh-better-compact — editable sections of the settings page.
 *
 * Every DOM structure, className, aria attribute and user-facing string here is
 * copied verbatim from the pre-TypeScript src/client.js.
 */
import React from 'react'
import {
  MAX_CUSTOM_PROMPT_CHARS,
  PROMPT_VARIABLES,
  type CompactionMode,
  type ConfigSnapshot,
  type InspectBudget,
  type InspectEngine,
  type InspectHandoffContinuation,
  type InspectLastCompaction,
  type InspectPreview,
  type ModelRoute,
  type PromptToken,
} from '../shared/contract.ts'
import { DEFAULT_RETAIN_RATIO, POLICY_NUMBERS, policyDraft, type ConfigDraft, type PolicyDraft } from './draft.ts'
import { t } from './locales/index.ts'
import type { MessageKey } from './locales/zh.ts'
import {
  collapseDetails,
  durationText,
  Explain,
  Field,
  Metric,
  modeMeta,
  processText,
  ratioText,
  ReasonList,
  Row,
  Section,
  Select,
  Toggle,
  tokensText,
  ModeCards,
  NumberField,
  type ProjectedBudget,
} from './controls.tsx'
import { CompactionFlow } from './diagram.tsx'

/** One staged save outcome. */
export type SaveState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'saving' }
  | { readonly kind: 'saved' }
  | { readonly kind: 'rejected' }
  | { readonly kind: 'invalid'; readonly errors: readonly string[] }
  | { readonly kind: 'transport'; readonly message: string }

/** A field-level error lookup provided by the page. */
export type FieldErrorFn = (field: string) => string | undefined

/** Draft patch the sections push back into the page draft store. */
export type DraftPatch = (patch: Partial<ConfigDraft>) => void

/** Goal-mode default instruction; custom mode starts from this template. Keep in sync with goalInstruction(). */
export const DEFAULT_CUSTOM_PROMPT = "You are now acting as a compaction engine for this AI coding assistant. Condense the conversation ABOVE into a structured checkpoint that lets the next model resume the work with no loss of essential context.\n\nOutput EXACTLY the Markdown structure below. Keep every section, in order. Use terse bullets, not prose paragraphs. Write \"(none)\" for an empty section — never drop a section.\n\n## Current Goal and Unresolved Requests\n- [facts]\n\n## Constraints, Preferences, and Approved Boundaries\n- [facts]\n\n## Decisions and Reasons\n- [facts]\n\n## Completed Work\n- [facts]\n\n## In Progress\n- [facts]\n\n## Blocked, Pending, and Unverified\n- [facts]\n\n## Key References\n- [facts]\n\n## Next Actions\n- [facts]\n\nRules:\n- Separate the current authoritative goal and unresolved user requests from completed work.\n- Record decisions and their reasons, not only outcomes.\n- Separate actually verified results from work that is merely believed done.\n- Preserve exact references and error strings instead of copying large plans or file bodies.\n- Next Actions must be directly in line with the most recent unresolved request, not an invented roadmap.\n- Preserve exact file paths, commands, error strings, identifiers, numeric values, function signatures, and syntax fragments verbatim.\n- Capture user feedback and explicit instructions faithfully, especially corrections.\n- Never mark incomplete work complete and never describe unverified work as verified. If a result has not been proven against current files, command output, tests, or runtime state, list it as unverified.\n- Keep pending user questions, running jobs, and running child agents as facts to wait for or collect later. Do not claim to have answered a question, started or stopped a job, or finished a child agent.\n- Prefer references to existing specs, plans, diffs, and commits over copying their text.\n- Treat the authoritative state block (if present) as current host state that outranks any goal/progress claim inside an older checkpoint. Do not treat an older checkpoint as authoritative and do not let superseded plans accumulate.\n- Do not copy secrets, tokens, passwords, credentials, or private keys; redact them.\n- Do not mention this summarization request or that the context was compacted.\n- Output only the Markdown document: do not call any tool or take any other action.\n- If the conversation already contains a <compacted-summary> block, it is a PRIOR checkpoint: keep still-true facts, drop stale ones, and merge newer information into one consolidated document under the same structure."

/** Variables inserted by the custom-mode editor; keep in sync with prompts.js. */
export const PROMPT_MAX_CHARS = MAX_CUSTOM_PROMPT_CHARS

/** Dictionary key labelling one prompt variable chip (the token list itself is shared contract). */
const VARIABLE_LABEL_KEYS: Readonly<Record<PromptToken, MessageKey>> = Object.freeze({
  goal: 'variableGoal',
  todos: 'variableTodos',
  questions: 'variableQuestions',
  jobs: 'variableJobs',
  children: 'variableChildren',
  date: 'variableDate',
  session: 'variableSession',
  model: 'variableModel',
  trigger: 'variableTrigger',
  retain: 'variableRetain',
})

const UNKNOWN_PROMPT_TOKEN = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g

// ── capacity bar ──────────────────────────────────────────────────────

type SegmentKey = 'fixed' | 'compressible' | 'retained' | 'headroom' | 'reserved'

export interface CapacityHandleProps {
  barRef: React.RefObject<HTMLDivElement | null>
  kind: string
  percent: number
  label: string
  valueText: string
  disabled?: boolean
  onPercent: (percent: number) => void
}

/** One draggable ratio handle on the capacity bar. */
export function CapacityHandle(props: CapacityHandleProps): React.ReactElement {
  const dragging = React.useRef(false)
  const percent = Math.max(1, Math.min(99, props.percent))
  const update = (event: { clientX: number }): void => {
    const rect = props.barRef.current?.getBoundingClientRect?.()
    if (!rect || rect.width <= 0) return
    const next = Math.max(1, Math.min(99, ((event.clientX - rect.left) / rect.width) * 100))
    props.onPercent(next)
  }
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (props.disabled) return
    const step = event.shiftKey ? 5 : 1
    let next: number
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = percent - step
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = percent + step
    else if (event.key === 'Home') next = 1
    else if (event.key === 'End') next = 99
    else return
    event.preventDefault()
    props.onPercent(Math.max(1, Math.min(99, next)))
  }
  return (
    <button type="button" className="dsh-bc-handle" data-handle={props.kind} style={{ left: percent + '%' }}
      role="slider" tabIndex={0} aria-label={props.label} aria-valuemin={1} aria-valuemax={99}
      aria-valuenow={Math.round(percent)} aria-valuetext={props.valueText}
      aria-disabled={props.disabled ? true : undefined} disabled={props.disabled}
      onPointerDown={(event) => {
        if (props.disabled) return
        event.preventDefault()
        if (typeof event.currentTarget.setPointerCapture === 'function') event.currentTarget.setPointerCapture(event.pointerId)
        dragging.current = true
        update(event)
      }}
      onPointerMove={(event) => { if (dragging.current) update(event) }}
      onPointerUp={(event) => {
        dragging.current = false
        if (typeof event.currentTarget.releasePointerCapture === 'function') event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onPointerCancel={() => { dragging.current = false }}
      onKeyDown={onKeyDown}>
      <span className="dsh-bc-handle-chip">{props.label}</span>
      <span className="dsh-bc-handle-line" aria-hidden={true} />
    </button>
  )
}

export interface CapacityBarProps {
  draft: ConfigDraft
  projected?: ProjectedBudget | null
  budget?: InspectBudget | null
  disabled?: boolean
  onDraft: DraftPatch
}

/** One bold configuration bar; token arithmetic is rounded for display only. */
export function CapacityBar(props: CapacityBarProps): React.ReactElement {
  const { draft, projected, budget, disabled } = props
  const barRef = React.useRef<HTMLDivElement | null>(null)
  const windowTokens = projected?.window ?? budget?.contextWindow ?? null
  const message = projected?.message ?? null
  const threshold = projected?.threshold ?? null
  const retain = projected?.retain ?? null
  const fixed = typeof budget?.fixedTokens === 'number' && Number.isFinite(budget.fixedTokens) ? budget.fixedTokens : 0
  const current = typeof budget?.currentTokens === 'number' && Number.isFinite(budget.currentTokens) ? budget.currentTokens : null
  const known = [windowTokens, message, threshold, retain].every((value) => typeof value === 'number' && Number.isFinite(value) && value > 0)
  const ratio = Number(draft.thresholdRatio === '' ? 0.8 : draft.thresholdRatio)
  const retainRatio = Number(draft.retainRatio === '' ? DEFAULT_RETAIN_RATIO : draft.retainRatio)
  const unknown = !known
  const knownWindow = known && typeof windowTokens === 'number' ? windowTokens : 1
  const knownMessage = known && typeof message === 'number' ? message : 1
  const knownThreshold = known && typeof threshold === 'number' ? threshold : 1
  const knownRetain = known && typeof retain === 'number' ? retain : 1
  const scale = knownWindow
  const reserved = known ? Math.max(0, knownWindow - knownMessage) : 0
  const headroom = known ? Math.max(0, knownMessage - knownThreshold) : 0
  const compressible = known ? Math.max(0, knownThreshold - fixed - knownRetain) : 0
  const segments: { key: SegmentKey; tokens?: number; width: number }[] = known ? [
    { key: 'fixed', tokens: fixed, width: Math.max(0, fixed) / scale * 100 },
    { key: 'compressible', tokens: compressible, width: Math.max(0, compressible) / scale * 100 },
    { key: 'retained', tokens: knownRetain, width: Math.max(0, knownRetain) / scale * 100 },
    { key: 'headroom', tokens: headroom, width: Math.max(0, headroom) / scale * 100 },
    { key: 'reserved', tokens: reserved, width: Math.max(0, reserved) / scale * 100 },
  ] : [
    { key: 'compressible', width: Math.max(0, ratio * 100 - retainRatio * 100) },
    { key: 'retained', width: Math.max(0, Math.min(100, retainRatio * 100)) },
    { key: 'headroom', width: Math.max(0, 100 - ratio * 100) },
  ]
  const triggerPercent = known ? Math.max(0, Math.min(100, knownThreshold / knownWindow * 100)) : 0
  const ratioPercent = Math.max(1, Math.min(99, ratio * 100))
  const retainPercent = known ? Math.max(1, Math.min(99, (knownThreshold - knownRetain) / knownWindow * 100)) : Math.max(1, Math.min(99, (1 - retainRatio) * 100))
  const currentPercent = known && current !== null ? Math.max(0, Math.min(100, current / knownWindow * 100)) : null
  const labelFor: Readonly<Record<SegmentKey, string>> = {
    fixed: processText('barFixed'),
    compressible: processText('barCompressible'),
    retained: processText('barRetained'),
    headroom: processText('barHeadroom'),
    reserved: processText('reserve'),
  }
  const updateTrigger = (percent: number): void => props.onDraft({ thresholdRatio: String(Math.round(percent) / 100) })
  const updateRetain = (percent: number): void => {
    if (!known) {
      props.onDraft({ retainRatio: String(Number((1 - percent / 100).toFixed(4))) })
      return
    }
    const next = Math.max(0, Math.min(knownThreshold - 1, Math.round(knownThreshold - percent / 100 * knownWindow)))
    if (draft.retainMode === 'tokens') props.onDraft({ retainTokens: String(next) })
    else props.onDraft({ retainRatio: String(Number((next / knownMessage).toFixed(4))) })
  }
  const retainLabel = draft.retainMode === 'tokens' ? processText('retained') + ' ' + tokensText(Number(draft.retainTokens)) : processText('retainHandle') + ' ' + ratioText(retainRatio)
  return (
    <div className="dsh-bc-capacity" data-bc="capacity-bar">
      <div className="dsh-bc-capacity-head">
        <span className="dsh-bc-caption">{processText('configBudget')}</span>
        <span className="dsh-bc-caption dsh-bc-mono" data-bc="capacity-ratio">{ratioText(ratio) + ' \u00b7 ' + (known ? tokensText(threshold) : t('unknown'))}</span>
      </div>
      <div className="dsh-bc-bar dsh-bc-capacity-bar" ref={barRef} role="group"
        aria-label={unknown ? processText('unknownBudget') : processText('configBudget') + ': ' + ratioText(ratio) + ', ' + retainLabel}>
        <div className="dsh-bc-bar-track">
          {segments.map((entry) => (
            <div key={entry.key} className={'dsh-bc-bar-seg dsh-bc-seg-' + entry.key} style={{ width: entry.width + '%' }}
              title={labelFor[entry.key] + ' \u00b7 ' + tokensText(entry.tokens)}>
              {entry.width >= 12 ? <span className="dsh-bc-bar-label">{labelFor[entry.key]}</span> : null}
            </div>
          ))}
        </div>
        {!unknown && currentPercent !== null
          ? <span className="dsh-bc-current-line" style={{ left: currentPercent + '%' }} title={processText('currentUsage') + ' ' + tokensText(current)} data-bc="current-marker" />
          : null}
        {known ? <span className="dsh-bc-trigger" style={{ left: triggerPercent + '%' }} title={processText('effective') + ' ' + ratioText(triggerPercent / 100)} data-bc="effective-trigger" /> : null}
        <CapacityHandle barRef={barRef} kind="trigger" percent={ratioPercent} label={processText('triggerHandle') + ' ' + ratioText(ratio)} valueText={processText('triggerHandle') + ' ' + ratioText(ratio)} disabled={disabled} onPercent={updateTrigger} />
        {draft.retainMode === 'ratio'
          ? <CapacityHandle barRef={barRef} kind="retain" percent={retainPercent} label={retainLabel} valueText={retainLabel} disabled={disabled} onPercent={updateRetain} />
          : null}
        {draft.retainMode === 'tokens'
          ? <span className="dsh-bc-retain-pin" style={{ left: retainPercent + '%' }} title={retainLabel} data-bc="retain-pin">{retainLabel}</span>
          : null}
      </div>
      <ul className="dsh-bc-capacity-legend" aria-hidden={true}>
        {([['compressible', labelFor.compressible], ['retained', labelFor.retained], ['headroom', labelFor.headroom]] as const).map(([key, label]) => (
          <li key={key}><span className={'dsh-bc-swatch dsh-bc-swatch-' + key} />{label}</li>
        ))}
      </ul>
      {unknown ? <p className="dsh-bc-caption" data-bc="budget-incomplete">{processText('unknownBudget') + ' ' + t('ratioOnly')}</p> : null}
      {known ? (
        <div className="dsh-bc-capacity-labels">
          <span>{processText('currentUsage') + ': ' + (current === null ? t('unknown') : tokensText(current))}</span>
          <span>{processText('window') + ': ' + tokensText(windowTokens)}</span>
          <span>{processText('effective') + ': ' + tokensText(threshold)}</span>
          <span>{processText('retained') + ': ' + tokensText(retain)}</span>
        </div>
      ) : null}
    </div>
  )
}

export interface CapacitySectionProps {
  draft: ConfigDraft
  disabled?: boolean
  projected?: ProjectedBudget | null
  budget?: InspectBudget | null
  preview?: InspectPreview | null
  sessionControl?: React.ReactNode
  fieldError: FieldErrorFn
  onDraft: DraftPatch
}

/** Capacity, trigger, retention and the visible headroom field. */
export function CapacitySection(props: CapacitySectionProps): React.ReactElement {
  const { draft, disabled, projected, preview, fieldError, onDraft } = props
  const ratio = Number(draft.thresholdRatio === '' ? 0.8 : draft.thresholdRatio)
  const retainRatio = Number(draft.retainRatio === '' ? DEFAULT_RETAIN_RATIO : draft.retainRatio)
  const saved = preview && typeof preview.beforeTokens === 'number' && Number.isFinite(preview.beforeTokens)
    && typeof preview.afterUpperBoundTokens === 'number' && Number.isFinite(preview.afterUpperBoundTokens)
    ? preview.beforeTokens - preview.afterUpperBoundTokens : null
  const savedPercent = saved !== null && preview && typeof preview.beforeTokens === 'number' && preview.beforeTokens > 0 ? saved / preview.beforeTokens * 100 : null
  return (
    <Section name="capacity" dataBc="capacity" title={processText('capacityTitle')}
      aside={<span className="dsh-bc-caption">{t('draftLabel')}</span>}>
      <p className="dsh-bc-note">{processText('capacityIntro')}</p>
      {props.sessionControl ? (
        <div className="dsh-bc-session-row">
          {props.sessionControl}
          <p className="dsh-bc-caption dsh-bc-session-help">{processText('sessionHelp')}</p>
        </div>
      ) : null}
      <div className="dsh-bc-auto-row">
        <Toggle name="auto" label={processText('auto')} checked={draft.auto} disabled={disabled}
          onChange={(auto) => onDraft({ auto })} />
        <p className="dsh-bc-help dsh-bc-auto-help">{draft.auto ? processText('triggerHelp') : processText('autoOff')}</p>
      </div>
      {draft.auto ? (
        <React.Fragment>
          <div data-bc={projected ? 'draft-budget' : undefined}>
            <CapacityBar draft={draft} projected={projected} budget={props.budget} disabled={disabled} onDraft={onDraft} />
          </div>
          <div className="dsh-bc-capacity-summary" data-bc="capacity-summary">
            {saved !== null && preview && typeof preview.afterUpperBoundTokens === 'number' ? (
              <React.Fragment>
                <strong>{processText('before') + ' ' + tokensText(preview.beforeTokens) + ' \u2192 ' + processText('after') + ' \u2264 ' + tokensText(preview.afterUpperBoundTokens)}</strong>
                {savedPercent !== null ? <span className="dsh-bc-savings">{processText('savings') + ' ' + tokensText(Math.max(0, saved)) + ' (' + ratioText(savedPercent / 100) + ')'}</span> : null}
              </React.Fragment>
            ) : projected ? <span className="dsh-bc-caption">{processText('effective') + ' ' + tokensText(projected.threshold) + ' \u00b7 ' + processText('retained') + ' ' + tokensText(projected.retain)}</span> : null}
            {projected ? <p className="dsh-bc-caption">{processText('resultHelp')}</p> : null}
          </div>
          {projected ? (
            <div className="dsh-bc-capacity-metrics">
              <Metric label={processText('message')} value={tokensText(projected.message)} name="draft-message-budget" />
              <Metric label={processText('effective')} value={tokensText(projected.threshold)} name="draft-trigger" />
              <Metric label={processText('retained')} value={tokensText(projected.retain)} name="draft-retain" />
              <Metric label={processText('summaryBudget')} value={tokensText(projected.summary)} name="draft-summary" />
            </div>
          ) : null}
          <div className="dsh-bc-capacity-controls">
            <NumberField name="thresholdRatio" label={processText('triggerHandle')} ratio={true} value={draft.thresholdRatio}
              disabled={disabled} error={fieldError('thresholdRatio')} onChange={(thresholdRatio) => onDraft({ thresholdRatio })} />
            <div className="dsh-bc-retain-control">
              <fieldset className="dsh-bc-retain-choice">
                <legend className="dsh-bc-label">{processText('retain')}</legend>
                <div className="dsh-bc-segmented">
                  {([['ratio', processText('byRatio')], ['tokens', processText('fixed')]] as const).map(([value, label]) => (
                    <label key={value} className="dsh-bc-segment" data-checked={draft.retainMode === value}>
                      <input type="radio" name="retainMode" value={value} checked={draft.retainMode === value}
                        disabled={disabled} onChange={() => onDraft({ retainMode: value })} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {draft.retainMode === 'ratio'
                ? <NumberField name="retainRatio" label={processText('retainHandle')} ratio={true}
                    value={draft.retainRatio === '' ? String(DEFAULT_RETAIN_RATIO) : draft.retainRatio}
                    disabled={disabled} error={fieldError('retainRatio')} onChange={(retainRatioValue) => onDraft({ retainRatio: retainRatioValue })} />
                : <NumberField name="retainTokens" label={processText('tokens')} value={draft.retainTokens}
                    disabled={disabled} error={fieldError('retainTokens')} onChange={(retainTokens) => onDraft({ retainTokens })} />}
            </div>
            <NumberField name="headroomTokens" label={processText('headroom')} value={draft.headroomTokens}
              disabled={disabled} error={fieldError('headroomTokens')} onChange={(headroomTokens) => onDraft({ headroomTokens })} />
          </div>
          <p className="dsh-bc-caption">{processText('retainHelp') + ' ' + processText('headroomHelp')}</p>
        </React.Fragment>
      ) : <p className="dsh-bc-note" data-bc="auto-off">{processText('autoOff')}</p>}
      {projected?.policy ? <p className="dsh-bc-note" data-bc="process-override">{processText('override')}</p> : null}
      {projected?.error ? <p className="dsh-bc-error" role="alert" data-bc="budget-constraint">{projected.error}</p> : null}
    </Section>
  )
}

// ── custom prompt editor ──────────────────────────────────────────────

export interface PromptEditorProps {
  value: string
  disabled?: boolean
  error?: string
  onChange: (value: string) => void
}

/** Custom-mode instruction editor with one-click variable insertion. */
export function PromptEditor(props: PromptEditorProps): React.ReactElement {
  const { value, disabled, error } = props
  const ref = React.useRef<HTMLTextAreaElement | null>(null)
  const known = new Set<string>(PROMPT_VARIABLES.map((entry) => entry.token))
  const unknown = [...new Set([...String(value).matchAll(UNKNOWN_PROMPT_TOKEN)].map((match) => match[1]).filter((token): token is string => typeof token === 'string' && !known.has(token)))]
  const insert = (token: string): void => {
    const element = ref.current
    const selectionStart = element === null || element === undefined ? null : element.selectionStart
    const selectionEnd = element === null || element === undefined ? null : element.selectionEnd
    const start = typeof selectionStart === 'number' && Number.isInteger(selectionStart) ? selectionStart : String(value).length
    const end = typeof selectionEnd === 'number' && Number.isInteger(selectionEnd) ? selectionEnd : start
    const next = String(value).slice(0, start) + token + String(value).slice(end)
    props.onChange(next)
    const position = start + token.length
    const focus = (): void => {
      if (element === null || element === undefined) return
      element.focus?.()
      element.setSelectionRange?.(position, position)
    }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(focus)
    else focus()
  }
  return (
    <Section name="prompt" dataBc="prompt" title={processText('promptTitle')}
      aside={<span className="dsh-bc-chip">{processText('promptRequired')}</span>}>
      <p className="dsh-bc-note">{processText('promptIntro')}</p>
      <div className="dsh-bc-prompt-toolbar" role="toolbar" aria-label={processText('promptVariables')}>
        {PROMPT_VARIABLES.map((entry) => (
          <button key={entry.token} type="button" className="dsh-bc-chip dsh-bc-variable"
            data-bc={'prompt-variable-' + entry.token}
            title={t('processpromptVariables') + ' {{' + entry.token + '}}'}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => insert('{{' + entry.token + '}}')}>
            {t(VARIABLE_LABEL_KEYS[entry.token]) + ' {{' + entry.token + '}}'}
          </button>
        ))}
      </div>
      <textarea ref={ref} id="dsh-bc-custom-prompt" name="customPrompt" className="dsh-bc-textarea"
        rows={6} maxLength={PROMPT_MAX_CHARS} value={value} disabled={disabled}
        placeholder={processText('promptPlaceholder')}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'dsh-bc-custom-prompt-error' : undefined}
        onChange={(event) => props.onChange(event.target.value)} />
      <div className="dsh-bc-prompt-foot">
        <span className="dsh-bc-caption dsh-bc-mono" data-bc="prompt-counter">{processText('promptCounter').replace('{count}', String(String(value).length))}</span>
        {unknown.length > 0 ? <span className="dsh-bc-warn" role="status" data-bc="prompt-warning">{processText('promptUnknown').replace('{tokens}', unknown.map((token) => '{{' + token + '}}').join(', '))}</span> : null}
      </div>
      {error ? <p className="dsh-bc-error" id="dsh-bc-custom-prompt-error" role="alert">{error}</p> : null}
      <p className="dsh-bc-caption">{processText('promptPrivacy')}</p>
    </Section>
  )
}

// ── process editor ────────────────────────────────────────────────────

export interface ProcessEditorProps extends CapacitySectionProps {
  projection?: ProjectedBudget | null
  sessionId?: string
  draftInvalid?: boolean
  engineApplies?: boolean | null
  inspectLoading?: boolean
  inspectError?: string | null
  routes?: readonly ModelRoute[]
  route?: ModelRoute
  target?: { readonly provider: string; readonly model: string } | null
  routeWarning?: string | null
  modelsStatus?: string
  modelsEnabled?: boolean | null
  modelsError?: string | null
  onProvider?: (value: string) => void
  onModel?: (value: string) => void
}

/** Editable compaction surface: capacity, strategy, generation and prompt. */
export function ProcessEditor(props: ProcessEditorProps): React.ReactElement {
  const { draft, disabled, projection: projected } = props
  const fieldError = props.fieldError
  /** The image attachment only applies to the two summarising modes. */
  const summaryImageApplies = draft.mode === 'goal' || draft.mode === 'custom'
  const changeMode = (mode: CompactionMode): void => {
    if (mode === 'custom' && String(draft.customPrompt).trim() === '') {
      props.onDraft({ mode, customPrompt: DEFAULT_CUSTOM_PROMPT })
      return
    }
    props.onDraft({ mode })
  }
  return (
    <div className="dsh-bc-editor" data-bc="process-editor" data-bc-section="process">
      <CapacitySection {...props} projected={projected} />
      <Section name="strategy" dataBc="strategy" title={processText('strategyTitle')}>
        <div className="dsh-bc-strategy-layout">
          <div className="dsh-bc-strategy-choice">
            <p className="dsh-bc-caption">{t('strategyChoiceLabel')}</p>
            <ModeCards value={draft.mode} disabled={disabled} onChange={changeMode} />
          </div>
          <div className="dsh-bc-strategy-figure">
            <p className="dsh-bc-caption">{t('strategyFigureLabel')}</p>
            <CompactionFlow mode={draft.mode} draft={draft} projected={projected} preview={props.preview} fixedTokens={props.budget?.fixedTokens} />
          </div>
        </div>
        <div className="dsh-bc-strategy-extra">
          {draft.mode !== 'native' ? (
            <div className="dsh-bc-cache-row">
              <Toggle name="cachePriority" label={processText('cache')} checked={draft.cachePriority} disabled={disabled}
                onChange={(cachePriority) => props.onDraft({ cachePriority })} />
              <p className="dsh-bc-caption">{processText('cacheHelp')}</p>
            </div>
          ) : null}
          <div className="dsh-bc-cache-row">
            <Toggle name="summaryImage" label={t('summaryImage')} title={t('summaryImageHint')}
              checked={draft.summaryImage} disabled={disabled || !summaryImageApplies}
              onChange={(summaryImage) => props.onDraft({ summaryImage })} />
          </div>
        </div>
      </Section>
      <Section name="generation" dataBc="generation" title={processText('generationTitle')}
        aside={<span className="dsh-bc-caption">{processText('generationIntro')}</span>}>
        <ModelSection draft={draft} routes={props.routes ?? []} route={props.route} target={props.target}
          disabled={disabled} fieldError={fieldError} onDraft={props.onDraft}
          onProvider={props.onProvider} onModel={props.onModel} routeWarning={props.routeWarning}
          modelsStatus={props.modelsStatus} modelsEnabled={props.modelsEnabled} modelsError={props.modelsError} />
        <NumberField name="maxTokens" label={processText('summaryCap')} value={draft.maxTokens} min={1}
          disabled={disabled} help={processText('followHeadroom')} error={fieldError('maxTokens')}
          onChange={(maxTokens) => props.onDraft({ maxTokens })} />
        {projected ? <p className="dsh-bc-caption" data-bc="draft-summary-note">{processText('summaryBudget') + ': ' + tokensText(projected.summary)}</p> : null}
      </Section>
      {draft.mode === 'custom'
        ? <PromptEditor value={draft.customPrompt} disabled={disabled} error={fieldError('customPrompt')} onChange={(customPrompt) => props.onDraft({ customPrompt })} />
        : null}
    </div>
  )
}

// ── runtime budget ────────────────────────────────────────────────────

export interface RuntimeBudgetProps {
  budget?: InspectBudget | null
  preview?: InspectPreview | null
  engineApplies?: boolean | null
  activeConfig?: ConfigSnapshot | null
}

export function RuntimeBudget(props: RuntimeBudgetProps): React.ReactElement | null {
  const { budget, preview } = props
  if (props.engineApplies === false) return null
  const remaining = typeof budget?.thresholdTokens === 'number' && Number.isFinite(budget.thresholdTokens) && typeof budget?.currentTokens === 'number' && Number.isFinite(budget.currentTokens)
    ? budget.thresholdTokens - budget.currentTokens : null
  const conclusion = props.activeConfig?.auto === false ? t('conclusionAutoOff')
    : remaining === null ? t('conclusionNoUsage')
      : remaining > 0 ? t('conclusionRemaining', { remaining: tokensText(remaining) }) : t('conclusionReached')
  const measurement = budget?.measurement === 'measured' ? t('measured')
    : budget?.measurement === 'estimated' ? t('estimated') : t('measurementUnknown')
  const hasCut = typeof preview?.rangeStart === 'number' && typeof preview?.rangeEnd === 'number'
  return (
    <div className="dsh-bc-runtime" data-bc="runtime-budget">
      <div className="dsh-bc-subhead">
        <h4 className="dsh-bc-h4">{conclusion}</h4>
        <span className="dsh-bc-chip" data-bc="measurement">{measurement}</span>
      </div>
      <div className="dsh-bc-facts">
        <Metric label={t('runtimeWindow')} value={tokensText(budget?.contextWindow)} />
        <Metric label={t('currentContext')} value={tokensText(budget?.currentTokens)} name="current-tokens" />
        <Metric label={t('runtimeTrigger')} value={tokensText(budget?.thresholdTokens)} name="runtime-trigger" />
        <Metric label={t('runtimeMessageBudget')} value={tokensText(budget?.messageBudgetTokens)} />
        <Metric label={t('runtimeSummaryBudget')} value={tokensText(budget?.summaryMaxTokens)} />
      </div>
      <div data-bc="runtime-preview">
        {hasCut && preview
          ? <p className="dsh-bc-note" data-bc="safe-cut">{t('safeCutWithBefore', { start: preview.rangeStart as number, end: preview.rangeEnd as number, before: tokensText(preview.beforeTokens), upper: tokensText(preview.afterUpperBoundTokens) })}</p>
          : <p className="dsh-bc-caption" data-bc="no-safe-cut">{t('noSafeCut')}</p>}
      </div>
    </div>
  )
}

// ── model / effort section ────────────────────────────────────────────

export interface ModelSectionProps {
  draft: ConfigDraft
  routes: readonly ModelRoute[]
  route?: ModelRoute
  target?: { readonly provider: string; readonly model: string } | null
  disabled?: boolean
  fieldError: FieldErrorFn
  onDraft: DraftPatch
  onProvider?: (value: string) => void
  onModel?: (value: string) => void
  routeWarning?: string | null
  modelsStatus?: string
  modelsEnabled?: boolean | null
  modelsError?: string | null
}

export function ModelSection(props: ModelSectionProps): React.ReactElement {
  const { draft, routes, route, disabled } = props
  const native = draft.mode === 'native'
  const custom = draft.provider !== '' && !routes.some((entry) => entry.provider === draft.provider && entry.model === draft.model)
  const [customOpen, setCustomOpen] = React.useState(custom)
  const showCustom = custom || customOpen
  const textField = (name: string, label: string, value: string, onChange: (value: string) => void): React.ReactElement => (
    <Field name={name} label={label} error={props.fieldError(name)}>
      {(id, aria) => (
        <input {...aria} id={id} name={name} className="dsh-bc-input" value={value} disabled={disabled}
          onChange={(event) => onChange(event.target.value)} />
      )}
    </Field>
  )
  return (
    <div className="dsh-bc-process-model">
      <div className="dsh-bc-grid">
        <Field name="summaryRoute" label={t('summaryModel')} error={props.fieldError('summarizationModel')}>
          {(id, aria) => (
            <Select {...aria} id={id} name="summaryRoute"
              value={custom ? 'custom' : draft.provider === '' ? (customOpen ? 'custom' : '') : JSON.stringify([draft.provider, draft.model])}
              disabled={disabled}
              onChange={(event) => {
                if (event.target.value === 'custom') { setCustomOpen(true); return }
                setCustomOpen(false)
                const [provider, model] = event.target.value === '' ? ['', ''] : JSON.parse(event.target.value) as [string, string]
                props.onDraft({ provider, model })
              }}>
              <option value="">{t('followSessionModel') + (props.target ? ' \u00b7 ' + props.target.provider + '/' + props.target.model : '')}</option>
              {routes.map((entry) => (
                <option key={JSON.stringify([entry.provider, entry.model])} value={JSON.stringify([entry.provider, entry.model])}>
                  {entry.provider + '/' + entry.model}
                </option>
              ))}
              <option value="custom">{custom ? draft.provider + '/' + draft.model : t('customModelOption')}</option>
            </Select>
          )}
        </Field>
        {!native ? (
          <Field name="reasoningEffort" label={t('reasoningEffort')} error={props.fieldError('reasoningEffort')}>
            {(id, aria) => route ? (
              <Select {...aria} id={id} name="reasoningEffort" value={draft.effort} disabled={disabled}
                onChange={(event) => props.onDraft({ effort: event.target.value })}>
                <option value="">{route.defaultEffort ? t('modelDefaultWith', { effort: route.defaultEffort }) : t('modelDefault')}</option>
                {route.efforts.map((effort) => <option key={effort} value={effort}>{effort}</option>)}
                {draft.effort !== '' && !route.efforts.includes(draft.effort)
                  ? <option value={draft.effort}>{t('unsupportedEffortOption', { effort: draft.effort })}</option>
                  : null}
              </Select>
            ) : (
              <input {...aria} id={id} name="reasoningEffort" className="dsh-bc-input" value={draft.effort}
                disabled={disabled} placeholder={t('effortUnknownPlaceholder')}
                onChange={(event) => props.onDraft({ effort: event.target.value })} />
            )}
          </Field>
        ) : null}
      </div>
      {showCustom ? (
        <div className="dsh-bc-custom-model" data-bc="custom-model">
          <div className="dsh-bc-grid">
            {textField('summarizationProvider', t('provider'), draft.provider, props.onProvider as (value: string) => void)}
            {textField('summarizationModel', t('model'), draft.model, props.onModel as (value: string) => void)}
          </div>
        </div>
      ) : null}
      {props.routeWarning ? <p className="dsh-bc-note" data-bc="route-warning">{props.routeWarning}</p> : null}
      {props.modelsStatus === 'loading' || props.modelsStatus === 'refreshing'
        ? <p className="dsh-bc-caption" role="status">{t('modelsLoading')}</p>
        : props.modelsStatus === 'error' ? <p className="dsh-bc-note">{t('modelsFailed')}</p> : null}
    </div>
  )
}

// ── advanced section ──────────────────────────────────────────────────

export interface AdvancedSectionProps {
  draft: ConfigDraft
  disabled?: boolean
  fieldError: FieldErrorFn
  onDraft: DraftPatch
}

export function AdvancedSection(props: AdvancedSectionProps): React.ReactElement {
  const { draft, disabled } = props
  const defaults: Readonly<Record<string, string>> = { compactionRetries: '1', maxOverflowRetries: '1' }
  const names: Readonly<Record<string, string>> = { compactionRetries: t('pressureRetry'), maxOverflowRetries: t('overflowRecovery') }
  const customized = Object.keys(defaults).filter((key) => (draft as unknown as Record<string, unknown>)[key] !== defaults[key]).map((key) => names[key] as string)
  if (draft.policies.length) customized.push(draft.policies.length + ' \u00d7 ' + t('policies'))
  const updatePolicy = (index: number, patch: Partial<PolicyDraft>): void => props.onDraft({ policies: draft.policies.map((entry, i) => i === index ? { ...entry, ...patch } : entry) })
  const draftScalar = (key: keyof PolicyDraft): string => {
    const value = (draft as unknown as Record<string, unknown>)[key]
    return typeof value === 'string' ? value : ''
  }
  const policyField = (index: number, key: keyof PolicyDraft, label: string, ratio: boolean, inherited?: string): React.ReactElement => {
    const policy = draft.policies[index] as PolicyDraft
    return (
      <NumberField name={'policies.' + index + '.' + key} label={label} ratio={ratio} value={policy[key]}
        disabled={disabled}
        help={policy[key] === '' && inherited !== undefined
          ? t('inheritWith', { value: ratio ? ratioText(Number(inherited)) : key.includes('Retries') ? inherited + ' ' + t('timesUnit') : tokensText(Number(inherited)) })
          : undefined}
        error={props.fieldError('policies.' + index + '.' + key)}
        onChange={(value) => updatePolicy(index, { [key]: value } as Partial<PolicyDraft>)} />
    )
  }
  const policyText = (index: number, key: keyof PolicyDraft, label: string): React.ReactElement => {
    const policy = draft.policies[index] as PolicyDraft
    return (
      <Field name={'policies.' + index + '.' + key} label={label} error={props.fieldError('policies.' + index + '.' + key)}>
        {(id, aria) => (
          <input {...aria} id={id} name={'policies.' + index + '.' + key} className="dsh-bc-input" value={policy[key]}
            disabled={disabled} onChange={(event) => updatePolicy(index, { [key]: event.target.value } as Partial<PolicyDraft>)} />
        )}
      </Field>
    )
  }
  return (
    <details className="dsh-bc-details" onKeyDown={collapseDetails} data-bc="advanced">
      <summary>
        <span>{processText('advancedRules')}</span>
        {customized.length
          ? <span className="dsh-bc-caption" data-bc="advanced-summary">{t('advancedCount', { count: customized.length }) + ' \u00b7 ' + customized.join(' \u00b7 ')}</span>
          : <span className="dsh-bc-caption">{processText('advancedDefault')}</span>}
      </summary>
      <div className="dsh-bc-details-body">
        <div className="dsh-bc-grid">
          {draft.auto ? (
            <React.Fragment>
              <NumberField name="compactionRetries" label={t('pressureRetry')} unit={t('timesUnit')} value={draft.compactionRetries}
                disabled={disabled} error={props.fieldError('compactionRetries')} onChange={(compactionRetries) => props.onDraft({ compactionRetries })} />
              <NumberField name="maxOverflowRetries" label={t('overflowRecovery')} unit={t('timesUnit')} value={draft.maxOverflowRetries}
                disabled={disabled} error={props.fieldError('maxOverflowRetries')} onChange={(maxOverflowRetries) => props.onDraft({ maxOverflowRetries })} />
            </React.Fragment>
          ) : null}
        </div>
        <div className="dsh-bc-subhead">
          <h4 className="dsh-bc-h4">{t('policies')}</h4>
          <button type="button" className="dsh-bc-btn" disabled={disabled} data-bc="add-policy"
            onClick={() => props.onDraft({ policies: [...draft.policies, policyDraft()] })}>{t('addRule')}</button>
        </div>
        {draft.policies.length === 0 ? <p className="dsh-bc-caption">{t('allModelsGlobal')}</p> : null}
        {draft.policies.map((policy, index) => (
          <div key={index} className="dsh-bc-policy-card" data-bc-policy={index}>
            <div className="dsh-bc-policy-head">
              <span className="dsh-bc-mono">{policy.provider && policy.model ? policy.provider + '/' + policy.model : t('newRule')}</span>
              <button type="button" className="dsh-bc-btn dsh-bc-btn-remove" disabled={disabled}
                aria-label={t('deleteRule', { index: index + 1 })}
                onClick={() => props.onDraft({ policies: draft.policies.filter((_, i) => i !== index) })}>{t('deleteRuleShort')}</button>
            </div>
            <div className="dsh-bc-policy-body">
              <div className="dsh-bc-grid">
                {policyText(index, 'provider', t('sessionProvider'))}
                {policyText(index, 'model', t('sessionModel'))}
                {POLICY_NUMBERS.filter(([key]) => draft.auto || !['thresholdRatio', 'compactionRetries', 'maxOverflowRetries'].includes(key)).map(([key, labelKey, ratio]) => (
                  <React.Fragment key={key}>
                    {policyField(index, key, t(labelKey), ratio === true, key === 'maxTokens' ? draft.maxTokens || policy.headroomTokens || draft.headroomTokens : draftScalar(key))}
                  </React.Fragment>
                ))}
                {draft.auto ? (
                  <React.Fragment>
                    <Field name={'policies.' + index + '.retainMode'} label={t('retainRecent')}>
                      {(id, aria) => (
                        <Select {...aria} id={id} name={'policies.' + index + '.retainMode'} value={policy.retainMode} disabled={disabled}
                          onChange={(event) => updatePolicy(index, { retainMode: event.target.value as PolicyDraft['retainMode'] })}>
                          <option value="inherit">{t('inheritWith', { value: draft.retainMode === 'tokens' ? tokensText(Number(draft.retainTokens)) : ratioText(draft.retainRatio === '' ? DEFAULT_RETAIN_RATIO : Number(draft.retainRatio)) })}</option>
                          <option value="ratio">{t('byMessageBudgetRatio')}</option>
                          <option value="tokens">{t('fixedTokenCount')}</option>
                        </Select>
                      )}
                    </Field>
                    {policy.retainMode !== 'inherit'
                      ? policyField(index, policy.retainMode === 'ratio' ? 'retainRatio' : 'retainTokens',
                        policy.retainMode === 'ratio' ? t('retainRatio') : t('retainTokens'), policy.retainMode === 'ratio',
                        policy.retainMode === 'ratio' ? draft.retainRatio || String(DEFAULT_RETAIN_RATIO) : undefined)
                      : props.fieldError('policies.' + index + '.retainRatio')
                        ? <p className="dsh-bc-error" role="alert">{props.fieldError('policies.' + index + '.retainRatio')}</p>
                        : null}
                  </React.Fragment>
                ) : null}
                <Field name={'policies.' + index + '.summaryMode'} label={t('policySummaryMode')}>
                  {(id, aria) => (
                    <Select {...aria} id={id} name={'policies.' + index + '.summaryMode'} value={policy.summaryMode} disabled={disabled}
                      onChange={(event) => updatePolicy(index, { summaryMode: event.target.value as PolicyDraft['summaryMode'] })}>
                      <option value="inherit">{t('policySummaryInherit', { value: draft.provider ? draft.provider + '/' + draft.model : t('followSessionModel') })}</option>
                      <option value="session">{t('policySummarySession')}</option>
                      <option value="custom">{t('policySummaryCustom')}</option>
                    </Select>
                  )}
                </Field>
                {policy.summaryMode === 'custom' ? (
                  <React.Fragment>
                    {policyText(index, 'summarizationProvider', t('summaryProvider'))}
                    {policyText(index, 'summarizationModel', t('summaryModel'))}
                  </React.Fragment>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {/* policyBlankInherit is deliberately not rendered: in the pre-TypeScript source that paragraph
            was the second argument of Array.prototype.map (a thisArg), so it never reached the DOM. Keeping
            the rendered output identical matters more than rendering a dead hint. */}
      </div>
    </details>
  )
}

// ── status section ────────────────────────────────────────────────────

const STATUS_KEYS: Readonly<Record<string, MessageKey>> = Object.freeze({
  running: 'statusRunning',
  completed: 'statusCompleted',
  failed: 'statusFailed',
  cancelled: 'statusCancelled',
  'persistence-error': 'statusPersistenceError',
})

/** One-line engine ownership statement. */
export function engineNote(engine: InspectEngine | null | undefined): string {
  if (engine === null || engine === undefined) return t('engineUnknown')
  if (engine.inspectApplies === false) return t('engineForeign', { owner: engine.owner })
  if (engine.owner === 'unknown') return t('engineOwnerUnknown')
  return t('engineOwner', { owner: engine.owner })
}

export interface LastCompactionProps {
  record?: InspectLastCompaction | null
  emptyText?: React.ReactNode
  emptyName?: string
}

/** The status of the last real native compaction bracket. */
export function LastCompaction(props: LastCompactionProps): React.ReactElement {
  const record = props.record
  if (!record) return <p className="dsh-bc-caption" data-bc={props.emptyName ?? 'last-compaction-empty'}>{props.emptyText}</p>
  const trigger = record.trigger === 'manual' ? t('triggerManual') : record.trigger === 'automatic' ? t('triggerAutomatic') : t('triggerUnknown')
  const recordMode = modeMeta(record.mode)
  return (
    <div className="dsh-bc-status-record" data-bc="last-compaction" data-status={record.status}>
      <p className={'dsh-bc-status-line dsh-bc-status-' + record.status}>{t(STATUS_KEYS[record.status] ?? 'unknown') + ' \u00b7 ' + trigger}</p>
      <div className="dsh-bc-status-grid">
        <Row label={t('strategyLabel')} value={recordMode ? t(recordMode.labelKey) : t('unknown')} />
        <Row label={t('duration')} value={durationText(record.durationMs)} />
        <Row label={t('replacedMessages')} value={tokensText(record.beforeTokens)} />
        <Row label={t('summaryEstimate')} value={tokensText(record.afterTokens)} />
        <Row label={t('cacheRead')} value={tokensText(record.cacheReadTokens)} />
        <Row label={t('cacheWrite')} value={tokensText(record.cacheWriteTokens)} />
      </div>
      {record.status === 'persistence-error' ? <p className="dsh-bc-error" role="alert" data-bc="persistence-error">{t('persistenceFailed')}</p> : null}
      {record.error ? <p className="dsh-bc-error" role="alert">{record.error}</p> : null}
    </div>
  )
}

export interface StatusSectionProps extends RuntimeBudgetProps {
  sessionId?: string
  engine?: InspectEngine | null
  record?: InspectLastCompaction | null
  continuation?: InspectHandoffContinuation | null
  diagnostics?: readonly string[]
  reasons?: readonly string[]
  inspectError?: string | null
  inspectLoading?: boolean
}

export function StatusSection(props: StatusSectionProps): React.ReactElement {
  const reasons = [...new Set([...(props.diagnostics ?? []), ...(props.reasons ?? [])].filter((entry) => typeof entry === 'string' && entry !== ''))]
  return (
    <Section name="diagnostics" dataBc="diagnostics" title={t('statusSection')}
      aside={<span className="dsh-bc-caption">{t('statusReadOnly')}</span>}>
      {props.inspectError
        ? <p className="dsh-bc-error" role="alert">{t('diagnosticsFailed', { message: props.inspectError })}</p>
        : props.inspectLoading
          ? <p className="dsh-bc-note" role="status" aria-busy={true}>{t('readingDiagnostics')}</p>
          : props.sessionId === ''
            ? <p className="dsh-bc-caption" data-bc="status-empty">{t('statusEmpty')}</p>
            : (
              <React.Fragment>
                <p className="dsh-bc-caption" data-bc="engine-note">{engineNote(props.engine)}</p>
                <RuntimeBudget {...props} />
                <div className="dsh-bc-budget-view">
                  <h4 className="dsh-bc-h4">{t('lastCompaction')}</h4>
                  <LastCompaction record={props.record} emptyText={t('noCompaction')} />
                </div>
                {props.continuation ? (
                  <div className="dsh-bc-continuation" data-bc="handoff-continuation">
                    <h4 className="dsh-bc-h4">{t('handoffContinuation')}</h4>
                    <p className="dsh-bc-note">{props.continuation.status === 'scheduled' ? t('continuationScheduled') : t('continuationSkipped')}</p>
                    {props.continuation.blockers?.length
                      ? <ul className="dsh-bc-bullets">{props.continuation.blockers.map((item, index) => <li key={index}>{item}</li>)}</ul>
                      : null}
                  </div>
                ) : null}
              </React.Fragment>
            )}
      {reasons.length ? <Explain name="diagnostics-details" title={t('diagnosticsDetails', { count: reasons.length })}><ReasonList reasons={reasons} /></Explain> : null}
    </Section>
  )
}

export interface SessionEntry {
  readonly id: string
  readonly title: string
  readonly running: boolean
}

export interface SessionPickerProps {
  entries: readonly SessionEntry[]
  selectedId: string
  phase?: string
  listError?: string | null
  refresh?: boolean
  onSelect: (id: string) => void
  onRefresh: () => void
}

export function SessionPicker(props: SessionPickerProps): React.ReactElement {
  const id = 'dsh-bc-session-' + React.useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <div className="dsh-bc-session" data-bc="session-picker">
      <label id={id + '-label'} htmlFor={id} className="dsh-bc-label">{t('session')}</label>
      <Select id={id} name="inspectSession" aria-labelledby={id + '-label'} value={props.selectedId}
        disabled={props.phase === 'pending' || props.entries.length === 0}
        onChange={(event) => props.onSelect(event.target.value)} title={t('selectSessionTitle')}>
        <option value="">{props.phase === 'pending' ? t('loadingSessions') : props.entries.length === 0 ? t('noSessions') : t('selectSession')}</option>
        {props.entries.map((entry) => (
          <option key={entry.id} value={entry.id}>{entry.title + (entry.running ? t('runningSuffix') : '')}</option>
        ))}
      </Select>
      <button type="button" className="dsh-bc-btn" onClick={props.onRefresh} disabled={props.refresh}
        aria-busy={props.refresh} aria-label={t('refreshDiagnostics')}>{props.refresh ? t('reading') : t('refresh')}</button>
      {props.listError ? <span className="dsh-bc-error">{t('sessionListFailed')}</span> : null}
    </div>
  )
}

export interface ActiveConfigBannerProps {
  activeConfig?: ConfigSnapshot | null
  requiresReload?: boolean | null
  dirty?: boolean
}

export function ActiveConfigBanner(props: ActiveConfigBannerProps): React.ReactElement | null {
  const active = props.activeConfig
  if (props.requiresReload !== true) return null
  const activeMode = active ? modeMeta(active.mode) : undefined
  return (
    <div className="dsh-bc-banner" data-bc="active-config" data-requires-reload={String(props.requiresReload)}>
      <span className="dsh-bc-chip" data-tone="accent">{t('activeDiffers')}</span>
      <Explain title={t('viewActiveConfig')}>
        {active ? (
          <div className="dsh-bc-status-grid">
            <Row label={t('runtimeMode')} value={activeMode ? t(activeMode.labelKey) : active.mode} />
            <Row label={t('runtimeSummaryModel')} value={active.summarizationProvider ? active.summarizationProvider + '/' + active.summarizationModel : t('followSession')} mono={true} />
            <Row label={t('runtimeThreshold')} value={ratioText(active.thresholdRatio)} />
            <Row label={t('runtimeRetain')} value={active.retainTokens != null ? tokensText(active.retainTokens) : ratioText(active.retainRatio)} />
          </div>
        ) : null}
      </Explain>
    </div>
  )
}

export interface SaveFooterProps {
  draft: ConfigDraft | null
  changeCount: number
  saveState: SaveState
  errors: readonly string[]
  conflict: boolean
  disabled: boolean
  saving: boolean
  writable: boolean
  revision: number | null
  dirty: boolean
  onSave: () => void
  onReload: () => void
}

export function SaveFooter(props: SaveFooterProps): React.ReactElement | null {
  const [discardTarget, setDiscardTarget] = React.useState<ConfigDraft | null>(null)
  const discardArmed = discardTarget === props.draft
  const saving = props.saving || props.saveState.kind === 'saving'
  const disabled = props.disabled || saving || props.conflict || !props.writable || !props.dirty || props.errors.length > 0
  const failure = props.saveState.kind === 'transport' ? t('saveFailed', { message: props.saveState.message })
    : props.saveState.kind === 'rejected' ? t('saveRejected')
      : props.conflict ? t('saveConflict') : null
  if (!props.dirty && !props.conflict) return null
  return (
    <footer className="dsh-bc-footer" data-bc="save-footer" aria-busy={saving}>
      <div className="dsh-bc-footer-copy">
        {failure
          ? <p className="dsh-bc-error" role="alert" data-bc={props.conflict ? 'revision-conflict' : props.saveState.kind === 'rejected' ? 'save-rejected' : 'save-transport'}>{failure}</p>
          : (
            <p className="dsh-bc-note" role="status" data-bc={!props.writable ? 'read-only' : props.saveState.kind === 'saved' ? 'save-saved' : 'save-status'}>
              {!props.writable ? t('readOnlyConfig') : t('saveChanges', { count: props.changeCount })}
            </p>
          )}
        {props.errors.length ? (
          <div className="dsh-bc-footer-errors" role="alert" data-bc="save-errors">
            <p className="dsh-bc-error">{t('fixErrors', { count: props.errors.length })}</p>
            <ul className="dsh-bc-reasons">{props.errors.map((message, index) => <li key={index}>{message}</li>)}</ul>
          </div>
        ) : null}
      </div>
      <div className="dsh-bc-actions">
        <button type="button" className="dsh-bc-btn"
          onClick={() => { if (props.changeCount > 3 && !discardArmed) setDiscardTarget(props.draft); else props.onReload() }}
          disabled={saving || (!props.dirty && !props.conflict)}>
          {discardArmed ? t('discardAgain') : props.conflict ? t('reload') : t('discard')}
        </button>
        <button type="button" className="dsh-bc-btn dsh-bc-btn-primary" onClick={props.onSave} disabled={disabled}
          data-bc="save-button" aria-busy={saving}>{saving ? t('saving') : t('save')}</button>
      </div>
    </footer>
  )
}
