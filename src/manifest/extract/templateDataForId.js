import checkFileExists from "../../lib/checkFileExists.js"
import importJSONAsync from "../../lib/importJSONAsync.js"

import path from 'path'
// import callerPath from 'caller-path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


export default async ({ id, path: protocolPath }) => {
  let version = "1.0.0"
  let index = await loadIndex(protocolPath)
  if (index && index.apiVersion) {
    version = index.apiVersion
  }
  const basePath = '../data'
  let url = `${basePath}/${version}/${id}.json`
  url = path.resolve(__dirname, url)
  if (!(await checkFileExists(url))) {
    throw { message: `Could not find template data ${id} at path ${protocolPath}` }
  }
  let data = await importJSONAsync(url)
  return data
}


const loadIndex = async (__path) => {

  let _path = `${__path}/index.json`
  if (!(await checkFileExists(_path))) {
    _path = `${__path}/manifest.json`
    if (!(await checkFileExists(_path))) {
      _path = `${__path}/module.json`
      if (!(await checkFileExists(_path))) {
        return null
      }
    }
  }

  const data = await importJSONAsync(_path)
  return data
}
