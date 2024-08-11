import checkFileExists from "./checkFileExists.js"
import importJSONAsync from "./importJSONAsync.js"
import semver from "semver"

export default async ({ path }) => {

  let modulePath = `${path}/manifest.json`
  if (!(await checkFileExists(modulePath))) {
    modulePath = `${path}/index.json`
    if (!(await checkFileExists(modulePath))) {
      modulePath = `${path}/module.json`
      if (!(await checkFileExists(modulePath))) {
        return null
      }
    }
  }

  const module = await importJSONAsync(modulePath)
  if (!module) {
    return null
  }

  let value = module.apiVersion
  if (!value || semver.valid(value)) {
    return "1.0.0"
  }

  return value

}
