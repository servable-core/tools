import templateDataForId from './templateDataForId.js'
import extractItem from './extractItem.js'
import { DataTemplateType } from '../data/1.0.0/enums.js'
import ServableClass from "../../domain/servable/index.js"

export default async ({
  path,
  dataTemplateType = DataTemplateType.Feature
}) => {
  const reference = {}
  if (!global.Servable) {
    global.Servable = new ServableClass()
  }

  const item = await templateDataForId({ id: dataTemplateType, path })
  const tree = await extractItem({
    item,
    reference,
    parentLeafPath: path
  })

  return { reference, tree }
}
