import preserveMostRestricted from './preserveMostRestricted.js'

export default async (props) => {
  const { classSchema, feature } = props
  let _classSchema = { ...classSchema }
  try {
    //#TODO: feature.loader
    const _fields = await feature.loader.schemaFields()
    if (_fields) {
      _classSchema.fields = {
        ..._classSchema.fields,
        ..._fields
      }
    }

    //#TODO: feature.loader
    const _indexes = await feature.loader.schemaIndexes()
    if (_indexes) {
      _classSchema.indexes = {
        ..._classSchema.indexes,
        ..._indexes
      }
    }

    //#TODO: feature.loader
    const _classLevelPermissions = await feature.loader.schemaClassLevelPermissions()
    if (_classLevelPermissions) {
      const __classLevelPermissions = preserveMostRestricted([_classSchema.classLevelPermissions, _classLevelPermissions])
      _classSchema.classLevelPermissions = __classLevelPermissions
    }
  } catch (e) {
    console.error(e)
  }

  return _classSchema
}
