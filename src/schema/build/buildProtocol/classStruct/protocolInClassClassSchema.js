import preserveMostRestricted from './preserveMostRestricted.js'

export default async (props) => {
  const { classSchema, protocol } = props
  let _classSchema = { ...classSchema }
  try {
    //#TODO: protocol.loader
    const _fields = await protocol.loader.schemaFields()
    if (_fields) {
      _classSchema.fields = {
        ..._classSchema.fields,
        ..._fields
      }
    }

    //#TODO: protocol.loader
    const _indexes = await protocol.loader.schemaIndexes()
    if (_indexes) {
      _classSchema.indexes = {
        ..._classSchema.indexes,
        ..._indexes
      }
    }

    //#TODO: protocol.loader
    const _classLevelPermissions = await protocol.loader.schemaClassLevelPermissions()
    let __classLevelPermissions
    if (_classLevelPermissions && Object.keys(_classLevelPermissions).length) {
      __classLevelPermissions = preserveMostRestricted([_classSchema.classLevelPermissions, _classLevelPermissions])
    } else {
      __classLevelPermissions = {
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
        }
      }
    }


    _classSchema.classLevelPermissions = __classLevelPermissions
  } catch (e) {
    console.error(e)
  }

  return _classSchema
}
