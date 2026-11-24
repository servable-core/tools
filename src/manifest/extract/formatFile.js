import commentsParser from 'parse-comments'
import importFileAsText from "../../lib/importFileAsText.js"
import extractAst from './extractAst.js'

// parse-comments cannot read every JSDoc type: a generic inside a record type, such as
// `{{ query_params: Record<string, unknown> }}`, valid TypeScript-flavoured JSDoc that tsc reads, makes its type parser
// throw "TypeApplication does not have a name". Thrown from there, the error lost every comment of the file and was
// printed with its stack once per file and per protocol instance (118 times at one boot of backend/main, 2026-11-24).
// The comments are documentation only (`documentProtocol`), so a type it cannot read is left unparsed: the tag keeps
// its name, its description and its raw type (`rawType`), only its structured `type` is null.
const typeParserWithoutFallback = new commentsParser()

/**
 * @param {string} rawType
 * @param {object} tag
 */
const typeOrNullWhenUnreadable = (rawType, tag) => {
  try {
    return typeParserWithoutFallback.parseType(rawType, tag)
  } catch {
    return null
  }
}

const parsingOptions = { parse: { type: typeOrNullWhenUnreadable } }

// A file whose comments cannot be read at all is reported once per path, not once per protocol instance reading it.
const pathsAlreadyReported = new Set()

/**
 * Reads the comments of one file of a protocol's manifest, for its documentation.
 * @param {{ file: { path: string } }} props
 * @returns {Promise<object>} The file with its comments (`ast`, `astAdapted`), or the file alone when they cannot be read.
 */
export default async ({ file }) => {
  try {
    const { path } = file
    const text = await importFileAsText(path)
    const ast = commentsParser.parse(text, parsingOptions)
    const astAdapted = extractAst({ ast })

    return {
      ...file,
      ast,
      astAdapted
    }
  } catch (e) {
    if (!pathsAlreadyReported.has(file.path)) {
      pathsAlreadyReported.add(file.path)
      console.warn('[Servable]', 'formatFile → could not read the comments of', file.path, '→', e && e.message)
    }
  }

  return file
}
