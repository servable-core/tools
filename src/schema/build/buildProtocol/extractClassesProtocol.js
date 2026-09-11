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

    // Same missing-local-dependency case as extractProtocolsProtocols.js's own guard - a
    // protocolPayload can name a protocol that protocolFactory() can't find on disk
    // (protocolPath() resolves nowhere), returning null rather than throwing. perform() (passed
    // in as extractProtocol) does `protocol.loader.isValid()` as its very first line with no
    // null check, so this used to crash the whole build instead of just omitting the one
    // missing protocol's contribution.
    if (!protocol) {
      console.warn(`[@servable/tools] protocol dependency "${protocolPayload?.id}" not found locally - skipping (see extractClassesProtocol.js)`)
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
