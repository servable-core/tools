import featurePath from './featurePath.js'

import _ from 'underscore'
import FeatureClass from '../index.js'

export default async ({
  featurePayload,
  servableConfig,
  featuresCache,
  instancesPathId
}) => {

  const { id, module, version, type, } = featurePayload
  let path = featurePayload.path
  if (!path) {
    path = await featurePath({
      id,
      module,
      version,
      servableConfig
    })
  }

  if (!path) {
    return null
  }

  let feature = null
  const valueInCache = cacheValue({
    featurePayload: {
      ...featurePayload,
      path
    }, featuresCache
  })

  if (valueInCache) {
    feature = valueInCache.feature
  } else {
    feature = new FeatureClass({ id, type })
    featuresCache.push({
      id,
      module,
      version,
      path,
      feature
    })
  }

  await feature.addInstanceIfNeeded({
    featurePayload: {
      ...featurePayload,
      path
    },
    instancesPathId,
    servableConfig
  })
  // console.log(instancesPathId)
  return feature
}


const cacheValue = ({ featurePayload, featuresCache }) => {
  const { id, module, version, path } = featurePayload
  const candidates = _.where(featuresCache, {
    id,
    // version,
    // path,
    // module
  })
  return (candidates && candidates.length) ? candidates[0] : null
}
