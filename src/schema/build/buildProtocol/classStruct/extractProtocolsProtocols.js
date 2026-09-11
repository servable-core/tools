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

    // A protocol can declare a dependency-of-a-dependency (ownProtocols()) that isn't actually
    // vendored locally - confirmed live while testing unischema's migration against backend/main:
    // disposableorphansable, disposablechildrenable and servableconfigurable are all referenced
    // this way by at least one protocol but don't exist under protocols/. protocolFactory()
    // returns null in that case (protocolPath() found nowhere to load from) rather than
    // throwing, so this was always reachable - it just hadn't been hit before. Previously this
    // crashed the entire schema build (`protocol.loader` on null) for every class, not just the
    // one missing protocol; skipping the missing dependency and continuing is what the rest of
    // this loop already assumes is possible (see the `a && a.length` check right below, which
    // already tolerates a protocol contributing nothing).
    if (!protocol) {
      console.warn(`[@servable/tools] protocol dependency "${protocolPayload?.id}" not found locally - skipping (see extractProtocolsProtocols.js)`)
      continue
    }

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
