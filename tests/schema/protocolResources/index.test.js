import fs from 'fs'
import os from 'os'
import path from 'path'
import buildProtocolResources from '../../../src/schema/protocolResources/index.js'

/** A minimal fake `protocol` shaped enough for buildProtocolResources - it only ever reads
 * `.id` and `.loader.path`. */
const fakeProtocol = ({ id, rootPath }) => ({ id, loader: { path: rootPath } })

const writeFile = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
}

describe('buildProtocolResources', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'servable-protocol-resources-'))
    // Without this, Node treats the fixture .js files as CommonJS (no ancestor package.json
    // says otherwise) and `export default {...}` fails to parse.
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({ type: 'module' }))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  test('finds a service and a job for a protocol that has both', async () => {
    const protocolPath = path.join(tmpDir, 'foo')
    writeFile(
      path.join(protocolPath, 'services', 'checkAuth.js'),
      `export default { id: 'foo.checkAuth', handler: async () => true }`
    )
    writeFile(
      path.join(protocolPath, 'jobs', 'sendReminder.js'),
      `export default { id: 'sendReminder', cron: '0 9 * * *', handler: async () => {} }`
    )

    const result = await buildProtocolResources({
      protocols: [fakeProtocol({ id: 'foo', rootPath: protocolPath })],
    })

    expect(result.foo.services).toEqual([
      { id: 'foo.checkAuth', path: path.join(protocolPath, 'services', 'checkAuth.js') },
    ])
    expect(result.foo.jobs).toEqual([
      { id: 'sendReminder', cron: '0 9 * * *', path: path.join(protocolPath, 'jobs', 'sendReminder.js') },
    ])
  })

  test('omits a protocol entirely when it has neither services nor jobs', async () => {
    const protocolPath = path.join(tmpDir, 'empty')
    fs.mkdirSync(protocolPath, { recursive: true })

    const result = await buildProtocolResources({
      protocols: [fakeProtocol({ id: 'empty', rootPath: protocolPath })],
    })

    expect(result.empty).toBeUndefined()
  })

  test('skips a malformed service file (no id) rather than throwing', async () => {
    const protocolPath = path.join(tmpDir, 'broken')
    writeFile(
      path.join(protocolPath, 'services', 'noId.js'),
      `export default { handler: async () => true }`
    )

    const result = await buildProtocolResources({
      protocols: [fakeProtocol({ id: 'broken', rootPath: protocolPath })],
    })

    expect(result.broken).toBeUndefined()
  })

  test('finds services nested in subdirectories', async () => {
    const protocolPath = path.join(tmpDir, 'nested')
    writeFile(
      path.join(protocolPath, 'services', 'payout', 'finak', 'request.js'),
      `export default { id: 'nested.payout.request', handler: async () => true }`
    )

    const result = await buildProtocolResources({
      protocols: [fakeProtocol({ id: 'nested', rootPath: protocolPath })],
    })

    expect(result.nested.services).toHaveLength(1)
    expect(result.nested.services[0].id).toBe('nested.payout.request')
  })
})
