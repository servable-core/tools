// unischema's plan/diff engine - see .docs/technical/unischema-plan.md decisions #2-#4.
//
// Compares two compiled artifacts (schema/artifact/index.js) - typically the previously
// committed servable.schema.json against a freshly-built one - and classifies every difference
// as SAFE (additive, applies automatically at boot) or BREAKING (never applied automatically;
// only `schema contract --allow-destructive` can act on it, and only when the thing being
// removed was already marked deprecated - see decision #1).
//
// This never touches a database. Both sides are just JSON, which is what makes the CI gate
// possible without one (decision #2) - `servable schema plan` diffs the artifact this commit
// would produce against the one the previous commit produced.
import classifyField from './classifyField.js'

const byClassName = (classes) => {
  const map = new Map()
  ;(classes || []).forEach(c => map.set(c.className, c))
  return map
}

const diffClass = ({ before, after }) => {
  const changes = []

  if (!before && after) {
    return [{ kind: 'classAdded', className: after.className, safe: true }]
  }

  if (before && !after) {
    return [{ kind: 'classRemoved', className: before.className, safe: false, deprecated: false }]
  }

  const fieldNames = new Set([
    ...Object.keys(before.fields || {}),
    ...Object.keys(after.fields || {}),
  ])

  fieldNames.forEach(fieldName => {
    const result = classifyField({
      before: before.fields?.[fieldName],
      after: after.fields?.[fieldName],
    })
    if (result) {
      changes.push({ ...result, className: before.className, fieldName })
    }
  })

  const indexNames = new Set([
    ...Object.keys(before.indexes || {}),
    ...Object.keys(after.indexes || {}),
  ])
  indexNames.forEach(indexName => {
    const beforeIndex = before.indexes?.[indexName]
    const afterIndex = after.indexes?.[indexName]
    if (!beforeIndex && afterIndex) {
      changes.push({ kind: 'indexAdded', safe: true, className: before.className, indexName })
    } else if (beforeIndex && !afterIndex) {
      // Dropping an index is safe in the sense that it can't corrupt data - but it can silently
      // remove a uniqueness constraint or tank a query an old pod relies on, so it's treated as
      // BREAKING like everything else that removes a guarantee a running pod might depend on.
      changes.push({ kind: 'indexRemoved', safe: false, deprecated: false, className: before.className, indexName })
    } else if (beforeIndex && afterIndex && JSON.stringify(beforeIndex) !== JSON.stringify(afterIndex)) {
      changes.push({ kind: 'indexChanged', safe: false, deprecated: false, className: before.className, indexName })
    }
  })

  // classLevelPermissions changes are reported but always SAFE: narrowing a CLP is an access
  // decision, not a data-integrity one - it can't produce the "old pod can't read what's there"
  // failure mode this whole plan/apply split exists to prevent. Flagged, not gated.
  if (JSON.stringify(before.classLevelPermissions || {}) !== JSON.stringify(after.classLevelPermissions || {})) {
    changes.push({ kind: 'classLevelPermissionsChanged', safe: true, className: before.className })
  }

  return changes
}

export const plan = ({ before, after }) => {
  const beforeClasses = byClassName(before?.classes)
  const afterClasses = byClassName(after?.classes)

  const allClassNames = new Set([...beforeClasses.keys(), ...afterClasses.keys()])

  let changes = []
  allClassNames.forEach(className => {
    changes = changes.concat(diffClass({
      before: beforeClasses.get(className),
      after: afterClasses.get(className),
    }))
  })

  const safe = changes.filter(c => c.safe)
  const breaking = changes.filter(c => !c.safe && !c.deprecated)
  const breakingDeprecated = changes.filter(c => !c.safe && c.deprecated)

  return {
    hashChanged: before?.hash !== after?.hash,
    safe,
    breaking,
    breakingDeprecated,
    // A plan is clean to auto-apply only when nothing breaking (deprecated or not) is present -
    // `contract` is a separate, explicit command even for the deprecated-and-therefore-eligible
    // case (decision #1: never automatic, always a deliberate act).
    hasBreakingChanges: breaking.length > 0 || breakingDeprecated.length > 0,
  }
}

export default plan
