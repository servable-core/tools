import sanitizePath from 'path-sanitizer'
import fse from 'fs-extra'
import json2md from 'json2md'
import writeChunk from '../utils/chunk.js'
import checkFileExists from "../../../../../lib/checkFileExists.js"
import writeClass from '../class/index.js'

export default async ({ item, path, includeAuxiliary }) => {
  const {
    payload,
    chunks,
    classes,
  } = item

  const rootPath = sanitizePath.default(`${path}/documentation/generated`)

  if ((await checkFileExists(rootPath))) {
    await fse.emptyDir(rootPath)
  }

  const indexPath = `/${rootPath}/index.md`
  const chunksRootPath = `/${rootPath}`

  const text = json2md(payload)
  await fse.outputFile(indexPath, text)

  await Promise.all(Object.keys(chunks).map(async chunk => writeChunk({ chunk: chunks[chunk], path: chunksRootPath, includeAuxiliary })))

  if (classes && classes.length) {

    await Promise.all(classes.map(async _item => {
      if (!_item.id) {
        return
      }

      return writeClass({
        item: _item,
        path: `/${rootPath}/classes/${_item.id}`,
        includeAuxiliary
      })
    }))
  }
}
