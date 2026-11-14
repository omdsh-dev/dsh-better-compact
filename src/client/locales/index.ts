/**
 * Locale runtime for the settings page.
 *
 * ./zh.ts owns the key set and ./en.ts is checked against it, so this module
 * only has to translate. The host is never value-imported: LocaleFace is the
 * minimal structural face of what this half actually touches, which keeps the
 * browser bundle free of extra module-table entries.
 */

import { LOCALE_NAMESPACE } from '../../shared/contract.ts'
import { en } from './en.ts'
import { zh, type MessageKey } from './zh.ts'

/** Namespace this plugin registers its dictionaries under. */
export const NS = LOCALE_NAMESPACE

/** Placeholder values substituted into one message template. */
export type TranslateParams = Record<string, string | number>

/** One translation function (the shape the host registry binds). */
export type Translate = (key: string, params?: TranslateParams) => string

/** The slice of a host locale snapshot this module reads. */
export interface LocaleSnapshotFace {
  readonly active: string
}

/**
 * Minimal structural face of the host locale service. Members are optional
 * because an older or partial registry may expose only some of them; every call
 * site probes them the way the pre-TypeScript client did.
 */
export interface LocaleRuntimeFace {
  register?(ns: string, dicts: Record<string, Record<string, string>>): unknown
  bind?(ns: string): Translate
  getLocale?(): LocaleSnapshotFace
}

/** The context slice `bindLocale` needs. */
export interface LocaleFace {
  readonly locale?: LocaleRuntimeFace | null
  readonly effect?: unknown
}

/** Substitute `{name}` placeholders; unknown names stay verbatim. */
export function interpolate(text: string, params?: TranslateParams | null): string {
  if (params === undefined || params === null) return text
  return String(text).replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match))
}

/** The Chinese dictionary indexed for lookup by an untrusted key. */
const fallback: Record<string, string> = zh

/** Active translator; the Chinese fallback until `bindLocale` binds the host. */
let translate: Translate = (key, params) => interpolate(fallback[key] ?? key, params)

/** Host locale runtime captured by `bindLocale`, read by `activeLocale`. */
let runtime: LocaleRuntimeFace | null = null

/**
 * Translate one message key. A key without an entry renders as itself, which is
 * what makes a partially registered namespace degrade instead of blanking out.
 */
export function t(key: MessageKey | (string & {}), params?: TranslateParams): string {
  return translate(key, params)
}

/**
 * Register both dictionaries with the host registry and bind its translate
 * function. A missing, partial, or throwing registry keeps the Chinese
 * fallback, so a composition without a locale service still renders.
 */
export function bindLocale(ctx: LocaleFace): void {
  if (ctx.locale === undefined || ctx.locale === null) return
  const locale = ctx.locale
  runtime = locale
  try {
    const dicts = { zh, en } as unknown as Record<string, Record<string, string>>
    const dispose = typeof locale.register === 'function' ? locale.register(NS, dicts) : undefined
    const effect = ctx.effect
    if (typeof dispose === 'function' && typeof effect === 'function') {
      const register = effect as (setup: () => () => void, label: string) => unknown
      register(() => dispose as () => void, 'dsh-better-compact: locale dictionaries')
    }
  } catch {
    // Keep the Chinese fallback when the namespace is unavailable.
  }
  try {
    if (typeof locale.bind === 'function') translate = locale.bind(NS)
  } catch {
    // Keep the Chinese fallback when binding is unavailable.
  }
}

/**
 * The locale id the host registry currently serves. Falls back to Chinese,
 * which is both this module's dictionary and the language used before
 * `bindLocale` runs.
 */
export function activeLocale(): string {
  try {
    const snapshot = runtime?.getLocale?.()
    if (snapshot !== null && snapshot !== undefined && typeof snapshot.active === 'string') return snapshot.active
  } catch {
    // A registry that cannot report leaves the Chinese fallback.
  }
  return 'zh'
}
