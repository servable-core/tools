import featureInClassClassSchema from './featureInClassClassSchema.js'
import adaptFeaturePayload from '../../../../lib/adaptFeaturePayload.js'
import extractFeaturesFeatures from './extractFeaturesFeatures.js'
import cleanFeatures from '../../../../lib/cleanFeatures.js'

export default async ({
  feature,
  classSchema,
  featureFactory,
  instancesPathId
}) => {

  const { className } = classSchema

  //#TODO: feature.loader
  let featuresPayloads = await feature.loader.classFeatures({
    className,
    withFeaturesFeatures: false
  })

  if (!featuresPayloads
    || !featuresPayloads.length) {
    return { classSchema }
  }

  featuresPayloads = featuresPayloads.map(adaptFeaturePayload)

  if (!featuresPayloads || !featuresPayloads.length) {
    return { classSchema }
  }

  let featuresFeatures = await extractFeaturesFeatures({
    featuresPayloads,
    featureFactory,
    instancesPathId
  })
  featuresPayloads = cleanFeatures([...featuresPayloads, ...featuresFeatures])

  let _classSchema = { ...classSchema }

  for (var i in featuresPayloads) {
    const featurePayload = featuresPayloads[i]
    const feature = await featureFactory({
      featurePayload,
      instancesPathId
    })
    _classSchema = await featureInClassClassSchema({
      feature,
      classSchema: _classSchema,
    })
  }


  //#TODO: feature.loader
  const _class = await feature.loader.getClass({ className })

  return {
    classSchema: _classSchema,
    featuresPayloads,
    _class
  }
}
