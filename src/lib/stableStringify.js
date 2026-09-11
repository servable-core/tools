// Deterministic JSON.stringify - object keys sorted recursively, so two structurally-identical
// schemas always hash to the same string regardless of the order protocols happened to
// contribute their fields in. Arrays keep their order (field/index order within an object does
// not matter for schema equivalence, but array element order - e.g. protocol ids - might).
const sortValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sortValue)
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const sorted = {}
    Object.keys(value).sort().forEach(key => {
      sorted[key] = sortValue(value[key])
    })
    return sorted
  }
  return value
}

export default (value) => JSON.stringify(sortValue(value))
