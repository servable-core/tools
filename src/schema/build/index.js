import protocolFactory from "../../domain/protocol/factory/index.js"
import getProtocolsLiveClasses from "./lib/getProtocolsLiveClasses.js"
import adaptConfigBasic from "../../lib/adaptConfig/basic.js"
import buildProtocol from './buildProtocol/index.js'
import updateProtocolsExcerpt from './lib/updateProtocolsExcerpt.js'

export default async ({ servableConfig }) => {
  const { rootProtocolPayload } = servableConfig
  adaptConfigBasic({ servableConfig, live: false })
  const protocolsCache = []
  const appProtocol = await protocolFactory({
    protocolPayload: {
      id: rootProtocolPayload.id,
      type: rootProtocolPayload.type,
      path: rootProtocolPayload.path,
      version: rootProtocolPayload.version
    },
    servableConfig,
    protocolsCache,
    instancesPathId: [
      // { type: 'class', value: { className: '_root' } },
      { type: 'protocol', value: { id: 'app' } }
    ],
  })

  const protocolsExcerpt = {}
  const protocols = await buildProtocol({
    protocol: appProtocol,
    protocolFactory: async ({
      protocolPayload,
      instancesPathId
    }) =>
      protocolFactory({
        protocolPayload,
        servableConfig,
        protocolsCache,
        instancesPathId
      }),
    updateProtocolsExcerpt: async ({ adaptedClassesStructs }) =>
      updateProtocolsExcerpt({ adaptedClassesStructs, protocolsExcerpt }),
    instancesPathId: [
      { type: 'protocol', value: { id: 'app' } }
    ],
  })

  const liveClasses = await getProtocolsLiveClasses({ protocols })

  return {
    protocols,
    protocolsExcerpt,
    appProtocol,
    liveClasses
  }
}
