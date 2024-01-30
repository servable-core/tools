import * as FeatureLoaderFactory from '../../featureLoader/factory/index.js'

export default async ({ featurePayload }) => {
  const { path, version } = featurePayload
  const _loader = await FeatureLoaderFactory.getByPathAndVersion({ path, version })
  return _loader
}
