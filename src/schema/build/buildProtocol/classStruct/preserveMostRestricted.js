export default (items) => {
  let permissions = dedupePermissions(items)
  const protectedFields = dedupeProtectedFields(items)

  permissions = {
    "find": {
      "role:admin": true
    },
    "count": {
      "role:admin": true
    },
    "get": {
      "role:admin": true
    },
    "create": {
      "role:admin": true
    },
    "update": {
      "role:admin": true
    },
    "delete": {
      "role:admin": true
    },
    "addField": {
      "role:admin": true
    },
    "protectedFields": {
      "*": []
    },
    ...permissions
  }

  return {
    ...permissions,
    protectedFields
  }
}

const dedupeProtectedFields = (items) => {
  const itemA = items[0] ? items[0] : {}
  const itemB = items[1] ? items[1] : {}
  const a = itemA.protectedFields ? itemA.protectedFields : {}
  const b = itemB.protectedFields ? itemB.protectedFields : {}
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)

  const result = {}
  const keys = [...(new Set([...aKeys, ...bKeys]))]
  keys.forEach(key => {
    result[key] = [
      ...(a[key] ? a[key] : []),
      ...(b[key] ? b[key] : []),
    ]
    result[key] = result[key].filter(a => a)
  })

  return result
}

const dedupePermissions = (items) => {
  const a = items[0] ? items[0] : {}
  const b = items[1] ? items[1] : {}
  const aKeys = Object.keys(a).filter(a => a !== "protectedFields")
  const bKeys = Object.keys(b).filter(a => a !== "protectedFields")
  const result = {}
  const keys = [...(new Set([...aKeys, ...bKeys]))]
  keys.forEach(key => {
    result[key] = dedupePermission(a[key], b[key])
  })

  return result
}

const dedupePermission = (a, b) => {
  if (!a) {
    return b
  }

  if (!b) {
    return a
  }

  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  const result = {}
  const keys = [...(new Set([...aKeys, ...bKeys]))]

  keys.forEach(key => {
    if (key === 'requiresAuthentication') {
      // Found via eslint (no-prototype-builtins led here; lucide/PEAKUB DX initiative) - two real
      // bugs stacked on this one field, both defeating this function's whole stated purpose
      // ("preserve most restrictive"):
      //   1. `b.aRequiresAuthentication` was a typo for `b.requiresAuthentication` - that
      //      property never exists on any real object, so the `||` always fell through to
      //      `undefined` unless `a.requiresAuthentication` was already truthy.
      //   2. Even fixed, the assignment was entirely dead: with no `return` here, the shared
      //      `result[key] = b.hasOwnProperty(key) ? b[key] : a[key]` below ran unconditionally
      //      right after for this same key, silently overwriting whatever was just computed.
      //      That line implements "b wins if b has the key", which is the OPPOSITE of "most
      //      restrictive wins" whenever `a.requiresAuthentication` is `true` and
      //      `b.requiresAuthentication` is `false` - the merge would end up NOT requiring
      //      authentication for a class where one of the two merged protocols required it.
      result.requiresAuthentication = Boolean(a.requiresAuthentication || b.requiresAuthentication)
      delete result["*"]
      return
    }

    result[key] = Object.prototype.hasOwnProperty.call(b, key) ? b[key] : a[key]
  })

  return result
}
