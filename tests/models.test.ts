import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { apply, handleModels, INSPECT_PATH, MODELS_PATH } from '../src/index.ts'
import { collectModelRoutes } from '../src/models.ts'

/** Test seam: the handler only reads method/url/headers. */
type FakeRequest = IncomingMessage
/** Test seam: the handler only writes statusCode/headers/body. */
type FakeResponse = ServerResponse & { body: string; ended: boolean; headers: Record<string, any> }

function fakeRequest({ method = 'GET', url = MODELS_PATH }: { method?: string; url?: string } = {}): FakeRequest {
  return { method, url, headers: {} } as unknown as FakeRequest
}

/** Concrete response double; the handler only writes these fields. */
interface FakeResponseShape {
  statusCode: number
  headers: Record<string, any>
  body: string
  ended: boolean
  setHeader(name: string, value: unknown): void
  end(body?: string): void
}

function fakeResponse(): FakeResponse {
  const response: FakeResponseShape = {
    statusCode: 0,
    headers: {},
    body: '',
    ended: false,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value
    },
    end(body = '') {
      this.body = body
      this.ended = true
    },
  }
  return response as unknown as FakeResponse
}

const allowFence = { requestRejection: () => undefined }

interface CtxOptions {
  selection?: unknown
  llm?: unknown
  connection?: unknown
}

function ctxWith({ selection, llm, connection }: CtxOptions = {}) {
  const calls = { current: 0, resolveModelInfo: [] as unknown[] }
  return {
    calls,
    ctx: {
      get(name: string) {
        if (name === 'subagentModelSelection') {
          if (selection === undefined) return undefined
          return {
            current: () => {
              calls.current += 1
              return typeof selection === 'function' ? (selection as () => unknown)() : selection
            },
          }
        }
        if (name === 'llm') return llm
        if (name === 'connection') return connection
        return undefined
      },
    } as unknown as Context,
  }
}

test('models route is disabled without the host allowed-model service', async () => {
  const { ctx } = ctxWith()
  assert.deepEqual(await collectModelRoutes(ctx), { enabled: false, routes: [] })

  const broken = ctxWith({
    selection: () => {
      throw new Error('selection unavailable')
    },
  })
  assert.deepEqual(await collectModelRoutes(broken.ctx), { enabled: false, routes: [] })

  for (const malformed of [null, {}, { allowedModels: 'nope' }, { enabled: true }]) {
    const { ctx: malformedCtx } = ctxWith({ selection: malformed })
    assert.deepEqual(await collectModelRoutes(malformedCtx), { enabled: false, routes: [] })
  }
})

test('models route enriches allowed candidates with advertised efforts only', async () => {
  const selection = {
    enabled: true,
    allowedModels: [
      { provider: 'prov', model: 'good' },
      { provider: 'prov', model: 'no-metadata' },
      { provider: 'prov', model: 'good' },
      { provider: '', model: 'invalid' },
      'not-an-object',
    ],
  }
  const { ctx } = ctxWith({
    selection,
    llm: {
      resolveModelInfo: async (provider: string, model: string) => {
        if (model === 'no-metadata') throw new Error('no adapter model info')
        return {
          provider,
          id: model,
          reasoning: {
            efforts: [{ id: 'low' }, { id: 'high' }, { id: '' }, {}],
            defaultEffort: 'high',
          },
        }
      },
    },
  })
  assert.deepEqual(await collectModelRoutes(ctx), {
    enabled: true,
    routes: [
      { provider: 'prov', model: 'good', efforts: ['low', 'high'], defaultEffort: 'high' },
      { provider: 'prov', model: 'no-metadata', efforts: [], defaultEffort: '' },
    ],
  })
})

test('models route keeps candidates when capability metadata or the llm service is absent', async () => {
  const { ctx } = ctxWith({
    selection: { enabled: false, allowedModels: [{ provider: 'p', model: 'm' }] },
    llm: {
      resolveModelInfo: async () => ({
        reasoning: { efforts: [{ id: 'medium' }], defaultEffort: 'not-advertised' },
      }),
    },
  })
  assert.deepEqual(await collectModelRoutes(ctx), {
    enabled: false,
    routes: [{ provider: 'p', model: 'm', efforts: ['medium'], defaultEffort: '' }],
  })

  const noLlm = ctxWith({
    selection: { enabled: true, allowedModels: [{ provider: 'p', model: 'm' }] },
  })
  assert.deepEqual(await collectModelRoutes(noLlm.ctx), {
    enabled: true,
    routes: [{ provider: 'p', model: 'm', efforts: [], defaultEffort: '' }],
  })
})

test('models handler returns read-only JSON with no-store and ignores the query', async () => {
  const { ctx } = ctxWith({
    selection: { enabled: true, allowedModels: [{ provider: 'p', model: 'm' }] },
    llm: { resolveModelInfo: async () => ({ reasoning: { efforts: [{ id: 'low' }], defaultEffort: 'low' } }) },
    connection: allowFence,
  })
  const res = fakeResponse()
  await handleModels(ctx, fakeRequest({ url: `${MODELS_PATH}?ignored=1` }), res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.headers['cache-control'], 'no-store')
  assert.match(res.headers['content-type'], /application\/json/)
  assert.deepEqual(JSON.parse(res.body), {
    enabled: true,
    routes: [{ provider: 'p', model: 'm', efforts: ['low'], defaultEffort: 'low' }],
  })
})

test('models handler applies the host fence before any model work and is GET-only', async () => {
  for (const status of [401, 403]) {
    const { ctx, calls } = ctxWith({
      selection: { enabled: true, allowedModels: [{ provider: 'p', model: 'm' }] },
      llm: { resolveModelInfo: async () => assert.fail('fenced request must not resolve a model') },
      connection: { requestRejection: () => status },
    })
    const res = fakeResponse()
    await handleModels(ctx, fakeRequest({ method: 'POST' }), res)
    assert.equal(res.statusCode, status)
    assert.equal(res.body, '')
    assert.equal(res.headers['cache-control'], 'no-store')
    assert.equal(res.headers['content-type'], undefined)
    assert.equal(calls.current, 0)
  }

  const method = ctxWith({
    selection: { enabled: true, allowedModels: [] },
    connection: allowFence,
  })
  const res = fakeResponse()
  await handleModels(method.ctx, fakeRequest({ method: 'POST' }), res)
  assert.equal(res.statusCode, 405)
  assert.equal(res.headers.allow, 'GET')
  assert.equal(res.headers['cache-control'], 'no-store')
  assert.equal(method.calls.current, 0)
})

test('models handler fails closed when the connection fence disappears or throws', async () => {
  const missing = ctxWith({
    selection: { enabled: true, allowedModels: [{ provider: 'p', model: 'm' }] },
  })
  const res = fakeResponse()
  await handleModels(missing.ctx, fakeRequest(), res)
  assert.equal(res.statusCode, 503)
  assert.match(res.body, /MODELS_UNAVAILABLE/)
  assert.equal(res.headers['cache-control'], 'no-store')
  assert.equal(missing.calls.current, 0)

  const throwing = ctxWith({
    connection: {
      requestRejection: () => {
        throw new Error('fence exploded')
      },
    },
  })
  const thrown = fakeResponse()
  await handleModels(throwing.ctx, fakeRequest(), thrown)
  assert.equal(thrown.statusCode, 503)
  assert.match(thrown.body, /CONNECTION_FENCE_UNAVAILABLE/)
})

test('apply registers both read-only routes only when webserver and fence exist', () => {
  interface RegisteredRoute {
    readonly kind: string
    readonly path: string
    readonly handler: unknown
  }
  const registered: RegisteredRoute[] = []
  const warnings: string[] = []
  const makeCtx = (connection: unknown) => ({
    provide: () => undefined,
    inject(names: readonly string[], callback: (scope: unknown) => void) {
      if (names.includes('webServer')) {
        callback({
          webServer: {
            register: (route: RegisteredRoute) => {
              registered.push(route)
              return () => undefined
            },
          },
          connection,
          logger: { warn: (message: string) => warnings.push(message) },
          effect: (fn: () => void) => {
            fn()
          },
        })
      }
    },
    effect: (fn: () => void) => {
      fn()
    },
    logger: { warn: (message: string) => warnings.push(message) },
    fiber: {},
  })

  apply(makeCtx(undefined) as unknown as Context)
  assert.deepEqual(registered, [] as RegisteredRoute[])
  assert.ok(warnings.some((message) => /read-only API routes disabled/.test(message)))

  apply(makeCtx(allowFence) as unknown as Context)
  assert.deepEqual(
    registered.map((route) => ({ kind: route.kind, path: route.path })),
    [
      { kind: 'exact', path: INSPECT_PATH },
      { kind: 'exact', path: MODELS_PATH },
    ],
  )
  assert.deepEqual(
    registered.map((route) => typeof route.handler),
    ['function', 'function'],
  )
})
