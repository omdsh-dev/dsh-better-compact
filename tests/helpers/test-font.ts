/**
 * Test-only provisioning for the fixed checkpoint font.
 *
 * The renderer no longer discovers a system face: it draws with the pinned Noto
 * Sans SC file the operator installs. Tests keep that contract without the
 * network by committing a subset of the very same font (`fixtures/`) and, for
 * engine tests, staging it in a throwaway DSH home so `requireFontPath()`
 * exercises the production cache layout.
 */

import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FONT_ARTIFACT, FONT_META } from '../../src/font.ts'

/** Directory holding the committed fixture face and its licence. */
const FIXTURES = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures')

/**
 * Subset of the pinned face covering every character the tests render.
 * Regenerate it after changing rendered test text (see fixtures/README.md).
 */
export const TEST_FONT_PATH = join(FIXTURES, 'NotoSansSC-subset.otf')

/** One throwaway DSH home, active through `process.env.DSH_HOME`. */
export interface TestHome {
  /** Resolved DSH home the plugin would use. */
  readonly home: string
  /** Restore the previous `DSH_HOME` and delete the home. */
  dispose(): Promise<void>
}

/** A home that also knows the font file it staged. */
export interface StagedFontHome extends TestHome {
  /** Absolute path of the staged font file. */
  readonly fontPath: string
}

/**
 * Create a throwaway home, run the stager, and activate it for the process.
 * @param stage - optional setup receiving the home and the font cache directory.
 * @returns the active home plus a disposer that restores the previous environment.
 */
async function withHome(
  stage?: (home: string, fontDirectory: string) => Promise<string>,
): Promise<StagedFontHome> {
  const home = await mkdtemp(join(tmpdir(), 'better-compact-font-'))
  const directory = join(home, 'cache', 'better-compact', 'fonts')
  const fontPath = stage === undefined ? join(directory, FONT_ARTIFACT.file) : await stage(home, directory)
  const previous = process.env.DSH_HOME
  process.env.DSH_HOME = home
  return {
    home,
    fontPath,
    dispose: async () => {
      if (previous === undefined) delete process.env.DSH_HOME
      else process.env.DSH_HOME = previous
      await rm(home, { recursive: true, force: true })
    },
  }
}

/**
 * Write the metadata `fontStatus()` validates, for the staged file.
 * @param fontDirectory - cache directory.
 * @param bytes - staged file bytes.
 */
async function writeMeta(fontDirectory: string, bytes: Buffer): Promise<void> {
  await writeFile(
    join(fontDirectory, FONT_META),
    JSON.stringify(
      {
        package: FONT_ARTIFACT.package,
        version: FONT_ARTIFACT.version,
        family: FONT_ARTIFACT.family,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        bytes: bytes.byteLength,
        source: 'test-fixture',
        downloadedAt: new Date(0).toISOString(),
      },
      null,
      2,
    ) + '\n',
  )
}

/**
 * Stage the committed fixture face in a fresh home and point `DSH_HOME` at it.
 *
 * The metadata matches the pinned package/version so `fontStatus()` reports the
 * face as installed; only the bytes and hashes differ, which is exactly the
 * seam the artifact override exists for.
 *
 * @returns the active home with the staged face.
 */
export async function prepareTestFontHome(): Promise<StagedFontHome> {
  return withHome(async (_home, directory) => {
    await mkdir(directory, { recursive: true })
    const font = await readFile(TEST_FONT_PATH)
    const fontPath = join(directory, FONT_ARTIFACT.file)
    await writeFile(fontPath, font)
    await writeMeta(directory, font)
    return fontPath
  })
}

/**
 * Activate an empty home, so the font is reported as missing.
 * @returns the active empty home.
 */
export async function prepareEmptyTestHome(): Promise<StagedFontHome> {
  return withHome()
}

/**
 * Activate a home whose cached font is not a font at all.
 * @returns the active home with the corrupt file staged.
 */
export async function prepareCorruptTestHome(): Promise<StagedFontHome> {
  return withHome(async (_home, directory) => {
    await mkdir(directory, { recursive: true })
    const junk = Buffer.from('this is not a font file')
    const fontPath = join(directory, FONT_ARTIFACT.file)
    await writeFile(fontPath, junk)
    await writeMeta(directory, junk)
    return fontPath
  })
}
