import semver from 'semver'

export default async (props) => {
  const {
    feature,
  } = props

  const { instances } = feature
  if (!instances || !instances.length) {
    return {}
  }

  let highestVersion = {
    value: "0.0.0",
  }
  let lowestVersion = {
    value: "10000000.0.0",
  }
  let lowestCompatibleVersion = {
    value: "10000000.0.0",
  }

  for (var i in instances) {
    const instance = instances[i]
    if (semver.lte(highestVersion.value, instance.version)) {
      highestVersion = {
        value: instance.version,
        instance
      }
      lowestCompatibleVersion = {
        value: instance.minimumCompatibleVersion,
        instance
      }
    }
    if (semver.gte(lowestVersion.value, instance.version)) {
      lowestVersion = {
        value: instance.version,
        instance
      }
    }
  }

  return {
    highestVersion,
    lowestCompatibleVersion,
    lowestVersion
  }
}
