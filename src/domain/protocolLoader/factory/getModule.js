import importJSONAsync from '../../../lib/importJSONAsync.js'
import checkFileExists from '../../../lib/checkFileExists.js'
import v1_0_0 from '../v1.0.0.js'
import v1_1_0 from '../v1.1.0.js'

const DEFAULT_LOADER = v1_0_0

export default async ({ path, version }) => {
  if (version) {
    return loaderForVersion(version)
  }

  if (!path) {
    return null
  }

  let modulePath = `${path}/manifest.json`
  if (!(await checkFileExists(modulePath))) {
    modulePath = `${path}/index.json`
    if (!(await checkFileExists(modulePath))) {
      modulePath = `${path}/module.json`
      if (!(await checkFileExists(modulePath))) {
        return DEFAULT_LOADER
      }
    }
  }

  const module = await importJSONAsync(modulePath)
  const { apiVersion } = module
  return loaderForVersion(apiVersion)
}

const loaderForVersion = (version) => {
  switch (version) {
    case '1.1.0': {
      return v1_1_0
    }
    default: return DEFAULT_LOADER
  }
}
