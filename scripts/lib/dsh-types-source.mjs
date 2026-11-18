/**
 * Resolve the directories that may hold the linked `@deepseek-ai` type tree.
 *
 * Shared by the linker and its tests. `DSH_PACKAGE_ROOT` is documented in three
 * shapes, and each one needs a different parent:
 *
 *   - `…/node_modules/@deepseek-ai/dsh`   the installed package directory
 *   - `…/node_modules/@deepseek-ai`       the peer directory itself
 *   - `…/dsh-runtime`                     a runtime root with node_modules
 *
 * @param {{ explicit?: string, packageRoot?: string, root: string }} options
 *   explicit `--from`, the `DSH_PACKAGE_ROOT` value, and this repository root.
 * @returns {string[]} candidate directories, highest priority first, de-duplicated.
 */
import { basename, dirname, join, resolve } from 'node:path'

/**
 * Turn one `DSH_PACKAGE_ROOT` value into the peer directory it names.
 * @param {string} value - configured root.
 * @returns {string[]} the peer directory candidates for that shape.
 */
export function environmentCandidates(value) {
  const root = resolve(value)
  if (basename(root) === '@deepseek-ai') return [root]
  if (basename(root) === 'dsh') return [dirname(root)]
  return [join(root, 'node_modules', '@deepseek-ai')]
}

/**
 * Build the ordered, de-duplicated type-tree candidate list.
 * @param {{ explicit?: string, packageRoot?: string, root: string }} options
 *   explicit `--from`, the `DSH_PACKAGE_ROOT` value, and this repository root.
 * @returns {string[]} candidate directories, highest priority first.
 */
export function typeTreeCandidates(options) {
  const candidates = []
  if (options.explicit !== undefined) candidates.push(resolve(options.explicit))
  if (options.packageRoot !== undefined && options.packageRoot.trim() !== '') {
    for (const candidate of environmentCandidates(options.packageRoot)) candidates.push(candidate)
  }
  candidates.push(join(options.root, '.dsh-dev', 'runtime', 'node_modules', '@deepseek-ai'))
  candidates.push(join(options.root, '..', '.dsh-dev', 'runtime', 'node_modules', '@deepseek-ai'))
  return candidates.filter((value, index) => candidates.indexOf(value) === index)
}
