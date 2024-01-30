import _ from 'underscore'

export default async ({
  featuresPayloads,
  featureFactory,
  extractFeature,
  updateFeaturesExcerpt,
  instancesPathId }) => {

  let features = []

  for (var i in featuresPayloads) {
    const featurePayload = featuresPayloads[i]

    const feature = await featureFactory({
      featurePayload,
      instancesPathId,
      // instancesPathId: _instancesPathId
    })

    if (feature && feature.extractionStatus === 2) {
      features.push(feature)
      continue
    }

    const extractedFeatureStruct = await extractFeature({
      featureFactory,
      updateFeaturesExcerpt,
      feature,
      instancesPathId: [
        ...instancesPathId,
        { type: 'feature', value: { id: featurePayload.id } }
      ]
    })

    features.push(extractedFeatureStruct)
  }

  if (!features || !features.length) {
    return []
  }

  features = _.flatten(features)
  features = features.filter(a => a)
  features = _.flatten(_.flatten(features))
  features = _.uniq(features, 'id')

  return features
}
