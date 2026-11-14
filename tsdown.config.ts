/**
 * tsdown build for dsh-better-compact.
 *
 * Three published entries:
 *   - lib/index.js   host companion row (ESM, node)
 *   - lib/engine.js  host-plane / preset engine row (ESM, node)
 *   - lib/client.js  browser half (CJS closure, `window.__ModuleLoader__`)
 *
 * Every `@deepseek-ai/*` specifier is a runtime peer provided by the host, so
 * the host build keeps them external. The client build mirrors the official
 * DSH client-bundle preset: externals resolve through the loader module table,
 * everything else (including src/shared) inlines into the single factory chunk.
 */
import type { UserConfig } from 'tsdown'

/** Bundle id (= package name; the client module loader keys on it). */
const CLIENT_ID = 'dsh-better-compact'

/** Module specifiers the web shell shares into the frozen module table. */
const CLIENT_EXTERNALS = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
]

/** The host-half build: two ESM node entries. */
const hostConfig: UserConfig = {
  entry: { index: 'src/index.ts', engine: 'src/engine.ts' },
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: true,
  // `@napi-rs/canvas` ships prebuilt native N-API binaries per platform; it is
  // a real runtime dependency of the summary-image renderer and must stay
  // external so the published lib/ resolves the host's own installed copy.
  external: [/^@deepseek-ai\//, /^@napi-rs\//, /^node:/],
  outputOptions: {
    // Stable published file set: two named entries plus at most one named
    // shared chunk. Rolldown defaults to content-hashed chunk names, which
    // would make `lib/` drift on every build and defeat the CI drift gate.
    entryFileNames: '[name].js',
    chunkFileNames: 'chunks/[name].js',
  },
}

/** The client bundle build: one CJS closure factory. */
const clientConfig: UserConfig = {
  entry: { client: 'src/client/index.tsx' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  target: 'es2024',
  dts: false,
  sourcemap: true,
  clean: false,
  external: [...CLIENT_EXTERNALS],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
  noExternal: (id: string) => (CLIENT_EXTERNALS.includes(id) ? undefined : true),
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(CLIENT_ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
    // The CJS factory's `require` only resolves module-table entries; disable
    // code splitting so the single factory chunk stays self-contained.
    codeSplitting: false,
  },
}

export default [hostConfig, clientConfig] satisfies UserConfig[]
