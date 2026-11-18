/**
 * Fixed checkpoint-summary font: the pinned Noto Sans SC regular face and the
 * one-time installer behind the settings-page button.
 *
 * The renderer does not trust the operating system's font stack: a checkpoint
 * image has to look the same on Linux, macOS and Windows. This module owns the
 * single face the pages are drawn with — a pinned npm artifact, downloaded on
 * demand from the npm registry (with the npmmirror fallback), checked against
 * both the tarball and the extracted font, and cached under
 * `$DSH_HOME/cache/better-compact/fonts`.
 *
 * Nothing here touches the network at module load, and the test suite never
 * does: the route and the CLI script call `installFont()`, and tests inject a
 * local tarball fixture or a prepared cache directory.
 */

import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { dshCachePath } from '@deepseek-ai/dsh-home-paths'
import type { FontStatusPayload } from './shared/contract.ts'

/** Pinned npm package that ships the checkpoint face. */
export const FONT_PACKAGE = '@betteroffice/fonts-cjk'
/** Pinned package version; bumping it is a data migration (see docs). */
export const FONT_VERSION = '0.4.2'
/** Exact entry inside the published tarball. */
export const FONT_ENTRY = 'package/assets/NotoSansSC-Regular.otf'
/** Family name the tarball entry declares; the renderer draws with it. */
export const FONT_FAMILY = 'Noto Sans SC'
/** Absolute-size contract of the pinned font file. */
export const FONT_BYTES = 8331336
/** SHA-256 of the pinned font file (already extracted). */
export const FONT_SHA256 = 'faa6c9df652116dde789d351359f3d7e5d2285a2b2a1f04a2d7244df706d5ea9'
/** SHA-512 of the pinned npm tarball, in npm integrity syntax. */
export const FONT_TARBALL_INTEGRITY =
  'sha512-7emT0WTfmk7hNovU9CyjSDoLo8kNp7RnqICYJ1WT8KgIlPDhfvpVZIBlk258PTbIwe1UTW2lYPTrk5veglawIQ=='
/** Published tarball size, used by the settings hint. */
export const FONT_ARCHIVE_BYTES = 29697320
/** Registry order: npm source first, then the npmmirror mirror. */
export const FONT_REGISTRIES: readonly string[] = Object.freeze([
  'https://registry.npmjs.org',
  'https://registry.npmmirror.com',
])
/** Cached font file name. */
export const FONT_FILE = 'noto-sans-sc.otf'
/** Cached metadata file name. */
export const FONT_META = 'font.json'

/**
 * Every pinned property of the downloadable face.
 *
 * Production always uses {@link FONT_ARTIFACT}; tests pass a local artifact so
 * the real download, verification and extraction path runs against a small
 * fixture without touching the network.
 */
export interface FontArtifact {
  readonly package: string
  readonly version: string
  readonly entry: string
  readonly family: string
  readonly bytes: number
  readonly sha256: string
  readonly tarballIntegrity: string
  readonly archiveBytes: number
  readonly file: string
}

/** The one artifact the checkpoint renderer is allowed to draw with. */
export const FONT_ARTIFACT: FontArtifact = Object.freeze({
  package: FONT_PACKAGE,
  version: FONT_VERSION,
  entry: FONT_ENTRY,
  family: FONT_FAMILY,
  bytes: FONT_BYTES,
  sha256: FONT_SHA256,
  tarballIntegrity: FONT_TARBALL_INTEGRITY,
  archiveBytes: FONT_ARCHIVE_BYTES,
  file: FONT_FILE,
})
/** Upper bound on the downloaded tarball; the pinned one is ~30 MB. */
const ARCHIVE_MAX_BYTES = 64 * 1024 * 1024
/** Upper bound on the decompressed tar; one font entry plus headers. */
const TAR_MAX_BYTES = 64 * 1024 * 1024
/** Whole-download timeout for one registry attempt. */
const FETCH_TIMEOUT_MS = 180_000
/** Tar block size. */
const TAR_BLOCK = 512

/** Stable failure codes the HTTP layer maps to one status. */
export type FontErrorCode =
  | 'FONT_MISSING'
  | 'FONT_DOWNLOAD_FAILED'
  | 'FONT_INTEGRITY_FAILED'
  | 'FONT_EXTRACT_FAILED'
  | 'FONT_WRITE_FAILED'

/** Actionable failure while resolving or installing the fixed font. */
export class FontInstallError extends Error {
  /** Stable machine code. */
  readonly code: FontErrorCode

  /**
   * @param code - stable machine code.
   * @param message - actionable detail naming the next step.
   * @param options - standard error options (cause).
   */
  constructor(code: FontErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'FontInstallError'
    this.code = code
  }
}

/** Cache metadata written next to the font file. */
interface FontMeta {
  readonly package: string
  readonly version: string
  readonly family: string
  readonly sha256: string
  readonly bytes: number
  readonly source: string
  readonly downloadedAt: string
}

/** Install knobs; every one exists so tests never touch the network or `~`. */
export interface FontInstallOptions {
  /** Explicit DSH home override; omitted means the resolved harness home. */
  readonly home?: string
  /** Redownload even when a verified copy is already cached. */
  readonly force?: boolean
  /** Fetch implementation override (tests). */
  readonly fetchImpl?: typeof fetch
  /** Registry order override (tests). */
  readonly registries?: readonly string[]
  /** Artifact override (tests); production always uses {@link FONT_ARTIFACT}. */
  readonly artifact?: FontArtifact
}

/** Status resolution knobs. */
export interface FontStatusOptions {
  /** Explicit DSH home override; omitted means the resolved harness home. */
  readonly home?: string
  /** Artifact override (tests); production always uses {@link FONT_ARTIFACT}. */
  readonly artifact?: FontArtifact
}

/** The one directory the fixed font may live in. */
export function fontDirectory(home?: string): string {
  return home === undefined
    ? dshCachePath('better-compact', 'fonts')
    : dshCachePath({ dshHome: home }, 'better-compact', 'fonts')
}

/** Absolute path of the cached font file, installed or not. */
export function fontFilePath(home?: string, artifact: FontArtifact = FONT_ARTIFACT): string {
  return join(fontDirectory(home), artifact.file)
}

/**
 * Installed state of the cached font.
 *
 * File size is compared with the metadata written at install time, so a
 * truncated download is reported as missing instead of being rendered. The
 * pinned hashes are re-verified on install, not on every settings read.
 *
 * @param options - home override.
 * @returns the status payload the settings route serves.
 */
export async function fontStatus(options: FontStatusOptions = {}): Promise<FontStatusPayload> {
  const artifact = options.artifact ?? FONT_ARTIFACT
  const directory = fontDirectory(options.home)
  const meta = await readMeta(directory)
  const size = await fileSize(join(directory, artifact.file))
  const installed =
    meta !== undefined &&
    meta.package === artifact.package &&
    meta.version === artifact.version &&
    meta.family === artifact.family &&
    size !== undefined &&
    size === meta.bytes
  return {
    installed,
    package: artifact.package,
    version: artifact.version,
    family: artifact.family,
    bytes: installed ? size : null,
    archiveBytes: artifact.archiveBytes,
    source: installed ? meta.source : null,
    downloadedAt: installed ? meta.downloadedAt : null,
  }
}

/**
 * Resolve the cached font path for a render.
 *
 * @param options - home override.
 * @returns the absolute path of the installed font file.
 * @throws {FontInstallError} with `FONT_MISSING` when no verified copy is cached.
 */
export async function requireFontPath(options: FontStatusOptions = {}): Promise<string> {
  const status = await fontStatus(options)
  if (!status.installed) {
    throw new FontInstallError(
      'FONT_MISSING',
      'the fixed checkpoint font is not installed: open Better Compact settings and press "Download font", or run `npm run font:fetch` on the host',
    )
  }
  return fontFilePath(options.home, options.artifact)
}

/** Process-local installs per directory, so two clicks share one download. */
const inFlight = new Map<string, Promise<FontStatusPayload>>()

/**
 * Download, verify and cache the pinned font.
 *
 * @param options - home override, force redownload, fetch/registry overrides.
 * @returns the installed status.
 * @throws {FontInstallError} when every registry fails or the artifact is invalid.
 */
export async function installFont(options: FontInstallOptions = {}): Promise<FontStatusPayload> {
  const artifact = options.artifact ?? FONT_ARTIFACT
  const directory = fontDirectory(options.home)
  const key = directory + '\u0000' + artifact.package + '@' + artifact.version
  const running = inFlight.get(key)
  if (running !== undefined) return running
  const run = (async (): Promise<FontStatusPayload> => {
    if (options.force !== true) {
      const current = await fontStatus(options)
      if (current.installed) return current
    }
    const { bytes, source } = await downloadArchive(options, artifact)
    const font = readFont(bytes, artifact)
    await writeInstall(directory, font, source, artifact)
    return fontStatus(options)
  })().finally(() => {
    inFlight.delete(key)
  })
  inFlight.set(key, run)
  return run
}

/**
 * Download the pinned tarball, trying each registry in order.
 * @param options - fetch/registry overrides.
 * @returns the verified tarball bytes and the registry that served them.
 * @throws {FontInstallError} `FONT_DOWNLOAD_FAILED` with every failure reason.
 */
async function downloadArchive(
  options: FontInstallOptions,
  artifact: FontArtifact,
): Promise<{ bytes: Buffer; source: string }> {
  const fetchImpl = options.fetchImpl ?? fetch
  const registries = options.registries ?? FONT_REGISTRIES
  const failures: string[] = []
  for (const registry of registries) {
    const url = archiveUrl(registry, artifact)
    try {
      const response = await fetchImpl(url, {
        redirect: 'follow',
        headers: { accept: 'application/octet-stream' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })
      if (!response.ok) {
        failures.push(registry + ': HTTP ' + response.status)
        continue
      }
      const declared = Number(response.headers.get('content-length') ?? Number.NaN)
      if (Number.isFinite(declared) && declared > archiveLimit(artifact)) {
        failures.push(registry + ': declared size ' + declared + ' exceeds ' + archiveLimit(artifact))
        continue
      }
      const bytes = Buffer.from(await response.arrayBuffer())
      if (bytes.byteLength > archiveLimit(artifact)) {
        failures.push(registry + ': downloaded size ' + bytes.byteLength + ' exceeds ' + archiveLimit(artifact))
        continue
      }
      const digest = 'sha512-' + createHash('sha512').update(bytes).digest('base64')
      if (digest !== artifact.tarballIntegrity) {
        failures.push(registry + ': tarball integrity mismatch')
        continue
      }
      return { bytes, source: registry }
    } catch (error) {
      failures.push(registry + ': ' + messageOf(error))
    }
  }
  throw new FontInstallError(
    'FONT_DOWNLOAD_FAILED',
    'could not download the fixed checkpoint font from any registry (' + registries.join(', ') + '): ' +
      (failures.length > 0 ? failures.join('; ') : 'no registry configured'),
  )
}

/**
 * Build the npm tarball URL for one registry.
 * @param registry - registry base URL.
 * @returns the absolute tarball URL.
 */
function archiveUrl(registry: string, artifact: FontArtifact): string {
  const base = registry.endsWith('/') ? registry : registry + '/'
  const name = artifact.package.slice(artifact.package.lastIndexOf('/') + 1)
  return new URL(encodeURIComponent(artifact.package) + '/-/' + name + '-' + artifact.version + '.tgz', base).href
}

/**
 * Upper bound on one downloaded tarball.
 * @param artifact - pinned artifact.
 * @returns the byte cap for that artifact (fixtures are far smaller).
 */
function archiveLimit(artifact: FontArtifact): number {
  return Math.max(ARCHIVE_MAX_BYTES, artifact.archiveBytes * 2)
}

/**
 * Decompress the tarball and extract the pinned font entry.
 * @param archive - verified tarball bytes.
 * @returns the extracted font bytes.
 * @throws {FontInstallError} when the archive cannot be read or the font is not the pinned one.
 */
function readFont(archive: Buffer, artifact: FontArtifact): Buffer {
  let tar: Buffer
  try {
    tar = gunzipSync(archive, { maxOutputLength: TAR_MAX_BYTES })
  } catch (error) {
    throw new FontInstallError('FONT_EXTRACT_FAILED', 'the font tarball is not a readable gzip stream: ' + messageOf(error), {
      cause: error,
    })
  }
  const font = extractTarEntry(tar, artifact.entry)
  if (font === undefined) {
    throw new FontInstallError('FONT_EXTRACT_FAILED', 'the font tarball does not contain ' + artifact.entry)
  }
  if (font.byteLength !== artifact.bytes) {
    throw new FontInstallError(
      'FONT_INTEGRITY_FAILED',
      'the extracted font is ' + font.byteLength + ' bytes, expected ' + artifact.bytes,
    )
  }
  const digest = createHash('sha256').update(font).digest('hex')
  if (digest !== artifact.sha256) {
    throw new FontInstallError('FONT_INTEGRITY_FAILED', 'the extracted font hash ' + digest + ' does not match the pinned face')
  }
  return font
}

/**
 * Read one entry out of an uncompressed tar buffer.
 *
 * Only the ustar shapes npm publishes are accepted: regular-file entries, an
 * optional `prefix` field for the scope directory, and GNU/pax extension
 * headers, whose payload is skipped. Nothing is written to the filesystem, so
 * a hostile path in the archive cannot escape.
 *
 * @param tar - uncompressed tar bytes.
 * @param wanted - exact entry path (`package/...`).
 * @returns the entry bytes, or undefined when the entry is absent.
 */
function extractTarEntry(tar: Buffer, wanted: string): Buffer | undefined {
  let offset = 0
  while (offset + TAR_BLOCK <= tar.byteLength) {
    const header = tar.subarray(offset, offset + TAR_BLOCK)
    if (header.every((byte) => byte === 0)) return undefined
    const name = tarString(header, 0, 100)
    const prefix = tarString(header, 345, 155)
    const size = tarOctal(header, 124, 12)
    const type = String.fromCharCode(header[156] ?? 0)
    const entry = prefix === '' ? name : prefix + '/' + name
    const dataStart = offset + TAR_BLOCK
    const dataEnd = dataStart + size
    if (type === 'L' || type === 'K' || type === 'x' || type === 'g') {
      // Extension header: its payload describes the next entry, not this one.
      offset = dataStart + roundedBlocks(size)
      continue
    }
    if (type === '0' || type === '\0') {
      if (entry === wanted) {
        if (dataEnd > tar.byteLength) break
        return Buffer.from(tar.subarray(dataStart, dataEnd))
      }
    }
    offset = dataStart + roundedBlocks(size)
  }
  return undefined
}

/**
 * Read a NUL-padded ASCII field.
 * @param block - tar header block.
 * @param start - field offset.
 * @param length - field length.
 * @returns the decoded field without trailing NULs.
 */
function tarString(block: Buffer, start: number, length: number): string {
  const field = block.subarray(start, start + length)
  const end = field.indexOf(0)
  return field.subarray(0, end === -1 ? field.byteLength : end).toString('utf8')
}

/**
 * Read an octal size field.
 * @param block - tar header block.
 * @param start - field offset.
 * @param length - field length.
 * @returns the parsed byte size.
 * @throws {FontInstallError} when the field is not a plain octal number.
 */
function tarOctal(block: Buffer, start: number, length: number): number {
  const raw = tarString(block, start, length).trim()
  const value = raw === '' ? 0 : Number.parseInt(raw, 8)
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new FontInstallError('FONT_EXTRACT_FAILED', 'the font tarball has a malformed size field: ' + JSON.stringify(raw))
  }
  return value
}

/**
 * Round a tar payload size up to whole 512-byte blocks.
 * @param size - payload bytes.
 * @returns padded byte count.
 */
function roundedBlocks(size: number): number {
  return Math.ceil(size / TAR_BLOCK) * TAR_BLOCK
}

/**
 * Write the font and its metadata atomically.
 * @param directory - cache directory.
 * @param font - verified font bytes.
 * @param source - registry that served the tarball.
 * @throws {FontInstallError} `FONT_WRITE_FAILED` with the filesystem reason.
 */
async function writeInstall(directory: string, font: Buffer, source: string, artifact: FontArtifact): Promise<void> {
  const target = join(directory, artifact.file)
  const metaFile = join(directory, FONT_META)
  const temp = join(directory, '.' + artifact.file + '.' + process.pid + '.' + Date.now().toString(36) + '.tmp')
  try {
    await mkdir(directory, { recursive: true, mode: 0o700 })
    try {
      await writeFile(temp, font, { mode: 0o600 })
      await rename(temp, target)
    } finally {
      await rm(temp, { force: true })
    }
    const meta: FontMeta = {
      package: artifact.package,
      version: artifact.version,
      family: artifact.family,
      sha256: artifact.sha256,
      bytes: font.byteLength,
      source,
      downloadedAt: new Date().toISOString(),
    }
    const metaTemp = metaFile + '.tmp'
    await writeFile(metaTemp, JSON.stringify(meta, null, 2) + '\n', { mode: 0o600 })
    await rename(metaTemp, metaFile)
  } catch (error) {
    throw new FontInstallError(
      'FONT_WRITE_FAILED',
      'could not store the fixed checkpoint font in ' + directory + ': ' + messageOf(error),
      { cause: error },
    )
  }
}

/**
 * Read and shape-check the cache metadata.
 * @param directory - cache directory.
 * @returns the metadata, or undefined when absent/unreadable.
 */
async function readMeta(directory: string): Promise<FontMeta | undefined> {
  let text: string
  try {
    text = await readFile(join(directory, FONT_META), 'utf8')
  } catch {
    return undefined
  }
  try {
    const parsed: unknown = JSON.parse(text)
    if (parsed === null || typeof parsed !== 'object') return undefined
    const record = parsed as Record<string, unknown>
    if (
      typeof record.package !== 'string' ||
      typeof record.version !== 'string' ||
      typeof record.family !== 'string' ||
      typeof record.sha256 !== 'string' ||
      typeof record.bytes !== 'number' ||
      typeof record.source !== 'string' ||
      typeof record.downloadedAt !== 'string'
    ) {
      return undefined
    }
    return {
      package: record.package,
      version: record.version,
      family: record.family,
      sha256: record.sha256,
      bytes: record.bytes,
      source: record.source,
      downloadedAt: record.downloadedAt,
    }
  } catch {
    return undefined
  }
}

/**
 * Stat one file without throwing.
 * @param path - file path.
 * @returns the byte size when it is a regular file, else undefined.
 */
async function fileSize(path: string): Promise<number | undefined> {
  try {
    const info = await stat(path)
    return info.isFile() ? info.size : undefined
  } catch {
    return undefined
  }
}

/**
 * One-line error text for messages.
 * @param error - thrown value.
 * @returns its message, or its string form.
 */
function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
