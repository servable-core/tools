import sanitizePath from 'path-sanitizer'
import fse from 'fs-extra'
import json2md from 'json2md'

export default async ({ chunk, path, includeAuxiliary }) => {
  const {
    payload,
    name,
    id,
    auxiliary
  } = chunk

  const chunkPath = `/${sanitizePath(`${path}/${id}.md`)}`
  let text = json2md([{ h1: name }, ...payload])
  if (includeAuxiliary && auxiliary) {
    text = `${text}\n${auxiliary}`
  }
  await fse.outputFile(chunkPath, text)
}
