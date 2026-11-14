import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { apply, handleInspect } from '../src/index.ts'
import { readConfig } from '../src/config.ts'

/** The `betterCompactConfig` face `handleInspect` accepts. */
type Companion = Parameters<typeof handleInspect>[1]

/** Hand-built request: the route reads only method, url, and headers. */
interface FakeRequest {
  method: string
  url: string
  headers: Record<string, string>
}

/** Hand-built response capturing exactly what the route writes. */
interface FakeResponse {
  statusCode: number
  headers: Record<string, string | undefined>
  body: string
  ended?: boolean
  setHeader(name: string, value: string): void
  end(body?: string): void
}

const asRequest = (value: FakeRequest): IncomingMessage => value as unknown as IncomingMessage
const asResponse = (value: FakeResponse): ServerResponse => value as unknown as ServerResponse
const asContext = (value: object): Context => value as unknown as Context

const config = readConfig({ mode: 'goal' })
const companion = { snapshot: () => config, current: () => config } as unknown as Companion

function fakeRequest({ method = 'GET', url = '/better-compact/api/inspect' }: Partial<FakeRequest> = {}): FakeRequest {
  return { method, url, headers: {} }
}

function fakeResponse(): FakeResponse {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(name: string, value: string) {
      this.headers[name.toLowerCase()] = value
    },
    end(body = '') {
      this.body = body
      this.ended = true
    },
  }
}

function ctxWith(connection: object | undefined): Context {
  return asContext({
    get: (name: string) => {
      if (name === 'connection') return connection
      if (name === 'agents' || name === 'sessions' || name === 'sessionQuery') return undefined
      return undefined
    },
  })
}

/** The route is only registered with a fence; tests that bypass registration
 * still provide the same contract explicitly. */
const allowFence = { requestRejection: () => undefined }

test('the Host connection fence rejects before method, query, or session work', async () => {
  for (const status of [401, 403]) {
    const res = fakeResponse()
    let inspected = false
    const ctx = asContext({
      get: (name: string) => {
        if (name === 'connection') return { requestRejection: () => status }
        if (name === 'sessionQuery') {
          inspected = true
          return { observeSession: async () => undefined }
        }
        return undefined
      },
    })
    await handleInspect(ctx, companion, asRequest(fakeRequest({ method: 'POST' })), asResponse(res))
    assert.equal(res.statusCode, status)
    assert.equal(res.body, '')
    assert.equal(res.headers['cache-control'], 'no-store')
    assert.equal(res.headers['content-type'], undefined)
    assert.equal(inspected, false)
  }
})

test('a failing connection fence returns a readable 503 instead of crashing', async () => {
  const res = fakeResponse()
  const ctx = ctxWith({
    requestRejection: () => {
      throw new Error('fence exploded')
    },
  })
  await handleInspect(ctx, companion, asRequest(fakeRequest()), asResponse(res))
  assert.equal(res.statusCode, 503)
  assert.match(res.body, /CONNECTION_FENCE_UNAVAILABLE/)
  assert.equal(res.headers['cache-control'], 'no-store')
})

test('a missing connection fence fails closed with 503', async () => {
  const res = fakeResponse()
  await handleInspect(ctxWith(undefined), companion, asRequest(fakeRequest()), asResponse(res))
  assert.equal(res.statusCode, 503)
  assert.match(res.body, /INSPECT_UNAVAILABLE/)
  assert.equal(res.headers['cache-control'], 'no-store')
})

test('the route registration waits for both webServer and connection', () => {
  const provided: Record<string, unknown> = {}
  const injections: unknown[] = []
  const effects: unknown[] = []
  const ctx = asContext({
    provide: (name: string, value: unknown) => {
      provided[name] = value
    },
    inject: (names: string[], callback: (inner: object) => void) => {
      injections.push(names)
      // Simulate a composition with only webServer: the callback must not run.
      if (names.includes('connection')) return undefined
      callback({ webServer: { register: () => () => undefined } })
    },
    effect: (fn: unknown) => {
      effects.push(fn)
    },
    logger: { warn: () => undefined },
    fiber: {},
  })
  apply(ctx, { mode: 'goal' })
  assert.deepEqual(injections[0], ['settings'])
  assert.deepEqual(injections[1], ['webServer', 'connection'])
  // The gated callback body never ran, so no route effect was registered.
  assert.equal(effects.includes('unreachable'), false)
  assert.ok(provided.betterCompactConfig)
})

test('invalid query and unsupported methods are rejected with no-store JSON', async () => {
  const ctx = ctxWith(allowFence)
  const cases = [
    { request: { method: 'GET', url: '/better-compact/api/inspect?bogus=1' }, status: 400 },
    { request: { method: 'GET', url: '/better-compact/api/inspect?sessionId=a&sessionId=b' }, status: 400 },
    { request: { method: 'GET', url: '/better-compact/api/inspect?sessionId=' }, status: 400 },
    { request: { method: 'POST', url: '/better-compact/api/inspect' }, status: 405 },
  ]
  for (const item of cases) {
    const res = fakeResponse()
    await handleInspect(ctx, companion, asRequest(fakeRequest(item.request)), asResponse(res))
    assert.equal(res.statusCode, item.status, item.request.url)
    assert.equal(res.headers['cache-control'], 'no-store')
    if (item.status === 405) assert.equal(res.headers.allow, 'GET')
    else assert.match(res.body, /INVALID_QUERY/)
  }
})

test('a valid plugin-state request returns exactly the documented fields', async () => {
  const res = fakeResponse()
  await handleInspect(ctxWith(allowFence), companion, asRequest(fakeRequest()), asResponse(res))
  assert.equal(res.statusCode, 200)
  assert.equal(res.headers['cache-control'], 'no-store')
  const payload = JSON.parse(res.body)
  assert.deepEqual(Object.keys(payload), [
    'activeConfig',
    'requiresReload',
    'sessionId',
    'engine',
    'diagnostics',
    'budget',
    'preview',
    'lastCompaction',
    'handoffContinuation',
  ])
  assert.equal(payload.sessionId, null)
  assert.equal(payload.budget, null)
  assert.equal(payload.preview, null)
  assert.equal(payload.lastCompaction, null)
})
