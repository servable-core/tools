// `ensuredIndexes`: indexes a class needs that the engine's own schema indexes (`indexes`) cannot express, declared
// beside them in a schema.json and made by the engine after boot, in the background (never awaited by the boot,
// never dropped). Engine-agnostic: fields are named as the app names them (`objectId`, a pointer by its own name, a
// dotted path into an object); the engine maps them to its storage.
//
//   "ensuredIndexes": {
//     "<name in the database>": {
//       "keys": { "<field or dotted path>": 1 | -1, ... },      required, in order
//       "isUnique": true,                                          optional, false by default
//       "isSparse": false,                                         optional, true by default (rows without the field are left out),
//                                                                  never with a partialFilter
//       "partialFilter": { "<field>": { "$exists": true } },       optional, only the rows matching it
//       "fieldTypes": { "<field>": { "type": "Pointer", "targetClass": "X" } }
//                                                                  optional, the type of a field the class does not declare
//     }
//   }
//
// A protocol declares them on its own classes (`managed.classes[].ensuredIndexes`) or on every class it is attached
// to (`target.ensuredIndexes`), exactly like `indexes`, so a protocol never names another's class. They ride in the
// compiled artifact (`servable.schema.json`), so `schema plan` shows them and the boot's drift check covers them; a
// class that declares none has no `ensuredIndexes` key there, so an app that uses none keeps its artifact's hash.

const INDEX_DIRECTIONS = [1, -1]
const KNOWN_OPTIONS = ['keys', 'isUnique', 'isSparse', 'partialFilter', 'fieldTypes']

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value)

/**
 * The problems of one declaration, in words; none when it is well formed.
 * @param {any} declaration
 * @returns {string[]}
 */
export const problemsOfAnEnsuredIndex = (declaration) => {
  if (!isPlainObject(declaration)) {
    return ['the declaration is not an object']
  }
  const problems = []
  const { keys, isUnique, isSparse, partialFilter, fieldTypes } = declaration
  if (!isPlainObject(keys) || Object.keys(keys).length === 0) {
    problems.push('`keys` names no field')
  } else {
    Object.entries(keys)
      .filter(([, direction]) => !INDEX_DIRECTIONS.includes(direction))
      .forEach(([fieldName]) => problems.push(`the direction of \`${fieldName}\` is neither 1 nor -1`))
  }
  if (isUnique !== undefined && typeof isUnique !== 'boolean') {
    problems.push('`isUnique` is not a boolean')
  }
  if (isSparse !== undefined && typeof isSparse !== 'boolean') {
    problems.push('`isSparse` is not a boolean')
  }
  if (partialFilter !== undefined && !isPlainObject(partialFilter)) {
    problems.push('`partialFilter` is not an object')
  }
  if (partialFilter !== undefined && isSparse === true) {
    problems.push('an index is either sparse or partial, not both')
  }
  if (fieldTypes !== undefined && !isPlainObject(fieldTypes)) {
    problems.push('`fieldTypes` is not an object')
  }
  Object.keys(declaration).filter((name) => !KNOWN_OPTIONS.includes(name)).forEach((name) => problems.push(`\`${name}\` is not an option of an ensured index`))
  return problems
}

/**
 * Every problem of every class's `ensuredIndexes`, each naming its class and index; none when all are well formed.
 * @param {{ classes: any[] }} props
 * @returns {string[]}
 */
export const ensuredIndexesProblemsOf = ({ classes }) => (classes || []).flatMap((classSchema) => {
  const { className, ensuredIndexes } = classSchema || {}
  if (ensuredIndexes === undefined) {
    return []
  }
  if (!isPlainObject(ensuredIndexes)) {
    return [`${className}: \`ensuredIndexes\` is not an object`]
  }
  return Object.entries(ensuredIndexes).flatMap(([name, declaration]) => problemsOfAnEnsuredIndex(declaration).map((problem) => `${className}.${name}: ${problem}`))
})

export default ensuredIndexesProblemsOf
