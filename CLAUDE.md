# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For fast copy-paste usage, see `QUICKREF.md`.

## What this repo is

`@servable/tools` — the engine-agnostic core of the Servable framework: the protocol loader (reads a protocol's manifest/schema/triggers/jobs off disk), the schema build pipeline (merges every protocol's contributions into one resolved per-class schema), and the unischema artifact/plan tooling. Nothing here imports a specific engine (`@servable/parse-server-engine` or any future one) — an app's own `index.js` chooses an engine and passes it in; this package only ever reads `Servable.engine`/`Servable.App` if a caller happened to set them, and must degrade correctly when they're absent (see the unischema section below — this is a real rule this package violated once).

## Commands

- Install: `yarn install`
- Test: `yarn test` (jest)
- Lint: `yarn test:lint` (`eslint .`)

## Architecture

- **`domain/protocolLoader/`** (`v1.0.0.js`, `v1.1.0.js`) — reads a protocol's manifest (`index.json`/`manifest.json`/`module.json`, checked in that priority order — see `factory/getModule.js`), classes, triggers, jobs, and schema off disk. `apiVersion` in the manifest picks which loader version a protocol uses; anything not `"1.1.0"` falls back to `v1.0.0`.
- **`schema/build/`** — `buildProtocol/` recursively walks a protocol's classes and every other protocol contributing fields to them (`classStruct/protocolInClassClassSchema.js` does the actual per-class merge), producing `appProtocol.schema.classes.all` — the fully-resolved, per-class schema every protocol's fields have already been merged into. This is what Parse actually receives at launch, and what `schema/artifact/` hashes.
- **`schema/validate/`** — protocol *version* compatibility (not schema compatibility — see unischema below): walks `instances[]` per protocol and checks `minimumCompatibleVersion` against the highest version present, erroring if a protocol can't work with a version of another it depends on. Currently inert in practice (every protocol in `backend/main` is vendored one-copy-each, so two versions of the same protocol never actually coexist) but kept for a future registry-install model where transitive dependencies could diverge.
- **`schema/artifact/`** and **`schema/plan/`** — see "unischema" below.

## unischema — flat schema.json, no versioned migration

See `.docs/technical/unischema-plan.md` (in the workspace root, above this repo) for the full plan and the reasoning behind every decision referenced below.

**A protocol's schema is one flat, unversioned file: `<protocol-root>/schema.json`.** Not `schema/<semver>/index.json`. `protocolLoader`'s `schemaRaw()` reads it directly — no `_schemaPath()`, no `schemaVersions()`, no `schemaVersionOf()`, no `up.js`/`down.js` concept at all. Both loader versions (`v1.0.0.js`, `v1.1.0.js`) were updated identically. A protocol's `version` field in its manifest is unaffected by any of this — it still feeds `schema/validate/`'s protocol-compatibility check above; schema identity now lives entirely in the artifact hash, decoupled from protocol version (decision #10).

**`schema/artifact/index.js`** compiles a `buildSchema()` result into a flat, hashable artifact:
- `normalizeArtifact({ appProtocol, protocols })` — **pure, no I/O.** Takes a `buildSchema()` result a caller already has (the server always does — it's already the expensive once-per-boot step) and extracts `{ classes, protocolVersions }`. Never call `compileArtifact()` if you already have a `buildSchema()` result; that would re-run the whole build a second time just to hash it.
- `compileArtifact({ servableConfig })` — convenience wrapper for a caller with no `buildSchema()` result already in hand (the CLI, always). Calls `buildSchema()` then `normalizeArtifact()`.
- **The hash covers `classes` only, deliberately not `protocolVersions`.** Confirmed live: which protocol instances `buildProtocol()`'s recursive `protocolFactory()`/`protocolsCache` resolves (and therefore what ends up in `protocolVersions`) is resolution-order-dependent for any protocol referenced from more than one place — two builds from byte-identical protocol sources produced identical `classes` but different `protocolVersions`, for reasons unrelated to any real schema change (which class.js files happened to import successfully elsewhere in the same run, affecting which dependency chains got walked far enough to resolve a given protocol). That makes `protocolVersions` unsuitable for hash-based drift detection — it would false-positive the boot-time compatibility check on deploys with no actual schema change. `protocolVersions` is still recorded in the artifact (useful in a `schema plan` diff, and feeds `schema/validate/`) — just not part of `hash`.

**`schema/plan/index.js`** diffs two artifacts (typically: committed `servable.schema.json` vs. a fresh `compileArtifact()`/`normalizeArtifact()` result) into three buckets:
- `safe` — added class/field/index, a field's `deprecated` flag changing, classLevelPermissions changes (narrowing a CLP is an access decision, not a data-integrity one — never gated).
- `breaking` — removed class/field/index, a type change, `targetClass` change on a Pointer, a field newly becoming required. Never applied automatically.
- `breakingDeprecated` — same as `breaking`, but the field/class carried `"deprecated": true` on the artifact it's being removed from. Only `servable schema contract` (in `@servable/cli`) may act on these.

`classifyField.js` holds the per-field rules; `plan/index.js` handles class/index/CLP-level diffing and buckets everything.

## Known gap this package must not reintroduce

`buildProtocol/index.js` used to call `Servable.engine.formatAppClassesSchemas({ classesSchemas })` for the root `app` protocol **unconditionally**. That's an engine-specific method — a caller with no engine configured (any `@servable/cli` `schema *` command; the CLI intentionally never bootstraps a real engine, see that package's own `CLAUDE.md`) would crash on `Servable.engine` being `undefined`. Fixed by guarding the call (`Servable.engine?.formatAppClassesSchemas`) rather than by forcing every caller to carry an engine dependency just to satisfy this one package's internals. If you add a new `Servable.engine.*` call anywhere in this package, guard it the same way — this package is supposed to work with nothing but `Servable.App.{Object,User,Role}` present, and every real caller (CLI, server) should be able to rely on that.

## Testing gotchas

`extractProtocolsProtocols.js` and `extractClassesProtocol.js` both call `protocolFactory()`, which returns `null` (not an error) when a referenced protocol can't be found locally (`protocolPath()` resolves nowhere — a dependency declared in a manifest but never vendored). Both are guarded (`if (!protocol) { console.warn(...); continue }`) — this used to crash the *entire* schema build on one missing dependency-of-a-dependency (`protocol.loader` on `null`). If you see `TypeError: Cannot read properties of null (reading 'loader')` while testing against a real protocol tree, it's very likely a genuinely-missing local vendor, not a regression — check the warning that should now print alongside it before assuming otherwise.
