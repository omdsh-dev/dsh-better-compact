import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { handleFont } from '../src/index.ts'
import type { FontStore } from '../src/index.ts'
import { FontInstallError } from '../src/font.ts'
import type { FontStatusPayload } from '../src/shared/contract.ts'

/** One fake incoming request: JSON headers plus an optional chunked body. */
interface FakeRequest {
  method: string
  url: string
  headers: Record<string, string>
  chunks: Buffer[]
  [Symbol.asyncIterator](): AsyncIterator<Buffer>
}

/**
 * Build one request.
 * @param method - HTTP method.
 * @param options - headers and a body split into the given chunks.
 * @returns the fake request.
 */
function request(
  method: string,
  options: { headers?: Record<string, string>; chunks?: readonly string[] } = {},
): FakeRequest {
  const chunks = (options.chunks ?? []).map((chunk) => Buffer.from(chunk, 'utf8'))
  return {
    method,
    url: '/better-compact/api/font',
    headers: options.headers ?? {},
    chunks,
    async *[Symbol.asyncIterator](): AsyncIterator<Buffer> {
      for (const chunk of chunks) yield chunk
    },
  }
}

/** One recorded response. */
interface FakeResponse {
  statusCode: number
  headers: Record<string, string>
  body: string
  setHeader(name: string, value: string): void
  end(chunk?: string): void
}

/** Build one recording response. */
function response(): FakeResponse {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(name: string, value: string) {
      this.headers[name.toLowerCase()] = String(value)
    },
    end(chunk?: string) {
      this.body = chunk ?? ''
    },
  }
}

const STATUS: FontStatusPayload = {
  installed: false,
  package: '@betteroffice/fonts-cjk',
  version: '0.4.2',
  family: 'Noto Sans SC',
  bytes: null,
  archiveBytes: 29697320,
  source: null,
  downloadedAt: null,
}

/** A store that records what the route asked for. */
function fakeStore(overrides: Partial<FontStore> = {}): {
  store: FontStore
  installs: { force: boolean }[]
  statusCalls: number
} {
  const installs: { force: boolean }[] = []
  const recorder = { statusCalls: 0 }
  const store: FontStore = {
    status: async () => {
      recorder.statusCalls += 1
      return STATUS
    },
    install: async (options) => {
      installs.push({ force: options.force })
      return { ...STATUS, installed: true, bytes: 8331336, source: 'https://registry.npmjs.org' }
    },
    ...overrides,
  }
  return {
    store,
    installs,
    get statusCalls() {
      return recorder.statusCalls
    },
  }
}

/** A context whose connection fence accepts every request. */
function trustedContext(): Context {
  return {
    get: (name: string) => (name === 'connection' ? { admit: () => ({ peer: {} }) } : undefined),
  } as unknown as Context
}

/**
 * Drive the handler and return what it wrote.
 * @param options - request pieces, store and context.
 * @returns the fake request and response.
 */
async function invoke(options: {
  method: string
  headers?: Record<string, string>
  chunks?: readonly string[]
  store?: FontStore
  ctx?: Context
}): Promise<{ req: FakeRequest; res: FakeResponse }> {
  const req = request(options.method, { headers: options.headers, chunks: options.chunks })
  const res = response()
  await handleFont(
    options.ctx ?? trustedContext(),
    options.store ?? fakeStore().store,
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
  )
  return { req, res }
}

test('GET reports the font status and is never cacheable', async () => {
  const facade = fakeStore()
  const { res } = await invoke({ method: 'GET', store: facade.store })
  assert.equal(res.statusCode, 200)
  assert.equal(res.headers['cache-control'], 'no-store')
  assert.equal(res.headers['content-type'], 'application/json; charset=utf-8')
  assert.deepEqual(JSON.parse(res.body), STATUS)
  assert.equal(facade.statusCalls, 1)
})

test('POST installs with force when the body asks for it', async () => {
  const facade = fakeStore()
  const { res } = await invoke({
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    chunks: ['{"force":', 'true}'],
    store: facade.store,
  })
  assert.equal(res.statusCode, 200)
  assert.deepEqual(facade.installs, [{ force: true }])
  assert.equal(JSON.parse(res.body).installed, true)
})

test('POST without a body installs without force', async () => {
  const facade = fakeStore()
  const { res } = await invoke({
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    store: facade.store,
  })
  assert.equal(res.statusCode, 200)
  assert.deepEqual(facade.installs, [{ force: false }])
})

test('rejects every other method and advertises the allowed pair', async () => {
  const facade = fakeStore()
  const { res } = await invoke({ method: 'PUT', store: facade.store })
  assert.equal(res.statusCode, 405)
  assert.equal(res.headers.allow, 'GET, POST')
  assert.equal(facade.installs.length, 0)
})

test('requires a JSON content type on the install path', async () => {
  const facade = fakeStore()
  const { res } = await invoke({ method: 'POST', headers: { 'content-type': 'text/plain' }, store: facade.store })
  assert.equal(res.statusCode, 415)
  assert.equal(JSON.parse(res.body).code, 'UNSUPPORTED_MEDIA_TYPE')
  assert.equal(facade.installs.length, 0)
})

test('applies the host fence before any work', async () => {
  const facade = fakeStore()
  const rejecting = {
    get: (name: string) => (name === 'connection' ? { admit: () => ({ rejection: 403 }) } : undefined),
  } as unknown as Context
  const { res } = await invoke({ method: 'POST', headers: { 'content-type': 'application/json' }, ctx: rejecting, store: facade.store })
  assert.equal(res.statusCode, 403)
  assert.equal(facade.installs.length, 0)
})

test('fails closed when the connection fence is missing or broken', async () => {
  const missing = { get: () => undefined } as unknown as Context
  const missingRes = (await invoke({ method: 'GET', ctx: missing })).res
  assert.equal(missingRes.statusCode, 503)
  assert.equal(JSON.parse(missingRes.body).code, 'FONT_UNAVAILABLE')

  const throwing = {
    get: (name: string) => (name === 'connection' ? { admit: () => { throw new Error('fence down') } } : undefined),
  } as unknown as Context
  const throwingRes = (await invoke({ method: 'GET', ctx: throwing })).res
  assert.equal(throwingRes.statusCode, 503)
  assert.equal(JSON.parse(throwingRes.body).code, 'CONNECTION_FENCE_UNAVAILABLE')
})

test('rejects a body over the size cap', async () => {
  const facade = fakeStore()
  const { res } = await invoke({
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    chunks: ['x'.repeat(65 * 1024)],
    store: facade.store,
  })
  assert.equal(res.statusCode, 413)
  assert.equal(JSON.parse(res.body).code, 'BODY_TOO_LARGE')
  assert.equal(facade.installs.length, 0)
})

test('rejects invalid JSON, unknown fields and non-boolean force', async () => {
  const headers = { 'content-type': 'application/json' }
  const invalid = await invoke({ method: 'POST', headers, chunks: ['{'], store: fakeStore().store })
  assert.equal(invalid.res.statusCode, 400)
  assert.equal(JSON.parse(invalid.res.body).code, 'INVALID_BODY')

  const unknown = await invoke({ method: 'POST', headers, chunks: ['{"url":"http://elsewhere"}'], store: fakeStore().store })
  assert.equal(unknown.res.statusCode, 400)
  assert.match(JSON.parse(unknown.res.body).message, /unknown field/)

  const notBoolean = await invoke({ method: 'POST', headers, chunks: ['{"force":"yes"}'], store: fakeStore().store })
  assert.equal(notBoolean.res.statusCode, 400)
  assert.match(JSON.parse(notBoolean.res.body).message, /boolean/)
})

test('maps an install failure to 502 with its stable code', async () => {
  const store: FontStore = {
    status: async () => STATUS,
    install: async () => {
      throw new FontInstallError('FONT_DOWNLOAD_FAILED', 'both registries are unreachable')
    },
  }
  const { res } = await invoke({ method: 'POST', headers: { 'content-type': 'application/json' }, store })
  assert.equal(res.statusCode, 502)
  assert.deepEqual(JSON.parse(res.body), { code: 'FONT_DOWNLOAD_FAILED', message: 'both registries are unreachable' })
})
