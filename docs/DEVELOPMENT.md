# dsh-better-compact — development guide

For maintainers, source installers, and people debugging host compatibility.
Everyday usage is in [README](../README.md). The design specs that drove this
implementation are deliberately **not** in this repository; do not add them to
commits, docs, or the npm package.

## Status and compatibility

- Package version: `0.4.1`.
- Verified DSH build: `0.2.2-rc.2`; `engines.dsh` is
  exactly `0.2.2-rc.2`; other builds are not supported by this release.
- Node.js `>=24.9.0`.
- TypeScript sources under `src/`, prebuilt `lib/` in the repository. Runtime
  behaviour is identical to the previous zero-build JavaScript package: the
  refactor adds types, not features.
- `lib/index.js` / `lib/engine.js` are ESM host bundles, `lib/client.js` is the
  single-file browser bundle wrapped in the `window.__ModuleLoader__` factory,
  and `lib/types/**/*.d.ts` is the published declaration surface.
- The build is [tsdown](../tsdown.config.ts) + `tsc -p tsconfig.build.json`
  (`npm run build`). Tests run straight off the TypeScript sources through the
  `tsx` loader (`.tsx` needs JSX support that Node's native type stripping does
  not have); there is no test bundle and no build step in the test path.
- The visual settings page is the browser half and is covered by component
  tests with a fake Host form. A visual/keyboard acceptance pass in the current
  GUI was **not** performed here; that belongs to S4.

## Repository layout

| Path | Responsibility |
| --- | --- |
| [package.json](../package.json) | npm metadata, exports, peers, `dsh.bundle.patch`, `dsh.client`. |
| [cordis.patch.yml](../cordis.patch.yml) | Standalone composition: disable host `compaction-basic`, insert host companion + host-plane engine rows. |
| [presets/better-compact.patch.yml](../presets/better-compact.patch.yml) | Selectable Web preset: pinned rc.2 `standard` copy with the compaction group's engine swapped. |
| [tsconfig.json](../tsconfig.json) | Host + test typecheck face (`strict`, `noUncheckedIndexedAccess`, classic JSX). No `paths`/`baseUrl`: `@deepseek-ai/*` types resolve through `node_modules`, linked by `scripts/link-dsh-types.mjs`. |
| [tsconfig.client.json](../tsconfig.client.json) | Browser-only typecheck face: `src/client` + `src/shared`, no Node types. |
| [tsconfig.build.json](../tsconfig.build.json) | Declaration build: emits `lib/types/**/*.d.ts` from the host half. |
| [tsdown.config.ts](../tsdown.config.ts) | Three entries: `lib/index.js`, `lib/engine.js` (ESM), `lib/client.js` (CJS closure with the ModuleLoader banner). |
| [lib/](../lib) | Committed build output. Never edited by hand; `npm run build` regenerates it and CI rejects a drift. |
| [src/index.ts](../src/index.ts) | Host companion row: volatile `Config`, `betterCompactConfig` service, settings policy, GET inspect route, test seam for the fence. |
| [src/engine.ts](../src/engine.ts) | `BetterCompactEngine extends BasicCompactionEngine`: enhanced `summarize()`, preset-supersede guard, manual handoff continuation, failure classification. |
| [src/config.ts](../src/config.ts) | Single source of truth for defaults, schema, normalization, native projection, row keys. |
| [src/budget.ts](../src/budget.ts) | Clearly marked adapter re-implementing the native capacity/retention/selection formulas and fixed-prefix pricing. |
| [src/prompts.ts](../src/prompts.ts) | Goal/handoff instructions, authoritative-state rendering, output structure check, mode detection, conservative redaction, handoff document/continuation text. |
| [src/state.ts](../src/state.ts) | Read-only goal/todo/question/job/child collection and continuation blockers. |
| [src/handoff.ts](../src/handoff.ts) | Per-attempt temp directory/path, owner-only write, permission stat, byte-for-byte read-back. |
| [src/live.ts](../src/live.ts) | Process-local "summary in flight", classified-failure, and handoff-continuation outcome observations for inspect only; no durable claim. |
| [src/identity.ts](../src/identity.ts) | Unwraps cordis service proxies (`symbols.original`) so preset-owned engines can be compared and recognized. |
| [src/inspect.ts](../src/inspect.ts) | Live/cold session inspection, budget/preview construction, `lastCompaction` projection, inspect error taxonomy. |
| [src/models.ts](../src/models.ts) | Read-only projection of the host's allowed summary-model candidates and their advertised efforts. |
| [src/shared/](../src/shared) | Host/client shared contract: stable paths, mode ids, row keys, inspect payload types, optional host service faces. Must not import `node:*`. |
| [src/summary-image.ts](../src/summary-image.ts) | Checkpoint-as-image renderer: 860px white pages, two font ladders, page cap, hand-written 8-bit greyscale PNG encoder (`deflateSync` + CRC32). `@napi-rs/canvas` is imported lazily. |
| [src/client/](../src/client) | Visual settings page: three strategy diagrams, model/effort, budget/retention, cache, advanced options, native status, session picker, Host-form save. Registers the stable row-config keys. |
| [docs/SUMMARY-IMAGE.md](../docs/SUMMARY-IMAGE.md) | The `summaryImage` option: scope, page layout, fail-closed semantics, cost, local visual check. |
| [scripts/link-dsh-types.mjs](../scripts/link-dsh-types.mjs) | Junctions `@deepseek-ai/*` from an installed DSH runtime into `node_modules` so `tsc` resolves the peer types. |
| [scripts/runtime-smoke.mjs](../scripts/runtime-smoke.mjs) | Four-boot real-profile smoke with a temp DSH home and scripted adapter. |
| [scripts/summary-image-probe.mjs](../scripts/summary-image-probe.mjs) | Renders the sample checkpoint to temp PNGs for visual inspection; never part of `npm test`. |
| [tests/](../tests) | `node:test` unit/component tests (run directly on `.ts` sources); no browser build. |
| [third-party/](../third-party) | MIT notice/license for adapted DSH material. |

## Install for development

```sh
npm install                          # build/test toolchain + test-only React/js-yaml/jsdom
node scripts/link-dsh-types.mjs      # point node_modules/@deepseek-ai at a DSH runtime
npm run typecheck                    # host face + client face
npm test                             # node --import tsx --test
npm run build                        # tsdown + tsc declarations -> lib/
```

`@deepseek-ai/*` is a runtime peer the host provides, not a dependency of this
plugin, so `npm install` brings no types for it. Run
[scripts/link-dsh-types.mjs](../scripts/link-dsh-types.mjs) once after cloning:
it junctions each DSH package into `node_modules/@deepseek-ai`, taking the
source from `$DSH_PACKAGE_ROOT`, `--from <dir>`, or the isolated
`.dsh-dev/runtime` checkout — in that order. **Re-run it after every
`npm install`**: installing rewrites `node_modules` and drops the junctions, which
makes `typecheck` fail with `Cannot find module '@deepseek-ai/…'`. TypeScript then resolves every
`@deepseek-ai/*` specifier through plain node_modules; the packages ship their
own `lib/types` and expose the subpaths this plugin imports, so `tsconfig.json`
needs no `paths`/`baseUrl` mapping. `--check` only reports and exits 1, which is
how CI fails fast on a missing type tree.

`lib/` is committed. Whenever you touch `src/`, `npm run build` and commit the
regenerated `lib/` in the same change — the release workflow re-runs the build
and fails on `git diff --exit-code lib/`, so a stale artifact tree cannot be
published.

Source conventions (`strict` + `noUncheckedIndexedAccess`):

- A relative import carries its `.ts` extension (`from './config.ts'`).
- Keep everything erasable — no `enum`, no `namespace`, no parameter
  properties. Modules are loaded by `tsx`/`tsdown`, never transpiled by `tsc`.
- `tsconfig.json` uses the **classic** JSX runtime (`"jsx": "react"`), so every
  `.tsx` file imports React explicitly (`import React from 'react'`) and does not
  rely on `react/jsx-runtime` being injected.

Install this checkout into a throwaway profile to try it interactively:

```sh
npm run build
dsh plugin --profile <profile> add /absolute/path/to/dsh-better-compact
# restart the DSH process for the new profile wiring
```

Inside the Web UI choose the **Better Compact** preset for the session (or set
it as the default). Headless/TUI profiles use the host-plane engine directly.

## Architecture decisions

These are host-driven and should not be "simplified" without re-verifying the
installed build:

1. **Two rows, one package.** `dsh-better-compact` is the host companion (config
   schema/service/inspect/client), `dsh-better-compact/engine` is the compaction
   provider. The companion never registers `ctx.compaction`; the engine never
   owns UI/config parsing.
2. **One provider per realm.** `BasicCompactionEngine` provides the
   `compaction` service. Web presets isolate that service per agent; the
   `better-compact` preset mounts our engine inside the same group as
   `command-compact` and `tool-result-pruner`.
3. **Host-plane engine guard.** The standalone bundle also inserts a host-plane
   engine for headless/TUI. Agent events are delivered to untagged root
   listeners, so in Web the host engine would otherwise see every preset agent.
   Native automatic listeners are registered through an extended public context
   that gates `agent/pre-step`, `agent/request`, and `agent/request-error` by
   `ctx.agentPresets.serviceFor(agent,'compaction')`. In rc.2 the request-model
   switch path bypasses `compactIfNeeded`, so that method's existing guard alone
   is insufficient. Native callbacks still own proposed-header pricing and
   durable transactions; no upstream private methods are overridden. Cordis wraps
   services in proxies, so identity is compared through
   `symbols.original`; a raw `!==` check wrongly treats a preset engine as
   "another" engine.
4. **Frozen snapshot + live current.** The Loader's volatile config fields make
   saves live without remounting. The engine intentionally does not follow them:
   load-time snapshot keeps one coherent strategy. `inspect` compares the saved
   value with the snapshot and returns `requiresReload`.
5. **Only `summarize()` is subclassed.** Selection, retention, pricing, locking,
   the bracket transaction, flush, overflow recovery, and retry loops stay in
   the inherited engine. Enhanced modes re-implement only the auxiliary
   LLM request shape (adapted from `summarizeWithLlm`, MIT) so they can change
   the instruction, add authoritative state, pass an explicit reasoning effort,
   and validate output before installation.
6. **Windows temp files cannot prove POSIX modes.** `%TEMP%` is the per-user
   boundary, Node's `stat.mode` on Windows only reflects the read-only
   attribute, and an ACL check would need a native module. The handoff writer
   therefore verifies `0600` on POSIX and skips only that assertion on
   `win32`, keeping the byte-for-byte read-back and per-attempt directory. The
   platform and stat call are injectable test seams.
7. **Inspect must name the engine it is looking at.** A Web session can run a
   preset-owned native engine (the shipped `standard` preset). `serviceFor`
   plus `symbols.original` distinguishes host, our preset, and a foreign preset;
   foreign sessions get `engine.inspectApplies: false` with `budget`/`preview`
   null while `lastCompaction` still comes from their real events.
8. **The inspect route fails closed.** It is registered only when both
   `webServer` and `connection` exist; if the fence service disappears the
   handler returns 503. The smoke mints a real Connection session cookie and
   exercises the route through the real auth path (401 unauthenticated).
9. **The preview upper bound includes native framing.** `NATIVE_CHECKPOINT_FRAMING_TOKENS`
   prices the native preamble and `<compacted-summary>` tags so
   `afterUpperBoundTokens` is a true upper bound; the text is reproduced only
   for pricing (MIT notice), never used to write checkpoints.
10. **The native formulas are mirrored in one adapter.** DSH's installed build is
   bundled and does not export `resolveCompactSpec`, `resolveTargetPolicy`, or
   `selectCompactableRange`. `src/budget.js` reproduces them for the inspect
   preview and the summary budget. The smoke asserts the preview cut against the
   actual `shadowedRange` of a real automatic compaction; when changing the DSH
   baseline, re-check those formulas first.
11. **No new session events, no second history, no write API.** Successful work
   produces the native compaction events/replacement; inspect is a GET projection
   over those events plus the singleton token meter.
12. **Handoff body is the checkpoint summary.** The temp file and checkpoint share
   the exact same Markdown body. That makes file deletion harmless for replay and
   avoids a sidecar index. Continuation is triggered by the live manual call,
   never by observing an event, so replay cannot reschedule it.
13. **The visual page reads over GET and writes only through the Host form.**
    `/better-compact/api/models` is a metadata projection of the optional host
    `subagentModelSelection` service plus `llm.resolveModelInfo` efforts; it is
    not a second model catalog, performs no provider/CLI I/O, and returns
    `{enabled:false,routes:[]}` when the service is absent. The page's only
    write path is `form.mutate(ops, expectedRevision)`; revision conflicts are
    surfaced explicitly and transport failures keep the draft. Session selection
    comes from the client `sessions` list store, so the row page never invents a
    session id. Strategy SVGs are schematics; token/budget/status numbers come
    only from inspect and unknown values stay unknown.

## Test coverage

`npm test` runs `node --import tsx --test` over the TypeScript sources — the
`tsx` loader handles `.tsx` component tests, which Node's native type stripping
cannot. No bundle or build step is involved:

- `config.test.ts` — schema defaults, volatile fields, normalization, all
  cross-field conflicts, unknown top-level/policy key rejection,
  native-projection stripping, policy-level headroom semantics, stable keys.
- `budget.test.ts` — exact native threshold/retention arithmetic, per-target
  overrides, capacity/retention errors, safe-cut tail retention, tool-pairing
  boundaries, fixed-prefix pricing.
- `prompts.test.ts` — required sections, state rendering/caps, omission notes,
  structure rejection, mode detection, redaction patterns, handoff document
  composition, continuation text.
- `handoff.test.ts` — temp directory/file uniqueness, POSIX `0600` and
  Windows synthetic-mode paths, read-back verification, empty-body rejection,
  path-safe session ids, explicit timestamps.
- `engine.test.ts` — frozen snapshot, missing companion error, native delegation
  and native in-flight summary marking, goal state + effort + cache-shape
  request, unsupported effort, truncation / malformed-output rejection, handoff
  file embedding and rawOutput redaction, ordered budget fallback (todos first,
  then pending facts, then goal-only) with disclosure/omission recording, route
  resolution, supersede identity, exactly-one continuation and blockers,
  continuation outcome recording.
- `state.test.ts` — read-only goal/todo/question/job/child collection and every
  continuation blocker.
- `inspect.test.ts` — `lastCompaction` status/trigger/mode projection (including
  recorded-error surfacing on an open bracket), budget/preview math with native
  framing, null-not-zero semantics, engine ownership for host/preset/foreign/
  cold sessions, handoff-continuation exposure, diagnostics for token-meter
  failure and summary-budget omissions, live read-only behavior, 404/503
  mapping, cold `observeSession` path.
- `fence.test.ts` — 401/403 ordering, missing-fence 503, registration waiting
  for both webServer and connection, 400/405, documented response shape and
  no-store.
- `models.test.ts` — absent/allowed/malformed catalogs, per-route capability
  failure, fence ordering before model work, GET-only 405, no-store JSON, and
  both routes being registered only with webserver+fence.
- `client.test.tsx` — module identity, alias keys, slot registration, summary
  copy, section order, three distinct diagrams, radiogroup/keyboard/disabled
  semantics, pending active-mode flags, native "not applicable" controls,
  model/effort incompatibility and pair clearing, unknown capability,
  retention switching, save ops/revision, success/reload copy, conflict,
  refused/transport errors, unknown vs measured budget, framing labels, reason
  classification, completed/cache-unknown/persistence-error statuses, handoff
  continuation, deduped diagnostics, foreign-engine suppression, session
  selection/stale abort/empty state, inspect failure still editable, host theme
  tokens/reduced motion/labelled controls, and no client-side token counting.
- `summary-image.test.ts` — one page for a short summary, byte-for-byte
  determinism, fixed 860px width with variable height, empty text still yielding
  one page, a 40-line break on the default layout, consecutive page names capped
  at `SUMMARY_IMAGE_MAX_PAGES`, the compact re-wrap that saves a marginal
  checkpoint, the `… (N more line(s) omitted…)` marker, an explicit lower
  `maxPages`, different bytes for CJK vs ASCII, and a real `loadImage` decode
  round-trip (the hand-written greyscale PNG is valid).
- `draft.test.ts` — form validation messages against the dictionary, instruction
  length cap, the mirrored default retain ratio, `policyDraft`/`policyValue`
  round-trips, `buildOps` writing only changed fields (retention form included),
  stored-value tolerance, and model-selection effort warnings.
- `inspect-client.test.tsx` — the read-only renderer: foreign-engine suppression
  of budget/preview, unknown capacity staying unavailable instead of invented,
  every measured `lastCompaction` field plus the persistence failure, and the
  safe-cut range/upper bound.
- `package.test.ts` — npm contract (`main`/`types`/`exports`/`files` and the
  build scripts, `@napi-rs/canvas` staying a runtime dependency), patch
  structure, verbatim standard-preset copy (when
  `DSH_PACKAGE_ROOT` is set), release workflow, documented commands, and
  tracked-file hygiene.
- built artifacts — `lib/index.js`, `lib/engine.js`, `lib/client.js` and
  `lib/types/**/*.d.ts` exist, every `exports` target points at one of them
  (never at `src/*.ts`), and `lib/client.js` opens with the
  `window.__ModuleLoader__.load({ id: 'dsh-better-compact', ... })` banner.
  Build before running the suite, or these assertions fail on purpose.

Run with the baseline preset comparison enabled (the isolated rc.2 runtime in
this repository already has that shape):

```sh
DSH_PACKAGE_ROOT="../.dsh-dev/runtime/node_modules/@deepseek-ai/dsh" npm test
```

## Real-profile smoke

```sh
npm run build   # the smoke installs the published layout, so lib/ must exist
DSH_PACKAGE_ROOT="/path/to/node_modules/@deepseek-ai/dsh" npm run smoke
```

The `DSH_PACKAGE_ROOT` value may also point at a runtime root or at its
`node_modules/@deepseek-ai` directory; the script resolves `@deepseek-ai/dsh`
from any of the three. The expected host version comes from `engines.dsh`, so a
host that does not match it fails before the first boot.

What it does:

1. Creates a temp `DSH_HOME` and an `it` profile from the installed
   `@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-headless` bundles plus this
   package. Only the entries listed in `files` are copied (i.e. the built
   `lib/` tree, the presets, docs and licences) with `@deepseek-ai` symlinked to
   the runtime; no repo `node_modules`, `src/` or design docs are used. Missing
   artifacts abort with a "run npm run build" message instead of booting half a
   package.
2. Disables the headless startup/runner rows, inserts a workspace row, the
   model-selection settings row, an agent-preset registry, and a real
   `@deepseek-ai/dsh-host-webserver` on port 0.
3. Registers a scripted LLM adapter (`it-noop/noop`) with
   `contextWindow: 30000`, `defaultMaxTokens: 64`, reasoning efforts
   `low`/`high`, and special handling for `purpose: 'compaction'` and
   `'session-title'`.
4. Boot 1 — goal mode, auto on:
   auto pressure compaction and native event sequence; authenticated inspect
   over HTTP (401 unauthenticated, 400/404/405/no-store); the models route over
   the same fence with the real allowed-model catalog and advertised efforts
   (401 unauthenticated, 405 write verb, no-store); preview range equals the
   actual native `shadowedRange`; read-only checks; goal state in the
   instruction; failure keeps the durable surface and turn; recovery; manual
   failure mapping; manual no-op; settings save → `requiresReload` → active
   snapshot unchanged.
5. Boot 2 — handoff mode, auto off (reloaded): manual `/compact` writes the
   temp file, the summary/rawOutput/replacement/file contain no planted secret,
   exactly one same-session follow-up is scheduled and visible in inspect;
   effort/cache-priority request shape; delete file + flush; paused goal blocks
   continuation but still commits the checkpoint; a real `standard` preset
   session is reported as a foreign engine; an injected `session/flush`
   listener failure at the compaction durability checkpoint →
   `persistence-error` (the real JSONL writer still runs, so this is an
   aggregate flush failure, not a simulated disk failure); real in-flight abort
   → `cancelled`; simulated `compaction/end` append failure → `failed` with the
   recorded error; a real timed pending question, real running job, and real
   running child each skip continuation and expose blockers; save
   `auto: true`. Manual handoff continuation is exercised on the host-plane
   engine; the preset engine automatic path is covered separately, and the
   preset manual path runs the same engine code.
6. Boot 3 — handoff mode, auto on: automatic handoff compaction adds no turn;
   the `better-compact` preset provides an isolated engine and produces exactly
   one compaction (no host double-compaction); save `mode: native`.
7. Boot 4 — native mode: cold inspect of the persisted handoff session (mode
   `handoff`), replay after the file was deleted, and native auto compaction with
   the inherited summarizer, no effort override, and native request shape.

`BETTER_COMPACT_KEEP_SMOKE_HOME=1` keeps the temp home for post-mortem; the
session log is zstd-compressed (`session.v4.jsonl.zstd`) and the profile
`cordis.patch.yml` shows what the settings service persisted. The smoke never
touches the user's real profile or the running GUI.

## Debugging notes

- The Plugins row page is the visual editor. It saves through the Host
  configForms revision/CAS path and shows "saved — reload profile"; restart the
  DSH process to apply. If the page itself is unavailable or you prefer files,
  edit the `dsh-better-compact` row in the profile's `cordis.patch.yml` and
  restart the profile.
- If the visual page says model capability is unknown, the host has no
  `subagentModelSelection` service or the adapter has no reasoning metadata.
  Free-text provider/model/effort still works; the models route intentionally
  does not probe providers or CLI catalogs.
- The session picker auto-selects the first client session and can switch to
  plugin state only. It only calls the GET inspect route; a page refresh or a
  picker change never triggers compaction, an LLM call, a CLI call, or a file
  write.
- A revision conflict in the page means the Host configuration changed while
  the draft was open; use "Reload host values" and re-apply. A transport error
  keeps the draft and is not a successful save.
- Native mode disables the enhanced effort/cache controls while keeping their
  saved values; switching back to goal/handoff re-enables them. Do not expect
  the native summarizer to apply those values.
- `ctx.compaction` must be a `BetterCompactEngine`. If it is absent, the bundle
  row was not selected or the row failed to load; read the Loader diagnostic.
- If Web sessions do not use the plugin, check the selected preset. Shipped
  presets own their compaction engine; only `better-compact` contains ours.
- If `requiresReload` stays false after a save, the save did not change a
  volatile field (or the row is not addressable); check
  `ctx.settings.describe()` for the `dsh-better-compact` namespace/revision.
- The native `todos` projection resets on every `turn/start`. Automatic
  pressure compaction runs at that boundary, so it usually has no todo list;
  manual idle compaction sees the previous turn's list. This is host behavior,
  not a missing read path.
- Unknown configuration keys are rejected at load, including keys inside a
  `modelPolicies` entry. The error names the key and the supported set; a
  manual YAML typo should fail the row, not be ignored.
- If an enhanced summary request cannot fit all authoritative state, the
  instruction contains a `## Budget note` and inspect `diagnostics` reports what
  was omitted. The fallback order is: drop todos (keep pending
  questions/jobs/children), then goal-only, then no state.
- If enhanced summaries fail with `BETTER_COMPACT_BUDGET`, the replayed span plus
  `maxTokens` does not fit `contextWindow`; this is explicit rather than a silent
  truncation. Use a larger model, lower `maxTokens`, or compact earlier.
- If a manual handoff reports `ManualCompactionError('summary')`, inspect the
  session log's `compaction/end.error`. Common causes: provider failure,
  truncation at the cap, missing required sections, handoff file write/read-back
  failure, or the framed summary not being smaller than the shadowed span.
- The inspect route is read-only and fails closed: no `connection` service means
  no route. Smoke HTTP uses a real `/connect` cookie; a 401 usually means the
  cookie was not minted or the profile restarted.
- `engine.owner`/`inspectApplies` distinguishes the serving engine. A Web session
  on the `standard` preset correctly reports a foreign engine and no
  budget/preview; that is not a missing backend.
- Windows handoff writes skip the POSIX `0600` assertion (Node synthesizes
  `stat.mode` there). The read-back check still runs; see `handoff.test.ts`.
- Do not add mutating verbs to inspect; settings writes go through the host
  `settings`/configForms pipeline only.

## Inspect and models contract notes for the visual settings page

The read-only payload is the shared contract the visual settings page renders; treat these as stable:

- Keys: `activeConfig`, `requiresReload`, `sessionId`, `engine`, `diagnostics`,
  `budget`, `preview`, `lastCompaction`, `handoffContinuation`.
- `diagnostics` is always a `string[]` (empty when nothing is wrong). It carries
  token-meter or model-info failures, budget-capacity reasons, the last summary's
  budget omission (`recordBudgetFallback`), and the engine-applicability reason.
  Render it as an informational/error list; it is not a second metric system.
- `engine.owner`/`inspectApplies` decide whether the budget/preview sections are
  meaningful for this session. A foreign preset session returns
  `budget: null`/`preview: null`; do not draw a fake threshold or percentage.
- `handoffContinuation` is process-local (`null` on a cold/restarted process) and
  reports `scheduled` or `skipped` plus blockers for the last manual handoff.
- Unknown values stay `null`; `measurement` distinguishes `measured` (provider
  usage anchor), `estimated` (fixed heuristic), and `unavailable`.
- `afterUpperBoundTokens` includes the summary output budget and
  `NATIVE_CHECKPOINT_FRAMING_TOKENS`; keep calling it an upper-bound estimate.
- Saving still goes through `ctx.settings`/configForms revision CAS; this API is
  GET-only and must not gain a write verb for UI convenience.
- `GET /better-compact/api/models` shares the same fence and is also GET-only.
  It returns `{enabled, routes:[{provider,model,efforts,defaultEffort}]}` from
  the optional `subagentModelSelection.current().allowedModels` catalog enriched
  with `llm.resolveModelInfo` reasoning efforts; absent service/catalog is
  `{enabled:false,routes:[]}`. The list is candidate metadata — the page keeps a
  saved route outside it visible and marked rather than deleting it.
- The client uses the client `sessions` service list store (`ids`/`byId`) to
  pick one session for `?sessionId=`, aborts stale requests, and keeps the form
  editable when inspect fails. It never invents a session id.

## Updating the DSH baseline

1. Read the installed `@deepseek-ai/dsh-compaction-basic` source and re-check
   `resolveCompactSpec`, `resolveTargetPolicy`, `selectCompactableRange`,
   `summarizeWithLlm`, `frameSummary`, and the manual/overflow retain rules
   against `src/budget.js` / `src/engine.js`.
2. Refresh `presets/better-compact.patch.yml` from the new
   `@deepseek-ai/dsh-web-app/presets/standard.patch.yml` and change only the
   preset identity/metadata and the compaction group engine row. The package
   test compares it against the installed standard preset while
   `DSH_PACKAGE_ROOT` points at that install.
3. Read authoritative todo/question wire views with one complete
   `sessionProjections.snapshot(session, new Set(['todos', 'userQuestions']))`;
   do not use the deprecated `stateOf` or partial `cachedSnapshot` reads.
4. Re-check the Web composition: which rows are preset-owned/disabled and
   whether the preset group still isolates `compaction`/`toolResultPruner`.
5. Re-run unit tests and the smoke; then check the current GUI/URL only as part
   of the S4 integration task.

## Known unverified areas

- Real-model summary fidelity and adherence (controlled scripted output only).
- Real provider cache-read/write hits and cost effects.
- Reasoning-effort quality (capability validation is tested; model behavior is
  not).
- A current-GUI visual/keyboard acceptance pass of the visual settings page
  (component tests only here; the running-GUI check belongs to S4).
- Apollo combination/loading matrix and migration (S4).

## Known pre-existing failure (not a regression)

`scripts/runtime-smoke.mjs` stops at the model-switch turn of the
`better-compact` preset realm on DSH 0.2.2-rc.2:

```
MODEL_SWITCH_COMPACTION_FAILED: Cannot switch to it-noop/smaller: context
compaction failed: compaction still above threshold after 1 compaction
attempts (7897 estimated tokens >= threshold 7500)
```

The host realm and every check before it pass. This was verified A/B against
the pre-TypeScript implementation (`v0.4.1`, `src/*.js`) on the same rc.2
runtime: identical assertion, identical turn number, identical 7897/7500
numbers, identical `checks so far` list. It is therefore a defect of the
0.4.1 engine in the preset realm (model-switch pressure with
`compactionRetries: 0`), not something the TypeScript port introduced — and it
doubles as evidence that the port is behaviour-preserving. Triage on its own;
the smoke keeps every original assertion, so it stays visible.
