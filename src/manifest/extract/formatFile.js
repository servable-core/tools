import commentsParser from 'parse-comments'
import importFileAsText from "../../lib/importFileAsText.js"
import extractAst from './extractAst.js'

export default async ({ file }) => {
  try {
    const { path } = file
    const text = await importFileAsText(path)
    const ast = commentsParser.parse(text)
    const astAdapted = extractAst({ ast })

    return {
      ...file,
      ast,
      astAdapted
    }
  } catch (e) {
    console.error(e)
  }

  return file
}
