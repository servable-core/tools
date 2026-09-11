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
    console.log("[@servable/tools/schema/build/buildProtocol] perform() → Protocol validation failed - Protocol ID:", protocol.id, "Path:", protocol.loader.path)
    return defaultResult
  }

  //#TODO: protocol.loader
  const classesSchemas = await protocol.loader.classesSchemas()
  if (!classesSchemas) {
    return defaultResult
  }

  // `Servable.engine` is engine-specific bootstrap state - only present when a caller has gone
  // through a real engine's createApp()/adaptApp() (the running server always has, at boot).
  // This package is meant to stay engine-agnostic (an app's index.js is what chooses an engine,
  // never servable.config.js or anything in @servable/tools itself), so this call is guarded
  // rather than required - a caller with no engine configured (any @servable/cli `schema *`
  // command needs only a minimal Servable.App stub to load class.js files, not a real engine
  // bootstrap - see cli's own loadServableConfig.js) still gets a correct build.
  //
  // What's skipped: injecting the four framework-default classes (ServableApp/_User/_Session/
  // _Role) if the app's own schema.json doesn't already define them. For an app that has ever
  // completed a real server boot, it already does (confirmed live against backend/main's own
  // app/schema.json - all four are already there, committed from a prior run of this exact
  // injection), so skipping this call is a true no-op in that case. A brand-new app that has
  // never booted once and has no local schema.json for these classes yet would see a smaller
  // `classes` list from the CLI than the first real boot would produce - an acceptable gap
  // given how rare that specific ordering is, not a silent one (this comment is the record of
  // it).
  if (protocol.id === 'app' && Servable.engine?.formatAppClassesSchemas) {
    await Servable.engine.formatAppClassesSchemas({ classesSchemas })
  }

  let adaptedClassesStructs = []
  let classesProtocols = []

  for (var i in classesSchemas) {
    const classSchema = classesSchemas[i]
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
      continue
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
  }

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

