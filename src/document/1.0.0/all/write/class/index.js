import fse from 'fs-extra'
import json2md from 'json2md'
import writeChunk from '../utils/chunk.js'
import checkFileExists from "../../../../../lib/checkFileExists.js"

export default async ({ item, path, includeAuxiliary }) => {
  const {
    payload,
    chunks,
  } = item

  const rootPath = path

  if ((await checkFileExists(rootPath))) {
    await fse.emptyDir(rootPath)
  }

  const indexPath = `/${rootPath}/index.md`
  const chunksRootPath = `/${rootPath}`

  const text = json2md(payload)
  await fse.outputFile(indexPath, text)

  await Promise.all(Object.keys(chunks).map(async chunk => writeChunk({ chunk: chunks[chunk], path: chunksRootPath, includeAuxiliary })))
}
