/**
 * Client-side consumption of the read-only inspect payload.
 *
 * The pre-TypeScript suite carried no client half (its assertions were all host
 * budget arithmetic), so this file pins the mapping the settings page owns:
 * engine ownership, unknown budgets, the last-compaction record, and the safe-cut
 * preview. Payloads are hand-written shared-contract shapes, not host imports.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import React from 'react'

// jsdom ships no type declarations here; the computed specifier keeps it untyped.
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
setGlobal('IS_REACT_ACT_ENVIRONMENT', true)
;(dom.window.Element.prototype as any).scrollIntoView = function scrollIntoView(): void {}

const { render, act } = await import('@testing-library/react')
const { BetterCompactConfigEntry } = await import('../src/client/index.tsx')

const value = {
  mode: 'goal',
  auto: true,
  thresholdRatio: 0.8,
  headroomTokens: 100,
  retainRatio: 0.16,
  retainTokens: undefined,
  maxTokens: 50,
  summarizationProvider: '',
  summarizationModel: '',
  reasoningEffort: '',
  customPrompt: '',
  cachePriority: false,
  compactionRetries: 1,
  maxOverflowRetries: 1,
  modelPolicies: [],
}

const budget = {
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
}

const payload = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  activeConfig: { ...value, retainTokens: null },
  requiresReload: false,
  sessionId: 's1',
  engine: { owner: 'host', inspectApplies: true, reason: null },
  diagnostics: [],
  budget,
  preview: {
    beforeTokens: 600,
    afterUpperBoundTokens: 300,
    retainedTokens: 250,
    replacedTokens: 300,
    rangeStart: 1,
    rangeEnd: 2,
    reason: null,
  },
  lastCompaction: null,
  handoffContinuation: null,
  ...over,
})

async function mount(inspect: Record<string, unknown>) {
  setGlobal('fetch', async (path: string) => ({
    ok: true,
    status: 200,
    json: async () => (path.indexOf('/models') >= 0 ? { enabled: true, routes: [] } : inspect),
  }))
  const list = { ids: ['s1'], byId: { s1: { displayTitle: 'Session' } }, phase: 'ready', projectionsBySession: {} }
  const sessions = { list: { subscribe: () => () => undefined, getSnapshot: () => list } }
  const state = { status: 'ready', writable: true, revision: 7, value }
  const utils = render(React.createElement(BetterCompactConfigEntry, { form: { state, mutate: async () => true }, sessions } as any))
  await act(async () => { await Promise.resolve() })
  const container = utils.container
  const by = (name: string): HTMLElement => container.querySelector('[data-bc="' + name + '"]') as HTMLElement
  const countBy = (name: string): number => container.querySelectorAll('[data-bc="' + name + '"]').length
  const text = (node: Element | null): string => (node === null ? '' : node.textContent ?? '')
  return { container, by, countBy, text, dispose: () => utils.unmount() }
}

test('a foreign engine hides every budget and preview while keeping the real record', async () => {
  const ui = await mount(payload({
    engine: { owner: 'foreign-preset', inspectApplies: false, reason: 'another engine owns this session' },
    lastCompaction: { id: 'c9', trigger: 'automatic', status: 'completed', mode: 'native', beforeTokens: 700, afterTokens: 120, durationMs: 800, cacheReadTokens: null, cacheWriteTokens: null, error: null },
  }))
  assert.match(ui.text(ui.by('engine-note')), /此会话使用其他压缩引擎（foreign-preset）/)
  assert.equal(ui.countBy('runtime-budget'), 0, 'no runtime budget for a foreign engine')
  assert.equal(ui.countBy('draft-budget'), 0, 'no draft budget for a foreign engine')
  assert.equal(ui.countBy('capacity-bar'), 1)
  assert.match(ui.text(ui.by('budget-incomplete')), /选择会话后可读取当前用量/)
  assert.match(ui.text(ui.by('last-compaction')), /已完成 · 自动/)
  assert.match(ui.text(ui.by('last-compaction')), /700 tokens/)
  ui.dispose()
})

test('an unknown model capacity keeps the draft budget unavailable instead of inventing numbers', async () => {
  const ui = await mount(payload({
    budget: { ...budget, contextWindow: null, ratioThresholdTokens: null, thresholdTokens: null, retainTokens: null, currentTokens: null, measurement: 'unavailable' },
    preview: { beforeTokens: null, afterUpperBoundTokens: null, retainedTokens: undefined, replacedTokens: undefined, rangeStart: null, rangeEnd: null, reason: null },
  }))
  assert.equal(ui.countBy('draft-budget'), 0)
  assert.equal(ui.countBy('draft-trigger'), 0)
  assert.equal(ui.countBy('draft-retain'), 0)
  assert.match(ui.text(ui.by('budget-incomplete')), /选择会话后可读取当前用量/)
  assert.match(ui.text(ui.by('runtime-budget')), /用量未知/)
  assert.match(ui.text(ui.by('measurement')), /用量未知/)
  assert.match(ui.text(ui.by('no-safe-cut')), /当前无安全压缩选区/)
  ui.dispose()
})

test('the last compaction record renders each measured field and the persistence failure', async () => {
  const ui = await mount(payload({
    lastCompaction: { id: 'c1', trigger: 'manual', status: 'completed', mode: 'handoff', beforeTokens: 600, afterTokens: 200, durationMs: 1234, cacheReadTokens: 10, cacheWriteTokens: 20, error: null },
  }))
  const record = ui.by('last-compaction')
  assert.equal(record.getAttribute('data-status'), 'completed')
  assert.match(ui.text(record), /已完成 · 手动/)
  const rows = Array.from(record.querySelectorAll('.dsh-bc-row')).map((row) => row.textContent)
  assert.ok(rows.some((row) => String(row).includes('1.2 s')), 'duration is rendered')
  assert.ok(rows.some((row) => String(row).includes('文件交接')), 'strategy is localized')
  assert.ok(rows.some((row) => String(row).includes('600 tokens')), 'replaced messages are rendered')
  assert.ok(rows.some((row) => String(row).includes('200 tokens')), 'summary estimate is rendered')
  assert.equal(ui.countBy('persistence-error'), 0)
  ui.dispose()

  const failed = await mount(payload({
    lastCompaction: { id: 'c2', trigger: 'automatic', status: 'persistence-error', mode: 'goal', beforeTokens: 500, afterTokens: null, durationMs: 900, cacheReadTokens: null, cacheWriteTokens: null, error: 'disk full' },
  }))
  assert.match(failed.text(failed.by('persistence-error')), /摘要可能已写入，但会话保存失败/)
  assert.match(failed.text(failed.by('last-compaction')), /disk full/)
  failed.dispose()
})

test('the safe cut renders the inspected range and upper bound, and disappears without one', async () => {
  const ui = await mount(payload())
  assert.match(ui.text(ui.by('safe-cut')), /选区 1–2/)
  assert.match(ui.text(ui.by('safe-cut')), /压缩前 600 tokens/)
  assert.match(ui.text(ui.by('safe-cut')), /上界 ≤ 300 tokens/)
  assert.match(ui.text(ui.by('runtime-budget')), /距离自动压缩还有 230 tokens/)
  assert.equal(ui.countBy('runtime-preview'), 1)
  ui.dispose()

  const none = await mount(payload({
    preview: { beforeTokens: 600, afterUpperBoundTokens: null, retainedTokens: undefined, replacedTokens: undefined, rangeStart: null, rangeEnd: null, reason: null },
  }))
  assert.equal(none.countBy('safe-cut'), 0)
  assert.match(none.text(none.by('no-safe-cut')), /当前无安全压缩选区/)
  assert.equal(none.countBy('runtime-preview'), 1)
  none.dispose()
})