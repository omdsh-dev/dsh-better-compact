/**
 * Settings-page state for the fixed checkpoint font.
 *
 * The status comes from the plugin's own GET route and the install from its
 * POST route, so the page reports exactly what the host has on disk instead of
 * guessing from the build. Errors are surfaced verbatim: the route already
 * names the failed registries or the filesystem reason.
 */

import { useCallback, useEffect, useState } from 'react'
import { FONT_PATH } from '../shared/contract.ts'
import type { FontStatusPayload } from '../shared/contract.ts'
import { getJson, postJson } from './inspect-store.ts'

/** Everything the settings row needs to render and drive the download. */
export interface FontAsset {
  /** Last known installed state, or null before the first read. */
  readonly status: FontStatusPayload | null
  /** True while the initial status read is in flight. */
  readonly loading: boolean
  /** True while an install request is in flight. */
  readonly installing: boolean
  /** Last failure message, cleared when the next install starts. */
  readonly error: string | null
  /** Install the pinned face; `force` redownloads an already-installed copy. */
  install(force?: boolean): Promise<void>
}

/**
 * One-line error text.
 * @param error - thrown value.
 * @returns its message, or its string form.
 */
function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Shape-check the route payload before trusting it.
 * @param payload - parsed JSON body.
 * @returns the typed status, or null when the payload is not one.
 */
function asStatus(payload: Record<string, unknown>): FontStatusPayload | null {
  if (
    typeof payload.installed !== 'boolean' ||
    typeof payload.package !== 'string' ||
    typeof payload.version !== 'string' ||
    typeof payload.family !== 'string'
  ) {
    return null
  }
  return {
    installed: payload.installed,
    package: payload.package,
    version: payload.version,
    family: payload.family,
    bytes: typeof payload.bytes === 'number' ? payload.bytes : null,
    archiveBytes: typeof payload.archiveBytes === 'number' ? payload.archiveBytes : 0,
    source: typeof payload.source === 'string' ? payload.source : null,
    downloadedAt: typeof payload.downloadedAt === 'string' ? payload.downloadedAt : null,
  }
}

/**
 * Read the font status on mount and expose the install action.
 * @returns the current asset state plus `install()`.
 */
export function useFontAsset(): FontAsset {
  const [status, setStatus] = useState<FontStatusPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [installing, setInstalling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getJson(FONT_PATH).then(
      (payload) => {
        if (!cancelled) setStatus(asStatus(payload))
      },
      (failure: unknown) => {
        if (!cancelled) setError(messageOf(failure))
      },
    ).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const install = useCallback(async (force = false): Promise<void> => {
    setInstalling(true)
    setError(null)
    try {
      const next = asStatus(await postJson(FONT_PATH, { force }))
      if (next === null) throw new Error('the font route returned an unexpected payload')
      setStatus(next)
    } catch (failure) {
      setError(messageOf(failure))
    } finally {
      setInstalling(false)
    }
  }, [])

  return { status, loading, installing, error, install }
}
