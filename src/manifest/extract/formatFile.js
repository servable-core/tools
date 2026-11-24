import fs from 'fs'
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
 * @param {string} path
 * @returns {Promise<{ ast: object[], astAdapted: object | null }>}
 */
const parseCommentsOfFileAt = async (path) => {
  const text = await importFileAsText(path)
  const ast = commentsParser.parse(text, parsingOptions)
  return { ast, astAdapted: extractAst({ ast }) }
}

// The comments of a file, parsed once per process and per version of the file (its path and its modification time):
// a lib shared by many classes, or a protocol documented by several calls, is parsed once, and again only once it
// changed. A file whose comments cannot be read keeps its failure too, so it is not parsed again either.
const commentsByFileVersion = new Map()

/**
 * @param {string} path
 * @returns {Promise<{ ast: object[], astAdapted: object | null }>}
 */
const commentsOfFileAt = async (path) => {
  const { mtimeMs } = await fs.promises.stat(path)
  const fileVersion = `${path}\u0000${mtimeMs}`
  if (!commentsByFileVersion.has(fileVersion)) {
    commentsByFileVersion.set(fileVersion, parseCommentsOfFileAt(path))
  }
  return commentsByFileVersion.get(fileVersion)
}

/**
 * Reads the comments of one file of a protocol's manifest, for its documentation only: the runtime extraction of a
 * protocol instance never calls it (see `shouldReadComments` in `./index.js`).
 * @param {{ file: { path: string } }} props
 * @returns {Promise<object>} The file with its comments (`ast`, `astAdapted`), or the file alone when they cannot be read.
 */
export default async ({ file }) => {
  try {
    const { ast, astAdapted } = await commentsOfFileAt(file.path)

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
