/**
 * Draft, validation, and mutation tests for the settings page's pure logic.
 *
 * Table-driven: every case states the draft patch and the exact field list the
 * page must complain about. Messages are asserted against the Chinese
 * dictionary (the pre-bind fallback), so a copy change is caught here too.
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  DEFAULT_RETAIN_RATIO,
  POLICY_NUMBERS,
  buildOps,
  draftFromValue,
  equalDraft,
  policyDraft,
  policyValue,
  routeCandidateWarning,
  routeForDraft,
  validateDraft,
  validateModelSelection,
  type ConfigDraft,
  type PolicyDraft,
} from '../src/client/draft.ts'
import { zh } from '../src/client/locales/zh.ts'
import type { ModelRoute } from '../src/shared/contract.ts'

const dict = zh as Record<string, string>

/** Read one dictionary entry, failing loudly instead of comparing against undefined. */
function must(key: string): string {
  const value = dict[key]
  if (value === undefined) throw new Error('missing dictionary key: ' + key)
  return value
}

/** A draft the host schema accepts; every case patches this baseline. */
function baseDraft(patch: Partial<ConfigDraft> = {}): ConfigDraft {
  return {
    mode: 'native',
    customPrompt: '',
    provider: '',
    model: '',
    effort: '',
    thresholdRatio: '0.8',
    headroomTokens: '1000',
    retainMode: 'ratio',
    retainRatio: '0.16',
    retainTokens: '',
    cachePriority: false,
    summaryImage: false,
    auto: true,
    policies: [],
    maxTokens: '',
    compactionRetries: '1',
    maxOverflowRetries: '1',
    ...patch,
  }
}

/** A policy draft with every optional override left to inherit. */
function basePolicy(patch: Partial<PolicyDraft> = {}): PolicyDraft {
  return {
    provider: 'p',
    model: 'm',
    retainMode: 'inherit',
    retainRatio: '',
    retainTokens: '',
    summaryMode: 'inherit',
    summarizationProvider: '',
    summarizationModel: '',
    thresholdRatio: '',
    headroomTokens: '',
    maxTokens: '',
    compactionRetries: '',
    maxOverflowRetries: '',
    ...patch,
  }
}

/** The value {@link baseDraft} was loaded from: an untouched save writes nothing. */
const STORED = {
  mode: 'native',
  customPrompt: '',
  summarizationProvider: '',
  summarizationModel: '',
  reasoningEffort: '',
  thresholdRatio: 0.8,
  headroomTokens: 1000,
  retainRatio: 0.16,
  cachePriority: false,
  summaryImage: false,
  auto: true,
  compactionRetries: 1,
  maxOverflowRetries: 1,
  modelPolicies: [],
}

const ROUTES: ModelRoute[] = [
  { provider: 'p', model: 'm', efforts: ['low', 'high'], defaultEffort: 'low' },
  { provider: 'q', model: 'n', efforts: [], defaultEffort: 'low' },
]

/** Field order is the validation order, which the page renders top to bottom. */
const INVALID_CASES: [string, Partial<ConfigDraft>, string[]][] = [
  ['a valid draft has no errors', {}, []],
  ['an unknown mode', { mode: 'weird' }, ['mode']],
  ['a blank custom instruction', { mode: 'custom', customPrompt: '   ' }, ['customPrompt']],
  ['an over-long instruction', { customPrompt: 'x'.repeat(8001) }, ['customPrompt']],
  // A trigger the page cannot read also breaks the retention comparison.
  ['a missing trigger ratio', { thresholdRatio: '' }, ['thresholdRatio', 'retainRatio']],
  ['a trigger ratio of one', { thresholdRatio: '1' }, ['thresholdRatio']],
  ['a negative headroom', { headroomTokens: '-1' }, ['headroomTokens']],
  ['an empty token retention', { retainMode: 'tokens', retainTokens: '' }, ['retainTokens']],
  ['a retention ratio above the trigger', { retainRatio: '0.9' }, ['retainRatio']],
  ['half a summary route', { provider: 'p' }, ['summarizationModel']],
  ['a whitespace-only effort', { effort: '   ' }, ['reasoningEffort']],
  ['a zero summary cap', { maxTokens: '0' }, ['maxTokens']],
  ['no summary budget at all', { headroomTokens: '0' }, ['maxTokens']],
  ['an empty retry budget', { compactionRetries: '' }, ['compactionRetries']],
  [
    'a policy without an identity',
    { policies: [basePolicy({ provider: '', model: '' })] },
    ['policies.0.model'],
  ],
  [
    'a duplicated policy identity',
    { policies: [basePolicy(), basePolicy()] },
    ['policies.1.model'],
  ],
  [
    'a policy ratio out of range',
    { policies: [basePolicy({ thresholdRatio: '2' })] },
    ['policies.0.thresholdRatio'],
  ],
  [
    'a policy token retention without a value',
    { policies: [basePolicy({ retainMode: 'tokens' })] },
    ['policies.0.retainTokens'],
  ],
  [
    'a policy ratio above the inherited trigger',
    { policies: [basePolicy({ retainMode: 'ratio', retainRatio: '0.9' })] },
    ['policies.0.retainRatio'],
  ],
  [
    'a custom policy summary route without a model',
    { policies: [basePolicy({ summaryMode: 'custom' })] },
    ['policies.0.summarizationModel'],
  ],
  [
    'a policy without any summary budget',
    { headroomTokens: '0', policies: [basePolicy()] },
    ['maxTokens', 'policies.0.maxTokens'],
  ],
]

for (const [name, patch, fields] of INVALID_CASES) {
  test('validateDraft: ' + name, () => {
    const errors = validateDraft(baseDraft(patch))
    assert.deepEqual(errors.map((error) => error.field), fields)
    for (const error of errors) assert.ok(error.message.length > 0)
  })
}

test('validateDraft keys its messages to the dictionary', () => {
  assert.equal(validateDraft(baseDraft({ mode: 'weird' }))[0]?.message, dict.validationMode)
  assert.equal(
    validateDraft(baseDraft({ policies: [basePolicy(), basePolicy()] }))[0]?.message,
    dict.validationDuplicatePolicy,
  )
  assert.equal(
    validateDraft(baseDraft({ policies: [basePolicy({ thresholdRatio: '2' })] }))[0]?.message,
    must('threshold') + must('validationSuffixRatio'),
  )
  assert.equal(
    validateDraft(baseDraft({ policies: [basePolicy({ maxTokens: '0' })] }))[0]?.message,
    must('summaryOutputCap') + must('validationSuffixPositive'),
  )
})

test('validateDraft sizes the instruction against the shared character cap', () => {
  assert.deepEqual(validateDraft(baseDraft({ mode: 'custom', customPrompt: 'x'.repeat(8000) })), [])
  assert.deepEqual(validateDraft(baseDraft({ mode: 'custom', customPrompt: 'x'.repeat(8001) })), [
    { field: 'customPrompt', message: dict.processpromptTooLong },
  ])
})

test('DEFAULT_RETAIN_RATIO mirrors the host default', () => {
  assert.equal(DEFAULT_RETAIN_RATIO, 0.16)
})

test('POLICY_NUMBERS names one dictionary label per numeric policy field', () => {
  assert.deepEqual(POLICY_NUMBERS.map(([key]) => key), [
    'thresholdRatio',
    'headroomTokens',
    'maxTokens',
    'compactionRetries',
    'maxOverflowRetries',
  ])
  for (const [, labelKey] of POLICY_NUMBERS) assert.equal(typeof must(labelKey), 'string')
  assert.deepEqual(POLICY_NUMBERS.filter(([, , ratio]) => ratio === true).map(([key]) => key), ['thresholdRatio'])
})

test('equalDraft compares drafts and the retention form in use', () => {
  assert.equal(equalDraft(baseDraft(), baseDraft()), true)
  assert.equal(equalDraft(null, null), true)
  assert.equal(equalDraft(null, baseDraft()), false)
  assert.equal(equalDraft(baseDraft({ effort: 'low' }), baseDraft()), false)
  // The hidden retention value never marks the page dirty.
  assert.equal(equalDraft(baseDraft({ retainTokens: '999' }), baseDraft()), true)
  assert.equal(
    equalDraft(baseDraft({ retainMode: 'tokens', retainTokens: '5' }), baseDraft({ retainMode: 'tokens', retainTokens: '5' })),
    true,
  )
  assert.equal(
    equalDraft(baseDraft({ retainMode: 'tokens', retainTokens: '5' }), baseDraft({ retainMode: 'tokens', retainTokens: '6' })),
    false,
  )
  assert.equal(equalDraft(baseDraft({ policies: [basePolicy()] }), baseDraft()), false)
  // An inherited retention form is not part of the stored policy.
  assert.equal(
    equalDraft(baseDraft({ policies: [basePolicy({ retainRatio: '0.2' })] }), baseDraft({ policies: [basePolicy()] })),
    true,
  )
})

test('buildOps of an untouched draft rewrites only the retention form', () => {
  assert.deepEqual(buildOps(baseDraft(), STORED), [
    { op: 'unset', path: ['retainTokens'] },
    { op: 'set', path: ['retainRatio'], value: 0.16 },
  ])
})

const OP_CASES: [string, ConfigDraft, Record<string, unknown>, unknown[]][] = [
  [
    'a token retention',
    baseDraft({ retainMode: 'tokens', retainTokens: '2000' }),
    STORED,
    [
      { op: 'unset', path: ['retainRatio'] },
      { op: 'set', path: ['retainTokens'], value: 2000 },
    ],
  ],
  [
    'a cleared retention ratio',
    baseDraft({ retainRatio: '' }),
    { ...STORED, retainRatio: 0.16 },
    [
      { op: 'unset', path: ['retainTokens'] },
      { op: 'unset', path: ['retainRatio'] },
    ],
  ],
  [
    'an already clear retention ratio',
    baseDraft({ retainRatio: '' }),
    { ...STORED, retainRatio: undefined },
    [{ op: 'unset', path: ['retainTokens'] }],
  ],
  [
    'a mode change',
    baseDraft({ mode: 'goal' }),
    STORED,
    [
      { op: 'set', path: ['mode'], value: 'goal' },
      { op: 'unset', path: ['retainTokens'] },
      { op: 'set', path: ['retainRatio'], value: 0.16 },
    ],
  ],
  [
    'a summary image toggle',
    baseDraft({ summaryImage: true }),
    STORED,
    [
      { op: 'unset', path: ['retainTokens'] },
      { op: 'set', path: ['retainRatio'], value: 0.16 },
      { op: 'set', path: ['summaryImage'], value: true },
    ],
  ],
  [
    'a summary route pair',
    baseDraft({ provider: 'p', model: 'm' }),
    STORED,
    [
      { op: 'set', path: ['summarizationProvider'], value: 'p' },
      { op: 'set', path: ['summarizationModel'], value: 'm' },
      { op: 'unset', path: ['retainTokens'] },
      { op: 'set', path: ['retainRatio'], value: 0.16 },
    ],
  ],
  [
    'a cleared summary cap',
    baseDraft(),
    { ...STORED, maxTokens: 500 },
    [
      { op: 'unset', path: ['retainTokens'] },
      { op: 'set', path: ['retainRatio'], value: 0.16 },
      { op: 'unset', path: ['maxTokens'] },
    ],
  ],
  [
    'a model policy list',
    baseDraft({ policies: [basePolicy({ retainMode: 'tokens', retainTokens: '800' })] }),
    STORED,
    [
      { op: 'unset', path: ['retainTokens'] },
      { op: 'set', path: ['retainRatio'], value: 0.16 },
      { op: 'set', path: ['modelPolicies'], value: [{ provider: 'p', model: 'm', retainTokens: 800 }] },
    ],
  ],
  [
    'an unchanged model policy list',
    baseDraft({ policies: [basePolicy()] }),
    { ...STORED, modelPolicies: [{ provider: 'p', model: 'm' }] },
    [
      { op: 'unset', path: ['retainTokens'] },
      { op: 'set', path: ['retainRatio'], value: 0.16 },
    ],
  ],
]

for (const [name, draft, stored, ops] of OP_CASES) {
  test('buildOps: ' + name, () => {
    assert.deepEqual(buildOps(draft, stored), ops)
  })
}

test('buildOps tolerates a missing or non-object stored value', () => {
  assert.deepEqual(buildOps(baseDraft(), null), [
    { op: 'set', path: ['mode'], value: 'native' },
    { op: 'set', path: ['thresholdRatio'], value: 0.8 },
    { op: 'set', path: ['headroomTokens'], value: 1000 },
    { op: 'unset', path: ['retainTokens'] },
    { op: 'set', path: ['retainRatio'], value: 0.16 },
    { op: 'set', path: ['cachePriority'], value: false },
    { op: 'set', path: ['summaryImage'], value: false },
    { op: 'set', path: ['auto'], value: true },
    { op: 'set', path: ['compactionRetries'], value: 1 },
    { op: 'set', path: ['maxOverflowRetries'], value: 1 },
  ])
  assert.deepEqual(buildOps(baseDraft(), 'nonsense'), buildOps(baseDraft(), null))
})

test('policyDraft derives the retention and summary forms it found', () => {
  assert.deepEqual(policyDraft({ provider: 'p', model: 'm' }), basePolicy())
  assert.equal(policyDraft({ retainTokens: 1000 }).retainMode, 'tokens')
  assert.equal(policyDraft({ retainTokens: 1000 }).retainTokens, '1000')
  assert.equal(policyDraft({ retainRatio: 0.2 }).retainMode, 'ratio')
  assert.equal(policyDraft({ retainRatio: 0.2 }).retainRatio, '0.2')
  assert.equal(policyDraft({ summarizationProvider: '' }).summaryMode, 'session')
  assert.equal(policyDraft({ summarizationProvider: 'q', summarizationModel: 'n' }).summaryMode, 'custom')
  assert.equal(policyDraft({ thresholdRatio: 0.7 }).thresholdRatio, '0.7')
  assert.deepEqual(policyDraft(undefined), basePolicy({ provider: '', model: '' }))
})

test('policyValue writes only the fields the policy actually overrides', () => {
  assert.deepEqual(policyValue(basePolicy()), { provider: 'p', model: 'm' })
  assert.deepEqual(policyValue(basePolicy({ retainMode: 'tokens', retainTokens: '800', retainRatio: '0.2' })), {
    provider: 'p',
    model: 'm',
    retainTokens: 800,
  })
  assert.deepEqual(policyValue(basePolicy({ thresholdRatio: '0.5', summaryMode: 'session' })), {
    provider: 'p',
    model: 'm',
    thresholdRatio: 0.5,
    summarizationProvider: '',
    summarizationModel: '',
  })
  assert.deepEqual(policyValue(basePolicy({ summaryMode: 'custom', summarizationProvider: 'q', summarizationModel: 'n' })), {
    provider: 'p',
    model: 'm',
    summarizationProvider: 'q',
    summarizationModel: 'n',
  })
})

test('draftFromValue normalizes a stored value into string fields', () => {
  const draft = draftFromValue({
    mode: 'handoff',
    customPrompt: 'do it',
    summarizationProvider: 'p',
    summarizationModel: 'm',
    reasoningEffort: 'high',
    thresholdRatio: 0.75,
    headroomTokens: 900,
    retainTokens: 1500,
    cachePriority: true,
    auto: false,
    maxTokens: 200,
    compactionRetries: 2,
    maxOverflowRetries: 3,
    modelPolicies: [{ provider: 'q', model: 'n', retainRatio: 0.1 }],
  })
  assert.deepEqual(draft, {
    mode: 'handoff',
    customPrompt: 'do it',
    provider: 'p',
    model: 'm',
    effort: 'high',
    thresholdRatio: '0.75',
    headroomTokens: '900',
    retainMode: 'tokens',
    retainRatio: '',
    retainTokens: '1500',
    cachePriority: true,
    summaryImage: false,
    auto: false,
    policies: [basePolicy({ provider: 'q', model: 'n', retainMode: 'ratio', retainRatio: '0.1' })],
    maxTokens: '200',
    compactionRetries: '2',
    maxOverflowRetries: '3',
  })
  assert.deepEqual(draftFromValue(null), baseDraft({
    mode: '',
    thresholdRatio: '',
    headroomTokens: '',
    retainRatio: '',
    auto: false,
    compactionRetries: '',
    maxOverflowRetries: '',
  }))
})

test('validateModelSelection only reports an advertised-effort mismatch', () => {
  const routed = baseDraft({ mode: 'goal', provider: 'p', model: 'm', effort: 'low' })
  assert.deepEqual(validateModelSelection(routed, ROUTES, true), [])
  assert.deepEqual(validateModelSelection(baseDraft({ mode: 'native', provider: 'p', model: 'm', effort: 'low' }), ROUTES, true), [])
  assert.deepEqual(validateModelSelection(baseDraft({ provider: 'p', model: 'm', effort: '' }), ROUTES, true), [])
  assert.deepEqual(validateModelSelection(routed, ROUTES, false), [])
  const unsupported = validateModelSelection(baseDraft({ mode: 'goal', provider: 'q', model: 'n', effort: 'low' }), ROUTES, true)
  assert.deepEqual(unsupported.map((error) => error.field), ['reasoningEffort'])
  assert.ok(unsupported[0]?.message.includes('q'))
  assert.ok(unsupported[0]?.message.includes('low'))
})

test('validateModelSelection follows a policy route and the inspected target', () => {
  const draft = baseDraft({
    mode: 'goal',
    effort: 'high',
    policies: [basePolicy({ summaryMode: 'custom', summarizationProvider: 'q', summarizationModel: 'n' })],
  })
  assert.deepEqual(validateModelSelection(draft, ROUTES, true).map((error) => error.field), ['policies.0.summarizationModel'])
  assert.deepEqual(
    validateModelSelection(baseDraft({ mode: 'goal', effort: 'high' }), ROUTES, true, { provider: 'q', model: 'n' }).map((error) => error.field),
    ['reasoningEffort'],
  )
  assert.deepEqual(
    validateModelSelection(baseDraft({ mode: 'goal', effort: 'high' }), ROUTES, true, { provider: 'p', model: 'm' }),
    [],
  )
  // A policy that already covers the inspected target is not checked twice.
  assert.deepEqual(
    validateModelSelection(baseDraft({ mode: 'goal', effort: 'high', policies: [basePolicy()] }), ROUTES, true, { provider: 'p', model: 'm' }),
    [],
  )
})

test('routeCandidateWarning and routeForDraft agree on the catalog', () => {
  const routed = baseDraft({ provider: 'p', model: 'm' })
  assert.equal(routeForDraft(routed, ROUTES), ROUTES[0])
  assert.equal(routeForDraft(baseDraft({ provider: 'x', model: 'y' }), ROUTES), undefined)
  assert.equal(routeCandidateWarning(routed, ROUTES, true), null)
  assert.equal(routeCandidateWarning(baseDraft({ provider: 'x', model: 'y' }), ROUTES, true), must('routeWarning').replace('{provider}', 'x').replace('{model}', 'y'))
  assert.equal(routeCandidateWarning(routed, ROUTES, false), null)
  assert.equal(routeCandidateWarning(baseDraft(), ROUTES, true), null)
})
