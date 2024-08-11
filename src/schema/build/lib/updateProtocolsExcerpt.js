
export default async ({
  adaptedClassesStructs,
  protocolsExcerpt }) => {
  const candidates = adaptedClassesStructs.filter(a =>
    (a && a.protocols && a.protocols.length))

  if (!candidates || !candidates.length) {
    return
  }
  candidates.forEach(adaptedClassesStruct => {
    const { protocols, classSchema: { className } } = adaptedClassesStruct
    protocols.forEach(protocol => {
      if (!protocolsExcerpt[protocol.id]) {
        protocolsExcerpt[protocol.id] = {
          classes: []
        }
      }
      if (!protocolsExcerpt[protocol.id].classes.includes(className)) {
        protocolsExcerpt[protocol.id].classes.push(className)
      }
    })
  })
}
