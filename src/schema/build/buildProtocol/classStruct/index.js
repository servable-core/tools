import protocolInClassClassSchema from './protocolInClassClassSchema.js'
import adaptProtocolPayload from '../../../../lib/adaptProtocolPayload.js'
import extractProtocolProtocols from './extractProtocolsProtocols.js'
import cleanProtocols from '../../../../lib/cleanProtocols.js'

export default async ({
  protocol,
  classSchema,
  protocolFactory,
  instancesPathId
}) => {

  const { className } = classSchema

  //#TODO: protocol.loader
  let protocolsPayloads = await protocol.loader.classProtocols({
    className,
    withProtocolsProtocols: false
  })

  if (!protocolsPayloads
    || !protocolsPayloads.length) {
    return { classSchema }
  }

  protocolsPayloads = protocolsPayloads.map(adaptProtocolPayload)

  if (!protocolsPayloads || !protocolsPayloads.length) {
    return { classSchema }
  }

  let protocolsProtocols = await extractProtocolProtocols({
    protocolsPayloads,
    protocolFactory,
    instancesPathId
  })
  protocolsPayloads = cleanProtocols([...protocolsPayloads, ...protocolsProtocols])

  let _classSchema = { ...classSchema }

  for (var i in protocolsPayloads) {
    const protocolPayload = protocolsPayloads[i]
    const protocol = await protocolFactory({
      protocolPayload,
      instancesPathId
    })
    _classSchema = await protocolInClassClassSchema({
      protocol,
      classSchema: _classSchema,
    })
  }


  //#TODO: protocol.loader
  const _class = await protocol.loader.getClass({ className })

  return {
    classSchema: _classSchema,
    protocolsPayloads,
    _class
  }
}
