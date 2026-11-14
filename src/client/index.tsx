/**
 * dsh-better-compact — browser plugin entry.
 *
 * The stable entry is registered under the canonical row key and every Apollo
 * alias key so standalone and Apollo assemblies share one implementation.
 * Registration goes through the Host slot registry: this half owns no slot of
 * its own and never value-imports a Host package (the bundle only requires
 * react). The Host keeps owning the configuration form and its CAS writes.
 */
import type React from 'react'
import { ROW_CONFIG_KEYS, ROW_CONFIG_SLOT } from '../shared/contract.ts'
import { bindLocale, NS, type LocaleRuntimeFace } from './locales/index.ts'
import { BetterCompactConfigEntry, createConfigEntry, type BetterCompactConfigEntryProps } from './page.tsx'

export { ROW_CONFIG_KEYS, BetterCompactConfigEntry, createConfigEntry }

/** Options one "plugins.row.config" registration carries. */
export interface SlotRegistrationOptions {
  readonly name: string
  readonly key: string
  readonly locale: string
}

/** The slice of the Host slot registry this half uses. */
export interface SlotsFace {
  inject(name: string, factory: () => () => void): () => void
  register(options: SlotRegistrationOptions, component: (props: BetterCompactConfigEntryProps) => React.ReactElement): () => void
}

/** The client context slice apply() consumes. */
export interface ClientContextFace {
  readonly slots: SlotsFace
  readonly sessions?: unknown
  readonly locale?: LocaleRuntimeFace | null
  effect(setup: () => () => void, label: string): unknown
}

/** Services this client half consumes. */
export const inject = ['slots', 'sessions', 'locale']

/** Register the same row page under every assembly key. */
export function apply(ctx: ClientContextFace): void {
  bindLocale(ctx)
  const sessions = ctx.sessions ?? null
  const Entry = createConfigEntry(sessions)
  ctx.effect(
    () =>
      ctx.slots.inject(ROW_CONFIG_SLOT, () => {
        const disposers = ROW_CONFIG_KEYS.map((key) => ctx.slots.register({ name: ROW_CONFIG_SLOT, key, locale: NS }, Entry))
        return () => {
          for (const dispose of disposers) dispose()
        }
      }),
    'dsh-better-compact: row config entry',
  )
}
