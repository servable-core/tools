import { FeatureEnum } from "../../../../../manifest/data/1.0.0/enums.js"
import access from '../../../../../manifest/access/index.js'

export default async props => {
  const { path, extraction, version } = props
  const payload = []

  const target = await access({
    item: FeatureEnum.Schema,
    path,
    extraction
  })

  if (!target || !target.children || !target.children.length) {
    return { payload, name: 'Schema', id: 'schema', }
  }

  //TODO: version
  const schema = target.children[0]

  if (!schema.children || !schema.children.length) {
    return { payload, name: 'Schema', id: 'schema', }
  }

  const index = schema.children.filter(a => a.id === 'index')
  if (!index || !index.length || !index[0].data || !index[0].data.length) {
    return { payload, name: 'Schema', id: 'schema', }
  }
  const data = index[0].data[0]
  const { astAdapted, module: _module } = data
  const { managed, target: _target } = _module

  if (managed && managed.classes && managed.classes.length) {
    payload.push({
      h4: "Managed classes"
    })
    managed.classes.forEach(_class => {
      const { className, fields, classLevelPermissions, indexes, } = _class
      payload.push({
        h5: className
      })

      let rows = []

      if (fields && Object.keys(fields).length) {
        Object.keys(fields).forEach(key => {
          const { type, targetClass, defaultValue } = fields[key]
          rows.push([key ? key : "", type, targetClass ? targetClass : "", defaultValue ? defaultValue : ""])

        })
        if (rows && rows.length) {
          payload.push({
            p: '**Fields**'
          })
          payload.push({
            table: {
              headers: ["Name", "Type", "Target class", "Default value"],
              rows
            }
          })
        }
      } else {
        payload.push({
          p: 'No fields'
        })
      }


      rows = []
      if (classLevelPermissions && Object.keys(classLevelPermissions).length) {
        Object.keys(classLevelPermissions).forEach(key => {
          // rows.push([key, `${JSON.stringify(classLevelPermissions[key], null, 2)}`])
          rows.push([key, `${JSON.stringify(classLevelPermissions[key],)}`])
        })
        if (rows && rows.length) {
          payload.push({
            p: '**Class Level Permissions**'
          })
          payload.push({
            table: {
              headers: ["Name", "Content"],
              rows
            }
          })
        }
      } else {
        payload.push({
          p: 'No classLevelPermissions'
        })
      }


      rows = []
      if (indexes && Object.keys(indexes).length) {
        Object.keys(indexes).forEach(key => {
          // rows.push([key, `${JSON.stringify(classLevelPermissions[key], null, 2)}`])
          rows.push([key, `${JSON.stringify(indexes[key],)}`])
        })
        if (rows && rows.length) {
          payload.push({
            p: '**Indexes**'
          })
          payload.push({
            table: {
              headers: ["Name", "Content"],
              rows
            }
          })
        }
      } else {
        payload.push({
          p: 'No indexes'
        })
      }

    })
  }


  if (_target) {
    payload.push({
      h4: "Target class"
    })

    const { fields, classLevelPermissions, indexes, } = _target
    let rows = []

    if (fields && Object.keys(fields).length) {
      Object.keys(fields).forEach(key => {
        const { type, targetClass, defaultValue } = fields[key]
        rows.push([key ? key : "", type, targetClass ? targetClass : "", defaultValue ? defaultValue : ""])

      })
      if (rows && rows.length) {
        payload.push({
          p: '**Fields**'
        })
        payload.push({
          table: {
            headers: ["Name", "Type", "Target class", "Default value"],
            rows
          }
        })
      }
    } else {
      payload.push({
        p: 'No fields'
      })
    }


    rows = []
    if (classLevelPermissions && Object.keys(classLevelPermissions).length) {
      Object.keys(classLevelPermissions).forEach(key => {
        // rows.push([key, `${JSON.stringify(classLevelPermissions[key], null, 2)}`])
        rows.push([key, `${JSON.stringify(classLevelPermissions[key],)}`])
      })
      if (rows && rows.length) {
        payload.push({
          p: '**Class Level Permissions**'
        })
        payload.push({
          table: {
            headers: ["Name", "Content"],
            rows
          }
        })
      }
    } else {
      payload.push({
        p: 'No classLevelPermissions'
      })
    }


    rows = []
    if (indexes && Object.keys(indexes).length) {
      Object.keys(indexes).forEach(key => {
        // rows.push([key, `${JSON.stringify(classLevelPermissions[key], null, 2)}`])
        rows.push([key, `${JSON.stringify(indexes[key],)}`])
      })
      if (rows && rows.length) {
        payload.push({
          p: '**Indexes**'
        })
        payload.push({
          table: {
            headers: ["Name", "Content"],
            rows
          }
        })
      }
    } else {
      payload.push({
        p: 'No indexes'
      })
    }
  }

  return {
    payload, name: 'Schema',
    id: 'schema',
    auxiliary: (target && target.data) ? target.data.documentation : null
  }

}
