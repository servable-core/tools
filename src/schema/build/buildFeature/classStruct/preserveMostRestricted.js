export default (items) => {
    const permissions = dedupePermissions(items)
    const protectedFields = dedupeProtectedFields(items)

    return {
        ...permissions,
        protectedFields
    }
}

const dedupeProtectedFields = (items) => {
    const a = items[0].protectedFields ? items[0].protectedFields : {}
    const b = items[1].protectedFields ? items[1].protectedFields : {}
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
            result.requiresAuthentication = (a.requiresAuthentication || b.aRequiresAuthentication)
            delete result["*"]
        }

        result[key] = b.hasOwnProperty(key) ? b[key] : a[key]
    })

    return result
}