/**
 * dsh-better-compact — generic settings primitives.
 *
 * Every DOM structure, className, aria attribute and user-facing string here is
 * copied verbatim from the pre-TypeScript src/client.js: the stylesheet and the
 * accessibility acceptance tests are written against them. Only types are new.
 *
 * React is imported as a default namespace import (the client bundle is CJS and
 * compiles with the classic JSX runtime).
 */
import React from 'react'
import { MODES, type CompactionMode, type InspectBudget, type InspectPreview } from '../shared/contract.ts'
import { DEFAULT_RETAIN_RATIO, type PolicyDraft } from './draft.ts'
import { t } from './locales/index.ts'
import type { MessageKey } from './locales/zh.ts'

// ── formatting helpers ────────────────────────────────────────────────

/** Group an integer with commas without depending on the runtime locale. */
export function groupDigits(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** Human token value; a missing or non-finite value is unknown, never 0. */
export function tokensText(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return t('unknown')
  const rounded = Math.round(value)
  return groupDigits(rounded) + ' tokens'
}

/** Ratio text as a percentage; unknown stays unknown. */
export function ratioText(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return t('unknown')
  return String(Math.round(value * 10000) / 100) + '%'
}

/** Duration text; unknown stays unknown. */
export function durationText(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return t('unknown')
  if (value < 1000) return String(Math.round(value)) + ' ms'
  return String(Math.round(value / 100) / 10) + ' s'
}

/** One-line error message. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

/** Percentage of a scale, clamped to 0..100 for rendering only. */
export function percentOf(value: number | null | undefined, scale: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || typeof scale !== 'number' || scale <= 0) return null
  return Math.max(0, Math.min(100, (value / scale) * 100))
}

/** Suffix of a "process…" dictionary key (the process graph vocabulary). */
export type ProcessTextSuffix =
  | 'summary' | 'goalSummary' | 'handoffBody' | 'customSummary' | 'fixedPrefix' | 'earlier' | 'recent'
  | 'barFixed' | 'barCompressible' | 'barRetained' | 'barHeadroom' | 'reserve'
  | 'configBudget' | 'currentUsage' | 'effective' | 'retained' | 'triggerHandle' | 'retainHandle'
  | 'unknownBudget' | 'window'
  | 'capacityTitle' | 'capacityIntro' | 'sessionHelp' | 'auto' | 'triggerHelp' | 'autoOff'
  | 'before' | 'after' | 'savings' | 'message' | 'summaryBudget' | 'retain' | 'byRatio' | 'fixed' | 'resultHelp'
  | 'retainHelp' | 'headroomHelp' | 'headroom' | 'override' | 'tokens'
  | 'promptTitle' | 'promptRequired' | 'promptIntro' | 'promptVariables' | 'promptPlaceholder'
  | 'promptCounter' | 'promptUnknown' | 'promptPrivacy'
  | 'strategyTitle' | 'cache' | 'cacheHelp' | 'generationTitle' | 'generationIntro'
  | 'summaryCap' | 'followHeadroom'
  | 'advancedRules' | 'advancedDefault'

/** Read one "process…" dictionary entry. */
export const processText = (key: ProcessTextSuffix): string => t(('process' + key) as MessageKey)

// ── mode metadata ─────────────────────────────────────────────────────

/** Dictionary keys describing one selectable compaction mode. */
export interface ModeMeta {
  readonly labelKey: MessageKey
  readonly effectKey: MessageKey
  readonly captionKey: MessageKey
  readonly tagKey: MessageKey
}

export const MODE_META: Readonly<Record<CompactionMode, ModeMeta>> = Object.freeze({
  native: Object.freeze({ labelKey: 'modeNative', effectKey: 'modeNativeEffect', captionKey: 'modeNativeCaption', tagKey: 'modeNativeTag' }),
  goal: Object.freeze({ labelKey: 'modeGoal', effectKey: 'modeGoalEffect', captionKey: 'modeGoalCaption', tagKey: 'modeGoalTag' }),
  handoff: Object.freeze({ labelKey: 'modeHandoff', effectKey: 'modeHandoffEffect', captionKey: 'modeHandoffCaption', tagKey: 'modeHandoffTag' }),
  custom: Object.freeze({ labelKey: 'modeCustom', effectKey: 'modeCustomEffect', captionKey: 'modeCustomCaption', tagKey: 'modeCustomTag' }),
})

/**
 * Look up one mode's metadata for a value that arrived from the Host (a saved
 * config or an inspect record). Unknown modes stay unknown instead of throwing.
 */
export function modeMeta(key: string | null | undefined): ModeMeta | undefined {
  if (key === null || key === undefined) return undefined
  return (MODE_META as Record<string, ModeMeta | undefined>)[key]
}

// ── draft budget arithmetic ───────────────────────────────────────────

/** Budget arithmetic derived from the draft plus the inspected capacity. */
export interface ProjectedBudget {
  readonly window: number
  readonly reserved: number
  readonly message: number
  readonly headroom: number
  readonly pressure: number
  readonly ratio: number
  readonly threshold: number
  readonly retain: number
  readonly summary: number
  readonly policy: PolicyDraft | undefined
  readonly error: string | null
}

/** Configuration arithmetic only. Counts and safe cuts remain server-owned. */
export function projectDraftBudget(draft: PolicyDraftSource, budget: InspectBudget | null | undefined): ProjectedBudget | null {
  const target = budget?.target
  if (!target) return null
  const contextWindow = budget?.contextWindow
  const reservedCompletionTokens = budget?.reservedCompletionTokens
  if (typeof contextWindow !== 'number' || !Number.isFinite(contextWindow)) return null
  if (typeof reservedCompletionTokens !== 'number' || !Number.isFinite(reservedCompletionTokens)) return null
  const policy = draft.policies.find((entry) => entry.provider === target.provider && entry.model === target.model)
  const chosen = (key: 'headroomTokens' | 'thresholdRatio'): number => policy && policy[key] !== '' ? Number(policy[key]) : Number(draft[key])
  const window = contextWindow
  const reserved = reservedCompletionTokens
  const message = window - reserved
  const headroom = chosen('headroomTokens')
  const ratio = chosen('thresholdRatio')
  const pressure = message - headroom
  const threshold = Math.floor(Math.min(window * ratio, pressure))
  const retainMode = policy && policy.retainMode !== 'inherit' ? policy.retainMode : draft.retainMode
  const retainSource = policy && policy.retainMode !== 'inherit' ? policy : draft
  const retainRatioText = retainSource.retainRatio === '' ? DEFAULT_RETAIN_RATIO : Number(retainSource.retainRatio)
  const retain = retainMode === 'tokens' ? Number(retainSource.retainTokens) : Math.floor(message * retainRatioText)
  const summary = policy?.maxTokens !== undefined && policy.maxTokens !== '' ? Number(policy.maxTokens)
    : draft.maxTokens !== '' ? Number(draft.maxTokens) : headroom
  if (![window, reserved, message, headroom, ratio, threshold, retain, summary].every(Number.isFinite)) return null
  let error: string | null = null
  if (message <= 0) error = t('budgetNoMessageRoom')
  else if (pressure <= 0) error = t('budgetHeadroomTooLarge', { message: tokensText(message) })
  else if (retain >= threshold) error = t('budgetRetainTooLarge', { retain: tokensText(retain), threshold: tokensText(threshold) })
  return { window, reserved, message, headroom, pressure, ratio, threshold, retain, summary, policy, error }
}

/** The draft fields the budget arithmetic reads. */
export interface PolicyDraftSource {
  readonly policies: readonly PolicyDraft[]
  readonly retainMode: string
  readonly retainRatio: string
  readonly retainTokens: string
  readonly headroomTokens: string
  readonly thresholdRatio: string
  readonly maxTokens: string
}

// ── generic UI primitives ─────────────────────────────────────────────

/** The aria wiring a labelled control receives from Field. */
export interface FieldAria {
  'aria-labelledby': string
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

export interface FieldProps {
  name: string
  label: React.ReactNode
  hint?: React.ReactNode
  help?: React.ReactNode
  error?: React.ReactNode
  children: (id: string, aria: FieldAria) => React.ReactNode
}

/** A labelled field; children is a render function receiving the input id. */
export function Field(props: FieldProps): React.ReactElement {
  const id = 'dsh-bc-' + props.name + '-' + React.useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const described = props.error ? id + '-error' : props.hint !== undefined || props.help !== undefined ? id + '-help' : undefined
  return (
    <div className="dsh-bc-field">
      <label id={id + '-label'} htmlFor={id} className="dsh-bc-label">{props.label}</label>
      {props.children(id, { 'aria-labelledby': id + '-label', 'aria-invalid': props.error ? true : undefined, 'aria-describedby': described })}
      {props.hint !== undefined
        ? <p id={id + '-help'} className="dsh-bc-hint">{props.hint}</p>
        : props.help !== undefined ? <p id={id + '-help'} className="dsh-bc-help dsh-bc-sr-only">{props.help}</p> : null}
      {props.error ? <p id={id + '-error'} className="dsh-bc-error" role="alert" data-bc-error={props.name}>{props.error}</p> : null}
    </div>
  )
}

/** Props of one option child of Select. */
export interface SelectOptionElementProps {
  value: string
  children?: React.ReactNode
}

export interface SelectProps {
  id?: string
  name?: string
  value: string
  disabled?: boolean
  title?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: true | undefined
  children?: React.ReactNode
  onChange: (event: { target: { value: string } }) => void
}

/** The trigger keeps focus while the listbox previews an uncommitted option. */
export function Select(props: SelectProps): React.ReactElement {
  const fallbackId = 'dsh-bc-select-' + React.useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = props.id ?? fallbackId
  const options = React.Children.toArray(props.children).map((option) => (option as React.ReactElement<SelectOptionElementProps>).props)
  const selected = options.findIndex((option) => option.value === props.value)
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(selected < 0 ? 0 : selected)
  const [placement, setPlacement] = React.useState({ above: false, height: 240 })
  const root = React.useRef<HTMLDivElement | null>(null)
  const trigger = React.useRef<HTMLButtonElement | null>(null)
  const search = React.useRef({ text: '', at: 0 })
  const expanded = open && !props.disabled
  React.useEffect(() => {
    if (!expanded || typeof document === 'undefined') return
    const dismiss = (event: Event): void => { if (!root.current?.contains(event.target as Node | null)) setOpen(false) }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('focusin', dismiss)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('focusin', dismiss)
    }
  }, [expanded])
  React.useEffect(() => {
    if (expanded) root.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [expanded, active])
  const show = (index: number = selected < 0 ? 0 : selected): void => {
    if (props.disabled) return
    const rect = trigger.current?.getBoundingClientRect()
    if (rect && typeof window.innerHeight === 'number') {
      const below = window.innerHeight - rect.bottom - 8
      const above = rect.top - 8
      const preferred = Math.min(240, options.length * 32 + 8)
      const placeAbove = below < preferred && above > below
      setPlacement({ above: placeAbove, height: Math.min(240, Math.max(32, placeAbove ? above : below)) })
    }
    setActive(index); setOpen(true)
  }
  const choose = (index: number): void => {
    const option = options[index]
    if (props.disabled || !option) return
    props.onChange({ target: { value: option.value } })
    setOpen(false)
    trigger.current?.focus()
  }
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (props.disabled || event.defaultPrevented) return
    if (event.key === 'Tab') { setOpen(false); return }
    if (event.key === 'Escape' && expanded) {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      show(expanded ? (active + step + options.length) % options.length : selected < 0 ? 0 : selected)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      show(event.key === 'Home' ? 0 : options.length - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (expanded) choose(active)
      else show()
    } else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const now = Date.now()
      const previous = now - search.current.at < 600 ? search.current.text : ''
      const query = previous === event.key.toLocaleLowerCase() ? previous : previous + event.key.toLocaleLowerCase()
      search.current = { text: query, at: now }
      for (let step = 1; step <= options.length; step++) {
        const index = ((expanded ? active : selected) + step + options.length) % options.length
        const option = options[index]
        if (option && String(option.children).toLocaleLowerCase().startsWith(query)) {
          event.preventDefault()
          show(index)
          break
        }
      }
    }
  }
  return (
    <div className="dsh-bc-select" ref={root}>
      <button id={id} ref={trigger} name={props.name} value={props.value} type="button" role="combobox"
        className="dsh-bc-input dsh-bc-select-trigger" disabled={props.disabled} title={props.title}
        aria-label={props['aria-label']} aria-labelledby={props['aria-labelledby']}
        aria-describedby={props['aria-describedby']} aria-invalid={props['aria-invalid']}
        aria-haspopup="listbox" aria-expanded={expanded} aria-controls={expanded ? id + '-list' : undefined}
        aria-activedescendant={expanded ? id + '-option-' + active : undefined}
        onClick={() => expanded ? setOpen(false) : show()} onKeyDown={onKeyDown}>
        <span className="dsh-bc-select-value">{options[selected]?.children ?? t('selectOption')}</span>
        <span className="dsh-bc-chevron" aria-hidden={true} />
      </button>
      {expanded ? (
        <div id={id + '-list'} role="listbox" className="dsh-bc-select-menu"
          data-side={placement.above ? 'above' : 'below'} style={{ maxHeight: placement.height }}
          aria-labelledby={props['aria-labelledby'] ?? id}>
          {options.map((option, index) => (
            <div key={option.value} id={id + '-option-' + index} role="option"
              className="dsh-bc-select-option" aria-selected={index === selected} data-active={index === active}
              data-value={option.value} onPointerMove={() => setActive(index)}
              onPointerDown={(event) => event.preventDefault()} onClick={() => choose(index)}>
              <span>{option.children}</span>
              <span className="dsh-bc-option-check" aria-hidden={true}>{index === selected ? '\u2713' : ''}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export interface NumberFieldProps {
  name: string
  label: React.ReactNode
  value: string
  ratio?: boolean
  min?: number
  unit?: React.ReactNode
  disabled?: boolean
  placeholder?: string
  hint?: React.ReactNode
  help?: React.ReactNode
  error?: React.ReactNode
  onChange: (value: string) => void
}

export function NumberField(props: NumberFieldProps): React.ReactElement {
  const ratio = props.ratio === true
  const display = ratio && props.value !== '' ? String(Number((Number(props.value) * 100).toFixed(8))) : props.value
  return (
    <Field name={props.name} label={props.label} hint={props.hint} help={props.help} error={props.error}>
      {(id, aria) => (
        <div className="dsh-bc-number">
          <input {...aria} id={id} name={props.name} className="dsh-bc-input" type="number"
            inputMode={ratio ? 'decimal' : 'numeric'} min={props.min ?? 0} max={ratio ? 100 : undefined}
            step={ratio ? 'any' : 1} value={display} disabled={props.disabled} placeholder={props.placeholder}
            onChange={(event) => props.onChange(event.target.value === '' ? '' : ratio ? String(Number(event.target.value) / 100) : event.target.value)} />
          <span className="dsh-bc-unit" aria-hidden={true}>{ratio ? '%' : props.unit ?? 'tokens'}</span>
        </div>
      )}
    </Field>
  )
}

/** The Escape-to-collapse key handler shared by every details surface. */
export type DetailsKeyEvent = React.KeyboardEvent<HTMLDetailsElement>

export function collapseDetails(event: DetailsKeyEvent): void {
  if (event.key !== 'Escape' || event.defaultPrevented || !event.currentTarget.open) return
  event.preventDefault()
  event.stopPropagation()
  event.currentTarget.open = false
  event.currentTarget.querySelector('summary')?.focus()
}

export interface ExplainProps {
  name?: string
  title: React.ReactNode
  open?: boolean
  children?: React.ReactNode
}

export function Explain(props: ExplainProps): React.ReactElement {
  return (
    <details className="dsh-bc-explanation" open={props.open} onKeyDown={collapseDetails} data-bc={props.name}>
      <summary>{props.title}</summary>
      <div className="dsh-bc-explanation-body">{props.children}</div>
    </details>
  )
}

export interface MetricProps {
  label: React.ReactNode
  value: React.ReactNode
  name?: string
}

export function Metric(props: MetricProps): React.ReactElement {
  return (
    <div className="dsh-bc-metric">
      <span className="dsh-bc-caption">{props.label}</span>
      <span className="dsh-bc-metric-value dsh-bc-mono" data-bc={props.name}>{props.value}</span>
    </div>
  )
}

export interface SectionProps {
  name?: string
  dataBc?: string
  title: React.ReactNode
  aside?: React.ReactNode
  children?: React.ReactNode
}

/** A section surface with a heading. */
export function Section(props: SectionProps): React.ReactElement {
  return (
    <section className="dsh-bc-section" data-bc-section={props.name} data-bc={props.dataBc}>
      <div className="dsh-bc-section-head">
        <h3 className="dsh-bc-h3">{props.title}</h3>
        {props.aside === undefined || props.aside === null ? null : props.aside}
      </div>
      {props.children}
    </section>
  )
}

export interface RowProps {
  label: React.ReactNode
  help?: React.ReactNode
  value: React.ReactNode
  mono?: boolean
}

/** A definition row with a tabular value. */
export function Row(props: RowProps): React.ReactElement {
  return (
    <div className="dsh-bc-row">
      <div className="dsh-bc-row-label">
        <span>{props.label}</span>
        {props.help ? <p className="dsh-bc-help">{props.help}</p> : null}
      </div>
      <span className={props.mono === true ? 'dsh-bc-row-value dsh-bc-mono' : 'dsh-bc-row-value'}>{props.value}</span>
    </div>
  )
}

export interface ModeCardProps {
  mode: CompactionMode
  selected: boolean
  disabled?: boolean
  onSelect: (mode: CompactionMode) => void
  onMove: (delta: number) => void
  onMoveTo: (index: number) => void
  cardRef?: (node: HTMLDivElement | null) => void
}

/** One mode card with radio semantics. */
export function ModeCard(props: ModeCardProps): React.ReactElement {
  const meta = MODE_META[props.mode]
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (props.disabled) return
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      props.onSelect(props.mode)
      return
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      props.onMove(1)
      return
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      props.onMove(-1)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      props.onMoveTo(0)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      props.onMoveTo(MODES.length - 1)
    }
  }
  return (
    <div ref={props.cardRef} className="dsh-bc-mode" role="radio" aria-checked={props.selected}
      aria-label={t(meta.labelKey) + ' \u00b7 ' + t(meta.effectKey) + ' \u00b7 ' + t(meta.tagKey)}
      aria-disabled={props.disabled ? true : undefined}
      tabIndex={props.selected && !props.disabled ? 0 : -1}
      data-mode={props.mode} data-bc="mode-card" data-selected={props.selected ? 'true' : 'false'}
      onClick={() => { if (!props.disabled) props.onSelect(props.mode) }}
      onKeyDown={onKeyDown}>
      <div className="dsh-bc-mode-head">
        <span className="dsh-bc-radio-dot" aria-hidden="true" />
        <span className="dsh-bc-mode-title">{t(meta.labelKey)}</span>
        <span className="dsh-bc-mode-tag">{t(meta.tagKey)}</span>
      </div>
      <p className="dsh-bc-mode-description">{t(meta.effectKey)}</p>
    </div>
  )
}

export interface ModeCardsProps {
  value: string
  disabled?: boolean
  onChange: (mode: CompactionMode) => void
}

/** Four selectable mode cards with an accessible radiogroup. */
export function ModeCards(props: ModeCardsProps): React.ReactElement {
  const cardRefs = React.useRef<Partial<Record<CompactionMode, HTMLDivElement | null>>>({})
  const focusCard = (mode: CompactionMode): void => {
    const node = cardRefs.current[mode]
    if (node !== null && node !== undefined && typeof node.focus === 'function') {
      try { node.focus() } catch { /* A detached renderer has no focusable node. */ }
    }
  }
  const choose = (mode: CompactionMode): void => {
    if (props.disabled) return
    props.onChange(mode)
    focusCard(mode)
  }
  const move = (delta: number): void => {
    if (props.disabled) return
    const index = MODES.indexOf(props.value as CompactionMode)
    choose(MODES[(index + delta + MODES.length) % MODES.length] as CompactionMode)
  }
  return (
    <div className="dsh-bc-strategy">
      <div className="dsh-bc-modes dsh-bc-modes-4" role="radiogroup" aria-label={t('modeGroup')} data-bc="mode-cards">
        {MODES.map((mode) => (
          <ModeCard key={mode} mode={mode} selected={props.value === mode} disabled={props.disabled}
            onSelect={choose} onMove={move} onMoveTo={(index) => choose(MODES[index] as CompactionMode)}
            cardRef={(node) => { cardRefs.current[mode] = node }} />
        ))}
      </div>
    </div>
  )
}

export interface ToggleProps {
  name: string
  label: React.ReactNode
  /** Native tooltip used instead of a visible secondary label. */
  title?: string
  help?: React.ReactNode
  checked?: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

/** A setting row with a label on the left and a switch control on the right. */
export function Toggle(props: ToggleProps): React.ReactElement {
  const rawId = React.useId()
  const id = 'dsh-bc-toggle-' + props.name + '-' + rawId.replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <div className="dsh-bc-setting-row" data-bc-setting={props.name}>
      <div className="dsh-bc-setting-main">
        <label className="dsh-bc-setting-label" htmlFor={id}>{props.label}</label>
        {props.help === undefined || props.help === null ? null : <span className="dsh-bc-setting-desc">{props.help}</span>}
      </div>
      <div className="dsh-bc-setting-control">
        <input id={id} name={props.name} className="dsh-bc-switch" type="checkbox" title={props.title}
          checked={props.checked === true} disabled={props.disabled === true}
          onChange={(event) => props.onChange(event.target.checked)} role="switch"
          aria-checked={props.checked === true} />
      </div>
    </div>
  )
}

/** A classified inspect reason pointing at the controls that resolve it. */
export interface ClassifiedReason {
  readonly label: string
  readonly hint: string | null
}

/** Classify an inspect budget/diagnostic reason and point at the controls. */
export function classifyReason(text: string | null | undefined): ClassifiedReason | null {
  if (typeof text !== 'string' || text.length === 0) return null
  if (/leaving no message budget/i.test(text)) {
    return { label: t('reasonNoCapacity'), hint: t('reasonNoCapacityHint') }
  }
  if (/leaving no pressure budget/i.test(text)) {
    return { label: t('reasonReserveFull'), hint: t('reasonReserveFullHint') }
  }
  if (/must be less than threshold tokens/i.test(text)) {
    return { label: t('reasonRetainConflict'), hint: t('reasonRetainConflictHint') }
  }
  if (/no safe compactable range/i.test(text)) {
    return {
      label: /system prompt|retained tail|tool-call/i.test(text) ? t('reasonNoSafeRangeWithPrefix') : t('reasonNoSafeRange'),
      hint: t('reasonNoSafeRangeHint'),
    }
  }
  if (/no routed request/i.test(text)) {
    return { label: t('reasonNoRoute'), hint: t('reasonNoRouteHint') }
  }
  if (/no context capacity/i.test(text) || /model metadata is unavailable/i.test(text)) {
    return { label: t('reasonCapacityUnknown'), hint: t('reasonCapacityUnknownHint') }
  }
  if (/below the automatic trigger/i.test(text)) {
    return { label: t('reasonBelowTrigger'), hint: null }
  }
  if (/automatic compaction is disabled/i.test(text)) {
    return { label: t('reasonAutoOff'), hint: t('reasonAutoOffHint') }
  }
  return null
}

export interface ReasonListProps {
  reasons?: readonly string[] | null
}

/** Render deduplicated reasons with actionable hints. */
export function ReasonList(props: ReasonListProps): React.ReactElement | null {
  const seen = new Set<string>()
  const items: { raw: string; classified: ClassifiedReason | null }[] = []
  for (const raw of props.reasons ?? []) {
    if (typeof raw !== 'string' || raw.length === 0 || seen.has(raw)) continue
    seen.add(raw)
    items.push({ raw, classified: classifyReason(raw) })
  }
  if (items.length === 0) return null
  return (
    <ul className="dsh-bc-reasons" data-bc="reasons">
      {items.map((item) => (
        <li key={item.raw} className="dsh-bc-reason">
          <span>{item.classified?.label ?? item.raw}</span>
          {item.classified !== null && item.classified.hint !== null && item.classified.hint !== undefined
            ? <p className="dsh-bc-hint">{item.classified.hint}</p>
            : null}
        </li>
      ))}
    </ul>
  )
}

/** One proportional bar segment. */
export interface BarSegment {
  readonly key: string
  readonly tokens: number
  readonly tone?: string
  readonly label: string
}

export interface TokenBarProps {
  scale: number
  segments?: readonly BarSegment[]
  triggerTokens?: number | null
  currentTokens?: number | null
  ariaLabel: string
  name: string
}

/** One proportional bar with a trigger marker and an optional reserve zone. */
export function TokenBar(props: TokenBarProps): React.ReactElement | null {
  if (!(props.scale > 0)) return null
  const markers: readonly (readonly [string, number | null | undefined])[] = [['trigger', props.triggerTokens], ['current', props.currentTokens]]
  return (
    <div className="dsh-bc-bar" role="img" aria-label={props.ariaLabel} data-bc={props.name}>
      <div className="dsh-bc-bar-track">
        {(props.segments ?? []).filter((segment) => segment.tokens > 0).map((segment) => (
          <div key={segment.key} className={'dsh-bc-bar-seg dsh-bc-seg-' + (segment.tone ?? 'free')}
            title={segment.label + ' \u00b7 ' + tokensText(segment.tokens)}
            style={{ width: String(percentOf(segment.tokens, props.scale)) + '%' }} />
        ))}
      </div>
      {markers.map(([name, value]) => typeof value === 'number' && Number.isFinite(value) ? (
        <div key={name} className={name === 'trigger' ? 'dsh-bc-trigger' : 'dsh-bc-current-line'}
          style={{ left: String(percentOf(value, props.scale)) + '%' }} aria-hidden={true} />
      ) : null)}
    </div>
  )
}

/** One legend entry. */
export interface LegendItem {
  readonly key: string
  readonly label: string
  readonly tokens?: number | null
  readonly tone?: string
}

export interface TokenLegendProps {
  name: string
  items?: readonly LegendItem[]
}

/** Legend for one bar. */
export function TokenLegend(props: TokenLegendProps): React.ReactElement {
  return (
    <ul className="dsh-bc-legend" data-bc={props.name}>
      {(props.items ?? []).map((item) => (
        <li key={item.key}>
          <span className={'dsh-bc-swatch dsh-bc-swatch-' + (item.tone ?? 'free')} aria-hidden={true} />
          <span>{typeof item.tokens === 'number' ? item.label + ': ' + tokensText(item.tokens) : item.label + ': ' + t('unknown')}</span>
        </li>
      ))}
    </ul>
  )
}

export interface RatioControlProps {
  name: string
  sliderName?: string
  label: string
  value: string
  disabled?: boolean
  error?: string
  onChange: (value: string) => void
}

export function RatioControl(props: RatioControlProps): React.ReactElement {
  const rawId = React.useId()
  const id = 'dsh-bc-ratio-' + rawId.replace(/[^a-zA-Z0-9_-]/g, '')
  const value = props.value === '' ? '' : String(Number((Number(props.value) * 100).toFixed(8)))
  const ratio = Math.max(0.01, Math.min(0.99, Number(props.value) || 0.01))
  return (
    <div className="dsh-bc-field dsh-bc-threshold">
      <div className="dsh-bc-thresholdHead">
        <label className="dsh-bc-label" htmlFor={id}>{props.label}</label>
        <div className="dsh-bc-number dsh-bc-number-inline">
          <input id={id} name={props.name} className="dsh-bc-input" type="number" inputMode="decimal"
            min={0} max={100} step="any" value={value} disabled={props.disabled}
            aria-label={props.label} aria-invalid={props.error ? true : undefined}
            aria-describedby={props.error ? id + '-error' : undefined}
            onChange={(event) => props.onChange(event.target.value === '' ? '' : String(Number(event.target.value) / 100))} />
          <span className="dsh-bc-unit" aria-hidden={true}>%</span>
        </div>
      </div>
      <div className="dsh-bc-range-wrap">
        <span className="dsh-bc-range-fill" aria-hidden={true} style={{ width: String(percentOf(ratio - 0.01, 0.98)) + '%' }} />
        <input name={props.sliderName} type="range" className="dsh-bc-range" min={0.01} max={0.99} step={0.01}
          aria-label={props.label} aria-valuetext={value === '' ? t('unset') : value + '%'} value={ratio}
          disabled={props.disabled} onChange={(event) => props.onChange(event.target.value)} />
      </div>
      <div className="dsh-bc-scale" aria-hidden={true}>
        <span>1%</span><span>50%</span><span>99%</span>
      </div>
      {props.error ? <p id={id + '-error'} className="dsh-bc-error" role="alert">{props.error}</p> : null}
    </div>
  )
}

export type { InspectPreview }
