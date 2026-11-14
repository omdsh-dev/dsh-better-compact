/**
 * Link the DSH type tree into this package's node_modules.
 *
 * TypeScript resolves every `@deepseek-ai/*` specifier through node_modules
 * (the packages ship their own lib/types and declare the subpaths we use), so
 * no `paths` mapping is needed — but the packages themselves are runtime peers
 * the host provides, not npm dependencies of this plugin. This script points
 * the local node_modules at one installed DSH runtime:
 *
 *   node scripts/link-dsh-types.mjs [--from <dir>] [--check]
 *
 * `--from` defaults to `$DSH_PACKAGE_ROOT/..` and then to the isolated dev
 * runtime `.dsh-dev/runtime/node_modules/@deepseek-ai`. Idempotent: existing
 * links to the same target are left alone, links to another target are
 * replaced, and real directories (npm-installed packages such as
 * schemastery) are never touched.
 *
 * `--check` reports what is missing and exits 1 instead of writing; CI uses it
 * to fail fast when the type tree is absent.
 */
import { lstat, mkdir, readdir, readlink, rm, symlink } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const checkOnly = args.includes('--check')
const fromIndex = args.indexOf('--from')
const explicit = fromIndex >= 0 ? args[fromIndex + 1] : undefined

/** Candidate source directories, in priority order. */
const candidates = [
  explicit === undefined ? undefined : resolve(explicit),
  process.env.DSH_PACKAGE_ROOT === undefined
    ? undefined
    : resolve(process.env.DSH_PACKAGE_ROOT, '..', '@deepseek-ai'),
  join(root, '.dsh-dev', 'runtime', 'node_modules', '@deepseek-ai'),
  join(root, '..', '.dsh-dev', 'runtime', 'node_modules', '@deepseek-ai'),
].filter((value) => typeof value === 'string')

/** The first candidate that exists and contains packages. */
async function pickSource() {
  for (const candidate of candidates) {
    try {
      const entries = await readdir(candidate)
      if (entries.length > 0) return candidate
    } catch {
      // try the next candidate
    }
  }
  return undefined
}

const source = await pickSource()
if (source === undefined) {
  console.error('link-dsh-types: no DSH type tree found. Tried:\n  ' + candidates.join('\n  '))
  console.error('Set DSH_PACKAGE_ROOT, pass --from <dir>, or install one with:')
  console.error('  npm install --prefix .dsh-dev/runtime @deepseek-ai/dsh@0.2.2-rc.2')
  process.exit(1)
}

const target = join(root, 'node_modules', '@deepseek-ai')
await mkdir(target, { recursive: true })

const wanted = (await readdir(source, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
  .map((entry) => entry.name)

const linked = []
const skipped = []
const replaced = []
for (const name of wanted) {
  const link = join(target, name)
  const sourcePath = join(source, name)
  let existing
  try {
    existing = await lstat(link)
  } catch {
    existing = undefined
  }
  if (existing !== undefined) {
    if (existing.isSymbolicLink()) {
      const current = resolve(dirname(link), await readlink(link))
      if (current === resolve(sourcePath)) {
        skipped.push(name)
        continue
      }
      if (!checkOnly) {
        await rm(link, { force: true })
        await symlink(relative(dirname(link), sourcePath), link, 'junction')
      }
      replaced.push(name)
      continue
    }
    // A real directory is an npm-installed package: never overwrite it.
    skipped.push(name)
    continue
  }
  if (!checkOnly) await symlink(relative(dirname(link), sourcePath), link, 'junction')
  linked.push(name)
}

const summary = { source, linked: linked.length, replaced: replaced.length, skipped: skipped.length }
if (checkOnly) {
  const missing = wanted.length - skipped.length
  console.log(JSON.stringify({ ...summary, missing, checkOnly: true }))
  if (missing > 0) {
    console.error('link-dsh-types: ' + missing + ' link(s) missing; run without --check')
    process.exit(1)
  }
} else {
  console.log(JSON.stringify(summary))
}
