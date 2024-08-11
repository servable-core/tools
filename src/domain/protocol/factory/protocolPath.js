
import checkFileExists from '../../../lib/checkFileExists.js'
import absoluteModuleSrcPath from './absoluteModuleSrcPath.js'

export default async (props) => {
  const { id, module, servableConfig } = props
  let protocolPath = null

  if (typeof module === 'object'
    && Object.keys(module).length) {
    const item = Object.keys(module)[0]
    if (item) {
      protocolPath = absoluteModuleSrcPath(item)
      return protocolPath
    }
  }

  if (servableConfig.protocols
    && servableConfig.protocols.external
    && servableConfig.protocols.external[id]) {
    protocolPath = absoluteModuleSrcPath(servableConfig.protocols.external[id])
    return protocolPath
  }

  if (servableConfig.protocols
    && servableConfig.protocols.local
    && servableConfig.protocols.local.length) {

    let i = 0
    do {
      const repo = servableConfig.protocols.local[i]
      protocolPath = `${repo}/${id}`
      if ((await checkFileExists(protocolPath))) {
        return protocolPath
      }
      i++
    } while (i < servableConfig.protocols.local.length)
  }

  return null
}
