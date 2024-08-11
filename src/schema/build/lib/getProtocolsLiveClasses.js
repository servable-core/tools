import _ from 'underscore'

export default async ({ protocols }) => {
  let items = (await Promise.all(protocols.map(async protocol => {
    //#TODO: protocol.loader
    const fn = await protocol.loader.liveClasses()
    if (!fn) {
      return null
    }
    if (typeof fn !== 'function') {
      return null
    }

    return fn()
  }))).filter(a => a)
  items = _.uniq(_.flatten(items))
  return items
}
