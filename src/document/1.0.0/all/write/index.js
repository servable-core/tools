import sanitizePath from 'path-sanitizer'
import fs from 'fs'

export default async ({ payload, path }) => {
  const { path, protocol, classes } = payload
  const rootPath = sanitizePath(`${path}/generated`)

  const protocolPath = sanitizePath(`${rootPath}/index.md`)
  fs.promises.writeFile(protocolPath, protocol)
}
