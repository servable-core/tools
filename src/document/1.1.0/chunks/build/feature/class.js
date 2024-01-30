import { FeatureEnum } from "../../../../../manifest/data/1.0.0/enums.js"
import access from '../../../../../manifest/access/index.js'

export default async props => {
  const { path, extraction } = props
  const payload = []

  const target = await access({
    item: FeatureEnum.Class.Index,
    path,
    extraction
  })
  if (target && target.data) {
    const { astAdapted } = target.data
    if (astAdapted) {
      const { description, params = [], } = astAdapted
      const rows = []

      payload.push({
        p: description
      })
      params.forEach(param => {
        const { title, name, description: paramDescription, type } = param
        rows.push([name ? name : "", description ? description : "", type.name ? type.name : ""])
      })
      if (rows && rows.length) {
        payload.push({
          table: {
            headers: ["Name", "Description", "Type"],
            rows
          }
        })
      }
    }
  }

  return {
    payload, name: 'Feature class',
    id: 'class',
    auxiliary: (target && target.data) ? target.data.documentation : null
  }
}
