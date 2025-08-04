import classStruct from './classStruct/index.js'
import _ from 'underscore'
import extractClassesProtocol from './extractClassesProtocol.js'

const perform = async ({
  protocolFactory,
  protocol,
  updateProtocolsExcerpt,
  instancesPathId = []
}) => {

  const defaultResult = [
    protocol
  ]

  //#TODO: protocol.loader
  if (!(await protocol.loader.isValid())) {
    console.log('protocol not valid', protocol.id, protocol.loader.path)
    return defaultResult
  }

  //#TODO: protocol.loader
  const classesSchemas = await protocol.loader.classesSchemas()
  if (!classesSchemas) {
    return defaultResult
  }

  if (protocol.id === 'app') {
    await Servable.engine.formatAppClassesSchemas({ classesSchemas })
  }

  let adaptedClassesStructs = []
  let classesProtocols = []

  await Promise.all(classesSchemas.map(async classSchema => {
    // const classSchema = classesSchemas[i]
    const adaptedClassStruct = await classStruct({
      protocol,
      classSchema,
      protocolFactory,
      instancesPathId: [
        ...instancesPathId,
        { type: 'class', value: { className: classSchema.className } }
      ]
    })
    adaptedClassesStructs = adaptedClassesStructs.concat(adaptedClassStruct)

    let { protocolsPayloads } = adaptedClassStruct
    if (!protocolsPayloads || !protocolsPayloads.length) {
      return
    }

    protocolsPayloads = protocolsPayloads.filter(a => (a && a.id !== protocol.id))
    //#TODO Move from uniq to cleanprotocols
    protocolsPayloads = _.uniq(protocolsPayloads, a => a.id)

    const classProtocols = await extractClassesProtocol({
      protocolsPayloads,
      protocolFactory,
      updateProtocolsExcerpt,
      instancesPathId: [
        ...instancesPathId,
        {
          type: 'class',
          value: { className: classSchema.className }
        }
      ],
      extractProtocol: perform
    })
    classesProtocols = classesProtocols.concat(classProtocols)
  }))

  await updateProtocolsExcerpt({ adaptedClassesStructs })
  let ownClasses = adaptedClassesStructs.map(i => i.classSchema).filter(a => a)
  let jsClasses = adaptedClassesStructs.map(i => i._class).filter(a => a)


  classesProtocols = _.uniq(classesProtocols, a => a.id)
  if (!classesProtocols.length) {
    //#TODO: protocol.schema
    protocol.schema = {
      ...protocol.schema,
      classes: {
        managed: ownClasses,
        all: ownClasses
      },
      jsClasses
    }
    return [protocol]
  }

  //#TODO: protocol.schema
  let all = [...ownClasses]
  classesProtocols.forEach(element => {
    const { classes: { managed: _own = [], all: _all = [] } = {} } = element.schema
    all = [...all, ..._all]
    all = _.uniq(all, 'className')
  })

  //#TODO: protocol.schema
  protocol.schema = {
    ...protocol.schema,
    classes: {
      managed: ownClasses,
      all
    },
    jsClasses
  }

  protocol.extractionStatus = 2

  return [
    protocol,
    ...classesProtocols
  ]
}

export default perform

