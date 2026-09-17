import generateProtocolResourceTypes from '../../../src/schema/protocolResources/generateTypes.js'

describe('generateProtocolResourceTypes', () => {
  test('merges every service into ServableServiceCallMap, sorted by id, referencing the real file', () => {
    const out = generateProtocolResourceTypes({
      '@a/foo': {
        services: [
          { id: '@a/foo.zeta', path: '/app/protocols/@a/foo/services/zeta.js' },
          { id: '@a/foo.alpha', path: '/app/protocols/@a/foo/services/alpha.js' },
        ],
        jobs: [],
      },
    })

    expect(out).toContain('interface ServableServiceCallMap')
    const alphaIndex = out.indexOf('"@a/foo.alpha"')
    const zetaIndex = out.indexOf('"@a/foo.zeta"')
    expect(alphaIndex).toBeGreaterThan(-1)
    expect(zetaIndex).toBeGreaterThan(alphaIndex)
    expect(out).toContain(
      `"@a/foo.alpha": typeof import("/app/protocols/@a/foo/services/alpha.js")['default']`
    )
  })

  test('dedupes services by id rather than emitting a duplicate property, keeping exactly one', () => {
    const out = generateProtocolResourceTypes({
      '@a/foo': { services: [{ id: 'dup', path: '/first.js' }], jobs: [] },
      '@a/bar': { services: [{ id: 'dup', path: '/second.js' }], jobs: [] },
    })

    const occurrences = out.split('"dup":').length - 1
    expect(occurrences).toBe(1)
    // Protocols are processed in sorted-id order ('@a/bar' before '@a/foo'), and "first
    // occurrence wins" is defined over that order, not object-literal declaration order - so
    // '@a/bar's entry ('/second.js') is the one that survives here.
    expect(out).toContain('/second.js')
    expect(out).not.toContain('/first.js')
  })

  test('emits one interface per protocol with jobs, listing each job by id', () => {
    const out = generateProtocolResourceTypes({
      '@a/foo': {
        services: [],
        jobs: [{ id: 'sendReminder', path: '/app/protocols/@a/foo/jobs/sendReminder.js' }],
      },
    })

    expect(out).toContain('export interface ServableProtocolJobs__a_foo')
    expect(out).toContain(
      `"sendReminder": typeof import("/app/protocols/@a/foo/jobs/sendReminder.js")['default']`
    )
  })

  test('disambiguates two protocol ids that sanitize to the same interface name', () => {
    const out = generateProtocolResourceTypes({
      '@a/foo-bar': { services: [], jobs: [{ id: 'j1', path: '/one.js' }] },
      '@a/foo_bar': { services: [], jobs: [{ id: 'j2', path: '/two.js' }] },
    })

    const names = [...out.matchAll(/export interface (ServableProtocolJobs_\S+) \{/g)].map(m => m[1])
    expect(new Set(names).size).toBe(names.length)
    expect(names.length).toBe(2)
  })

  test('omits the ServableServiceCallMap merge entirely when there are no services anywhere', () => {
    const out = generateProtocolResourceTypes({
      '@a/foo': { services: [], jobs: [{ id: 'j1', path: '/one.js' }] },
    })

    expect(out).not.toContain('ServableServiceCallMap')
  })

  test('returns just the header (no declare global, no job interfaces) for an empty resource map', () => {
    const out = generateProtocolResourceTypes({})
    expect(out).not.toContain('declare global')
    expect(out).not.toContain('export interface')
  })
})
