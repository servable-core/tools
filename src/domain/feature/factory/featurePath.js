
import checkFileExists from '../../../lib/checkFileExists.js'
import absoluteModuleSrcPath from './absoluteModuleSrcPath.js'

export default async (props) => {
  const { id, module, servableConfig } = props
  let featurePath = null

  if (typeof module === 'object'
    && Object.keys(module).length) {
    const item = Object.keys(module)[0]
    if (item) {
      featurePath = absoluteModuleSrcPath(item)
      return featurePath
    }
  }

  if (servableConfig.features
    && servableConfig.features.external
    && servableConfig.features.external[id]) {
    featurePath = absoluteModuleSrcPath(servableConfig.features.external[id])
    return featurePath
  }

  if (servableConfig.features
    && servableConfig.features.local
    && servableConfig.features.local.length) {

    let i = 0
    do {
      const repo = servableConfig.features.local[i]
      featurePath = `${repo}/${id}`
      if ((await checkFileExists(featurePath))) {
        return featurePath
      }
      i++
    } while (i < servableConfig.features.local.length)
  }

  return null
}
