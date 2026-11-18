/**
 * Prefetch the pinned checkpoint font into
 * `$DSH_HOME/cache/better-compact/fonts`.
 *
 * The settings page downloads the same artifact through the plugin's POST
 * route; this script is the headless/CI/CLI equivalent and the way a developer
 * provisions the face before `npm run smoke` or the visual probe.
 *
 * Usage:
 *   npm run font:fetch            # download once, reuse a verified cache
 *   npm run font:fetch -- --force # redownload and re-verify
 *
 * Requires the repository toolchain (tsx), like the other dev scripts.
 */

import { fontStatus, installFont } from '../src/font.ts'

const force = process.argv.includes('--force')

try {
  const status = await installFont({ force })
  console.log(JSON.stringify(status, null, 2))
  const verified = await fontStatus()
  if (!verified.installed) {
    console.error('font:fetch: the font was written but no longer verifies; check the cache directory')
    process.exitCode = 1
  }
} catch (error) {
  console.error('font:fetch: ' + (error instanceof Error ? error.message : String(error)))
  process.exitCode = 1
}
