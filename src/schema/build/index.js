import featureFactory from "../../domain/feature/factory/index.js"
import getFeaturesLiveClasses from "./lib/getFeaturesLiveClasses.js"
import adaptConfigBasic from "../../lib/adaptConfig/basic.js"
import buildFeature from './buildFeature/index.js'
import updateFeaturesExcerpt from './lib/updateFeaturesExcerpt.js'

export default async ({ servableConfig }) => {
  const { rootFeaturePayload } = servableConfig
  adaptConfigBasic({ servableConfig, live: false })
  const featuresCache = []
  const appFeature = await featureFactory({
    featurePayload: {
      id: rootFeaturePayload.id,
      type: rootFeaturePayload.type,
      path: rootFeaturePayload.path,
      version: rootFeaturePayload.version
    },
    servableConfig,
    featuresCache,
    instancesPathId: [
      // { type: 'class', value: { className: '_root' } },
      { type: 'feature', value: { id: 'app' } }
    ],
  })

  const featuresExcerpt = {}
  const features = await buildFeature({
    feature: appFeature,
    featureFactory: async ({
      featurePayload,
      instancesPathId
    }) =>
      featureFactory({
        featurePayload,
        servableConfig,
        featuresCache,
        instancesPathId
      }),
    updateFeaturesExcerpt: async ({ adaptedClassesStructs }) =>
      updateFeaturesExcerpt({ adaptedClassesStructs, featuresExcerpt }),
    instancesPathId: [
      { type: 'feature', value: { id: 'app' } }
    ],
  })

  const liveClasses = await getFeaturesLiveClasses({ features })

  return {
    features,
    featuresExcerpt,
    appFeature,
    liveClasses
  }
}
