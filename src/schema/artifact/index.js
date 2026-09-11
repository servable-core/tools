// unischema's compiled schema artifact - see .docs/technical/unischema-plan.md decision #3.
//
// `buildSchema()` returns a rich object graph (protocol instances, loaders, caches) meant for
// driving the launch process, not for committing to git or hashing. This module extracts the
// one thing that actually matters for drift-detection and PR review: the fully-resolved,
// per-class schema every protocol's contributions have already been merged into
// (`appProtocol.schema.classes.all` - built by schema/build/buildProtocol/index.js, each entry
// already passed through classStruct/protocolInClassClassSchema for every contributing
// protocol). That merged view, not any single protocol's own schema.json, is what Parse actually
// receives at launch - so it's what should be reviewed and diffed.
import buildSchema from '../build/index.js'
import stableStringify from '../../lib/stableStringify.js'
import crypto from 'crypto'

const ARTIFACT_VERSION = 1

const normalizeClass = (classSchema) => {
  const {
    className,
    fields = {},
    indexes = {},
    classLevelPermissions = {},
  } = classSchema || {}

  return {
    className,
    fields,
    indexes,
    classLevelPermissions,
  }
}

// buildSchema()'s protocol graph carries version and dependency info per protocol instance -
// pulled out separately from the class data above because it answers a different question
// (validateSchema's protocol-compatibility check, decision #10) than the schema content does.
const extractProtocolVersions = (protocols) => {
  const seen = new Map()
  ;(protocols || []).forEach(protocol => {
    const { instances } = protocol || {}
    ;(instances || []).forEach(instance => {
      if (!instance || !instance.id) {
        return
      }
      seen.set(`${instance.id}@${instance.version}`, {
        id: instance.id,
        version: instance.version,
        minimumCompatibleVersion: instance.minimumCompatibleVersion,
      })
    })
  })
  return [...seen.values()].sort((a, b) => a.id.localeCompare(b.id) || a.version.localeCompare(b.version))
}

// Pure - no I/O, takes a buildSchema() result it did not itself produce. Split out from
// compileArtifact() specifically so a caller that already has a buildSchema() result (launch/
// index.js always does - it's already the slow, once-per-boot step) never has to pay for a
// second one just to get an artifact. Only the CLI (which never has one lying around) goes
// through compileArtifact() below.
export const normalizeArtifact = ({ appProtocol, protocols }) => {
  const classes = (appProtocol?.schema?.classes?.all || [])
    .map(normalizeClass)
    .filter(c => c.className)
    .sort((a, b) => a.className.localeCompare(b.className))

  const protocolVersions = extractProtocolVersions(protocols)

  // Hash covers `classes` ONLY, not protocolVersions - confirmed live during testing that which
  // protocol instances buildProtocol()'s recursive protocolFactory()/protocolsCache resolves
  // (and therefore what ends up in protocolVersions) is resolution-order-dependent for any
  // protocol that gets referenced from more than one place, independent of unischema's own
  // changes and independent of any actual schema content - two builds from byte-identical
  // protocol sources produced identical `classes` but different `protocolVersions` depending on
  // incidental import-order effects elsewhere (which class.js files happened to import
  // successfully). That makes protocolVersions unsuitable for hash-based drift detection
  // (decision #4) - it would false-positive on every deploy for reasons unrelated to any real
  // schema change. `classes` is what Parse actually receives and is what proved stable across
  // both runs, so it's the only thing this artifact's identity is defined by. protocolVersions
  // is still recorded (validateSchema's compatibility check, decision #10, and it's genuinely
  // useful in a `schema plan` diff) - just not part of `hash`.
  const hash = crypto.createHash('sha256').update(stableStringify({ classes })).digest('hex')

  return {
    artifactVersion: ARTIFACT_VERSION,
    generatedAt: new Date().toISOString(),
    hash,
    classes,
    protocolVersions,
  }
}

// Convenience wrapper for a caller with no buildSchema() result already in hand (the CLI, always
// - see schema/build.js, plan.js, apply.js, contract.js). Also used, deliberately, to detect
// drift at boot (decision #4): the server calls normalizeArtifact() on the result of its own
// buildSchema() run to hash "what the sources say right now," rather than calling this and
// re-running buildSchema() a second time.
export const compileArtifact = async ({ servableConfig }) => {
  const result = await buildSchema({ servableConfig })
  return normalizeArtifact(result)
}

// Content-only equality - ignores generatedAt, so re-running the build with no real schema
// change produces the same hash. Used both to build the artifact's own `hash` field and, at
// boot, to compare a freshly-compiled artifact against the one committed to git.
export const hashOf = (artifact) => {
  if (!artifact) {
    return null
  }
  const { classes = [] } = artifact
  return crypto.createHash('sha256').update(stableStringify({ classes })).digest('hex')
}

export default compileArtifact
