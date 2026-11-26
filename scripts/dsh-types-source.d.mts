export interface TypeTreeCandidatesOptions {
  /** `--from` directory, in any accepted shape. */
  explicit?: string
  /** `DSH_PACKAGE_ROOT`, in any accepted shape. */
  packageRoot?: string
  /** The package the dev-runtime fallbacks are resolved against. */
  root: string
}

/** Absolute `@deepseek-ai` peer directories, in priority order, without duplicates. */
export function typeTreeCandidates(options: TypeTreeCandidatesOptions): string[]
