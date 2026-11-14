/**
 * Cordis service identity helpers.
 *
 * Cordis wraps registered services in proxies. The retained-composition lookup
 * (`agentPresets.serviceFor`) returns the raw implementation value, so comparing
 * it to a service accessor with `!==` can wrongly report "another provider".
 * `symbols.original` unwraps the proxy to the implementation for identity
 * comparison only; callers still use the proxy for normal calls.
 */

import { symbols } from '@deepseek-ai/cordis'

/** A value that may carry the cordis implementation symbol. */
interface OriginalCarrier {
  [key: symbol]: unknown
}

/**
 * Read the underlying implementation of a possibly proxied service.
 * @param value - service proxy, raw implementation, or undefined.
 * @returns the comparable implementation identity, typed as the input.
 */
export function serviceIdentity<T = unknown>(value: T): T {
  if (value === null || value === undefined) return value
  if (typeof value !== 'object' && typeof value !== 'function') return value
  const original = (value as OriginalCarrier)[symbols.original]
  return (original ?? value) as T
}

/**
 * Whether a service value is this package's enhanced compaction engine.
 * @param value - service value to inspect.
 * @returns true for a `BetterCompactEngine` implementation.
 */
export function isBetterCompactEngine(value: unknown): boolean {
  const implementation = serviceIdentity(value)
  if (implementation === null || implementation === undefined) return false
  if (typeof implementation !== 'object' && typeof implementation !== 'function') return false
  const constructor = (implementation as { constructor?: { betterCompactEngine?: unknown } }).constructor
  return constructor?.betterCompactEngine === true
}
