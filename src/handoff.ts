/**
 * Per-attempt temporary handoff files.
 *
 * The file is written under the operating system temp directory, in a fresh
 * directory per attempt, with owner-only permissions, then read back and
 * compared byte-for-byte. A failure at any step throws, so the native
 * transaction never installs a checkpoint that points at an unverified file.
 *
 * The file is a convenience copy only: the same Markdown body is embedded in
 * the native checkpoint replacement by the engine. Deleting the file therefore
 * does not break replay, and there is deliberately no cleanup scheduler or
 * sidecar index here.
 */

import { mkdtemp, readFile, stat, writeFile, chmod } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

/** Directory prefix for every attempt. */
export const HANDOFF_DIR_PREFIX = 'dsh-better-compact-'
/** File mode: owner read/write only. */
export const HANDOFF_FILE_MODE = 0o600
/** Directory mode: owner access only (POSIX). */
export const HANDOFF_DIR_MODE = 0o700

/** The permission proof that applies to a written handoff file. */
export type HandoffPermissionPolicy = 'posix-0600' | 'windows-owner-temp'

/**
 * Permission proof used for the handoff file.
 *
 * POSIX systems expose the requested `0600` mode through `stat().mode`.
 * Windows has no POSIX mode bits: Node reports a synthetic value derived from
 * the read-only attribute (`0666` or `0444`), and `chmod` only toggles that
 * attribute. The file still lives under the per-user `%TEMP%` directory, which
 * is the platform's owner-only boundary; an ACL check is not available from
 * Node's standard library without native modules, so the POSIX mode assertion
 * is skipped there rather than failing every legitimate write.
 *
 * @param platform - Node `process.platform` value.
 * @returns the proof policy that applies.
 */
export function handoffPermissionPolicy(platform: NodeJS.Platform = process.platform): HandoffPermissionPolicy {
  return platform === 'win32' ? 'windows-owner-temp' : 'posix-0600'
}

/**
 * Sanitize a session id into a path-safe, still-recognizable component.
 * @param sessionId - raw session id.
 * @returns path-safe id.
 */
export function safeSessionComponent(sessionId?: string | null): string {
  const text = String(sessionId ?? 'session').replace(/[^A-Za-z0-9._-]/g, '_')
  return text.slice(0, 80).length > 0 ? text.slice(0, 80) : 'session'
}

/** Inputs shared by attempt preparation and document writing. */
export interface PrepareHandoffFileInput {
  /** Attempt correlation id (a UUID by default). */
  readonly attemptId?: string
  /** ISO timestamp used in the file name (now by default). */
  readonly createdAt?: string
  /** Owning session identity. */
  readonly sessionId?: string
}

/** The attempt directory and the exact target path inside it. */
export interface PreparedHandoffFile {
  readonly directory: string
  readonly path: string
  readonly attemptId: string
  readonly createdAt: string
}

/** The read-only stat facts a permission check needs. */
export interface HandoffStatFacts {
  isFile(): boolean
  mode: number
}

/**
 * Stat seam used by the permission proof: the real `node:fs/promises` stat, or a
 * test double exposing the same read-only facts.
 */
export type HandoffStatFile = typeof stat | ((path: string) => Promise<HandoffStatFacts>)

/** Inputs for {@link writeHandoffFile}. */
export interface WriteHandoffFileInput extends PrepareHandoffFileInput {
  /** Complete Markdown document. */
  readonly body?: string
  /** Body factory receiving the real path (wins over `body`). */
  readonly makeBody?: (path: string) => string
  /** Platform override for tests (defaults to `process.platform`). */
  readonly platform?: NodeJS.Platform
  /** Stat seam for tests. */
  readonly statFile?: HandoffStatFile
}

/** Verified facts about the written handoff file. */
export interface VerifiedHandoffFile extends PreparedHandoffFile {
  readonly bytes: number
  readonly body: string
  readonly permissionPolicy: HandoffPermissionPolicy
}

/**
 * Create the attempt directory and the exact target path. Exposed so the
 * engine can embed the real path in the document before the write; callers
 * that already have a body can pass it straight to {@link writeHandoffFile}.
 */
export async function prepareHandoffFile(input: PrepareHandoffFileInput = {}): Promise<PreparedHandoffFile> {
  const attemptId = input.attemptId ?? randomUUID()
  const createdAt = input.createdAt ?? new Date().toISOString()
  const directory = await mkdtemp(join(tmpdir(), HANDOFF_DIR_PREFIX))
  await chmod(directory, HANDOFF_DIR_MODE)
  const stamp = createdAt.replace(/[:.]/g, '-')
  const path = join(directory, `${safeSessionComponent(input.sessionId)}-${stamp}-${attemptId}.md`)
  return { directory, path, attemptId, createdAt }
}

/**
 * Write one handoff Markdown document, verify permissions and content by
 * reading it back, and return the exact path that can be shown to the user.
 *
 * @param input - write inputs.
 * @returns verified file facts.
 * @throws {Error} when the directory, write, permission, or read-back check fails.
 */
export async function writeHandoffFile(input: WriteHandoffFileInput): Promise<VerifiedHandoffFile> {
  const prepared = await prepareHandoffFile(input)
  const platform = input.platform ?? process.platform
  const permissionPolicy = handoffPermissionPolicy(platform)
  const statFile = input.statFile ?? stat
  const body = typeof input.makeBody === 'function' ? input.makeBody(prepared.path) : input.body
  if (typeof body !== 'string' || body.trim().length === 0) {
    throw new Error('handoff: refusing to write an empty document')
  }
  try {
    await writeFile(prepared.path, body, { encoding: 'utf8', mode: HANDOFF_FILE_MODE, flag: 'wx' })
    await chmod(prepared.path, HANDOFF_FILE_MODE)
    const info = await statFile(prepared.path)
    if (!info.isFile()) throw new Error(`handoff file ${prepared.path} is not a regular file`)
    if (permissionPolicy === 'posix-0600' && (info.mode & 0o777) !== HANDOFF_FILE_MODE) {
      throw new Error(
        `handoff file ${prepared.path} has mode ${(info.mode & 0o777).toString(8)}; expected 600 (owner-only)`,
      )
    }
    const readBack = await readFile(prepared.path, 'utf8')
    if (readBack !== body) {
      throw new Error(`handoff file ${prepared.path} did not read back identically; refusing to install the checkpoint`)
    }
    return {
      ...prepared,
      bytes: Buffer.byteLength(body, 'utf8'),
      body,
      permissionPolicy,
    }
  } catch (error) {
    // The attempt directory is left for debugging; no global cleanup scheduler
    // is introduced, and the session checkpoint is not installed by the caller.
    throw new Error(
      `handoff: could not write and verify ${prepared.path}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    )
  }
}
