import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { gzipSync } from 'node:zlib'
import {
  FONT_ARTIFACT,
  FONT_META,
  FontInstallError,
  fontFilePath,
  fontStatus,
  installFont,
  requireFontPath,
} from '../src/font.ts'
import type { FontArtifact } from '../src/font.ts'

/** Bytes the synthetic artifact ships; content never matters, hashes do. */
const FIXTURE_FONT = Buffer.from('fixture font bytes: not a real font, only a hash carrier')

/**
 * Build one ustar header block.
 * @param name - entry path.
 * @param size - payload size.
 * @returns the 512-byte header.
 */
function tarHeader(name: string, size: number): Buffer {
  const header = Buffer.alloc(512)
  header.write(name, 0, 100, 'utf8')
  header.write('0000644\0', 100, 8)
  header.write('0000000\0', 108, 8)
  header.write('0000000\0', 116, 8)
  header.write(size.toString(8).padStart(11, '0') + '\0', 124, 12)
  header.write('00000000000\0', 136, 12)
  header.fill(0x20, 148, 156)
  header.write('0', 156, 1)
  header.write('ustar\0', 257, 6)
  header.write('00', 263, 2)
  let checksum = 0
  for (const byte of header) checksum += byte
  header.write(checksum.toString(8).padStart(6, '0') + '\0 ', 148, 8)
  return header
}

/**
 * Build one npm-shaped tarball.
 * @param entries - entry path to payload.
 * @returns the gzipped tarball.
 */
function tarGz(entries: Readonly<Record<string, Buffer>>): Buffer {
  const blocks: Buffer[] = []
  for (const [name, payload] of Object.entries(entries)) {
    blocks.push(tarHeader(name, payload.byteLength), payload)
    const padding = (512 - (payload.byteLength % 512)) % 512
    if (padding > 0) blocks.push(Buffer.alloc(padding))
  }
  blocks.push(Buffer.alloc(1024))
  return gzipSync(Buffer.concat(blocks))
}

/** One synthetic artifact whose tarball is built in-test. */
function fixtureArtifact(overrides: Partial<FontArtifact> = {}): { artifact: FontArtifact; tarball: Buffer } {
  const entry = 'package/fonts/Fixture.otf'
  const tarball = tarGz({ [entry]: FIXTURE_FONT })
  const artifact: FontArtifact = {
    package: '@fixture/compact-font',
    version: '9.9.9',
    entry,
    family: 'Fixture Face',
    bytes: FIXTURE_FONT.byteLength,
    sha256: createHash('sha256').update(FIXTURE_FONT).digest('hex'),
    tarballIntegrity: 'sha512-' + createHash('sha512').update(tarball).digest('base64'),
    archiveBytes: tarball.byteLength,
    file: 'fixture.otf',
    ...overrides,
  }
  return { artifact, tarball }
}

/** One throwaway DSH home. */
async function withHome(run: (home: string) => Promise<void>): Promise<void> {
  const home = await mkdtemp(join(tmpdir(), 'better-compact-font-unit-'))
  try {
    await run(home)
  } finally {
    await rm(home, { recursive: true, force: true })
  }
}

/** A fetch stub that serves one body per registry, counting calls. */
function servingFetch(bodies: readonly (Buffer | number)[]): {
  calls: string[]
  fetchImpl: typeof fetch
} {
  const calls: string[] = []
  const fetchImpl = (async (input: string | URL | Request) => {
    const url = String(input)
    calls.push(url)
    const index = Math.min(calls.length - 1, bodies.length - 1)
    const body = bodies[index]
    if (typeof body === 'number') {
      return new Response(null, { status: body })
    }
    const bytes = new Uint8Array((body ?? Buffer.alloc(0)).byteLength)
    bytes.set(body ?? Buffer.alloc(0))
    return new Response(bytes.buffer, { status: 200 })
  }) as unknown as typeof fetch
  return { calls, fetchImpl }
}

test('installs the pinned artifact into the DSH cache and reports it installed', async () => {
  await withHome(async (home) => {
    const { artifact, tarball } = fixtureArtifact()
    const { calls, fetchImpl } = servingFetch([tarball])
    const status = await installFont({
      home,
      artifact,
      registries: ['https://primary.invalid', 'https://mirror.invalid'],
      fetchImpl,
    })
    assert.equal(status.installed, true)
    assert.equal(status.package, artifact.package)
    assert.equal(status.version, artifact.version)
    assert.equal(status.family, artifact.family)
    assert.equal(status.bytes, FIXTURE_FONT.byteLength)
    assert.equal(status.source, 'https://primary.invalid')
    assert.equal(calls.length, 1)
    assert.deepEqual(await readFile(join(home, 'cache', 'better-compact', 'fonts', artifact.file)), FIXTURE_FONT)
    const meta = JSON.parse(await readFile(join(home, 'cache', 'better-compact', 'fonts', FONT_META), 'utf8')) as {
      sha256: string
      bytes: number
      source: string
    }
    assert.equal(meta.sha256, artifact.sha256)
    assert.equal(meta.bytes, FIXTURE_FONT.byteLength)
    assert.equal(meta.source, 'https://primary.invalid')
  })
})

test('an installed copy short-circuits the download unless force is set', async () => {
  await withHome(async (home) => {
    const { artifact, tarball } = fixtureArtifact()
    const first = servingFetch([tarball])
    await installFont({ home, artifact, registries: ['https://primary.invalid'], fetchImpl: first.fetchImpl })
    // Count the calls to prove the cached read never reaches the network.
    const second = servingFetch([tarball])
    const cached = await installFont({ home, artifact, registries: ['https://primary.invalid'], fetchImpl: second.fetchImpl })
    assert.equal(cached.installed, true)
    assert.equal(second.calls.length, 0, 'an installed copy must not download again')
    const forced = await installFont({
      home,
      artifact,
      force: true,
      registries: ['https://primary.invalid'],
      fetchImpl: second.fetchImpl,
    })
    assert.equal(forced.installed, true)
    assert.equal(second.calls.length, 1, 'force must redownload')
  })
})

test('falls back to the mirror when the source registry fails', async () => {
  await withHome(async (home) => {
    const { artifact, tarball } = fixtureArtifact()
    const { calls, fetchImpl } = servingFetch([503, tarball])
    const status = await installFont({
      home,
      artifact,
      registries: ['https://primary.invalid', 'https://mirror.invalid'],
      fetchImpl,
    })
    assert.equal(status.installed, true)
    assert.equal(status.source, 'https://mirror.invalid')
    assert.equal(calls.length, 2)
  })
})

test('rejects a tarball whose bytes do not match the pinned integrity and tries the mirror', async () => {
  await withHome(async (home) => {
    const { artifact, tarball } = fixtureArtifact()
    const tampered = Buffer.from(tarball)
    tampered[tampered.byteLength - 1] = (tampered[tampered.byteLength - 1] ?? 0) ^ 0xff
    const { calls, fetchImpl } = servingFetch([tampered, tarball])
    const status = await installFont({
      home,
      artifact,
      registries: ['https://primary.invalid', 'https://mirror.invalid'],
      fetchImpl,
    })
    assert.equal(status.installed, true)
    assert.equal(status.source, 'https://mirror.invalid')
    assert.equal(calls.length, 2)
  })
})

test('fails closed when every registry fails', async () => {
  await withHome(async (home) => {
    const { artifact } = fixtureArtifact()
    const { fetchImpl } = servingFetch([503, 502])
    await assert.rejects(
      () => installFont({ home, artifact, registries: ['https://primary.invalid', 'https://mirror.invalid'], fetchImpl }),
      (error: unknown) => {
        const failure = error as FontInstallError
        assert.ok(failure instanceof FontInstallError)
        assert.equal(failure.code, 'FONT_DOWNLOAD_FAILED')
        assert.match(failure.message, /primary\.invalid/)
        assert.match(failure.message, /mirror\.invalid/)
        return true
      },
    )
    assert.equal((await fontStatus({ home, artifact })).installed, false)
  })
})

test('rejects an artifact whose extracted font hash is not the pinned one', async () => {
  await withHome(async (home) => {
    const { artifact, tarball } = fixtureArtifact({ sha256: '0'.repeat(64) })
    const { fetchImpl } = servingFetch([tarball])
    await assert.rejects(
      () => installFont({ home, artifact, registries: ['https://primary.invalid'], fetchImpl }),
      (error: unknown) => (error as FontInstallError).code === 'FONT_INTEGRITY_FAILED',
    )
    assert.equal((await fontStatus({ home, artifact })).installed, false)
  })
})

test('rejects a tarball without the pinned entry', async () => {
  await withHome(async (home) => {
    const tarball = tarGz({ 'package/other.txt': Buffer.from('unrelated') })
    const artifact: FontArtifact = {
      ...fixtureArtifact().artifact,
      tarballIntegrity: 'sha512-' + createHash('sha512').update(tarball).digest('base64'),
    }
    const { fetchImpl } = servingFetch([tarball])
    await assert.rejects(
      () => installFont({ home, artifact, registries: ['https://primary.invalid'], fetchImpl }),
      (error: unknown) => (error as FontInstallError).code === 'FONT_EXTRACT_FAILED',
    )
  })
})

test('concurrent installs share one download', async () => {
  await withHome(async (home) => {
    const { artifact, tarball } = fixtureArtifact()
    const gate = { release: undefined as undefined | (() => void) }
    let fetched = 0
    const fetchImpl = (async () => {
      fetched += 1
      await new Promise<void>((resolve) => {
        gate.release = resolve
      })
      const bytes = new Uint8Array(tarball.byteLength)
      bytes.set(tarball)
      return new Response(bytes.buffer, { status: 200 })
    }) as unknown as typeof fetch
    const first = installFont({ home, artifact, registries: ['https://primary.invalid'], fetchImpl })
    const second = installFont({ home, artifact, registries: ['https://primary.invalid'], fetchImpl })
    while (gate.release === undefined) await new Promise((resolve) => setTimeout(resolve, 1))
    gate.release()
    const [a, b] = await Promise.all([first, second])
    assert.equal(fetched, 1, 'two clicks must not download twice')
    assert.equal(a.installed, true)
    assert.equal(b.installed, true)
  })
})

test('requireFontPath names the settings button when the face is missing', async () => {
  await withHome(async (home) => {
    await assert.rejects(
      () => requireFontPath({ home }),
      (error: unknown) => {
        const failure = error as FontInstallError
        assert.equal(failure.code, 'FONT_MISSING')
        assert.match(failure.message, /Download font/)
        assert.match(failure.message, /font:fetch/)
        return true
      },
    )
  })
})

test('a corrupted cache metadata is treated as not installed', async () => {
  await withHome(async (home) => {
    const directory = join(home, 'cache', 'better-compact', 'fonts')
    await import('node:fs/promises').then(({ mkdir }) => mkdir(directory, { recursive: true }))
    await writeFile(join(directory, FONT_ARTIFACT.file), FIXTURE_FONT)
    await writeFile(join(directory, FONT_META), '{not json')
    assert.equal((await fontStatus({ home })).installed, false)
    assert.equal(fontFilePath(home), join(directory, FONT_ARTIFACT.file))
  })
})

test('the production artifact pins the documented package, hashes and sizes', async () => {
  assert.equal(FONT_ARTIFACT.package, '@betteroffice/fonts-cjk')
  assert.equal(FONT_ARTIFACT.version, '0.4.2')
  assert.equal(FONT_ARTIFACT.entry, 'package/assets/NotoSansSC-Regular.otf')
  assert.equal(FONT_ARTIFACT.family, 'Noto Sans SC')
  assert.equal(FONT_ARTIFACT.bytes, 8331336)
  assert.equal(FONT_ARTIFACT.sha256, 'faa6c9df652116dde789d351359f3d7e5d2285a2b2a1f04a2d7244df706d5ea9')
  assert.match(FONT_ARTIFACT.tarballIntegrity, /^sha512-[A-Za-z0-9+/]{86}==$/)
  assert.equal(FONT_ARTIFACT.archiveBytes, 29697320)
})
