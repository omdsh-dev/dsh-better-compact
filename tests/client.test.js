import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import vm from 'node:vm'
import React from 'react'
import Renderer, { act } from 'react-test-renderer'
import { Session } from '@deepseek-ai/dsh-session'
import { readConfig, DEFAULTS } from '../src/config.js'
import { resolveCompactSpec, resolveTargetPolicy } from '../src/budget.js'
import { buildBudgetPreview } from '../src/inspect.js'
import { GOAL_SECTIONS, goalInstruction } from '../src/prompts.js'

const source = await readFile(process.env.COMPACT_CLIENT_PATH ?? new URL('../src/client.js', import.meta.url), 'utf8')
const plain = (value) => JSON.parse(JSON.stringify(value))
const text = (node) => typeof node === 'string' ? node : (node.children ?? []).map(text).join(' ')

async function mount(options = {}) {
  const initial = { ...DEFAULTS, retainTokens: undefined, maxTokens: undefined, ...options.value }
  const active = readConfig(initial)
  const W = options.window ?? 1000
  const R = options.reserved ?? 100
  let session = null
  let measurement
  if (options.preview) {
    session = Session.create('client-preview-test')
    const counts = [20, 300, 100, 150]
    counts.forEach((_, index) => session.append(index === 0 ? 'system/message' : 'user/message', { content: [{ type: 'text', text: 'Message ' + index }] }, { surfaceOp: 'append' }))
    measurement = { totalTokens: 570, nodes: session.surface.nodes.map((seq, index) => ({ seq, tokens: counts[index] })) }
  }
  const snapshot = buildBudgetPreview({ session, measurement, events: [{ type: 'request/header', data: { header: { config: { provider: 'p', model: 'm', maxTokens: R } } } }],
    activeConfig: active, modelInfo: { context: { contextWindow: W } } })
  const payload = { activeConfig: active, requiresReload: false, engine: { owner: 'host', inspectApplies: true }, ...snapshot }
  const requests = []
  let failed = options.fetchError
  let entry
  let client
  vm.runInNewContext(source, { window: { __ModuleLoader__: { load({ factory }) { client = factory((name) => { assert.equal(name, 'react'); return React }); entry = client.BetterCompactConfigEntry } } },
    AbortController, fetch: async (path, init) => { requests.push({ path, init }); if (failed) throw new Error('offline')
      return { ok: true, json: async () => path.includes('/models') ? { enabled: true, routes: options.routes ?? [{ provider: 'p', model: 'm', efforts: ['low', 'high'], defaultEffort: 'low' }] } : payload } } })
  if (options.language && client.inject.includes('locale')) {
    let dictionaries
    client.apply({ locale: {
      register: (_namespace, value) => { dictionaries = value; return () => {} },
      bind: () => (key, params = {}) => String(dictionaries[options.language]?.[key] ?? key).replace(/\{(\w+)\}/g, (match, key) => params[key] ?? match),
    }, effect: (callback) => callback(), slots: { inject: () => () => {}, register: () => () => {} } })
  }
  const list = { ids: ['s1'], byId: { s1: { displayTitle: 'Session' } }, phase: 'ready' }
  const sessions = { list: { subscribe: () => () => {}, getSnapshot: () => list } }
  const calls = []
  let replace
  let current = initial
  function Host() {
    const [state, setState] = React.useState({ status: 'ready', writable: options.writable !== false, revision: 7, value: initial })
    replace = setState
    return React.createElement(entry, { form: { state, mutate: async (ops, revision) => {
      calls.push({ ops: plain(ops), revision })
      if (options.reject) return false
      if (options.saveWait) await options.saveWait
      const value = { ...state.value }
      for (const op of ops) { assert.equal(op.path.length, 1); if (op.op === 'unset') delete value[op.path[0]]; else value[op.path[0]] = plain(op.value) }
      readConfig(value)
      current = value
      setState({ ...state, revision: state.revision + 1, value })
      return true
    } }, sessions })
  }
  let renderer
  await act(async () => { renderer = Renderer.create(React.createElement(Host)) })
  const input = (name) => renderer.root.find((node) => typeof node.type === 'string' && node.props.name === name && (node.props.type !== 'radio' || node.props.checked))
  const by = (name) => renderer.root.find((node) => typeof node.type === 'string' && node.props['data-bc'] === name)
  const change = async (name, value) => {
    const control = input(name)
    if (control.props.role === 'combobox') {
      await act(async () => control.props.onClick())
      await act(async () => renderer.root.find((node) => node.props.role === 'option' && node.props['data-value'] === value).props.onClick())
    } else {
      const target = control.props.type === 'radio' ? renderer.root.find((node) => node.type === 'input' && node.props.name === name && node.props.value === value) : control
      await act(async () => target.props.onChange({ target: { value, checked: value } }))
    }
  }
  const click = async (name) => act(async () => by(name).props.onClick())
  const dispose = () => act(() => renderer.unmount())
  return { renderer, input, by, change, click, calls, requests, replace: (next) => act(() => replace(next)), value: () => current, failRefresh: () => { failed = true }, dispose }
}

const base = { thresholdRatio: .8, headroomTokens: 100, retainRatio: .16 }

test('custom default prompt mirrors goalInstruction exactly', () => {
  const match = source.match(/const DEFAULT_CUSTOM_PROMPT = ("(?:[^"\\]|\\.)*")/)
  assert.ok(match, 'DEFAULT_CUSTOM_PROMPT is present')
  assert.equal(JSON.parse(match[1]), goalInstruction())
})


for (const mode of ['native', 'goal', 'handoff']) {
  for (const retainMode of ['ratio', 'tokens']) {
    test('process graph saves ' + mode + ' with ' + retainMode + ' retention through one explicit CAS mutation', async () => {
      const ui = await mount({ value: { ...base, mode: mode === 'goal' ? 'native' : 'goal', maxTokens: 50 }, preview: true })
      const graph = ui.by('process-editor')
      assert.ok(graph)
      assert.equal(graph.findAll((node) => node.props['data-bc-section']).length >= 3, true)
      assert.equal(graph.findAll((node) => node.props['data-bc'] === 'runtime-preview' || node.props['data-bc'] === 'draft-preview-line').length, 0)
      await ui.change('thresholdRatio', '65')
      assert.equal(ui.input('thresholdRatio').props.value, '65')
      await ui.change('thresholdRatio', '70')
      assert.equal(ui.input('thresholdRatio').props.value, '70')
      await ui.change('retainRatio', '22')
      assert.equal(ui.input('retainRatio').props.value, '22')
      await ui.change('retainRatio', '20')
      assert.equal(ui.input('retainRatio').props.value, '20')
      if (retainMode === 'tokens') {
        await ui.change('retainMode', 'tokens')
        await ui.change('retainTokens', '80')
      }
      await act(async () => ui.renderer.root.findByProps({ 'data-mode': mode }).props.onClick())
      assert.equal(ui.by('process-result').props['data-mode-result'], mode)
      assert.equal(ui.renderer.root.findAllByProps({ 'data-mode-flow': mode }).length, 1)
      assert.equal(text(ui.by('draft-message-budget')), '900 tokens')
      assert.equal(text(ui.by('draft-trigger')), '700 tokens')
      assert.equal(text(ui.by('draft-retain')), (retainMode === 'tokens' ? '80' : '180') + ' tokens')
      assert.equal(text(ui.by('draft-summary')), '50 tokens')
      assert.equal(ui.calls.length, 0, 'graph editing never saves or invokes a model')
      await ui.click('save-button')
      assert.equal(ui.calls.length, 1)
      assert.equal(ui.calls[0].revision, 7)
      assert.equal(ui.value().mode, mode)
      assert.equal(ui.value().thresholdRatio, .7)
      assert.equal(ui.value()[retainMode === 'tokens' ? 'retainTokens' : 'retainRatio'], retainMode === 'tokens' ? 80 : .2)
      assert.equal(ui.value()[retainMode === 'tokens' ? 'retainRatio' : 'retainTokens'], undefined)
      assert.equal(ui.calls[0].ops.some((op) => op.path[0] === 'retainMode'), false)
      assert.ok(ui.calls[0].ops.some((op) => op.path[0] === 'mode' && op.value === mode))
      assert.ok(ui.requests.every(({ init }) => init.method === 'GET'))
      ui.dispose()
    })
  }
}

test('custom mode requires a prompt, inserts variables, warns on unknown tokens and saves mode+customPrompt', async () => {
  const ui = await mount({ value: { ...base, mode: 'goal' }, preview: true })
  await act(async () => ui.renderer.root.findByProps({ 'data-mode': 'custom' }).props.onClick())
  assert.ok(ui.input('customPrompt'))
  assert.match(ui.input('customPrompt').props.value, /## Next Actions/)
  assert.match(ui.input('customPrompt').props.value, /acting as a compaction engine/)
  for (const section of GOAL_SECTIONS) assert.ok(ui.input('customPrompt').props.value.includes(section), section)
  assert.equal(ui.by('save-button').props.disabled, false, 'the goal default is a valid starting prompt')
  assert.match(text(ui.by('process-result')), /你的摘要 \+ 近期原文/)
  await ui.change('customPrompt', '')
  assert.equal(ui.by('save-button').props.disabled, true, 'clearing the prefilled prompt blocks saving')
  await act(async () => ui.by('prompt-variable-goal').props.onClick())
  assert.equal(ui.input('customPrompt').props.value, '{{goal}}')
  await ui.change('customPrompt', 'Keep {{todos}} and {{unknown}}')
  assert.match(text(ui.by('prompt-warning')), /\{\{unknown\}\}/)
  assert.equal(ui.by('save-button').props.disabled, false)
  await ui.click('save-button')
  assert.equal(ui.value().mode, 'custom')
  assert.equal(ui.value().customPrompt, 'Keep {{todos}} and {{unknown}}')
  assert.ok(ui.calls[0].ops.some((op) => op.path[0] === 'mode' && op.value === 'custom'))
  assert.ok(ui.calls[0].ops.some((op) => op.path[0] === 'customPrompt' && op.value === 'Keep {{todos}} and {{unknown}}'))
  ui.dispose()
})

test('custom prefill only fills an empty prompt and never overwrites a saved prompt', async () => {
  const saved = await mount({ value: { ...base, mode: 'goal', customPrompt: 'Keep my prompt' } })
  await act(async () => saved.renderer.root.findByProps({ 'data-mode': 'custom' }).props.onClick())
  assert.equal(saved.input('customPrompt').props.value, 'Keep my prompt')
  saved.dispose()
  const blank = await mount({ value: { ...base, mode: 'goal', customPrompt: '' } })
  await act(async () => blank.renderer.root.findByProps({ 'data-mode': 'custom' }).props.onClick())
  assert.match(blank.input('customPrompt').props.value, /## Next Actions/)
  await act(async () => blank.renderer.root.findByProps({ 'data-mode': 'goal' }).props.onClick())
  await act(async () => blank.renderer.root.findByProps({ 'data-mode': 'custom' }).props.onClick())
  assert.match(blank.input('customPrompt').props.value, /## Next Actions/)
  blank.dispose()
})

test('capacity handles edit the same draft with keyboard and stay in sync with the numeric ranges', async () => {
  const ui = await mount({ value: base, preview: true })
  const handles = ui.renderer.root.findAll((node) => node.props.role === 'slider')
  assert.equal(handles.length, 2)
  const trigger = handles.find((node) => String(node.props['aria-label']).startsWith('触发'))
  const retain = handles.find((node) => String(node.props['aria-label']).startsWith('保留'))
  assert.ok(trigger)
  assert.ok(retain)
  await act(async () => trigger.props.onKeyDown({ key: 'ArrowRight', preventDefault() {} }))
  assert.equal(ui.input('thresholdRatio').props.value, '81')
  const before = ui.input('retainRatio').props.value
  await act(async () => retain.props.onKeyDown({ key: 'ArrowRight', preventDefault() {} }))
  assert.notEqual(ui.input('retainRatio').props.value, before)
  assert.equal(ui.calls.length, 0)
  ui.dispose()
})

test('global graph controls keep effective model overrides separate and preserve them on Save', async () => {
  const policies = [{ provider: 'p', model: 'm', thresholdRatio: .4, retainTokens: 60, maxTokens: 30 }]
  const ui = await mount({ value: { ...base, modelPolicies: policies } })
  await ui.change('thresholdRatio', '60')
  await ui.change('retainRatio', '20')
  assert.equal(ui.input('thresholdRatio').props.value, '60')
  assert.equal(text(ui.by('draft-trigger')), '400 tokens')
  assert.equal(text(ui.by('draft-retain')), '60 tokens')
  assert.equal(text(ui.by('draft-summary')), '30 tokens')
  assert.match(text(ui.by('process-override')), /覆盖规则/)
  await ui.click('save-button')
  assert.deepEqual(ui.value().modelPolicies, policies)
  assert.equal(ui.value().thresholdRatio, .6)
  assert.equal(ui.calls[0].ops.some((op) => op.path[0] === 'modelPolicies'), false)
  ui.dispose()
})

test('draft budget uses real resolver formulas for both limiting constraints and policy inheritance', async () => {
  for (const value of [base, { ...base, thresholdRatio: .5 }, { ...base, headroomTokens: 500 },
    { ...base, modelPolicies: [{ provider: 'p', model: 'm', headroomTokens: 450, retainTokens: 50 }] }]) {
    const ui = await mount({ value })
    const expected = resolveCompactSpec(resolveTargetPolicy(readConfig({ ...DEFAULTS, retainTokens: undefined, maxTokens: undefined, ...value }), { provider: 'p', model: 'm' }), 1000, 100)
    assert.equal(text(ui.by('draft-trigger')), expected.thresholdTokens + ' tokens')
    assert.equal(text(ui.by('draft-retain')), expected.retainTokens + ' tokens')
    assert.equal(text(ui.by('draft-message-budget')), '900 tokens')
    await ui.change('thresholdRatio', '60')
    assert.equal(ui.input('thresholdRatio').props.value, '60')
    assert.equal(ui.by('save-button').props.disabled, false)
    assert.ok(ui.requests.every(({ init }) => init.method === 'GET'))
    ui.dispose()
  }
})

test('save atomically switches retention forms, preserves untouched policies, and uses host revision', async () => {
  const policies = [{ provider: 'other', model: 'model', headroomTokens: 20 }]
  const ui = await mount({ value: { ...base, modelPolicies: policies } })
  await ui.change('retainMode', 'tokens')
  await ui.change('retainTokens', '80')
  await ui.click('save-button')
  assert.equal(ui.calls.length, 1)
  assert.equal(ui.calls[0].revision, 7)
  assert.equal(ui.value().retainTokens, 80)
  assert.equal(ui.value().retainRatio, undefined)
  assert.deepEqual(ui.value().modelPolicies, policies)
  assert.ok(!ui.calls[0].ops.some((op) => op.path[0] === 'modelPolicies'))
  assert.equal(ui.renderer.root.findAllByProps({ 'data-bc': 'save-footer' }).length, 0)
  assert.match(text(ui.by('save-saved')), /已保存/ )
  ui.dispose()
})

test('visual policy editor saves inheritance, empty summary override, and exact model identity', async () => {
  const ui = await mount({ value: base })
  await ui.click('add-policy')
  await ui.change('policies.0.provider', 'p')
  await ui.change('policies.0.model', 'm')
  await ui.change('policies.0.headroomTokens', '400')
  await ui.change('policies.0.retainMode', 'tokens')
  await ui.change('policies.0.retainTokens', '0')
  await ui.change('policies.0.summaryMode', 'session')
  await ui.click('save-button')
  assert.deepEqual(ui.value().modelPolicies, [{ provider: 'p', model: 'm', headroomTokens: 400, retainTokens: 0, summarizationProvider: '', summarizationModel: '' }])
  assert.equal(resolveTargetPolicy(readConfig(ui.value()), { provider: 'p', model: 'm' }).maxTokens, 400)
  ui.dispose()
})

test('native and automatic dependencies hide inapplicable controls without losing draft values; read-only blocks editing', async () => {
  const ui = await mount({ value: base })
  const count = (name) => ui.renderer.root.findAll((node) => typeof node.type === 'string' && node.props.name === name).length
  assert.equal(ui.renderer.root.findAllByProps({ 'data-bc': 'save-footer' }).length, 0)
  await act(async () => ui.renderer.root.findByProps({ 'data-mode': 'native' }).props.onClick())
  assert.equal(count('reasoningEffort'), 0)
  assert.equal(count('cachePriority'), 0)
  assert.equal(ui.input('summaryRoute').props.disabled, false)
  await ui.change('auto', false)
  for (const name of ['maxOverflowRetries', 'compactionRetries', 'thresholdRatio', 'retainMode']) assert.equal(count(name), 0)
  await ui.change('auto', true)
  assert.equal(ui.input('thresholdRatio').props.value, '80')
  assert.equal(ui.input('maxOverflowRetries').props.value, '1')
  ui.dispose()
  const locked = await mount({ value: base, writable: false })
  for (const node of locked.renderer.root.findAll((node) => node.type === 'input' || node.props.role === 'combobox' && node.props.name !== 'inspectSession')) assert.equal(node.props.disabled, true)
  assert.equal(locked.renderer.root.findAllByProps({ 'data-bc': 'save-footer' }).length, 0)
  assert.equal(locked.calls.length, 0)
  locked.dispose()
})

test('cross-field, implicit retention, safe integer, and effective budget boundaries block saving', async () => {
  for (const [field, value] of [['thresholdRatio', '10'], ['headroomTokens', '900'], ['retainRatio', '80'], ['retainTokens', '800'], ['compactionRetries', '9007199254740992']]) {
    const ui = await mount({ value: { ...base, retainRatio: undefined } })
    if (field === 'retainTokens') await ui.change('retainMode', 'tokens')
    await ui.change(field, value)
    assert.equal(ui.by('save-button').props.disabled, true, field)
    await ui.click('save-button')
    assert.equal(ui.calls.length, 0)
    ui.dispose()
  }
  const ui = await mount({ value: { ...base, modelPolicies: [{ provider: 'p', model: 'm', retainRatio: .3 }] } })
  await ui.change('thresholdRatio', '20')
  assert.equal(ui.by('save-button').props.disabled, true)
  assert.match(JSON.stringify(ui.renderer.toJSON()), /有效保留比例/)
  ui.dispose()
})

test('rejected saves retain edits and revision conflicts never mutate', async () => {
  const ui = await mount({ value: base, reject: true })
  await ui.change('thresholdRatio', '70')
  await ui.click('save-button')
  assert.equal(ui.input('thresholdRatio').props.value, '70')
  assert.match(JSON.stringify(ui.renderer.toJSON()), /宿主拒绝保存/)
  ui.replace({ status: 'ready', writable: true, revision: 8, value: { ...DEFAULTS, ...base, thresholdRatio: .6 } })
  assert.equal(ui.by('save-button').props.disabled, true)
  await ui.click('save-button')
  assert.equal(ui.calls.length, 1)
  ui.dispose()
})

test('diagnostic failure leaves valid settings editable and missing budgets unknown', async () => {
  const ui = await mount({ value: base, fetchError: true })
  await ui.change('thresholdRatio', '70')
  assert.equal(ui.by('save-button').props.disabled, false)
  assert.match(JSON.stringify(ui.renderer.toJSON()), /诊断读取失败/)
  assert.equal(ui.renderer.root.findAll((node) => node.props['data-bc'] === 'draft-budget').length, 0)
  ui.dispose()
})

test('runtime facts use actual retained tail and hide stale previews after refresh errors', async () => {
  const ui = await mount({ value: { ...base, retainRatio: undefined, retainTokens: 160, maxTokens: 50 }, preview: true })
  assert.match(text(ui.by('runtime-budget')), /模型窗口/)
  assert.match(text(ui.by('runtime-budget')), /当前上下文/)
  assert.match(text(ui.by('safe-cut')), /418 tokens/)
  assert.equal(ui.renderer.root.findAll((node) => node.props['data-bc'] === 'before-bar' || node.props['data-bc'] === 'after-bar').length, 0)
  ui.failRefresh()
  await act(async () => ui.renderer.root.findByProps({ 'aria-label': '刷新会话诊断' }).props.onClick())
  assert.equal(ui.renderer.root.findAll((node) => node.props['data-bc'] === 'safe-cut').length, 0)
  assert.match(JSON.stringify(ui.renderer.toJSON()), /诊断读取失败/)
  ui.dispose()
})

test('shared effort validates policy summary routes and followed conversation models', async () => {
  const routes = [{ provider: 'p', model: 'm', efforts: ['low', 'high'] }, { provider: 'q', model: 'n', efforts: ['low'] }]
  const ui = await mount({ value: { ...base, summarizationProvider: 'p', summarizationModel: 'm', reasoningEffort: 'high',
    modelPolicies: [{ provider: 'p', model: 'm', summarizationProvider: 'q', summarizationModel: 'n' }] }, routes })
  await ui.change('thresholdRatio', '70')
  assert.equal(ui.by('save-button').props.disabled, true)
  assert.match(JSON.stringify(ui.renderer.toJSON()), /q\/n 未声明支持强度/)
  await ui.change('reasoningEffort', 'low')
  assert.equal(ui.by('save-button').props.disabled, false)
  ui.dispose()
  const followed = await mount({ value: { ...base, reasoningEffort: 'unsupported' }, routes })
  await followed.change('thresholdRatio', '70')
  assert.equal(followed.by('save-button').props.disabled, true)
  followed.dispose()
})


test('zero headroom needs an explicit output cap and duplicate policies never save', async () => {
  const ui = await mount({ value: base })
  await ui.change('headroomTokens', '0')
  assert.equal(ui.by('save-button').props.disabled, true)
  await ui.change('maxTokens', '40')
  assert.equal(ui.by('save-button').props.disabled, false)
  await ui.click('save-button')
  assert.equal(ui.value().headroomTokens, 0)
  assert.equal(ui.value().maxTokens, 40)
  await ui.click('add-policy')
  await ui.change('policies.0.provider', 'p')
  await ui.change('policies.0.model', 'm')
  await ui.click('add-policy')
  await ui.change('policies.1.provider', 'p')
  await ui.change('policies.1.model', 'm')
  assert.equal(ui.by('save-button').props.disabled, true)
  assert.match(JSON.stringify(ui.renderer.toJSON()), /该模型已有覆盖规则/)
  ui.dispose()
  const inherited = await mount({ value: { ...base, maxTokens: 50, modelPolicies: [{ provider: 'p', model: 'm', headroomTokens: 0 }] } })
  await inherited.change('maxTokens', '')
  assert.equal(inherited.by('save-button').props.disabled, true)
  assert.match(JSON.stringify(inherited.renderer.toJSON()), /余量为 0 时须设置摘要输出上限/)
  inherited.dispose()
})


test('custom combobox previews with keyboard, commits on Enter, and consumes Escape before the host', async () => {
  const ui = await mount({ value: base })
  const page = () => ui.renderer.root.findByProps({ 'data-better-compact': 'page' })
  const key = async (value) => {
    const event = { key: value, defaultPrevented: false, stopped: false,
      preventDefault() { this.defaultPrevented = true }, stopPropagation() { this.stopped = true } }
    await act(async () => ui.input('summaryRoute').props.onKeyDown(event))
    return event
  }
  assert.equal(ui.input('summaryRoute').type, 'button')
  assert.equal(ui.input('summaryRoute').props['aria-expanded'], false)
  await key('ArrowDown')
  await key('End')
  const active = ui.input('summaryRoute').props['aria-activedescendant']
  const selectedOption = ui.renderer.root.findByProps({ id: active })
  assert.equal(selectedOption.props['data-value'], 'custom')
  assert.equal(page().props['data-settings-dirty'], false, 'highlighting does not change the draft')
  const escape = await key('Escape')
  assert.equal(escape.defaultPrevented, true)
  assert.equal(escape.stopped, true)
  assert.equal(ui.input('summaryRoute').props['aria-expanded'], false)
  assert.equal(ui.input('summaryRoute').props.value, '')
  await key('ArrowDown')
  await key('End')
  await key('ArrowUp')
  await key('Enter')
  assert.equal(ui.input('summaryRoute').props.value, JSON.stringify(['p', 'm']))
  assert.equal(ui.renderer.root.findAll((node) => typeof node.type === 'string' && node.props.name === 'summarizationProvider').length, 0)
  assert.equal(page().props['data-settings-dirty'], true)
  await key('Home')
  await key('Enter')
  assert.equal(page().props['data-settings-dirty'], false)
  assert.equal(ui.renderer.root.findAllByProps({ 'data-bc': 'save-footer' }).length, 0)
  ui.dispose()
})

test('draft guards expose pending save and clear only after the host accepts the saved snapshot', async () => {
  let finish
  const saveWait = new Promise((resolve) => { finish = resolve })
  const ui = await mount({ value: base, saveWait })
  const page = () => ui.renderer.root.findByProps({ 'data-better-compact': 'page' })
  assert.equal(page().props['data-settings-dirty'], false)
  await ui.change('thresholdRatio', '60')
  assert.equal(page().props['data-settings-dirty'], true)
  let pending
  await act(async () => { pending = ui.by('save-button').props.onClick() })
  assert.equal(page().props['data-settings-busy'], true)
  assert.equal(ui.by('save-button').props['aria-busy'], true)
  assert.equal(ui.by('save-button').props.disabled, true)
  await act(async () => { finish(); await pending })
  assert.equal(ui.calls.length, 1)
  assert.equal(page().props['data-settings-busy'], false)
  assert.equal(page().props['data-settings-dirty'], false)
  assert.equal(ui.renderer.root.findAllByProps({ 'data-bc': 'save-footer' }).length, 0)
  assert.match(text(ui.by('save-saved')), /已保存/)
  ui.dispose()
})

test('retention drafts survive mode switches without creating false dirty state or policy rewrites', async () => {
  const ui = await mount({ value: { ...base, modelPolicies: [{ provider: 'other', model: 'model', retainRatio: .2 }] } })
  const page = () => ui.renderer.root.findByProps({ 'data-better-compact': 'page' })
  await ui.change('retainMode', 'tokens')
  await ui.change('retainTokens', '80')
  await ui.change('retainMode', 'ratio')
  assert.equal(ui.input('retainRatio').props.value, '16')
  assert.equal(page().props['data-settings-dirty'], false)
  await ui.change('policies.0.retainMode', 'tokens')
  await ui.change('policies.0.retainTokens', '60')
  await ui.change('policies.0.retainMode', 'ratio')
  assert.equal(page().props['data-settings-dirty'], false)
  await ui.change('retainMode', 'tokens')
  assert.equal(ui.input('retainTokens').props.value, '80')
  await ui.click('save-button')
  assert.equal(page().props['data-settings-dirty'], false)
  assert.equal(ui.calls[0].ops.some((op) => op.path[0] === 'modelPolicies'), false)
  ui.dispose()
})

test('diagnostics and draft allocation stay separate, advanced summaries expose only nondefault settings, and help consumes Escape', async () => {
  const ui = await mount({ value: base, preview: true })
  const status = ui.by('diagnostics')
  assert.equal(status.props['data-bc-section'], 'diagnostics')
  assert.equal(status.findAll((node) => typeof node.type === 'string' && node.props.name).length, 0)
  assert.equal(ui.by('draft-budget').findAllByProps({ 'data-bc': 'runtime-trigger' }).length, 0)
  assert.equal(ui.renderer.root.findAllByProps({ 'data-bc': 'advanced-summary' }).length, 0)
  assert.equal(ui.by('advanced').props.open, undefined)
  const retries = await mount({ value: { ...base, compactionRetries: 2 }, preview: true })
  assert.match(text(retries.by('advanced-summary')), /压力(?:残留)?重试/)
  retries.dispose()
  const explain = ui.by('advanced')
  let focused = false
  const target = { open: true, querySelector: () => ({ focus: () => { focused = true } }) }
  const event = { key: 'Escape', currentTarget: target, defaultPrevented: false, stopped: false,
    preventDefault() { this.defaultPrevented = true }, stopPropagation() { this.stopped = true } }
  explain.props.onKeyDown(event)
  assert.equal(target.open, false)
  assert.equal(event.defaultPrevented, true)
  assert.equal(event.stopped, true)
  assert.equal(focused, true)
  ui.dispose()
  const defaults = await mount({ window: 200000 })
  assert.equal(defaults.renderer.root.findAllByProps({ 'data-bc': 'advanced-summary' }).length, 0)
  defaults.dispose()
})


test('process presentation preserves the client locale contract', async () => {
  const localized = source.includes('function bindLocale')
  const ui = await mount({ value: base, language: 'en' })
  const graph = text(ui.renderer.root.findByProps({ 'data-better-compact': 'page' }))
  assert.ok(graph.includes(localized ? 'Compaction' : '上下文压缩'))
  assert.ok(graph.includes(localized ? 'Capacity and trigger' : '容量与触发'))
  const aria = ui.renderer.root.findByProps({ 'data-mode': 'native' }).props['aria-label']
  assert.equal(aria.startsWith(localized ? 'Native' : '原生'), true)
  await act(async () => ui.renderer.root.findByProps({ 'data-mode': 'handoff' }).props.onClick())
  assert.ok(text(ui.renderer.root.findAllByProps({ 'data-mode-flow': 'handoff' })[0]).includes(localized ? 'Handoff body' : '交接正文'))
  assert.equal(ui.calls.length, 0)
  ui.dispose()
})
