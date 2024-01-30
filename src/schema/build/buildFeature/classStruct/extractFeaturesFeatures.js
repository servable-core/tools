import _ from 'underscore'
import adaptFeaturePayload from '../../../../lib/adaptFeaturePayload.js'
import cleanFeatures from '../../../../lib/cleanFeatures.js'

export default async ({
  featuresPayloads,
  featureFactory,
  instancesPathId }) => {

  let items = []

  for (var i in featuresPayloads) {
    const featurePayload = featuresPayloads[i]
    const feature = await featureFactory({
      featurePayload,
      instancesPathId
    })
    //#TODO: feature.loader
    const ownFeatures = await feature.loader.ownFeatures()
    let a = (ownFeatures && ownFeatures.length) ? ownFeatures.map(adaptFeaturePayload) : null
    if (a && a.length) {
      items = items.concat(a)
    }
  }

  items = _.flatten(items.filter(a => a)).filter(a => a)
  items = cleanFeatures(items)
  return items
}
