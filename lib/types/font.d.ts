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
import type { FontStatusPayload } from './shared/contract.ts';
/** Pinned npm package that ships the checkpoint face. */
export declare const FONT_PACKAGE = "@betteroffice/fonts-cjk";
/** Pinned package version; bumping it is a data migration (see docs). */
export declare const FONT_VERSION = "0.4.2";
/** Exact entry inside the published tarball. */
export declare const FONT_ENTRY = "package/assets/NotoSansSC-Regular.otf";
/** Family name the tarball entry declares; the renderer draws with it. */
export declare const FONT_FAMILY = "Noto Sans SC";
/** Absolute-size contract of the pinned font file. */
export declare const FONT_BYTES = 8331336;
/** SHA-256 of the pinned font file (already extracted). */
export declare const FONT_SHA256 = "faa6c9df652116dde789d351359f3d7e5d2285a2b2a1f04a2d7244df706d5ea9";
/** SHA-512 of the pinned npm tarball, in npm integrity syntax. */
export declare const FONT_TARBALL_INTEGRITY = "sha512-7emT0WTfmk7hNovU9CyjSDoLo8kNp7RnqICYJ1WT8KgIlPDhfvpVZIBlk258PTbIwe1UTW2lYPTrk5veglawIQ==";
/** Published tarball size, used by the settings hint. */
export declare const FONT_ARCHIVE_BYTES = 29697320;
/** Registry order: npm source first, then the npmmirror mirror. */
export declare const FONT_REGISTRIES: readonly string[];
/** Cached font file name. */
export declare const FONT_FILE = "noto-sans-sc.otf";
/** Cached metadata file name. */
export declare const FONT_META = "font.json";
/**
 * Every pinned property of the downloadable face.
 *
 * Production always uses {@link FONT_ARTIFACT}; tests pass a local artifact so
 * the real download, verification and extraction path runs against a small
 * fixture without touching the network.
 */
export interface FontArtifact {
    readonly package: string;
    readonly version: string;
    readonly entry: string;
    readonly family: string;
    readonly bytes: number;
    readonly sha256: string;
    readonly tarballIntegrity: string;
    readonly archiveBytes: number;
    readonly file: string;
}
/** The one artifact the checkpoint renderer is allowed to draw with. */
export declare const FONT_ARTIFACT: FontArtifact;
/** Stable failure codes the HTTP layer maps to one status. */
export type FontErrorCode = 'FONT_MISSING' | 'FONT_DOWNLOAD_FAILED' | 'FONT_INTEGRITY_FAILED' | 'FONT_EXTRACT_FAILED' | 'FONT_WRITE_FAILED';
/** Actionable failure while resolving or installing the fixed font. */
export declare class FontInstallError extends Error {
    /** Stable machine code. */
    readonly code: FontErrorCode;
    /**
     * @param code - stable machine code.
     * @param message - actionable detail naming the next step.
     * @param options - standard error options (cause).
     */
    constructor(code: FontErrorCode, message: string, options?: {
        cause?: unknown;
    });
}
/** Install knobs; every one exists so tests never touch the network or `~`. */
export interface FontInstallOptions {
    /** Explicit DSH home override; omitted means the resolved harness home. */
    readonly home?: string;
    /** Redownload even when a verified copy is already cached. */
    readonly force?: boolean;
    /** Fetch implementation override (tests). */
    readonly fetchImpl?: typeof fetch;
    /** Registry order override (tests). */
    readonly registries?: readonly string[];
    /** Artifact override (tests); production always uses {@link FONT_ARTIFACT}. */
    readonly artifact?: FontArtifact;
}
/** Status resolution knobs. */
export interface FontStatusOptions {
    /** Explicit DSH home override; omitted means the resolved harness home. */
    readonly home?: string;
    /** Artifact override (tests); production always uses {@link FONT_ARTIFACT}. */
    readonly artifact?: FontArtifact;
}
/** The one directory the fixed font may live in. */
export declare function fontDirectory(home?: string): string;
/** Absolute path of the cached font file, installed or not. */
export declare function fontFilePath(home?: string, artifact?: FontArtifact): string;
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
export declare function fontStatus(options?: FontStatusOptions): Promise<FontStatusPayload>;
/**
 * Resolve the cached font path for a render.
 *
 * @param options - home override.
 * @returns the absolute path of the installed font file.
 * @throws {FontInstallError} with `FONT_MISSING` when no verified copy is cached.
 */
export declare function requireFontPath(options?: FontStatusOptions): Promise<string>;
/**
 * Download, verify and cache the pinned font.
 *
 * @param options - home override, force redownload, fetch/registry overrides.
 * @returns the installed status.
 * @throws {FontInstallError} when every registry fails or the artifact is invalid.
 */
export declare function installFont(options?: FontInstallOptions): Promise<FontStatusPayload>;
