import { test } from 'node:test'
import assert from 'node:assert/strict'
import { join, resolve } from 'node:path'
import { typeTreeCandidates } from '../scripts/dsh-types-source.mjs'

test('DSH_PACKAGE_ROOT accepts the package, peer-directory and runtime-root shapes', () => {
  const runtime = join('/opt', 'dsh-runtime')
  const peers = join(runtime, 'node_modules', '@deepseek-ai')
  const packageDirectory = join(peers, 'dsh')
  const shapes: [string, string][] = [
    [packageDirectory, peers],
    [peers, peers],
    [runtime, peers],
  ]
  for (const [value, expected] of shapes) {
    const [first] = typeTreeCandidates({ packageRoot: value, root: '/repo' })
    assert.equal(first, resolve(expected), value)
  }
})

test('an explicit --from wins and duplicate candidates are dropped', () => {
  const runtime = join('/opt', 'dsh-runtime')
  const peers = join(runtime, 'node_modules', '@deepseek-ai')
  const candidates = typeTreeCandidates({ explicit: peers, packageRoot: peers, root: '/repo' })
  assert.equal(candidates[0], resolve(peers))
  assert.equal(new Set(candidates).size, candidates.length, 'candidates must be de-duplicated')
  assert.equal(candidates.filter((value) => value === resolve(peers)).length, 1)
})

test('a blank DSH_PACKAGE_ROOT is ignored', () => {
  const candidates = typeTreeCandidates({ packageRoot: '   ', root: '/repo' })
  assert.equal(candidates.some((value) => value.includes('   ')), false)
  assert.equal(candidates.length, 2, 'only the two dev-runtime fallbacks remain')
})
