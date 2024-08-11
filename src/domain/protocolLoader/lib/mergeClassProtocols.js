import cleanProtocols from "../../../lib/cleanProtocols.js"


export default ({ items = [], _class, withProtocolsProtocols }) => {
  let classProtocols = _class.protocols ? _class.protocols : []
  if (!withProtocolsProtocols) {
    return cleanProtocols([...items, ...classProtocols])
  }

  return cleanProtocols([...items])

  // let inheritedProtocols = _class.inheritedProtocols ? _class.inheritedProtocols : []
  // return cleanProtocols([
  //     ...classProtocols,
  //     ...inheritedProtocols
  // ])
}
