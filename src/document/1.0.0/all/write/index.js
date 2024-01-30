import sanitizePath from 'path-sanitizer'
import fs from 'fs'

export default async ({ payload, path }) => {
  const { path, feature, classes } = payload
  const rootPath = sanitizePath(`${path}/generated`)

  const featurePath = sanitizePath(`${rootPath}/index.md`)
  fs.promises.writeFile(featurePath, feature)
}
