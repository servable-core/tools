import generateSchemaTypes from '../../src/schema/types/index.js'

const artifact = (classes) => ({ classes })

describe('generateSchemaTypes', () => {
  test('emits one interface per class, sorted, with sorted optional fields', () => {
    const out = generateSchemaTypes(artifact([
      { className: 'Genre', fields: { name: { type: 'String' }, rank: { type: 'Number' } } },
      { className: 'Category', fields: { name: { type: 'String' } } },
    ]))

    const categoryIndex = out.indexOf('export interface Category')
    const genreIndex = out.indexOf('export interface Genre')
    expect(categoryIndex).toBeGreaterThan(-1)
    expect(genreIndex).toBeGreaterThan(categoryIndex)
    expect(out).toContain('export interface Genre {\n  name?: string\n  rank?: number\n}')
  })

  test('maps every known Parse field type to a real TS type, defaulting unknown ones to any', () => {
    const out = generateSchemaTypes(artifact([{
      className: 'Everything',
      fields: {
        s: { type: 'String' },
        n: { type: 'Number' },
        b: { type: 'Boolean' },
        d: { type: 'Date' },
        arr: { type: 'Array' },
        obj: { type: 'Object' },
        geo: { type: 'GeoPoint' },
        poly: { type: 'Polygon' },
        file: { type: 'File' },
        acl: { type: 'ACL' },
        weird: { type: 'SomeFutureParseType' },
      },
    }]))

    expect(out).toContain('s?: string')
    expect(out).toContain('n?: number')
    expect(out).toContain('b?: boolean')
    expect(out).toContain('d?: Date')
    expect(out).toContain('arr?: any[]')
    expect(out).toContain('obj?: Record<string, any>')
    expect(out).toContain('geo?: { latitude: number, longitude: number }')
    expect(out).toContain('poly?: Array<[number, number]>')
    expect(out).toContain('file?: { url: () => string, name: () => string }')
    expect(out).toContain('acl?: Record<string, { read?: boolean, write?: boolean }>')
    expect(out).toContain('weird?: any')
  })

  test('narrows a Pointer/Relation to its target class when that class is in the same artifact', () => {
    const out = generateSchemaTypes(artifact([
      { className: 'Publication', fields: {} },
      {
        className: 'Article',
        fields: {
          publication: { type: 'Pointer', targetClass: 'Publication' },
          comments: { type: 'Relation', targetClass: 'Comment' },
        },
      },
    ]))

    expect(out).toContain('publication?: ServablePointer<Publication>')
    // Comment isn't defined in this artifact - falls back to a generic pointer rather than
    // referencing a type that wouldn't exist and breaking the generated file.
    expect(out).toContain('comments?: ServableRelation<any>')
  })

  test('a Pointer at a class outside this artifact (e.g. a core Parse class) falls back to generic', () => {
    const out = generateSchemaTypes(artifact([
      { className: 'Session', fields: { user: { type: 'Pointer', targetClass: '_User' } } },
    ]))

    expect(out).toContain('user?: ServablePointer<any>')
  })

  test('quotes a field name that is not a valid bare identifier', () => {
    const out = generateSchemaTypes(artifact([
      { className: 'Weird', fields: { 'not-an-identifier': { type: 'String' } } },
    ]))

    expect(out).toContain('"not-an-identifier"?: string')
  })

  test('a class with no fields still emits a valid (index-signature) interface', () => {
    const out = generateSchemaTypes(artifact([{ className: 'Empty', fields: {} }]))

    expect(out).toContain('export interface Empty {\n  [key: string]: any\n}')
  })

  test('an artifact with no classes still emits the shared header types', () => {
    const out = generateSchemaTypes(artifact([]))

    expect(out).toContain('export interface ServablePointer<T>')
    expect(out).toContain('export interface ServableRelation<T>')
  })

  test('tolerates a missing classes array entirely', () => {
    expect(() => generateSchemaTypes({})).not.toThrow()
  })
})
