import _ from 'underscore'

export default async ({ features }) => {
  let items = (await Promise.all(features.map(async feature => {
    //#TODO: feature.loader
    const fn = await feature.loader.liveClasses()
    if (!fn) {
      return null
    }
    return fn()
  }))).filter(a => a)
  items = _.uniq(_.flatten(items))
  return items
}
