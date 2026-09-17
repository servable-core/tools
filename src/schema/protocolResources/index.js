import checkFileExists from '../../lib/checkFileExists.js'
import directoryFilesRecursive from '../../lib/directoryFilesRecursive.js'

// lucide 0.6 (protocol-resources), PEAKUB DX initiative.
//
// A separate, additive pass over an app's already-built protocol list - NOT part of
// buildSchema()/protocolLoader's own boot-critical path, and never invoked at server boot.
// buildSchema() already has a known perf finding (redundant reads, unparallelized loops); this
// module intentionally does not touch it or run as part of it, so it can't make that worse or
// put schema-compatibility-floor correctness at risk. It's meant to be called once, by a CLI
// command (see @servable/cli's `servable schema protocol-types`), consuming the `protocols`
// array `buildSchema()` already produces as plain input - not re-discovering protocols itself.
//
// Only `services/` and `jobs/` are scanned. Routes and Parse Cloud functions were deliberately
// left out of this first pass (not because they're unsupported, but because they're not a good
// fit yet): no live protocol under a real app currently has a `routes/` directory (the
// convention is only exercised by the app-level `app/routes/` tree), and `functions/`/`cloudCode`
// files use a structurally different export shape (multiple named exports, each becoming its own
// `Parse.Cloud.define()`-registered function, rather than one `{ id, handler }` default export)
// that this scanner doesn't handle yet. Both are real gaps, not silently ignored - see this
// package's own CLAUDE.md or file a follow-up rather than assuming they're covered.
//
// Services are the one resource here actually invoked through a string-keyed indirection
// (`Servable.Services.call({ id, params })`) that static analysis can't see through on its own -
// that's the whole reason this exists. Jobs are listed for discoverability (so an editor can show
// "what jobs does this protocol define"), not because anything calls a job by name - jobs run on
// their own cron schedule.

/**
 * @typedef {object} ProtocolResourceEntry
 * @property {string} id - the resource's own `id` field (services) or `id`/name (jobs).
 * @property {string} path - absolute path to the file that exports it, for `typeof import(...)`.
 * @property {string} [cron] - jobs only.
 */

/**
 * @typedef {object} ProtocolResources
 * @property {ProtocolResourceEntry[]} services
 * @property {ProtocolResourceEntry[]} jobs
 */

/**
 * Scans `services/` and `jobs/` for every protocol in `protocols`, keyed by protocol id.
 * Protocols with neither directory (or with directories that only contain malformed exports -
 * missing `id`, logged and skipped rather than thrown) are omitted from the result entirely.
 *
 * @param {object} props
 * @param {any[]} props.protocols - the `protocols` array `buildSchema()` already produced (each
 *   a `ProtocolInstance` with `.id` and `.loader.path`).
 * @returns {Promise<Record<string, ProtocolResources>>}
 */
export default async function buildProtocolResources({ protocols }) {
  /** @type {Record<string, ProtocolResources>} */
  const result = {}

  for (const protocol of protocols || []) {
    const protocolId = protocol && protocol.id
    const rootPath = protocol && protocol.loader && protocol.loader.path
    if (!protocolId || !rootPath) {
      continue
    }

    const services = await scanResourceDir({ dirPath: `${rootPath}/services` })
    const jobs = await scanResourceDir({ dirPath: `${rootPath}/jobs`, isJob: true })

    if (!services.length && !jobs.length) {
      continue
    }

    result[protocolId] = { services, jobs }
  }

  return result
}

/**
 * @param {object} props
 * @param {string} props.dirPath
 * @param {boolean} [props.isJob]
 * @returns {Promise<ProtocolResourceEntry[]>}
 */
const scanResourceDir = async ({ dirPath, isJob = false }) => {
  if (!(await checkFileExists(dirPath))) {
    return []
  }

  const files = await directoryFilesRecursive({ path: dirPath, includeMeta: true })
  if (!files) {
    return []
  }

  return files
    .map(({ module, path }) => {
      const exported = module && module.default
      if (!exported || !exported.id) {
        return null
      }
      return isJob
        ? { id: exported.id, path, cron: exported.cron }
        : { id: exported.id, path }
    })
    .filter(entry => entry !== null)
}
