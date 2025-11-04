import sanitizePath from 'path-sanitizer'
import fs from 'fs'

export default async ({ payload, path }) => {
  const { path, protocol, classes } = payload
  const rootPath = sanitizePath.default(`${path}/generated`)

  const protocolPath = sanitizePath.default(`${rootPath}/index.md`)
  fs.promises.writeFile(protocolPath, protocol)
}
