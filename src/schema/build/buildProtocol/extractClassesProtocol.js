import _ from 'underscore'

export default async ({
  protocolsPayloads,
  protocolFactory,
  extractProtocol,
  updateProtocolsExcerpt,
  instancesPathId }) => {

  let protocols = []

  for (var i in protocolsPayloads) {
    const protocolPayload = protocolsPayloads[i]

    const protocol = await protocolFactory({
      protocolPayload,
      instancesPathId,
      // instancesPathId: _instancesPathId
    })

    if (protocol && protocol.extractionStatus === 2) {
      protocols.push(protocol)
      continue
    }

    const extractedProtocolStruct = await extractProtocol({
      protocolFactory,
      updateProtocolsExcerpt,
      protocol,
      instancesPathId: [
        ...instancesPathId,
        { type: 'protocol', value: { id: protocolPayload.id } }
      ]
    })

    protocols.push(extractedProtocolStruct)
  }

  if (!protocols || !protocols.length) {
    return []
  }

  protocols = _.flatten(protocols)
  protocols = protocols.filter(a => a)
  protocols = _.flatten(_.flatten(protocols))
  protocols = _.uniq(protocols, 'id')

  return protocols
}
