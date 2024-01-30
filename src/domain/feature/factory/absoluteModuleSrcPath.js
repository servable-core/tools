import getModuleDir from '../../../lib/getModuleDir.js'

export default (item) => {
  const featurePath = getModuleDir(item)
  if (!featurePath) {
    return null
  }

  return `${featurePath}/src`
}
