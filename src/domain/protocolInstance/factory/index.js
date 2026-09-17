import getLoaderWithPayload from './getLoaderWithPayload.js'
import ProtocolInstanceClass from '../index.js'
import instancesWithPath from './instancesWithPath.js'

export const getWithCache = async ({
  protocolPayload,
  servableConfig,
  instancesPathId,
  instances,
}) => {

  // `id`/`module`/`version` (also destructured here previously) were never read anywhere in
  // this function - trimmed (found via eslint's `no-unused-vars`, lucide/PEAKUB DX initiative).
  const { path } = protocolPayload

  if (!instancesPathId || !instancesPathId.length) {
    return null
  }

  const instancePathOfInterest = instancesPathId[instancesPathId.length - 1]
  let { type, value: { className } } = instancePathOfInterest

  switch (type) {
    // No override needed: `className` is already correct from the destructure above.
    case 'class':
      break
    case 'protocol': {
      if (instancePathOfInterest.value.id === 'app') {
        className = '_root'
      }
      break
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

  const loader = await getLoaderWithPayload({ protocolPayload })
  instance = new ProtocolInstanceClass({
    protocolPayload,
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
