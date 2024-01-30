import getLoaderWithPayload from './getLoaderWithPayload.js'
import FeatureInstanceClass from '../index.js'
import instancesWithPath from './instancesWithPath.js'

export const getWithCache = async ({
  featurePayload,
  servableConfig,
  instancesPathId,
  instances,
}) => {

  const { id, module, version, path } = featurePayload

  if (!instancesPathId || !instancesPathId.length) {
    return null
  }

  const instancePathOfInterest = instancesPathId[instancesPathId.length - 1]
  let { type, value: { className } } = instancePathOfInterest

  switch (type) {
    case 'class': {
    } break
    case 'feature': {
      if (instancePathOfInterest.value.id === 'app') {
        className = '_root'
      } break
    }
    default: {
      return null
    }
  }

  let instance = instancesWithPath({
    className,
    instances,
    path
  })

  if (instance) {
    return instance
  }

  const loader = await getLoaderWithPayload({ featurePayload })
  instance = new FeatureInstanceClass({
    featurePayload,
    className,
    loader,
    instancesPathId
  })
  instance = new Proxy(instance, {
    get(target, prop) {
      if (prop in target) {
        return target[prop]
      } else if (prop in loader) {
        return loader[prop].bind(loader); // default value
      }
      return target[prop]
    }
  })
  instances.push(instance)
  await instance.load({ servableConfig })

  return instance
}
