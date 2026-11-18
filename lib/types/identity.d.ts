/**
 * Cordis service identity helpers.
 *
 * Cordis wraps registered services in proxies. The retained-composition lookup
 * (`agentPresets.serviceFor`) returns the raw implementation value, so comparing
 * it to a service accessor with `!==` can wrongly report "another provider".
 * `symbols.original` unwraps the proxy to the implementation for identity
 * comparison only; callers still use the proxy for normal calls.
 */
/**
 * Read the underlying implementation of a possibly proxied service.
 * @param value - service proxy, raw implementation, or undefined.
 * @returns the comparable implementation identity, typed as the input.
 */
export declare function serviceIdentity<T = unknown>(value: T): T;
/**
 * Whether a service value is this package's enhanced compaction engine.
 * @param value - service value to inspect.
 * @returns true for a `BetterCompactEngine` implementation.
 */
export declare function isBetterCompactEngine(value: unknown): boolean;
