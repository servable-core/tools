import { normalizeArtifact } from '../../src/schema/artifact/index.js'
import plan from '../../src/schema/plan/index.js'
import protocolInClassClassSchema from '../../src/schema/build/buildProtocol/classStruct/protocolInClassClassSchema.js'
import ensuredIndexesProblemsOf, { problemsOfAnEnsuredIndex } from '../../src/schema/ensuredIndexes.js'
import stableStringify from '../../src/lib/stableStringify.js'
import crypto from 'crypto'

// `ensuredIndexes` (src/schema/ensuredIndexes.js): carried from a protocol's schema.json to the class it is attached
// to, into the compiled artifact only where a class declares some (so every existing artifact keeps its hash), checked
// for shape, and diffed by `plan` like `indexes`.

const artifactOf = (classes) => normalizeArtifact({ appProtocol: { schema: { classes: { all: classes } } }, protocols: [] })
const CLAIM = { className: 'UniqueClaim', fields: { key: { type: 'String' } }, indexes: { _id_: { _id: 1 } }, classLevelPermissions: {} }
const KEY_1 = { keys: { key: 1 }, isUnique: true }

describe('ensuredIndexes in the artifact', () => {
  test('leave the artifact and its hash exactly as before for a class that declares none, or an empty set', () => {
    // The hash as it was computed before ensuredIndexes existed: classes of these four keys only.
    const hashBefore = crypto.createHash('sha256').update(stableStringify({ classes: [CLAIM] })).digest('hex')
    expect(artifactOf([CLAIM]).hash).toBe(hashBefore)
    expect(artifactOf([{ ...CLAIM, ensuredIndexes: {} }]).hash).toBe(hashBefore)
    expect(artifactOf([{ ...CLAIM, ensuredIndexes: {} }]).classes[0]).not.toHaveProperty('ensuredIndexes')
  })

  test('are in the artifact, and in its hash, once a class declares one', () => {
    const artifact = artifactOf([{ ...CLAIM, ensuredIndexes: { key_1: KEY_1 } }])
    expect(artifact.classes[0].ensuredIndexes).toEqual({ key_1: KEY_1 })
    expect(artifact.hash).not.toBe(artifactOf([CLAIM]).hash)
  })
})

describe('ensuredIndexes given by a protocol to the classes it is attached to', () => {
  const protocolWith = (loader) => ({ loader: { schemaFields: async () => null, schemaIndexes: async () => null, schemaClassLevelPermissions: async () => null, ...loader } })

  test('are merged into the class\'s own, like indexes', async () => {
    const classSchema = { ...CLAIM, ensuredIndexes: { key_1: KEY_1 } }
    const merged = await protocolInClassClassSchema({ classSchema, protocol: protocolWith({ schemaEnsuredIndexes: async () => ({ _owner_: { keys: { owner: 1 } } }) }) })
    expect(merged.ensuredIndexes).toEqual({ key_1: KEY_1, _owner_: { keys: { owner: 1 } } })
    expect(classSchema.ensuredIndexes).toEqual({ key_1: KEY_1 })
  })

  test('change nothing when the protocol gives none, or its loader predates them', async () => {
    const classSchema = { ...CLAIM }
    expect((await protocolInClassClassSchema({ classSchema, protocol: protocolWith({ schemaEnsuredIndexes: async () => null }) }))).not.toHaveProperty('ensuredIndexes')
    expect((await protocolInClassClassSchema({ classSchema, protocol: protocolWith({}) }))).not.toHaveProperty('ensuredIndexes')
  })
})

describe('the shape of ensuredIndexes', () => {
  test('well-formed declarations have no problem', () => {
    expect(ensuredIndexesProblemsOf({
      classes: [
        { className: 'A', ensuredIndexes: { key_1: KEY_1, _cursor_: { keys: { repoId: 1, objectId: -1 } }, _p_: { keys: { 'content.media.id': 1 }, partialFilter: { x: { $exists: true } }, isSparse: false, fieldTypes: { x: { type: 'String' } } } } },
        { className: 'B' },
      ],
    })).toEqual([])
  })

  test('each problem names its class, its index and what is wrong', () => {
    expect(ensuredIndexesProblemsOf({
      classes: [
        { className: 'A', ensuredIndexes: { i: { keys: {} }, j: { keys: { a: 'asc' }, unique: true }, k: { keys: { a: 1 }, isSparse: true, partialFilter: { a: 1 } } } },
        { className: 'B', ensuredIndexes: [] },
      ],
    })).toEqual([
      'A.i: `keys` names no field',
      'A.j: the direction of `a` is neither 1 nor -1',
      'A.j: `unique` is not an option of an ensured index',
      'A.k: an index is either sparse or partial, not both',
      'B: `ensuredIndexes` is not an object',
    ])
    expect(problemsOfAnEnsuredIndex('key')).toEqual(['the declaration is not an object'])
  })
})

describe('ensuredIndexes in a plan', () => {
  const planOf = (before, after) => plan({ before: artifactOf([before]), after: artifactOf([after]) })

  test('one added is safe', () => {
    const result = planOf(CLAIM, { ...CLAIM, ensuredIndexes: { key_1: KEY_1 } })
    expect(result.safe).toEqual([{ kind: 'ensuredIndexAdded', safe: true, className: 'UniqueClaim', indexName: 'key_1' }])
    expect(result.hasBreakingChanges).toBe(false)
  })

  test('one removed, or changed (even only the order of its keys), is breaking', () => {
    const removed = planOf({ ...CLAIM, ensuredIndexes: { key_1: KEY_1 } }, CLAIM)
    expect(removed.breaking).toEqual([{ kind: 'ensuredIndexRemoved', safe: false, deprecated: false, className: 'UniqueClaim', indexName: 'key_1' }])
    const reordered = planOf({ ...CLAIM, ensuredIndexes: { _c_: { keys: { a: 1, b: 1 } } } }, { ...CLAIM, ensuredIndexes: { _c_: { keys: { b: 1, a: 1 } } } })
    expect(reordered.breaking).toEqual([{ kind: 'ensuredIndexChanged', safe: false, deprecated: false, className: 'UniqueClaim', indexName: '_c_' }])
    expect(planOf({ ...CLAIM, ensuredIndexes: { key_1: KEY_1 } }, { ...CLAIM, ensuredIndexes: { key_1: KEY_1 } }).hasBreakingChanges).toBe(false)
  })
})
