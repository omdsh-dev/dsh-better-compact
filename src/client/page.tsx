/**
 * dsh-better-compact — the settings page.
 *
 * The Host owns the configuration form (form.state + form.mutate CAS) and this
 * module renders the visual editor around it. Saving goes exclusively through
 * form.mutate(ops, revision): there is no plugin-owned write HTTP route.
 *
 * Behaviour is byte-for-byte the pre-TypeScript src/client.js; only types are new.
 */
import React from 'react'
import {
  INSPECT_PATH,
  MODELS_PATH,
  type ConfigSnapshot,
  type InspectBudget,
  type InspectEngine,
  type InspectHandoffContinuation,
  type InspectLastCompaction,
  type InspectPayload,
  type InspectPreview,
  type ModelRoute,
  type ModelRoutesPayload,
} from '../shared/contract.ts'
import {
  buildOps,
  draftFromValue,
  equalDraft,
  routeCandidateWarning,
  routeForDraft,
  validateDraft,
  validateModelSelection,
  type ConfigDraft,
  type DraftError,
  type PathOp,
} from './draft.ts'
import { t } from './locales/index.ts'
import { STYLE } from './styles.ts'
import { sessionEntries, useReadOnlyJson, useSessionList } from './inspect-store.ts'
import { errorMessage, projectDraftBudget, type ProjectedBudget } from './controls.tsx'
import {
  AdvancedSection,
  ActiveConfigBanner,
  ProcessEditor,
  SaveFooter,
  SessionPicker,
  StatusSection,
  type SaveState,
} from './sections.tsx'

/** The Host configuration-form state this page reads. */
export interface ConfigFormStateLike {
  readonly status?: string
  readonly writable?: boolean
  readonly revision?: number | null
  readonly value?: unknown
}

/** The Host configuration form this page renders around. */
export interface ConfigFormLike {
  readonly state?: ConfigFormStateLike | null
  mutate?(ops: readonly PathOp[], revision: number | null): Promise<boolean | void> | boolean | void
}

/** Props every assembly passes to the registered row component. */
export interface BetterCompactConfigEntryProps {
  view?: string
  form?: ConfigFormLike | null
  sessions?: unknown
}

/** Props of the page itself. */
export interface BetterCompactPageProps {
  form?: ConfigFormLike | null
  sessions?: unknown
}

/** Compare the draft with the saved value field by field (page-level change count). */
function countChangedFields(draft: ConfigDraft | null, current: ConfigDraft): number {
  if (draft === null) return 0
  const left = draft as unknown as Record<string, unknown>
  const right = current as unknown as Record<string, unknown>
  return Object.keys(left).filter((key) => JSON.stringify(left[key]) !== JSON.stringify(right[key])).length
}

export function BetterCompactPage(props: BetterCompactPageProps): React.ReactElement {
  const form = props.form
  const state = form !== undefined && form !== null ? form.state : undefined
  const formStatus = state !== undefined && state !== null && typeof state.status === 'string' ? state.status : 'missing'
  const writable = state !== undefined && state !== null && state.writable === true
  const sessionList = useSessionList(props.sessions ?? null)
  const entries = React.useMemo(() => sessionEntries(sessionList), [sessionList])
  const [pickedId, setPickedId] = React.useState<string | null>(null)
  const availableIds = React.useMemo(() => new Set(entries.map((entry) => entry.id)), [entries])
  const selectedId =
    pickedId === null ? (entries.length > 0 ? entries[0]?.id ?? '' : '') : availableIds.has(pickedId) ? pickedId : ''
  const [refreshToken, setRefreshToken] = React.useState(0)
  const [draft, setDraft] = React.useState<ConfigDraft | null>(() => (formStatus === 'ready' ? draftFromValue(state?.value) : null))
  const [draftRevision, setDraftRevision] = React.useState<number | null>(() => (formStatus === 'ready' ? state?.revision ?? null : null))
  const baseValueRef = React.useRef<unknown>(formStatus === 'ready' ? state?.value ?? {} : null)
  const [conflict, setConflict] = React.useState(false)
  const [saveState, setSaveState] = React.useState<SaveState>({ kind: 'idle' })
  const [saving, setSaving] = React.useState(false)

  const pluginInspect = useReadOnlyJson<Partial<InspectPayload>>(INSPECT_PATH, refreshToken)
  const sessionPath = selectedId === '' ? null : INSPECT_PATH + '?sessionId=' + encodeURIComponent(selectedId)
  const sessionInspect = useReadOnlyJson<Partial<InspectPayload>>(sessionPath, refreshToken)
  const modelsInspect = useReadOnlyJson<Partial<ModelRoutesPayload>>(MODELS_PATH, refreshToken)

  // Keep one draft store. Adopt Host changes only while the user has no
  // staged edits; otherwise expose an explicit revision conflict instead of
  // overwriting either side.
  React.useEffect(() => {
    if (formStatus !== 'ready' || state === undefined || state === null) return
    const value = state.value ?? {}
    const revision = state.revision ?? null
    if (draft === null) {
      baseValueRef.current = value
      setDraft(draftFromValue(value))
      setDraftRevision(revision)
      return
    }
    if (revision === draftRevision) return
    const incoming = draftFromValue(value)
    const untouched = equalDraft(draft, draftFromValue(baseValueRef.current ?? {}))
    if (equalDraft(draft, incoming) || untouched) {
      baseValueRef.current = value
      setDraft(incoming)
      setDraftRevision(revision)
      setConflict(false)
      return
    }
    setConflict(true)
  }, [formStatus, state, draft, draftRevision])

  const activePayload = pluginInspect.payload
  const dataPayload = selectedId === '' ? pluginInspect.payload : sessionInspect.payload
  const activeConfig: ConfigSnapshot | null = activePayload !== null && activePayload !== undefined ? activePayload.activeConfig ?? null : null
  const requiresReload =
    activePayload !== null && activePayload !== undefined && typeof activePayload.requiresReload === 'boolean'
      ? activePayload.requiresReload
      : null
  const inspectError =
    selectedId === ''
      ? pluginInspect.status === 'error'
        ? pluginInspect.error
        : null
      : sessionInspect.status === 'error'
        ? sessionInspect.error
        : pluginInspect.status === 'error'
          ? pluginInspect.error
          : null
  const inspectLoading =
    selectedId === ''
      ? pluginInspect.status === 'loading' || pluginInspect.status === 'refreshing'
      : sessionInspect.status === 'loading' || sessionInspect.status === 'refreshing'
  const engine: InspectEngine | null = dataPayload !== null && dataPayload !== undefined ? dataPayload.engine ?? null : null
  const engineApplies = engine !== null && engine.inspectApplies === false ? false : null
  const budget: InspectBudget | null = engineApplies === false ? null : dataPayload !== null && dataPayload !== undefined ? dataPayload.budget ?? null : null
  const preview: InspectPreview | null = engineApplies === false ? null : dataPayload !== null && dataPayload !== undefined ? dataPayload.preview ?? null : null
  const lastCompaction: InspectLastCompaction | null = dataPayload !== null && dataPayload !== undefined ? dataPayload.lastCompaction ?? null : null
  const handoffContinuation: InspectHandoffContinuation | null =
    dataPayload !== null && dataPayload !== undefined ? dataPayload.handoffContinuation ?? null : null
  const diagnostics: readonly string[] =
    dataPayload !== null && dataPayload !== undefined && Array.isArray(dataPayload.diagnostics) ? dataPayload.diagnostics : []

  const modelsReady = modelsInspect.status === 'ready' && modelsInspect.payload !== null && modelsInspect.payload !== undefined
  const modelsPayload = modelsInspect.payload
  const rawRoutes: readonly ModelRoute[] =
    modelsReady && modelsPayload !== null && modelsPayload !== undefined && Array.isArray(modelsPayload.routes) ? modelsPayload.routes : []
  // Validate the read-only metadata once at this boundary; a malformed or
  // older route never crashes the page or becomes a fabricated effort.
  const routes: readonly ModelRoute[] = rawRoutes
    .filter(
      (entry) =>
        entry !== null &&
        typeof entry === 'object' &&
        typeof entry.provider === 'string' &&
        entry.provider.length > 0 &&
        typeof entry.model === 'string' &&
        entry.model.length > 0,
    )
    .map((entry) => ({
      provider: entry.provider,
      model: entry.model,
      efforts: Array.isArray(entry.efforts) ? entry.efforts.filter((effort) => typeof effort === 'string' && effort.length > 0) : [],
      defaultEffort: typeof entry.defaultEffort === 'string' ? entry.defaultEffort : '',
    }))
  const modelsEnabled = modelsReady && modelsPayload !== null && modelsPayload !== undefined && modelsPayload.enabled === true
  const modelsError = modelsInspect.status === 'error' ? modelsInspect.error : null
  const budgetTarget = budget?.target ?? null
  const currentValue: unknown = formStatus === 'ready' && state !== undefined && state !== null ? state.value ?? {} : {}
  const currentDraft = draftFromValue(currentValue)
  const dirty = draft !== null && !equalDraft(draft, currentDraft)
  const draftErrors: readonly DraftError[] = draft === null ? [] : validateDraft(draft)
  const projection: ProjectedBudget | null =
    draft !== null && draftErrors.length === 0 && engineApplies !== false && inspectError === null && !inspectLoading
      ? projectDraftBudget(draft, budget)
      : null
  const baseErrors: DraftError[] = [...draftErrors]
  if (projection !== null && projection.error !== null && draft !== null) {
    const index = projection.policy ? draft.policies.indexOf(projection.policy) : -1
    baseErrors.push({
      field: (index < 0 ? '' : 'policies.' + index + '.') + (projection.pressure <= 0 ? 'headroomTokens' : projection.policy?.retainMode === 'tokens' || (!projection.policy || projection.policy.retainMode === 'inherit') && draft.retainMode === 'tokens' ? 'retainTokens' : 'retainRatio'),
      message: projection.error,
    })
  }
  const modelErrors: readonly DraftError[] = draft === null ? [] : validateModelSelection(draft, routes, modelsReady && modelsEnabled === true, budgetTarget)
  const errors: string[] = [...baseErrors.map((entry) => entry.message), ...modelErrors.map((entry) => entry.message)]
  const fieldError = (field: string): string | undefined => {
    const found = [...baseErrors, ...modelErrors].find((entry) => entry.field === field)
    return found === undefined ? undefined : found.message
  }
  const draftRoute = draft === null
    ? undefined
    : routeForDraft(draft, routes) ?? (draft.provider === '' && budgetTarget ? routes.find((entry) => entry.provider === budgetTarget.provider && entry.model === budgetTarget.model) : undefined)
  const routeWarning = draft === null ? null : routeCandidateWarning(draft, routes, modelsReady && modelsEnabled === true)
  const savingNow = saving || saveState.kind === 'saving'

  const updateDraft = (patch: Partial<ConfigDraft>): void => {
    setDraft((previous) => (previous === null ? previous : { ...previous, ...patch }))
    setSaveState({ kind: 'idle' })
  }

  const reloadHost = (): void => {
    if (formStatus !== 'ready' || state === undefined || state === null) return
    baseValueRef.current = state.value ?? {}
    setDraft(draftFromValue(state.value ?? {}))
    setDraftRevision(state.revision ?? null)
    setConflict(false)
    setSaveState({ kind: 'idle' })
  }

  const save = async (): Promise<void> => {
    if (draft === null || state === undefined || state === null || !writable || savingNow) return
    if (conflict || (state.revision ?? null) !== draftRevision) {
      setConflict(true)
      return
    }
    if (equalDraft(draft, draftFromValue(state.value ?? {}))) {
      setSaveState({ kind: 'idle' })
      return
    }
    if (errors.length > 0) {
      setSaveState({ kind: 'invalid', errors })
      return
    }
    const ops = buildOps(draft, state.value ?? {})
    if (ops.length === 0) {
      setSaveState({ kind: 'idle' })
      return
    }
    const mutate = form !== undefined && form !== null ? form.mutate : undefined
    if (form === undefined || form === null || typeof mutate !== 'function') {
      setSaveState({ kind: 'transport', message: 'the Host form does not expose mutate()' })
      return
    }
    setSaving(true)
    setSaveState({ kind: 'saving' })
    try {
      const accepted = await mutate.call(form, ops, draftRevision)
      if (accepted === false) {
        setSaveState({ kind: 'rejected' })
        setRefreshToken((token) => token + 1)
        return
      }
      setSaveState({ kind: 'saved' })
      setRefreshToken((token) => token + 1)
    } catch (error) {
      setSaveState({ kind: 'transport', message: errorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  React.useEffect(() => {
    if (saveState.kind !== 'saved' || typeof setTimeout !== 'function') return
    const timer = setTimeout(() => setSaveState({ kind: 'idle' }), 4000)
    return () => clearTimeout(timer)
  }, [saveState.kind])

  const refresh = (): void => setRefreshToken((token) => token + 1)
  const listError = (sessionList as unknown as { error?: string | null })?.error ?? null
  const sessionControl = (
    <SessionPicker entries={entries} selectedId={selectedId} onSelect={setPickedId}
      phase={sessionList.phase ?? 'ready'} listError={listError} refresh={inspectLoading} onRefresh={refresh} />
  )
  const statusProps = {
    sessionId: selectedId,
    engine,
    engineApplies,
    activeConfig,
    budget,
    preview,
    record: lastCompaction,
    continuation: handoffContinuation,
    diagnostics,
    inspectError,
    inspectLoading,
    reasons: preview?.reason && !diagnostics.includes(preview.reason) ? [preview.reason] : [],
  }

  const pageStyle = <style key="dsh-bc-style">{STYLE}</style>
  const title = (
    <div className="dsh-bc-page-head" key="head">
      <div className="dsh-bc-page-titleBlock">
        <h2 className="dsh-bc-title">{t('title')}</h2>
        <p className="dsh-bc-page-sub">{t('purpose')}</p>
      </div>
      <div className="dsh-bc-page-chips">
        {formStatus === 'ready' && !writable ? <span className="dsh-bc-chip" data-bc="read-only-chip">{t('readOnly')}</span> : null}
      </div>
    </div>
  )

  if (formStatus === 'missing' || formStatus === 'loading') {
    return (
      <div className="dsh-bc-page" data-better-compact="page" data-settings-dirty={dirty} data-settings-busy={savingNow}>
        {pageStyle}
        {title}
        <div className="dsh-bc-section">
          <p className="dsh-bc-note" role="status">{formStatus === 'loading' ? t('loadingConfig') : t('waitingForm')}</p>
        </div>
      </div>
    )
  }

  if (formStatus !== 'ready' || state === null || state === undefined) {
    return (
      <div className="dsh-bc-page" data-better-compact="page" data-settings-dirty={dirty} data-settings-busy={savingNow}>
        {pageStyle}
        {title}
        <div className="dsh-bc-section">
          <p className="dsh-bc-note" data-bc="form-unavailable">{t('formUnavailable')}</p>
          <ActiveConfigBanner activeConfig={activeConfig} requiresReload={requiresReload} dirty={dirty} />
          {sessionControl}
        </div>
        <StatusSection {...statusProps} />
      </div>
    )
  }

  const disabled = !writable || savingNow || formStatus !== 'ready'

  return (
    <div className="dsh-bc-page" data-better-compact="page" data-settings-dirty={dirty} data-settings-busy={savingNow}>
      {pageStyle}
      {title}
      <ActiveConfigBanner activeConfig={activeConfig} requiresReload={requiresReload} dirty={dirty} />
      <ProcessEditor draft={draft ?? draftFromValue({})} disabled={disabled} fieldError={fieldError} onDraft={updateDraft}
        projection={projection} budget={budget} preview={preview} sessionControl={sessionControl} sessionId={selectedId}
        draftInvalid={draftErrors.length > 0} engineApplies={engineApplies} inspectLoading={inspectLoading} inspectError={inspectError}
        routes={routes} modelsStatus={modelsInspect.status} modelsEnabled={modelsEnabled} modelsError={modelsError}
        route={draftRoute} target={budgetTarget} routeWarning={routeWarning}
        onProvider={(value) => updateDraft(value === '' ? { provider: '', model: '' } : { provider: value })}
        onModel={(value) => updateDraft(value === '' ? { provider: '', model: '' } : { model: value })} />
      <AdvancedSection draft={draft ?? draftFromValue({})} disabled={disabled} fieldError={fieldError} onDraft={updateDraft} />
      <StatusSection {...statusProps} />
      {saveState.kind === 'saved' ? <p className="dsh-bc-save-feedback" role="status" data-bc="save-saved">{t('saved')}</p> : null}
      <SaveFooter draft={draft} changeCount={countChangedFields(draft, currentDraft)} saveState={saveState} errors={errors}
        conflict={conflict} disabled={disabled} saving={savingNow} writable={writable} revision={draftRevision}
        dirty={dirty} onSave={save} onReload={reloadHost} />
    </div>
  )
}

/** One stable row-config entry shared by every assembly key. */
export function BetterCompactConfigEntry(props: BetterCompactConfigEntryProps): React.ReactElement {
  if (props.view === 'summary') {
    return <span data-better-compact="summary">{t('summary')}</span>
  }
  return <BetterCompactPage form={props.form} sessions={props.sessions ?? null} />
}

/** Bind the Host sessions service once, for the registered page component. */
export function createConfigEntry(sessions: unknown): (props: BetterCompactConfigEntryProps) => React.ReactElement {
  return function BoundBetterCompactConfigEntry(props: BetterCompactConfigEntryProps): React.ReactElement {
    if (props.view === 'summary') {
      return <span data-better-compact="summary">{t('summary')}</span>
    }
    return <BetterCompactPage form={props.form} sessions={sessions} />
  }
}
