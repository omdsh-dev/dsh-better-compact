/** Options accepted by {@link typeTreeCandidates}. */
export interface TypeTreeOptions {
  /** Explicit `--from` directory. */
  readonly explicit?: string
  /** The `DSH_PACKAGE_ROOT` value, in any of its documented shapes. */
  readonly packageRoot?: string
  /** This repository root (fallback dev runtime lives next to it). */
  readonly root: string
}

/** Resolve the directories that may hold the linked `@deepseek-ai` type tree. */
export function typeTreeCandidates(options: TypeTreeOptions): string[]

/** Turn one `DSH_PACKAGE_ROOT` value into the peer directory it names. */
export function environmentCandidates(value: string): string[]
