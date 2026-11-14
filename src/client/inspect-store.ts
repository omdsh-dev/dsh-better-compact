/**
 * Read-only JSON endpoints and the session list, as React store hooks.
 *
 * The page never writes over HTTP: these are GETs to the plugin's own inspect
 * and models routes, and the picker rows come from the host sessions-list
 * snapshot store. Fetches abort the previous request when the path or refresh
 * token changes, so a stale response never overwrites a newer one.
 *
 * The payload type is the caller's: the page narrows the parsed JSON to the
 * shared contract shapes (`InspectPayload`, `ModelRoutesPayload`) at its own
 * boundary instead of this module inventing a second declaration.
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

/** Request lifecycle of one read-only endpoint. */
export type ReadOnlyStatus = 'idle' | 'loading' | 'refreshing' | 'ready' | 'error'

/** One read-only request as the page consumes it. */
export interface ReadOnlyState<T> {
  readonly key: string | null
  readonly status: ReadOnlyStatus
  readonly payload: T | null
  readonly error: string | null
}

/** One session-list row rendered by the picker. */
export interface SessionEntry {
  readonly id: string
  readonly title: string
  readonly running: boolean
}

/** One entry of the host sessions-list snapshot. */
export interface SessionRowSnapshot {
  readonly displayTitle?: string
  readonly running?: boolean
}

/** The host sessions-list snapshot (`sessions.list.getSnapshot()`). */
export interface SessionListSnapshot {
  readonly ids: readonly string[]
  readonly byId: Readonly<Record<string, SessionRowSnapshot>>
  readonly phase: string
  readonly projectionsBySession: Readonly<Record<string, unknown>>
}

/** Empty snapshot: a stable identity so useSyncExternalStore never re-renders. */
const EMPTY_SESSION_LIST: SessionListSnapshot = Object.freeze({
  ids: Object.freeze([]),
  byId: Object.freeze({}),
  phase: 'ready',
  projectionsBySession: Object.freeze({}),
})

/** One-line error message. */
function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

/**
 * GET one read-only JSON endpoint; never sends a write verb.
 * @param path - same-origin pathname, query included.
 * @param signal - abort signal for a superseded request.
 * @returns the parsed JSON object.
 */
export async function getJson(path: string, signal?: AbortSignal | null): Promise<Record<string, unknown>> {
  const fetcher = typeof fetch === 'function' ? fetch : undefined
  if (fetcher === undefined) throw new Error('HTTP fetch is unavailable in this client')
  const response = await fetcher(path, {
    method: 'GET',
    headers: { accept: 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
    ...(signal === undefined || signal === null ? {} : { signal }),
  })
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    payload = undefined
  }
  if (!response.ok) {
    const message =
      payload !== undefined && payload !== null && typeof payload === 'object' && typeof (payload as { message?: unknown }).message === 'string'
        ? (payload as { message: string }).message
        : 'HTTP ' + response.status
    throw new Error(message)
  }
  if (payload === undefined || payload === null || typeof payload !== 'object') {
    throw new Error('the read-only response was not JSON')
  }
  return payload as Record<string, unknown>
}

/**
 * Fetch one read-only endpoint and abort the previous request when the path or
 * refresh token changes.
 * @param path - endpoint pathname, or null to stay idle.
 * @param refreshToken - bump to refetch the same path.
 * @returns the request state; `payload` keeps the last good value while refreshing.
 */
export function useReadOnlyJson<T>(path: string | null, refreshToken: unknown): ReadOnlyState<T> {
  const [state, setState] = useState<ReadOnlyState<T>>({ key: null, status: 'idle', payload: null, error: null })
  useEffect(() => {
    if (path === null) {
      setState({ key: null, status: 'idle', payload: null, error: null })
      return undefined
    }
    const controller = typeof AbortController === 'function' ? new AbortController() : null
    let cancelled = false
    setState((previous) => ({
      key: path,
      status: previous.key === path && previous.payload !== null ? 'refreshing' : 'loading',
      payload: previous.key === path ? previous.payload : null,
      error: null,
    }))
    getJson(path, controller === null ? undefined : controller.signal).then(
      (payload) => {
        if (cancelled) return
        setState({ key: path, status: 'ready', payload: payload as T, error: null })
      },
      (error: unknown) => {
        if (cancelled || (controller !== null && controller.signal.aborted)) return
        setState((previous) => ({
          key: path,
          status: 'error',
          payload: previous.key === path ? previous.payload : null,
          error: errorMessage(error),
        }))
      },
    )
    return () => {
      cancelled = true
      if (controller !== null) controller.abort()
    }
  }, [path, refreshToken])
  if (state.key !== path) {
    return {
      key: path,
      status: path === null ? 'idle' : 'loading',
      payload: null,
      error: null,
    }
  }
  return state
}

/**
 * Subscribe to the client sessions-list snapshot store.
 * @param sessions - the injected `sessions` service, if this composition has one.
 * @returns the current snapshot, or the empty one when the store is absent.
 */
export function useSessionList(sessions: unknown): SessionListSnapshot {
  const store = sessions === null || sessions === undefined ? undefined : (sessions as { list?: unknown }).list
  const subscribe = useCallback(
    (onChange: () => void) => {
      const candidate = store as { subscribe?: unknown } | undefined
      if (candidate === undefined || candidate === null || typeof candidate.subscribe !== 'function') return () => undefined
      return (candidate.subscribe as (listener: () => void) => () => void)(onChange)
    },
    [store],
  )
  const getSnapshot = useCallback((): SessionListSnapshot => {
    const candidate = store as { getSnapshot?: unknown } | undefined
    if (candidate === undefined || candidate === null || typeof candidate.getSnapshot !== 'function') return EMPTY_SESSION_LIST
    try {
      const snapshot = (candidate.getSnapshot as () => unknown)()
      return snapshot === null || snapshot === undefined ? EMPTY_SESSION_LIST : (snapshot as SessionListSnapshot)
    } catch {
      return EMPTY_SESSION_LIST
    }
  }, [store])
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/**
 * Flatten the session-list snapshot into ordered picker rows.
 * @param list - the snapshot, possibly absent or partial.
 * @returns one row per known session, titled by its display title.
 */
export function sessionEntries(list: SessionListSnapshot | null | undefined): SessionEntry[] {
  const byId = list !== null && list !== undefined && typeof list.byId === 'object' && list.byId !== null ? list.byId : {}
  const ids = Array.isArray(list?.ids) ? list.ids : Object.keys(byId)
  return ids
    .map((id) => {
      const row = byId[id]
      const title =
        row !== null && row !== undefined && typeof row.displayTitle === 'string' && row.displayTitle.length > 0
          ? row.displayTitle
          : id
      return { id, title, running: row !== undefined && row !== null && row.running === true }
    })
    .filter((entry) => typeof entry.id === 'string' && entry.id.length > 0)
}
