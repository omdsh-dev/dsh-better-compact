/**
 * Where to find the installed DSH type tree, as `@deepseek-ai` peer directories.
 *
 * `DSH_PACKAGE_ROOT` / `--from` are accepted in the three shapes a DSH install
 * appears as: the `@deepseek-ai/dsh` package directory, the `@deepseek-ai`
 * peers directory itself, or a runtime root that holds `node_modules/@deepseek-ai`.
 * Without one, the documented dev runtime and the monorepo install are tried.
 *
 * @param {{ explicit?: string, packageRoot?: string, root: string }} options
 * @returns {string[]} absolute candidates in priority order, without duplicates
 */
import { basename, dirname, join, resolve } from 'node:path'

export function typeTreeCandidates({ explicit, packageRoot, root }) {
  const candidates = []
  const add = (directory) => {
    const absolute = resolve(directory)
    if (!candidates.includes(absolute)) candidates.push(absolute)
  }
  if (explicit !== undefined && explicit.trim() !== '') add(peerDirectory(explicit))
  if (packageRoot !== undefined && packageRoot.trim() !== '') add(peerDirectory(packageRoot))
  add(join(root, '.dsh-dev', 'runtime', 'node_modules', PEERS))
  add(join(root, '..', '..', 'node_modules', PEERS))
  return candidates
}

const PEERS = '@deepseek-ai'

/** The `@deepseek-ai` directory that holds `value`, whatever shape `value` has. */
function peerDirectory(value) {
  const absolute = resolve(value)
  if (basename(absolute) === 'dsh') return dirname(absolute)
  if (basename(absolute) === PEERS) return absolute
  return join(absolute, 'node_modules', PEERS)
}
