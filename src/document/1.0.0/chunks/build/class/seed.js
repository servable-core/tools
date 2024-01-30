import { FeatureEnum, DataTemplateType } from "../../../../../manifest/data/1.0.0/enums.js"
import access from '../../../../../manifest/access/index.js'

export default async props => {
  const { path, extraction, includeAuxiliary = true } = props
  const payload = []

  const target = await access({
    item: FeatureEnum.Class.Index,
    type: DataTemplateType.Class,
    path,
    extraction
  })
  if (target && target.data) {
    const { astAdapted } = target.data
    if (astAdapted) {
    }
  }

  return { payload, name: 'Seed', id: 'seed', auxiliary: (target && target.data) ? target.data.documentation : null }
}
