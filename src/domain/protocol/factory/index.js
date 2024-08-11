import protocolPath from './protocolPath.js'

import _ from 'underscore'
import ProtocolClass from '../index.js'

export default async ({
  protocolPayload,
  servableConfig,
  protocolsCache,
  instancesPathId
}) => {

  const { id, module, version, type, } = protocolPayload
  let path = protocolPayload.path
  if (!path) {
    path = await protocolPath({
      id,
      module,
      version,
      servableConfig
    })
  }

  if (!path) {
    return null
  }

  let protocol = null
  const valueInCache = cacheValue({
    protocolPayload: {
      ...protocolPayload,
      path
    }, protocolsCache
  })

  if (valueInCache) {
    protocol = valueInCache.protocol
  } else {
    protocol = new ProtocolClass({ id, type })
    protocolsCache.push({
      id,
      module,
      version,
      path,
      protocol
    })
  }

  await protocol.addInstanceIfNeeded({
    protocolPayload: {
      ...protocolPayload,
      path
    },
    instancesPathId,
    servableConfig
  })
  // console.log(instancesPathId)
  return protocol
}


const cacheValue = ({ protocolPayload, protocolsCache }) => {
  const { id, module, version, path } = protocolPayload
  const candidates = _.where(protocolsCache, {
    id,
    // version,
    // path,
    // module
  })
  return (candidates && candidates.length) ? candidates[0] : null
}
