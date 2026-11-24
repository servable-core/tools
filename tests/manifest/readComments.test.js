import fs from 'fs'
import os from 'os'
import path from 'path'
import commentsParser from 'parse-comments'
import ProtocolLoaderV1_1_0 from '../../src/domain/protocolLoader/v1.1.0.js'
import extract from '../../src/manifest/extract/index.js'
import access from '../../src/manifest/access/index.js'
import formatFile from '../../src/manifest/extract/formatFile.js'
import { DataTemplateType, ProtocolEnum } from '../../src/manifest/data/1.0.0/enums.js'

// Each protocol instance extracts its manifest at init (domain/protocolInstance → loader.loadExtraction), and the
// extraction used to read the JSDoc comments of every file it found (lib, routes, functions, triggers, classes, but
// also JSON, Markdown and images) with parse-comments: about 5,000 files at one boot of backend/main, a lib parsed
// again for every class using it. Nothing at runtime reads those comments: only the documentation does
// (`documentProtocol`, `generateGithubReadme`, the CLI's `servable protocol document/submit`). So the runtime
// extraction leaves them out, the documentation reads them, and a file is parsed once per process.

const writeFile = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
}

const documentedFunction = (description) => `
/**
 * ${description}
 * @param {number} first The first number.
 */
export default (first) => first
`

describe('a protocol file\'s comments are read only when documenting, once per file', () => {
  let temporaryFolder
  let protocolPath
  let parseSpy

  beforeEach(() => {
    temporaryFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'servable-read-comments-'))
    // Without it, Node reads the fixture's .js files as CommonJS and `export default` fails to parse.
    fs.writeFileSync(path.join(temporaryFolder, 'package.json'), JSON.stringify({ type: 'module' }))
    protocolPath = path.join(temporaryFolder, 'documented')
    writeFile(path.join(protocolPath, 'manifest.json'), JSON.stringify({
      id: 'documented',
      name: 'Documented',
      version: '1.0.0',
      apiVersion: '1.1.0',
    }))
    writeFile(path.join(protocolPath, 'lib', 'sum.js'), documentedFunction('Sums the numbers.'))
    writeFile(path.join(protocolPath, 'lib', 'nested', 'double.js'), documentedFunction('Doubles a number.'))
    parseSpy = import.meta.jest.spyOn(commentsParser, 'parse')
  })

  afterEach(() => {
    parseSpy.mockRestore()
    fs.rmSync(temporaryFolder, { recursive: true, force: true })
  })

  test('a protocol instance\'s init reads no comment, and its manifest is still complete', async () => {
    const loader = new ProtocolLoaderV1_1_0({ path: protocolPath })

    await loader.loadExtraction()

    expect(parseSpy).not.toHaveBeenCalled()
    const module = await loader.getModule()
    expect(module.id).toBe('documented')
    const lib = await access({ item: ProtocolEnum.Lib, extraction: loader.extraction })
    const libFiles = lib.data.map((file) => path.relative(protocolPath, file.path)).sort()
    expect(libFiles).toEqual(['lib/nested/double.js', 'lib/sum.js'])
    expect(lib.data.every((file) => file.module && file.module.default)).toBe(true)
    expect(lib.data.every((file) => file.ast === undefined && file.astAdapted === undefined)).toBe(true)
  })

  test('the documentation reads the comments: an extraction by path, as documentProtocol does', async () => {
    const lib = await access({ item: ProtocolEnum.Lib, path: protocolPath })
    const descriptions = lib.data.map((file) => file.astAdapted.description).sort()

    expect(descriptions).toEqual(['Doubles a number.', 'Sums the numbers.'])
  })

  test('extractProtocol reads the comments unless told not to', async () => {
    const documented = await extract({ path: protocolPath, dataTemplateType: DataTemplateType.Protocol })
    const undocumented = await extract({
      path: protocolPath,
      dataTemplateType: DataTemplateType.Protocol,
      shouldReadComments: false,
    })

    const libOf = (extraction) => access({ item: ProtocolEnum.Lib, extraction })
    expect((await libOf(documented)).data.every((file) => file.astAdapted)).toBe(true)
    expect((await libOf(undocumented)).data.every((file) => file.ast === undefined)).toBe(true)
  })

  test('a file read by many documentations is parsed once', async () => {
    await access({ item: ProtocolEnum.Lib, path: protocolPath })
    await access({ item: ProtocolEnum.Lib, path: protocolPath })
    const sumPath = path.join(protocolPath, 'lib', 'sum.js')
    const first = await formatFile({ file: { path: sumPath } })
    const second = await formatFile({ file: { path: sumPath } })

    const parsedTexts = parseSpy.mock.calls.map(([text]) => text)
    expect(parsedTexts.filter((text) => text.includes('Sums the numbers.'))).toHaveLength(1)
    expect(parsedTexts.filter((text) => text.includes('Doubles a number.'))).toHaveLength(1)
    expect(second.astAdapted).toEqual(first.astAdapted)
    expect(second.path).toBe(sumPath)
  })

  test('a file changed since it was parsed is parsed again', async () => {
    const sumPath = path.join(protocolPath, 'lib', 'sum.js')
    const before = await formatFile({ file: { path: sumPath } })
    writeFile(sumPath, documentedFunction('Adds the numbers.'))
    const later = new Date(Date.now() + 5000)
    fs.utimesSync(sumPath, later, later)
    const after = await formatFile({ file: { path: sumPath } })

    expect(before.astAdapted.description).toBe('Sums the numbers.')
    expect(after.astAdapted.description).toBe('Adds the numbers.')
    expect(parseSpy).toHaveBeenCalledTimes(2)
  })
})
