import build from './build/index.js'
import json2md from 'json2md'
import fse from 'fs-extra'

export default async props => {
  const {
    path,
    targetPath,
    write = true,
    includeAuxiliary = true,
    print = false } = props

  const item = await build({ path })
  if (print) {
    console.log(item)
  }

  const {
    payload,
  } = item

  if (write && targetPath) {
    const text = json2md(payload)
    await fse.outputFile(targetPath, text)
  }

  return item
}
