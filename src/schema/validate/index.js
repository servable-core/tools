import handleProtocol from "./handleProtocol/index.js"
import semver from 'semver'

export default async ({
  schema,
}) => {

  const {
    protocols
  } = schema
  const comparisons = []
  for (var i in protocols) {
    const protocol = protocols[i]
    const comparison = await handleProtocol({
      protocol,
    })
    comparisons.push(comparison)
  }

  const problematic = comparisons.filter(a => {
    const {
      highestVersion,
      lowestCompatibleVersion,
      lowestVersion
    } = a

    if (semver.lt(lowestVersion.value, lowestCompatibleVersion.value)) {
      return true
    }
    return false
  })

  if (!problematic || !problematic.length) {
    return {
      isValid: true
    }
  }

  let result = {
    isValid: false,
    issues: problematic.map(comparison => ({
      comparison,
      message: `${comparison.highestVersion.instance.id}@${comparison.highestVersion.instance.version} cannot work with ${comparison.lowestVersion.instance.id}@${comparison.lowestVersion.instance.version} (mimimum compatible version is ${comparison.highestVersion.instance.minimumCompatibleVersion}). Complete path: ${comparison.highestVersion.instance.instancesPathIdString}`
    }))
  }
  result = {
    ...result,
    message: `\n\n→ ${result.issues.map(a => a.message).join('\n→ ')}\n`
  }

  return result
}
