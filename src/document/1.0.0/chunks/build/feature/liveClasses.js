import { FeatureEnum } from "../../../../../manifest/data/1.0.0/enums.js"
import access from '../../../../../manifest/access/index.js'

export default async props => {
  const { path, extraction } = props
  const payload = []

  const target = await access({
    item: FeatureEnum.LiveClasses,
    path,
    extraction
  })
  if (target && target.data) {
    const { astAdapted } = target.data
    if (astAdapted) {
    }
  }

  return { payload, name: 'Live Classes', id: 'liveClasses', auxiliary: (target && target.data) ? target.data.documentation : null }
}
