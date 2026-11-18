/**
 * Settings-page behaviour, migrated from the react-test-renderer suite to a real
 * jsdom DOM. Every assertion keeps its original intent; props-level probes became
 * equivalent DOM probes (name attributes, data-bc hooks, disabled state, aria).
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import React from 'react'

// jsdom ships no type declarations in this project's devDependencies; a computed
// specifier keeps the import untyped instead of failing typecheck on a missing .d.ts.
const JSDOM_MODULE = 'jsdom'
const { JSDOM } = (await import(JSDOM_MODULE)) as { JSDOM: new (html: string) => { window: any } }
const dom = new JSDOM('<!doctype html><html><body></body></html>')
const g = globalThis as any
const setGlobal = (key: string, value: unknown): void => {
  try { Object.defineProperty(g, key, { value, writable: true, configurable: true }) } catch { g[key] = value }
}
setGlobal('window', dom.window)
setGlobal('document', dom.window.document)
setGlobal('navigator', dom.window.navigator)
setGlobal('HTMLElement', dom.window.HTMLElement)
setGlobal('Node', dom.window.Node)
setGlobal('Event', dom.window.Event)
setGlobal('MouseEvent', dom.window.MouseEvent)
setGlobal('KeyboardEvent', dom.window.KeyboardEvent)
setGlobal('getComputedStyle', dom.window.getComputedStyle.bind(dom.window))
setGlobal('IS_REACT_ACT_ENVIRONMENT', true)
// jsdom implements no layout pass; the combobox scrolls its active option into view.
;(dom.window.Element.prototype as any).scrollIntoView = function scrollIntoView(): void {}

const { render, fireEvent, act } = await import('@testing-library/react')
const client = await import('../src/client/index.tsx')
const { zh } = await import('../src/client/locales/zh.ts')
const { DEFAULT_CUSTOM_PROMPT } = await import('../src/client/sections.tsx')
const { collapseDetails } = await import('../src/client/controls.tsx')

const Entry = client.BetterCompactConfigEntry

const baseValue = (): Record<string, unknown> => ({
  mode: 'goal',
  auto: true,
  thresholdRatio: 0.8,
  headroomTokens: 100,
  retainRatio: 0.16,
  retainTokens: undefined,
  maxTokens: undefined,
  summarizationProvider: '',
  summarizationModel: '',
  reasoningEffort: '',
  customPrompt: '',
  cachePriority: false,
  summaryImage: false,
  compactionRetries: 1,
  maxOverflowRetries: 1,
  modelPolicies: [],
})

/** Budget and preview the Host would report for a 1000-token window with 100 reserved. */
const makePayload = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  activeConfig: { ...baseValue(), retainTokens: null },
  requiresReload: false,
  sessionId: null,
  engine: { owner: 'host', inspectApplies: true, reason: null },
  diagnostics: [],
  budget: {
    target: { provider: 'p', model: 'm' },
    contextWindow: 1000,
    reservedCompletionTokens: 100,
    messageBudgetTokens: 900,
    headroomTokens: 100,
    pressureBudgetTokens: 800,
    ratioThresholdTokens: 800,
    currentTokens: 570,
    measurement: 'measured',
    fixedTokens: 20,
    thresholdTokens: 800,
    retainTokens: 160,
    summaryMaxTokens: 50,
  },
  preview: {
    beforeTokens: 600,
    afterUpperBoundTokens: 300,
    retainedTokens: 250,
    replacedTokens: 300,
    rangeStart: 1,
    rangeEnd: 1,
    reason: null,
  },
  lastCompaction: null,
  handoffContinuation: null,
  ...over,
})

interface MountOptions {
  value?: Record<string, unknown>
  writable?: boolean
  reject?: boolean
  saveWait?: Promise<void>
  fetchError?: boolean
  routes?: readonly Record<string, unknown>[]
  payload?: Record<string, unknown>
  language?: 'zh' | 'en'
}

async function mount(options: MountOptions = {}) {
  const initial = { ...baseValue(), ...options.value }
  const requests: { path: string; method: string }[] = []
  let failed = options.fetchError === true
  const payload = options.payload ?? makePayload()
  const routes = options.routes ?? [{ provider: 'p', model: 'm', efforts: ['low', 'high'], defaultEffort: 'low' }]
  setGlobal('fetch', async (path: string, init: { method?: string }) => {
    requests.push({ path, method: init?.method ?? 'GET' })
    if (failed) throw new Error('offline')
    return {
      ok: true,
      status: 200,
      json: async () => (path.indexOf('/models') >= 0 ? { enabled: true, routes } : payload),
    }
  })

  // The locale binding is module state, so every mount starts from a known
  // dictionary instead of inheriting whatever the previous test bound.
  const bindDictionary = (dictionary: Record<string, string>): void => {
    client.apply({
      locale: {
        register: () => () => undefined,
        bind: () => (key: string, params: Record<string, string | number> = {}) => String(dictionary[key] ?? key).replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match)),
      },
      effect: (callback: () => () => void) => callback(),
      slots: { inject: () => () => undefined, register: () => () => undefined },
    })
  }
  if (options.language === 'en') {
    const { en } = await import('../src/client/locales/en.ts')
    bindDictionary(en)
  } else {
    bindDictionary(zh)
  }

  const list = { ids: ['s1'], byId: { s1: { displayTitle: 'Session' } }, phase: 'ready', projectionsBySession: {} }
  const sessions = { list: { subscribe: () => () => undefined, getSnapshot: () => list } }
  const calls: { ops: { op: string; path: string[]; value?: unknown }[]; revision: number | null }[] = []
  const plain = (value: unknown) => JSON.parse(JSON.stringify(value))
  let replace: ((next: any) => void) | undefined
  let current: Record<string, unknown> = initial

  function Host(): React.ReactElement {
    const [state, setState] = React.useState<any>({ status: 'ready', writable: options.writable !== false, revision: 7, value: initial })
    replace = setState
    return React.createElement(Entry, {
      form: {
        state,
        mutate: async (ops: any[], revision: number) => {
          calls.push({ ops: plain(ops), revision })
          if (options.reject) return false
          if (options.saveWait) await options.saveWait
          const value: Record<string, unknown> = { ...state.value }
          for (const op of ops) {
            assert.equal(op.path.length, 1)
            if (op.op === 'unset') delete value[op.path[0]]
            else value[op.path[0]] = plain(op.value)
          }
          current = value
          setState({ ...state, revision: state.revision + 1, value })
          return true
        },
      },
      sessions,
    })
  }

  const utils = render(React.createElement(Host))
  const container = utils.container
  const flush = async (): Promise<void> => { await act(async () => { await Promise.resolve() }) }
  await flush()

  const by = (name: string): HTMLElement => {
    const found = container.querySelector('[data-bc="' + name + '"]')
    assert.ok(found, 'missing [data-bc="' + name + '"]')
    return found as HTMLElement
  }
  const countBy = (name: string): number => container.querySelectorAll('[data-bc="' + name + '"]').length
  const control = (name: string): HTMLInputElement => {
    const all = Array.from(container.querySelectorAll<HTMLInputElement>('[name="' + name + '"]'))
    assert.ok(all.length > 0, 'missing control "' + name + '"')
    const plainControl = all.find((node) => node.type !== 'radio')
    if (plainControl) return plainControl
    const checked = all.find((node) => node.checked)
    assert.ok(checked, 'missing checked radio "' + name + '"')
    return checked
  }
  const change = async (name: string, value: string | boolean): Promise<void> => {
    const node = control(name)
    if (node.getAttribute('role') === 'combobox') {
      // The listbox only exists after the trigger's state update flushes, so the
      // two clicks cannot share one act() scope.
      await act(async () => { fireEvent.click(node); await Promise.resolve() })
      const option = container.querySelector('[role="option"][data-value="' + String(value) + '"]')
      assert.ok(option, 'missing option ' + String(value))
      await act(async () => { fireEvent.click(option as HTMLElement); await Promise.resolve() })
      await flush()
      return
    }
    await act(async () => {
      if (node.type === 'radio') {
        const radio = container.querySelector<HTMLInputElement>('[name="' + name + '"][value="' + String(value) + '"]')
        assert.ok(radio, 'missing radio ' + String(value))
        fireEvent.click(radio)
      } else if (node.type === 'checkbox') {
        if (node.checked !== Boolean(value)) fireEvent.click(node)
      } else {
        fireEvent.change(node, { target: { value: String(value) } })
      }
      await Promise.resolve()
    })
    await flush()
  }
  const click = async (name: string): Promise<void> => {
    await act(async () => { fireEvent.click(by(name)); await Promise.resolve() })
    await flush()
  }
  const clickElement = async (node: Element): Promise<void> => {
    await act(async () => { fireEvent.click(node as HTMLElement); await Promise.resolve() })
    await flush()
  }
  const page = (): HTMLElement => {
    const found = container.querySelector('[data-better-compact="page"]')
    assert.ok(found)
    return found as HTMLElement
  }
  const modeCard = (mode: string): HTMLElement => {
    const found = container.querySelector('[data-mode="' + mode + '"]')
    assert.ok(found, 'missing mode card ' + mode)
    return found as HTMLElement
  }
  const text = (node: Element | null): string => (node === null ? '' : node.textContent ?? '')
  const html = (): string => container.innerHTML
  const inputValue = (name: string): string => control(name).value

  return {
    container,
    by,
    countBy,
    control,
    change,
    click,
    clickElement,
    page,
    modeCard,
    text,
    html,
    inputValue,
    calls,
    requests,
    flush,
    value: () => current,
    replace: async (next: any) => { await act(async () => { replace?.(next); await Promise.resolve() }); await flush() },
    failRefresh: () => { failed = true },
    dispose: () => utils.unmount(),
  }
}

const plan = { mode: 'goal', thresholdRatio: 0.8, headroomTokens: 100, retainRatio: 0.16, retainTokens: undefined, maxTokens: undefined }

test('custom default prompt mirrors goalInstruction exactly', async () => {
  const prompts = await import('../src/prompts.ts')
  assert.equal(DEFAULT_CUSTOM_PROMPT, (prompts as any).goalInstruction())
})

for (const mode of ['native', 'goal', 'handoff']) {
  for (const retainMode of ['ratio', 'tokens']) {
    test('process graph saves ' + mode + ' with ' + retainMode + ' retention through one explicit CAS mutation', async () => {
      const ui = await mount({ value: { ...plan, mode: mode === 'goal' ? 'native' : 'goal', maxTokens: 50 } })
      const graph = ui.by('process-editor')
      assert.equal(graph.querySelectorAll('[data-bc-section]').length >= 3, true)
      assert.equal(graph.querySelectorAll('[data-bc="runtime-preview"], [data-bc="draft-preview-line"]').length, 0)
      await ui.change('thresholdRatio', '65')
      assert.equal(ui.inputValue('thresholdRatio'), '65')
      await ui.change('thresholdRatio', '70')
      assert.equal(ui.inputValue('thresholdRatio'), '70')
      await ui.change('retainRatio', '22')
      assert.equal(ui.inputValue('retainRatio'), '22')
      await ui.change('retainRatio', '20')
      assert.equal(ui.inputValue('retainRatio'), '20')
      if (retainMode === 'tokens') {
        await ui.change('retainMode', 'tokens')
        await ui.change('retainTokens', '80')
      }
      await ui.clickElement(ui.modeCard(mode))
      assert.equal(ui.by('process-result').getAttribute('data-mode-result'), mode)
      assert.equal(ui.container.querySelectorAll('[data-mode-flow="' + mode + '"]').length, 1)
      assert.equal(ui.text(ui.by('draft-message-budget')), '900 tokens')
      assert.equal(ui.text(ui.by('draft-trigger')), '700 tokens')
      assert.equal(ui.text(ui.by('draft-retain')), (retainMode === 'tokens' ? '80' : '180') + ' tokens')
      assert.equal(ui.text(ui.by('draft-summary')), '50 tokens')
      assert.equal(ui.calls.length, 0, 'graph editing never saves or invokes a model')
      await ui.click('save-button')
      assert.equal(ui.calls.length, 1)
      assert.equal(ui.calls[0]?.revision, 7)
      assert.equal(ui.value().mode, mode)
      assert.equal(ui.value().thresholdRatio, 0.7)
      assert.equal(ui.value()[retainMode === 'tokens' ? 'retainTokens' : 'retainRatio'], retainMode === 'tokens' ? 80 : 0.2)
      assert.equal(ui.value()[retainMode === 'tokens' ? 'retainRatio' : 'retainTokens'], undefined)
      assert.equal(ui.calls[0]?.ops.some((op) => op.path[0] === 'retainMode'), false)
      assert.ok(ui.calls[0]?.ops.some((op) => op.path[0] === 'mode' && op.value === mode))
      assert.ok(ui.requests.every((request) => request.method === 'GET'))
      ui.dispose()
    })
  }
}

test('custom mode requires a prompt, inserts variables, warns on unknown tokens and saves mode+customPrompt', async () => {
  const ui = await mount({ value: { ...plan, mode: 'goal' } })
  await ui.clickElement(ui.modeCard('custom'))
  assert.match(ui.inputValue('customPrompt'), /## Next Actions/)
  assert.match(ui.inputValue('customPrompt'), /acting as a compaction engine/)
  for (const section of ['## Current Goal and Unresolved Requests', '## Constraints, Preferences, and Approved Boundaries', '## Decisions and Reasons', '## Completed Work', '## In Progress', '## Blocked, Pending, and Unverified', '## Key References', '## Next Actions']) {
    assert.ok(ui.inputValue('customPrompt').includes(section), section)
  }
  assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, false, 'the goal default is a valid starting prompt')
  assert.match(ui.text(ui.by('process-result')), /你的摘要 \+ 近期原文/)
  await ui.change('customPrompt', '')
  assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, true, 'clearing the prefilled prompt blocks saving')
  await ui.clickElement(ui.by('prompt-variable-goal'))
  assert.equal(ui.inputValue('customPrompt'), '{{goal}}')
  await ui.change('customPrompt', 'Keep {{todos}} and {{unknown}}')
  assert.match(ui.text(ui.by('prompt-warning')), /\{\{unknown\}\}/)
  assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, false)
  await ui.click('save-button')
  assert.equal(ui.value().mode, 'custom')
  assert.equal(ui.value().customPrompt, 'Keep {{todos}} and {{unknown}}')
  assert.ok(ui.calls[0]?.ops.some((op) => op.path[0] === 'mode' && op.value === 'custom'))
  assert.ok(ui.calls[0]?.ops.some((op) => op.path[0] === 'customPrompt' && op.value === 'Keep {{todos}} and {{unknown}}'))
  ui.dispose()
})

test('custom prefill only fills an empty prompt and never overwrites a saved prompt', async () => {
  const saved = await mount({ value: { ...plan, mode: 'goal', customPrompt: 'Keep my prompt' } })
  await saved.clickElement(saved.modeCard('custom'))
  assert.equal(saved.inputValue('customPrompt'), 'Keep my prompt')
  saved.dispose()
  const blank = await mount({ value: { ...plan, mode: 'goal', customPrompt: '' } })
  await blank.clickElement(blank.modeCard('custom'))
  assert.match(blank.inputValue('customPrompt'), /## Next Actions/)
  await blank.clickElement(blank.modeCard('goal'))
  await blank.clickElement(blank.modeCard('custom'))
  assert.match(blank.inputValue('customPrompt'), /## Next Actions/)
  blank.dispose()
})

test('capacity handles edit the same draft with keyboard and stay in sync with the numeric ranges', async () => {
  const ui = await mount({ value: plan })
  const handles = Array.from(ui.container.querySelectorAll<HTMLElement>('[role="slider"]'))
  assert.equal(handles.length, 2)
  const trigger = handles.find((node) => String(node.getAttribute('aria-label')).startsWith('触发'))
  const retain = handles.find((node) => String(node.getAttribute('aria-label')).startsWith('保留'))
  assert.ok(trigger)
  assert.ok(retain)
  await act(async () => { fireEvent.keyDown(trigger as HTMLElement, { key: 'ArrowRight' }) })
  assert.equal(ui.inputValue('thresholdRatio'), '81')
  const before = ui.inputValue('retainRatio')
  await act(async () => { fireEvent.keyDown(retain as HTMLElement, { key: 'ArrowRight' }) })
  assert.notEqual(ui.inputValue('retainRatio'), before)
  assert.equal(ui.calls.length, 0)
  ui.dispose()
})

test('global graph controls keep effective model overrides separate and preserve them on Save', async () => {
  const policies = [{ provider: 'p', model: 'm', thresholdRatio: 0.4, retainTokens: 60, maxTokens: 30 }]
  const ui = await mount({ value: { ...plan, modelPolicies: policies } })
  await ui.change('thresholdRatio', '60')
  await ui.change('retainRatio', '20')
  assert.equal(ui.inputValue('thresholdRatio'), '60')
  assert.equal(ui.text(ui.by('draft-trigger')), '400 tokens')
  assert.equal(ui.text(ui.by('draft-retain')), '60 tokens')
  assert.equal(ui.text(ui.by('draft-summary')), '30 tokens')
  assert.match(ui.text(ui.by('process-override')), /覆盖规则/)
  await ui.click('save-button')
  assert.deepEqual(ui.value().modelPolicies, policies)
  assert.equal(ui.value().thresholdRatio, 0.6)
  assert.equal(ui.calls[0]?.ops.some((op) => op.path[0] === 'modelPolicies'), false)
  ui.dispose()
})

test('draft budget uses the shared resolver formulas for both limiting constraints and policy inheritance', async () => {
  // 1000-token window, 100 reserved -> 900 message budget; effective threshold is
  // min(window * ratio, message - headroom) and retention follows the message budget.
  const cases: { value: Record<string, unknown>; threshold: number; retain: number }[] = [
    { value: plan, threshold: 800, retain: 144 },
    { value: { ...plan, thresholdRatio: 0.5 }, threshold: 500, retain: 144 },
    { value: { ...plan, headroomTokens: 500 }, threshold: 400, retain: 144 },
    { value: { ...plan, modelPolicies: [{ provider: 'p', model: 'm', headroomTokens: 450, retainTokens: 50 }] }, threshold: 450, retain: 50 },
  ]
  for (const entry of cases) {
    const ui = await mount({ value: entry.value })
    assert.equal(ui.text(ui.by('draft-trigger')), entry.threshold + ' tokens')
    assert.equal(ui.text(ui.by('draft-retain')), entry.retain + ' tokens')
    assert.equal(ui.text(ui.by('draft-message-budget')), '900 tokens')
    await ui.change('thresholdRatio', '60')
    assert.equal(ui.inputValue('thresholdRatio'), '60')
    assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, false)
    assert.ok(ui.requests.every((request) => request.method === 'GET'))
    ui.dispose()
  }
})

test('save atomically switches retention forms, preserves untouched policies, and uses host revision', async () => {
  const policies = [{ provider: 'other', model: 'model', headroomTokens: 20 }]
  const ui = await mount({ value: { ...plan, modelPolicies: policies } })
  await ui.change('retainMode', 'tokens')
  await ui.change('retainTokens', '80')
  await ui.click('save-button')
  assert.equal(ui.calls.length, 1)
  assert.equal(ui.calls[0]?.revision, 7)
  assert.equal(ui.value().retainTokens, 80)
  assert.equal(ui.value().retainRatio, undefined)
  assert.deepEqual(ui.value().modelPolicies, policies)
  assert.ok(!ui.calls[0]?.ops.some((op) => op.path[0] === 'modelPolicies'))
  assert.equal(ui.countBy('save-footer'), 0)
  assert.match(ui.text(ui.by('save-saved')), /已保存/)
  ui.dispose()
})

test('visual policy editor saves inheritance, empty summary override, and exact model identity', async () => {
  const ui = await mount({ value: plan })
  await ui.click('add-policy')
  await ui.change('policies.0.provider', 'p')
  await ui.change('policies.0.model', 'm')
  await ui.change('policies.0.headroomTokens', '400')
  await ui.change('policies.0.retainMode', 'tokens')
  await ui.change('policies.0.retainTokens', '0')
  await ui.change('policies.0.summaryMode', 'session')
  await ui.click('save-button')
  assert.deepEqual(ui.value().modelPolicies, [{ provider: 'p', model: 'm', headroomTokens: 400, retainTokens: 0, summarizationProvider: '', summarizationModel: '' }])
  ui.dispose()
})

test('native and automatic dependencies hide inapplicable controls without losing draft values; read-only blocks editing', async () => {
  const ui = await mount({ value: plan })
  const count = (name: string): number => ui.container.querySelectorAll('[name="' + name + '"]').length
  assert.equal(ui.countBy('save-footer'), 0)
  await ui.clickElement(ui.modeCard('native'))
  assert.equal(count('reasoningEffort'), 0)
  assert.equal(count('cachePriority'), 0)
  assert.equal((ui.control('summaryRoute') as any).disabled, false)
  await ui.change('auto', false)
  for (const name of ['maxOverflowRetries', 'compactionRetries', 'thresholdRatio', 'retainMode']) assert.equal(count(name), 0)
  await ui.change('auto', true)
  assert.equal(ui.inputValue('thresholdRatio'), '80')
  assert.equal(ui.inputValue('maxOverflowRetries'), '1')
  ui.dispose()
  const locked = await mount({ value: plan, writable: false })
  for (const node of Array.from(locked.container.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, [role="combobox"]'))) {
    // The session picker stays interactive: it only selects a read-only reference.
    if (node.getAttribute('role') === 'combobox' && node.getAttribute('name') === 'inspectSession') continue
    assert.equal(node.disabled, true, 'control ' + String(node.getAttribute('name')) + ' must be disabled')
  }
  assert.equal(locked.countBy('save-footer'), 0)
  assert.equal(locked.calls.length, 0)
  locked.dispose()
})

test('cross-field, implicit retention, safe integer, and effective budget boundaries block saving', async () => {
  const boundaryCases: readonly (readonly [string, string])[] = [
    ['thresholdRatio', '10'], ['headroomTokens', '900'], ['retainRatio', '80'],
    ['retainTokens', '800'], ['compactionRetries', '9007199254740992'],
  ]
  for (const [field, value] of boundaryCases) {
    const ui = await mount({ value: { ...plan, retainRatio: undefined } })
    if (field === 'retainTokens') await ui.change('retainMode', 'tokens')
    await ui.change(field, value)
    assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, true, field)
    await ui.click('save-button')
    assert.equal(ui.calls.length, 0)
    ui.dispose()
  }
  const ui = await mount({ value: { ...plan, modelPolicies: [{ provider: 'p', model: 'm', retainRatio: 0.3 }] } })
  await ui.change('thresholdRatio', '20')
  assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, true)
  assert.match(ui.html(), /有效保留比例/)
  ui.dispose()
})

test('rejected saves retain edits and revision conflicts never mutate', async () => {
  const ui = await mount({ value: plan, reject: true })
  await ui.change('thresholdRatio', '70')
  await ui.click('save-button')
  assert.equal(ui.inputValue('thresholdRatio'), '70')
  assert.match(ui.html(), /宿主拒绝保存/)
  await ui.replace({ status: 'ready', writable: true, revision: 8, value: { ...baseValue(), ...plan, thresholdRatio: 0.6 } })
  assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, true)
  await ui.click('save-button')
  assert.equal(ui.calls.length, 1)
  ui.dispose()
})

test('diagnostic failure leaves valid settings editable and missing budgets unknown', async () => {
  const ui = await mount({ value: plan, fetchError: true })
  await ui.change('thresholdRatio', '70')
  assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, false)
  assert.match(ui.html(), /诊断读取失败/)
  assert.equal(ui.countBy('draft-budget'), 0)
  ui.dispose()
})

test('runtime facts use actual retained tail and hide stale previews after refresh errors', async () => {
  const ui = await mount({ value: { ...plan, retainRatio: undefined, retainTokens: 160, maxTokens: 50 } })
  assert.match(ui.text(ui.by('runtime-budget')), /模型窗口/)
  assert.match(ui.text(ui.by('runtime-budget')), /当前上下文/)
  assert.match(ui.text(ui.by('safe-cut')), /600 tokens/)
  assert.equal(ui.container.querySelectorAll('[data-bc="before-bar"], [data-bc="after-bar"]').length, 0)
  ui.failRefresh()
  await ui.clickElement(ui.container.querySelector('[aria-label="刷新会话诊断"]') as HTMLElement)
  assert.equal(ui.countBy('safe-cut'), 0)
  assert.match(ui.html(), /诊断读取失败/)
  ui.dispose()
})

test('shared effort validates policy summary routes and followed conversation models', async () => {
  const routes = [{ provider: 'p', model: 'm', efforts: ['low', 'high'] }, { provider: 'q', model: 'n', efforts: ['low'] }]
  const ui = await mount({
    value: {
      ...plan, summarizationProvider: 'p', summarizationModel: 'm', reasoningEffort: 'high',
      modelPolicies: [{ provider: 'p', model: 'm', summarizationProvider: 'q', summarizationModel: 'n' }],
    },
    routes,
  })
  await ui.change('thresholdRatio', '70')
  assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, true)
  assert.match(ui.html(), /q\/n 未声明支持强度/)
  await ui.change('reasoningEffort', 'low')
  assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, false)
  ui.dispose()
  const followed = await mount({ value: { ...plan, reasoningEffort: 'unsupported' }, routes })
  await followed.change('thresholdRatio', '70')
  assert.equal((followed.by('save-button') as HTMLButtonElement).disabled, true)
  followed.dispose()
})

test('zero headroom needs an explicit output cap and duplicate policies never save', async () => {
  const ui = await mount({ value: plan })
  await ui.change('headroomTokens', '0')
  assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, true)
  await ui.change('maxTokens', '40')
  assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, false)
  await ui.click('save-button')
  assert.equal(ui.value().headroomTokens, 0)
  assert.equal(ui.value().maxTokens, 40)
  await ui.click('add-policy')
  await ui.change('policies.0.provider', 'p')
  await ui.change('policies.0.model', 'm')
  await ui.click('add-policy')
  await ui.change('policies.1.provider', 'p')
  await ui.change('policies.1.model', 'm')
  assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, true)
  assert.match(ui.html(), /该模型已有覆盖规则/)
  ui.dispose()
  const inherited = await mount({ value: { ...plan, maxTokens: 50, modelPolicies: [{ provider: 'p', model: 'm', headroomTokens: 0 }] } })
  await inherited.change('maxTokens', '')
  assert.equal((inherited.by('save-button') as HTMLButtonElement).disabled, true)
  assert.match(inherited.html(), /余量为 0 时须设置摘要输出上限/)
  inherited.dispose()
})

test('custom combobox previews with keyboard, commits on Enter, and consumes Escape before the host', async () => {
  const ui = await mount({ value: plan })
  const trigger = ui.control('summaryRoute') as HTMLElement
  let bubbled = false
  const spy = (): void => { bubbled = true }
  // React delegates at the root container, so a consumed Escape never reaches document.
  dom.window.document.addEventListener('keydown', spy)
  assert.equal(trigger.getAttribute('aria-expanded'), 'false')
  await act(async () => { fireEvent.keyDown(trigger, { key: 'ArrowDown' }) })
  await act(async () => { fireEvent.keyDown(trigger, { key: 'End' }) })
  const active = trigger.getAttribute('aria-activedescendant')
  assert.ok(active)
  const selectedOption = ui.container.querySelector('[id="' + String(active) + '"]')
  assert.ok(selectedOption)
  assert.equal(selectedOption.getAttribute('data-value'), 'custom')
  assert.equal(ui.page().getAttribute('data-settings-dirty'), 'false', 'highlighting does not change the draft')
  bubbled = false
  let escapeNotPrevented = true
  await act(async () => { escapeNotPrevented = fireEvent.keyDown(trigger, { key: 'Escape' }) })
  dom.window.document.removeEventListener('keydown', spy)
  assert.equal(escapeNotPrevented, false)
  assert.equal(bubbled, false)
  assert.equal(trigger.getAttribute('aria-expanded'), 'false')
  assert.equal(trigger.getAttribute('value'), '')
  await act(async () => { fireEvent.keyDown(trigger, { key: 'ArrowDown' }) })
  await act(async () => { fireEvent.keyDown(trigger, { key: 'End' }) })
  await act(async () => { fireEvent.keyDown(trigger, { key: 'ArrowUp' }) })
  await act(async () => { fireEvent.keyDown(trigger, { key: 'Enter' }) })
  await ui.flush()
  assert.equal(trigger.getAttribute('value'), JSON.stringify(['p', 'm']))
  assert.equal(ui.container.querySelectorAll('[name="summarizationProvider"]').length, 0)
  assert.equal(ui.page().getAttribute('data-settings-dirty'), 'true')
  await act(async () => { fireEvent.keyDown(trigger, { key: 'Home' }) })
  await act(async () => { fireEvent.keyDown(trigger, { key: 'Enter' }) })
  await ui.flush()
  assert.equal(ui.page().getAttribute('data-settings-dirty'), 'false')
  assert.equal(ui.countBy('save-footer'), 0)
  ui.dispose()
})

test('draft guards expose pending save and clear only after the host accepts the saved snapshot', async () => {
  let finish: (() => void) | undefined
  const saveWait = new Promise<void>((resolve) => { finish = resolve })
  const ui = await mount({ value: plan, saveWait })
  assert.equal(ui.page().getAttribute('data-settings-dirty'), 'false')
  await ui.change('thresholdRatio', '60')
  assert.equal(ui.page().getAttribute('data-settings-dirty'), 'true')
  await act(async () => { (ui.by('save-button') as HTMLButtonElement).click() })
  assert.equal(ui.page().getAttribute('data-settings-busy'), 'true')
  assert.equal(ui.by('save-button').getAttribute('aria-busy'), 'true')
  assert.equal((ui.by('save-button') as HTMLButtonElement).disabled, true)
  await act(async () => { finish?.(); await new Promise((resolve) => setTimeout(resolve, 0)) })
  await ui.flush()
  assert.equal(ui.calls.length, 1)
  assert.equal(ui.page().getAttribute('data-settings-busy'), 'false')
  assert.equal(ui.page().getAttribute('data-settings-dirty'), 'false')
  assert.equal(ui.countBy('save-footer'), 0)
  assert.match(ui.text(ui.by('save-saved')), /已保存/)
  ui.dispose()
})

test('retention drafts survive mode switches without creating false dirty state or policy rewrites', async () => {
  const ui = await mount({ value: { ...plan, modelPolicies: [{ provider: 'other', model: 'model', retainRatio: 0.2 }] } })
  await ui.change('retainMode', 'tokens')
  await ui.change('retainTokens', '80')
  await ui.change('retainMode', 'ratio')
  assert.equal(ui.inputValue('retainRatio'), '16')
  assert.equal(ui.page().getAttribute('data-settings-dirty'), 'false')
  await ui.change('policies.0.retainMode', 'tokens')
  await ui.change('policies.0.retainTokens', '60')
  await ui.change('policies.0.retainMode', 'ratio')
  assert.equal(ui.page().getAttribute('data-settings-dirty'), 'false')
  await ui.change('retainMode', 'tokens')
  assert.equal(ui.inputValue('retainTokens'), '80')
  await ui.click('save-button')
  assert.equal(ui.page().getAttribute('data-settings-dirty'), 'false')
  assert.equal(ui.calls[0]?.ops.some((op) => op.path[0] === 'modelPolicies'), false)
  ui.dispose()
})

test('diagnostics and draft allocation stay separate, advanced summaries expose only nondefault settings, and help consumes Escape', async () => {
  const ui = await mount({ value: plan })
  const status = ui.by('diagnostics')
  assert.equal(status.getAttribute('data-bc-section'), 'diagnostics')
  assert.equal(status.querySelectorAll('[name]').length, 0)
  assert.equal(ui.by('draft-budget').querySelectorAll('[data-bc="runtime-trigger"]').length, 0)
  assert.equal(ui.countBy('advanced-summary'), 0)
  assert.equal(ui.by('advanced').hasAttribute('open'), false)
  const retries = await mount({ value: { ...plan, compactionRetries: 2 } })
  assert.match(retries.text(retries.by('advanced-summary')), /压力(?:残留)?重试/)
  retries.dispose()
  let focused = false
  const target = { open: true, querySelector: () => ({ focus: () => { focused = true } }) }
  let prevented = false
  let stopped = false
  const event = {
    key: 'Escape',
    currentTarget: target,
    defaultPrevented: false,
    preventDefault() { prevented = true },
    stopPropagation() { stopped = true },
  }
  collapseDetails(event as any)
  assert.equal(target.open, false)
  assert.equal(prevented, true)
  assert.equal(stopped, true)
  assert.equal(focused, true)
  ui.dispose()
  const defaults = await mount()
  assert.equal(defaults.countBy('advanced-summary'), 0)
  defaults.dispose()
})

test('process presentation preserves the client locale contract', async () => {
  const ui = await mount({ value: plan, language: 'en' })
  const graph = ui.text(ui.page())
  assert.ok(graph.includes('Compaction'))
  assert.ok(graph.includes('Capacity and trigger'))
  const aria = ui.modeCard('native').getAttribute('aria-label') ?? ''
  assert.equal(aria.startsWith('Native'), true)
  await ui.clickElement(ui.modeCard('handoff'))
  assert.ok(ui.text(ui.container.querySelector('[data-mode-flow="handoff"]')).includes('Handoff body'))
  assert.equal(ui.calls.length, 0)
  ui.dispose()
})

test('summary image switch reflects the saved draft and explains itself through its title', async () => {
  const ui = await mount({ value: { ...plan, summaryImage: true } })
  const row = ui.container.querySelector('[data-bc-setting="summaryImage"]')
  assert.ok(row, 'the summary-image row is rendered')
  assert.match(ui.text(row), /摘要以图片附加/)
  assert.equal(ui.control('summaryImage').checked, true)
  assert.equal(ui.control('summaryImage').getAttribute('title'), '仅在目标增强与自定义模式下生效')
  assert.equal(ui.control('summaryImage').disabled, false)
  ui.dispose()
  const off = await mount({ value: plan })
  assert.equal(off.control('summaryImage').checked, false)
  off.dispose()
})

test('summary image switch patches the draft and saves through one atomic mutation', async () => {
  const ui = await mount({ value: plan })
  assert.equal(ui.page().getAttribute('data-settings-dirty'), 'false')
  await ui.change('summaryImage', true)
  assert.equal(ui.control('summaryImage').checked, true)
  assert.equal(ui.page().getAttribute('data-settings-dirty'), 'true')
  await ui.click('save-button')
  assert.equal(ui.calls.length, 1)
  assert.equal(ui.value().summaryImage, true)
  assert.ok(ui.calls[0]?.ops.some((op) => op.path[0] === 'summaryImage' && op.value === true))
  ui.dispose()
})

test('summary image switch is disabled whenever the mode cannot attach an image', async () => {
  for (const mode of ['handoff', 'native']) {
    const ui = await mount({ value: { ...plan, mode, summaryImage: true } })
    assert.equal(ui.control('summaryImage').disabled, true, mode + ' must disable the switch')
    assert.equal(ui.control('summaryImage').checked, true, mode + ' keeps the stored value')
    ui.dispose()
  }
  for (const mode of ['goal', 'custom']) {
    const ui = await mount({ value: { ...plan, mode, customPrompt: mode === 'custom' ? 'Keep {{todos}}' : '' } })
    assert.equal(ui.control('summaryImage').disabled, false, mode + ' must allow the switch')
    ui.dispose()
  }
})