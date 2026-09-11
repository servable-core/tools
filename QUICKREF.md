# @servable/tools — Quick Reference

## Schema

A protocol's schema is one file at its root, `schema.json`, shaped like:

```json
{
  "managed": {
    "classes": [
      { "className": "SlugableEntry", "fields": { "...": { "type": "String" } }, "indexes": { "...": { "field": 1 } } }
    ]
  },
  "target": {
    "fields": { "slugableValue": { "type": "String" } },
    "indexes": { "_slugableValue": { "slugableValue": 1 } },
    "classLevelPermissions": {}
  }
}
```

- `managed.classes[]` — classes this protocol *owns* (created if they don't exist).
- `target.*` — fields/indexes/CLPs this protocol *contributes* to whatever class attaches it (e.g. `slugable` adds `slugableValue` etc. to `Publication`, `Article`, `_User`, ...).

No `schema/<version>/` directory, no `up.js`/`down.js`. If you're migrating an existing protocol off the old versioned convention, use the app's own migration script (e.g. `backend/main/scripts/migrate-protocol-schemas.js`) — it handles both the merged-`index.json` and legacy split-file (`classes.json`/`fields.json`/`indexes.json`/`classlevelpermissions.json`) conventions.

## Building the artifact

```js
import { compileArtifact } from '@servable/tools'

const artifact = await compileArtifact({ servableConfig })
// { artifactVersion, generatedAt, hash, classes: [...], protocolVersions: [...] }
```

If you already have a `buildSchema()` result (the server does, at boot — don't call `buildSchema()` a second time just to get an artifact):

```js
import { buildSchema, normalizeArtifact } from '@servable/tools'

const result = await buildSchema({ servableConfig })
const artifact = normalizeArtifact(result)   // pure, no I/O
```

`artifact.hash` covers `classes` only (see `CLAUDE.md` for why `protocolVersions` is excluded) — that's what changes when, and only when, the actual schema changes.

## Diffing two artifacts

```js
import { plan } from '@servable/tools'

const result = plan({ before: committedArtifact, after: freshArtifact })
// {
//   hashChanged: boolean,
//   safe: [...],              // additive - applies automatically
//   breaking: [...],          // never automatic - needs `schema contract`
//   breakingDeprecated: [...], // breaking, but the field/class was marked deprecated - eligible for `schema contract`
//   hasBreakingChanges: boolean,
// }
```

Each entry has at least `{ kind, className, safe }`; field-level entries also carry `fieldName`, and `typeChanged`/`targetClassChanged` carry `from`/`to`. See `schema/plan/classifyField.js` for the full set of `kind` values.

## Minimal caller requirements

`buildSchema()`/`compileArtifact()`/`normalizeArtifact()` need `global.Servable.App.{Object,User,Role}` to exist so protocol `class.js` files (`class Publication extends Servable.App.Object`) can import without throwing. They do **not** need a real engine — a plain stub is enough:

```js
class Base {}
global.Servable = { App: { Object: Base, User: class extends Base {}, Role: class extends Base {} } }
```

This is exactly what `@servable/cli`'s schema commands do (see its own `QUICKREF.md`) — no engine bootstrap, verified to produce byte-identical `classes` output to a fully-hydrated real server.
