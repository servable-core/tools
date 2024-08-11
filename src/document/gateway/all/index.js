import protocolApiVersion from '../../../lib/protocolApiVersion.js'
import _path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import checkFileExists from '../../../lib/checkFileExists.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default async props => {
  const { path, } = props
  const apiVersion = await protocolApiVersion({ path })
  if (!apiVersion) {
    throw new Error('No api version found')
  }

  const modulePath = _path.resolve(__dirname, `../../${apiVersion}/all/index.js`)
  if (!(await checkFileExists(modulePath))) {
    throw new Error('No module found for api version')
  }

  const module = (await import(modulePath)).default
  return module(props)
}
