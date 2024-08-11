import _ from 'underscore'
import adaptProtocolPayload from '../../../../lib/adaptProtocolPayload.js'
import cleanProtocols from '../../../../lib/cleanProtocols.js'

export default async ({
  protocolsPayloads,
  protocolFactory,
  instancesPathId }) => {

  let items = []

  for (var i in protocolsPayloads) {
    const protocolPayload = protocolsPayloads[i]
    const protocol = await protocolFactory({
      protocolPayload,
      instancesPathId
    })
    //#TODO: protocol.loader
    const ownProtocols = await protocol.loader.ownProtocols()
    let a = (ownProtocols && ownProtocols.length) ? ownProtocols.map(adaptProtocolPayload) : null
    if (a && a.length) {
      items = items.concat(a)
    }
  }

  items = _.flatten(items.filter(a => a)).filter(a => a)
  items = cleanProtocols(items)
  return items
}
