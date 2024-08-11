import * as ProtocolLoaderFactory from '../../protocolLoader/factory/index.js'

export default async ({ protocolPayload }) => {
  const { path, version } = protocolPayload
  const _loader = await ProtocolLoaderFactory.getByPathAndVersion({ path, version })
  return _loader
}
