import templateDataForId from './templateDataForId.js'
import extractItem from './extractItem.js'
import { DataTemplateType } from '../data/1.0.0/enums.js'
import ServableClass from "../../domain/servable/index.js"

/**
 * Extracts a protocol's (or a class's) manifest tree off disk: every item of its template, with the files found for
 * each and their modules.
 * @param {object} props
 * @param {string} props.path - the protocol's (or the class's) root.
 * @param {string} [props.dataTemplateType] - the template to walk. Defaults to `DataTemplateType.Protocol`.
 * @param {boolean} [props.shouldReadComments] - also read each file's JSDoc comments (`ast`, `astAdapted`), which only
 *   the documentation uses. Defaults to `true`; a protocol instance's runtime extraction passes `false`.
 * @returns {Promise<{ reference: object, tree: object }>}
 */
export default async ({
  path,
  dataTemplateType = DataTemplateType.Protocol,
  shouldReadComments = true
}) => {
  const reference = {}
  if (!global.Servable) {
    global.Servable = new ServableClass()
  }

  const item = await templateDataForId({ id: dataTemplateType, path })
  const tree = await extractItem({
    item,
    reference,
    parentLeafPath: path,
    shouldReadComments
  })

  return { reference, tree }
}
