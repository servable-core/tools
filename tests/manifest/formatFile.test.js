import fs from 'fs'
import os from 'os'
import path from 'path'
import formatFile from '../../src/manifest/extract/formatFile.js'

// formatFile (src/manifest/extract/formatFile.js) reads the comments of every file of a protocol's manifest (its lib,
// routes, functions, triggers, classes) with parse-comments, for `documentProtocol`. parse-comments cannot read a
// generic type inside a record type, `{{ query_params: Record<string, unknown> }}`, valid TypeScript-flavoured JSDoc
// that tsc reads: it threw "TypeApplication does not have a name", the whole file lost its comments and the error was
// printed with its stack once per file and per protocol instance (118 times at backend/main's boot, 2026-11-24).

const recordTypeWithAGeneric = `
/**
 * Builds the query.
 * @param {{ publicationId: string, windowDays?: number }} args The publication and the window.
 * @returns {{ query: string, query_params: Record<string, unknown> }}
 */
export default (args) => ({ query: '', query_params: args })
`

const plainTypes = `
/**
 * Sums two numbers.
 * @param {number} first The first number.
 * @param {Array<string>} names The names.
 * @returns {Promise<number>}
 */
export default async (first) => first
`

const fileWith = (text) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'servable-format-file-'))
  const filePath = path.join(folder, 'index.js')
  fs.writeFileSync(filePath, text)
  return { path: filePath }
}

describe('formatFile reads the comments of a protocol file', () => {
  const originalConsole = { error: console.error, warn: console.warn }
  let loggedErrors
  let loggedWarnings
  beforeEach(() => {
    loggedErrors = []
    loggedWarnings = []
    console.error = (...args) => loggedErrors.push(args)
    console.warn = (...args) => loggedWarnings.push(args)
  })
  afterEach(() => {
    console.error = originalConsole.error
    console.warn = originalConsole.warn
  })

  test('keeps the comments of a file whose JSDoc has a generic inside a record type, and logs nothing', async () => {
    const formatted = await formatFile({ file: fileWith(recordTypeWithAGeneric) })

    expect(formatted.ast).toHaveLength(1)
    expect(formatted.astAdapted.description).toBe('Builds the query.')
    expect(formatted.astAdapted.params.map((param) => param.name)).toEqual(['args'])
    expect(formatted.astAdapted.params[0].description).toBe('The publication and the window.')
    expect(formatted.astAdapted.tagsByTitle).toHaveProperty('returns')
    expect(loggedErrors).toEqual([])
    expect(loggedWarnings).toEqual([])
  })

  test('only the type it cannot read is left unparsed: the tag keeps its raw type', async () => {
    const formatted = await formatFile({ file: fileWith(recordTypeWithAGeneric) })
    const returnsTag = formatted.astAdapted.tagsByTitle.returns

    expect(returnsTag.type).toBeNull()
    expect(returnsTag.rawType).toBe('{{ query: string, query_params: Record<string, unknown> }}')
  })

  test('still parses the types it can read', async () => {
    const formatted = await formatFile({ file: fileWith(plainTypes) })
    const [first, names] = formatted.astAdapted.params

    expect(first.type).toEqual({ type: 'NameExpression', name: 'number' })
    expect(names.type.type).toBe('TypeApplication')
    expect(formatted.astAdapted.tagsByTitle.returns.type.expression).toEqual({ type: 'NameExpression', name: 'Promise' })
    expect(loggedErrors).toEqual([])
  })
})
