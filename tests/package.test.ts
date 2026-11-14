import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

// The package contract is asserted against the published layout: sources are
// TypeScript under src/, the shipped payload is the prebuilt lib/ tree plus the
// preset/docs/licence files listed in "files".

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const at = (...segments: string[]): string => join(rootDir, ...segments)
const readJson = (path: string): any => JSON.parse(readFileSync(path, 'utf8'))

const pkg = readJson(at('package.json'))
const pkgExports: Record<string, unknown> = pkg.exports

/** Loader patch files use DSH's `!!js` expression tag; keep it as inert data. */
const jsExprType = new yaml.Type('tag:yaml.org,2002:js', {
  kind: 'scalar',
  construct: (data: string) => ({ __jsExpr: data }),
})
const patchSchema = yaml.DEFAULT_SCHEMA.extend([jsExprType])
const loadPatch = (path: string): any =>
  yaml.load(readFileSync(path, 'utf8'), { schema: patchSchema })

const cordis = loadPatch(at('cordis.patch.yml'))
const preset = loadPatch(at('presets', 'better-compact.patch.yml'))

interface ExportEntry {
  target: string
  types?: string
}

/** An export entry is either a bare path or a conditions object with a `default`. */
function resolveExport(name: string): ExportEntry {
  const entry = pkgExports[name]
  if (typeof entry === 'string') return { target: entry }
  assert.ok(entry !== null && typeof entry === 'object', `exports['${name}'] must be a path or a conditions object`)
  const record = entry as Record<string, unknown>
  const target = record.default
  const types = record.types
  assert.equal(typeof target, 'string', `exports['${name}'].default must be a path`)
  if (types !== undefined) assert.equal(typeof types, 'string', `exports['${name}'].types must be a path`)
  return typeof types === 'string' ? { target: target as string, types } : { target: target as string }
}

const CLIENT_ENTRIES = ['lib/index.js', 'lib/engine.js', 'lib/client.js']
const TYPE_ENTRIES = ['lib/types/index.d.ts', 'lib/types/engine.d.ts']

test('package metadata matches the published contract', () => {
  assert.equal(pkg.name, 'dsh-better-compact')
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/, 'version must be plain semver')
  assert.equal(pkg.license, 'Apache-2.0')
  // Pins the exact licence text that ships inside the tarball.
  const license = readFileSync(at('LICENSE'), 'utf8')
  assert.equal(createHash('sha256').update(license).digest('hex'), '3ddf9be5c28fe27dad143a5dc76eea25222ad1dd68934a047064e56ed2fa40c5')
  assert.equal(pkg.type, 'module')
  assert.equal(pkg.repository.url, 'git+https://github.com/omdsh-dev/dsh-better-compact.git')
  assert.equal(pkg.engines.node, '>=24.9.0')
  assert.equal(pkg.engines.dsh, '0.2.2-rc.2')
  assert.equal(pkg.dependencies['@deepseek-ai/schemastery'], '~3.19.0')
  // The summary-image renderer needs this prebuilt native canvas; it stays a
  // runtime dependency (lazily imported), never a devDependency or a bundle.
  assert.equal(typeof pkg.dependencies['@napi-rs/canvas'], 'string', '@napi-rs/canvas must stay in dependencies')
  assert.equal(pkg.devDependencies['@napi-rs/canvas'], undefined)
  assert.equal(pkg.peerDependencies['@deepseek-ai/cordis'], '~4.1.0')
  assert.equal(pkg.peerDependencies['@deepseek-ai/dsh-host-webserver'], '0.2.2-rc.2')
  assert.equal(pkg.peerDependencies['@deepseek-ai/dsh-web-server'], undefined)
  for (const [name, range] of Object.entries(pkg.peerDependencies)) {
    if (name.startsWith('@deepseek-ai/dsh-')) assert.equal(range, '0.2.2-rc.2', name)
  }
  assert.deepEqual(pkg.dsh.bundle.patch, [
    './cordis.patch.yml',
    './presets/better-compact.patch.yml',
  ])
  assert.equal(pkg.dsh.client.platform, 'web')
  assert.deepEqual(pkg.dsh.client.inject, [
    '@deepseek-ai/dsh-client-connection',
    '@deepseek-ai/dsh-client-ui-settings',
    '@deepseek-ai/dsh-api-session-controller',
  ])
})

test('build scripts drive tsdown plus a declaration build, with no prepare hook', () => {
  // The repository has .tsx component tests; Node's native type stripping cannot
  // run JSX, so the test script must load the tsx loader.
  // The runner must load TypeScript through tsx AND explicitly cover .tsx:
  // `node --test` with no arguments never discovers `*.test.tsx`.
  assert.match(pkg.scripts.test, /^node --import tsx --test/)
  assert.match(pkg.scripts.test, /tests\/\*\*\/\*\.test\.ts\b/)
  assert.match(pkg.scripts.test, /tests\/\*\*\/\*\.test\.tsx\b/)
  assert.equal(typeof pkg.devDependencies.tsx, 'string', 'tsx must stay a devDependency of the test script')
  assert.equal(pkg.scripts.smoke, 'node scripts/runtime-smoke.mjs')
  assert.match(pkg.scripts.build, /\btsdown\b/, 'build must run tsdown')
  assert.match(pkg.scripts.build, /tsc -p tsconfig\.build\.json/, 'build must emit lib/types declarations')
  assert.match(pkg.scripts.typecheck, /tsc .*--noEmit/, 'typecheck must run tsc --noEmit')
  // Prebuilt-in-tarball strategy: lib/ is committed, so no install-time build.
  for (const hook of ['prepare', 'prepublishOnly', 'prepack']) {
    assert.equal(pkg.scripts[hook], undefined, `${hook} must stay out of the prebuilt strategy`)
  }
})

test('entry points resolve to the built lib/ artifacts, not to TypeScript sources', () => {
  assert.equal(pkg.main, 'lib/index.js')
  assert.equal(pkg.types, 'lib/types/index.d.ts')
  assert.deepEqual(Object.keys(pkgExports).sort(), [
    '.',
    './client',
    './engine',
    './package.json',
  ])
  const root = resolveExport('.')
  assert.equal(root.target, './lib/index.js')
  assert.equal(root.types, './lib/types/index.d.ts')
  const engine = resolveExport('./engine')
  assert.equal(engine.target, './lib/engine.js', './engine must point at a real lib/engine.js')
  assert.equal(engine.types, './lib/types/engine.d.ts')
  assert.equal(resolveExport('./client').target, './lib/client.js')
  assert.equal(pkgExports['./package.json'], './package.json')
  for (const entry of [root, engine, resolveExport('./client')]) {
    assert.equal(existsSync(at(entry.target)), true, `missing built artifact ${entry.target}`)
    assert.equal(/\.ts$/u.test(entry.target), false, `${entry.target} must not point at a source file`)
    if (entry.types) assert.equal(existsSync(at(entry.types)), true, `missing declaration ${entry.types}`)
  }
  for (const path of CLIENT_ENTRIES) {
    assert.equal(existsSync(at(path)), true, `missing built artifact ${path}`)
    const bytes = readFileSync(at(path)).byteLength
    assert.ok(bytes > 0, `${path} is empty`)
  }
  for (const path of TYPE_ENTRIES) {
    assert.equal(existsSync(at(path)), true, `missing declaration ${path}`)
  }
})

test('the client bundle is a ModuleLoader factory for the stable package id', () => {
  const bundle = readFileSync(at('lib', 'client.js'), 'utf8')
  // The banner is emitted over several lines (`{` then `id:`), so match the
  // whole document from its first character rather than a single line.
  assert.match(
    bundle,
    /^\s*window\.__ModuleLoader__\.load\(\{\s*id:\s*(['"])dsh-better-compact\1/,
    `lib/client.js must open with the module-loader banner for the package id, got: ${bundle.slice(0, 160)}`,
  )
  assert.match(bundle, /factory:\s*\(require\)/, 'the banner must open a factory closure')
})

test('the published file whitelist ships the built lib, preset, docs and licences only', () => {
  assert.ok(pkg.files.includes('lib'), 'files must ship lib/')
  assert.equal(pkg.files.includes('src'), false, 'files must not ship TypeScript sources')
  for (const forbidden of ['docs/specs', 'node_modules', '.worktrees', 'scripts', 'tests']) {
    assert.equal(pkg.files.includes(forbidden), false, forbidden)
  }
  for (const entry of pkg.files) {
    assert.equal(existsSync(at(entry)), true, `files entry does not exist: ${entry}`)
  }
  assert.equal(existsSync(at('LICENSE')), true)
  assert.equal(existsSync(at('third-party', 'NOTICE')), true)
  assert.equal(existsSync(at('third-party', 'LICENSE-MIT-dsh')), true)
})

function gitignoreEntries(): string[] {
  return readFileSync(at('.gitignore'), 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
}

test('lib/ is committed, not ignored, so a git install works without a build', () => {
  const entries = gitignoreEntries().map((entry) => entry.replace(/^\//u, '').replace(/\/$/u, ''))
  assert.equal(entries.includes('lib'), false, 'lib/ must be committed (prebuilt tarball payload)')
  // Local DSH runtimes are machine-specific and never shipped.
  for (const local of ['node_modules', '.dsh-dev', '.dsh-types']) {
    assert.equal(entries.includes(local), true, `${local}/ must be gitignored`)
  }
})

test('the development scripts that wire the local DSH runtime are present', () => {
  for (const script of ['link-dsh-types.mjs', 'runtime-smoke.mjs']) {
    assert.equal(existsSync(at('scripts', script)), true, `missing scripts/${script}`)
  }
  assert.equal(pkg.scripts.smoke.includes('scripts/runtime-smoke.mjs'), true)
})

test('standalone bundle patch disables native compaction and inserts two stable rows', () => {
  assert.deepEqual(cordis[0], { id: 'compaction-basic', disabled: true })
  assert.equal(cordis.length, 2)
  const rows = cordis[1].insert
  assert.deepEqual(rows, [
    { id: 'dsh-better-compact', name: 'dsh-better-compact' },
    { id: 'dsh-better-compact-engine', name: 'dsh-better-compact/engine' },
  ])
  // command-compact and the tool-result pruner are deliberately untouched.
  for (const row of cordis) {
    assert.notEqual(row.id, 'command-compact')
    assert.notEqual(row.id, 'tool-result-pruner')
  }
})

test('better-compact preset keeps the standard composition except its engine row', () => {
  assert.equal(preset.length, 1)
  const row = preset[0].insert[0]
  assert.equal(row.id, 'preset-better-compact')
  assert.equal(row.name, '@deepseek-ai/dsh-agent-preset')
  assert.equal(row.config.id, 'better-compact')
  assert.equal(row.config.order, 2)
  assert.equal(row.config.name, 'Better Compact')
  assert.equal(typeof row.config.description, 'string')
  assert.ok(row.config.description.length > 0)
  const groups = row.config.plugins
  const compaction = groups.find((plugin: any) => plugin.id === 'compaction')
  assert.ok(compaction)
  assert.deepEqual(compaction.isolate, { compaction: true, toolResultPruner: true })
  assert.deepEqual(compaction.config.map((plugin: any) => plugin.id), [
    'dsh-better-compact-engine',
    'command-compact',
    'tool-result-pruner',
  ])
  assert.equal(compaction.config[0].name, 'dsh-better-compact/engine')
  assert.equal(
    compaction.config.some((plugin: any) => plugin.name === '@deepseek-ai/dsh-compaction-basic'),
    false,
  )
  const delegation = groups.find((plugin: any) => plugin.id === 'delegation')
  assert.ok(delegation)
  assert.equal(delegation.config.some((plugin: any) => plugin.id === 'tool-subagent'), true)
})

test('the preset is a verbatim installed-standard copy with one row replaced', (t) => {
  const dshRoot = process.env.DSH_PACKAGE_ROOT
  if (!dshRoot) {
    t.skip('set DSH_PACKAGE_ROOT to the installed @deepseek-ai/dsh package directory to compare against the standard preset')
    return
  }
  const standardPath = join(dshRoot, '..', 'dsh-web-app', 'presets', 'standard.patch.yml')
  if (!existsSync(standardPath)) {
    t.skip(`installed standard preset not found at ${standardPath}`)
    return
  }
  const standard = loadPatch(standardPath)
  const expected = structuredClone(standard)
  const expectedRow = expected[0].insert[0]
  expectedRow.id = 'preset-better-compact'
  expectedRow.config.id = 'better-compact'
  expectedRow.config.order = 2
  expectedRow.config.name = 'Better Compact'
  expectedRow.config.description = preset[0].insert[0].config.description
  const expectedCompaction = expectedRow.config.plugins.find((plugin: any) => plugin.id === 'compaction')
  const engineRow = expectedCompaction.config.find((plugin: any) => plugin.id === 'compaction-basic')
  engineRow.id = 'dsh-better-compact-engine'
  engineRow.name = 'dsh-better-compact/engine'
  delete engineRow.config
  assert.deepEqual(preset, expected)
})

test('release workflow rebuilds lib/ and refuses a drifted artifact tree', () => {
  const workflow = readFileSync(at('.github', 'workflows', 'release.yml'), 'utf8')
  assert.match(workflow, /release:\s*\n\s*types: \[published\]/)
  assert.match(workflow, /id-token: write/)
  assert.match(workflow, /npm publish --provenance --access public/)
  assert.match(workflow, /v\$\{version\}.*GITHUB_REF_NAME/s)
  assert.equal(workflow.includes('NPM_TOKEN'), false)
  assert.equal(workflow.includes('NODE_AUTH_TOKEN'), false)
  // The peer type tree is linked from an installed host, then build + drift check.
  assert.match(workflow, /node scripts\/link-dsh-types\.mjs/)
  assert.match(workflow, /npm run build/)
  assert.match(workflow, /git diff[^\n]*--exit-code[^\n]*lib\//)
  assert.ok(
    workflow.indexOf('npm run build') < workflow.indexOf('npm publish'),
    'the artifact build must run before publish',
  )
  assert.ok(
    workflow.indexOf('git diff --exit-code lib/') < workflow.indexOf('npm publish'),
    'the artifact drift check must run before publish',
  )
})

test('documented commands match the package scripts', () => {
  const readme = readFileSync(at('README.md'), 'utf8')
  const development = readFileSync(at('docs', 'DEVELOPMENT.md'), 'utf8')
  for (const command of ['npm install', 'npm run build', 'npm test', 'npm run typecheck', 'npm run smoke']) {
    assert.ok(readme.includes(command) || development.includes(command), `docs never mention \`${command}\``)
  }
  assert.ok(
    development.includes('lib/'),
    'DEVELOPMENT.md must document the prebuilt lib/ layout',
  )
  assert.equal(
    readme.includes(`dsh-better-compact@${pkg.version}`),
    true,
    `README install snippet must name the current version (${pkg.version})`,
  )
})

function packageFiles(directory: string, prefix = ''): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules') return []
    const path = `${prefix}${entry.name}`
    return entry.isDirectory()
      ? packageFiles(join(directory, entry.name), `${path}/`)
      : [path]
  })
}

test('package files contain no design specs or temp artifacts', () => {
  // An enclosing repository does not own the inventory of an exported package copy.
  const tracked: string[] = existsSync(at('.git'))
    ? execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
      cwd: rootDir,
      encoding: 'utf8',
    }).split('\n').filter(Boolean)
    : packageFiles(rootDir)
  assert.ok(tracked.length > 0)
  for (const path of tracked) {
    assert.equal(/10-28-better-plugins|\.worktrees\/|node_modules\//.test(path), false, path)
  }
  // The shipped entry points are build products kept in the repository.
  assert.ok(tracked.includes('lib/index.js'))
  assert.ok(tracked.includes('lib/engine.js'))
  assert.ok(tracked.includes('lib/client.js'))
  assert.ok(tracked.includes('cordis.patch.yml'))
  assert.ok(tracked.includes('presets/better-compact.patch.yml'))
  assert.ok(tracked.includes('package.json'))
})
