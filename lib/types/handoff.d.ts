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
import { stat } from 'node:fs/promises';
/** Directory prefix for every attempt. */
export declare const HANDOFF_DIR_PREFIX = "dsh-better-compact-";
/** File mode: owner read/write only. */
export declare const HANDOFF_FILE_MODE = 384;
/** Directory mode: owner access only (POSIX). */
export declare const HANDOFF_DIR_MODE = 448;
/** The permission proof that applies to a written handoff file. */
export type HandoffPermissionPolicy = 'posix-0600' | 'windows-owner-temp';
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
export declare function handoffPermissionPolicy(platform?: NodeJS.Platform): HandoffPermissionPolicy;
/**
 * Sanitize a session id into a path-safe, still-recognizable component.
 * @param sessionId - raw session id.
 * @returns path-safe id.
 */
export declare function safeSessionComponent(sessionId?: string | null): string;
/** Inputs shared by attempt preparation and document writing. */
export interface PrepareHandoffFileInput {
    /** Attempt correlation id (a UUID by default). */
    readonly attemptId?: string;
    /** ISO timestamp used in the file name (now by default). */
    readonly createdAt?: string;
    /** Owning session identity. */
    readonly sessionId?: string;
}
/** The attempt directory and the exact target path inside it. */
export interface PreparedHandoffFile {
    readonly directory: string;
    readonly path: string;
    readonly attemptId: string;
    readonly createdAt: string;
}
/** The read-only stat facts a permission check needs. */
export interface HandoffStatFacts {
    isFile(): boolean;
    mode: number;
}
/**
 * Stat seam used by the permission proof: the real `node:fs/promises` stat, or a
 * test double exposing the same read-only facts.
 */
export type HandoffStatFile = typeof stat | ((path: string) => Promise<HandoffStatFacts>);
/** Inputs for {@link writeHandoffFile}. */
export interface WriteHandoffFileInput extends PrepareHandoffFileInput {
    /** Complete Markdown document. */
    readonly body?: string;
    /** Body factory receiving the real path (wins over `body`). */
    readonly makeBody?: (path: string) => string;
    /** Platform override for tests (defaults to `process.platform`). */
    readonly platform?: NodeJS.Platform;
    /** Stat seam for tests. */
    readonly statFile?: HandoffStatFile;
}
/** Verified facts about the written handoff file. */
export interface VerifiedHandoffFile extends PreparedHandoffFile {
    readonly bytes: number;
    readonly body: string;
    readonly permissionPolicy: HandoffPermissionPolicy;
}
/**
 * Create the attempt directory and the exact target path. Exposed so the
 * engine can embed the real path in the document before the write; callers
 * that already have a body can pass it straight to {@link writeHandoffFile}.
 */
export declare function prepareHandoffFile(input?: PrepareHandoffFileInput): Promise<PreparedHandoffFile>;
/**
 * Write one handoff Markdown document, verify permissions and content by
 * reading it back, and return the exact path that can be shown to the user.
 *
 * @param input - write inputs.
 * @returns verified file facts.
 * @throws {Error} when the directory, write, permission, or read-back check fails.
 */
export declare function writeHandoffFile(input: WriteHandoffFileInput): Promise<VerifiedHandoffFile>;
