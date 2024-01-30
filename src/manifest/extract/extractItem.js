import performRoute from './route/index.js'
import templateDataForId from './templateDataForId.js'

const performItem = async (props) => {
  const {
    item,
    reference = {},
    parentLeafPath,
    prefix } = props

  const { id, routes, name, } = item

  let computed = null
  if (routes && routes.length) {
    const _routes = routes.sort(a => a.priority)

    for (var i = 0; i < _routes.length; i++) {
      computed = await performRoute({
        ...props,
        route: _routes[i],
        parentLeafPath
      })
      if (computed && computed.data && computed.data.length) {
        break
      }
    }

    let result = {
      ...item,
    }

    if (computed) {
      result = {
        ...result,
        ...computed
      }
    }

    if (computed && computed.templateCollection && computed.templateCollection.folders && computed.templateCollection.folders.length) {
      const { templateId } = computed
      const templateData = await templateDataForId({ id: templateId, path: props.parentLeafPath })

      result.children = await Promise.all(computed.templateCollection.folders.map(async (folder, index) => {
        const { stat, name } = folder
        return performItem({
          ...props,
          item: templateData,
          parentLeafPath: folder.path,
          prefix: `${templateId}-${name}`
        })
      }))
    } else if (computed && computed.children && computed.children.length) {
      result.children = await Promise.all(computed.children.map(async a =>
        performItem({
          ...props,
          item: a,
          parentLeafPath: computed.leafPath
        })))
    }

    if (computed && computed.fullPath) {
      // reference[result.route.fullPath] = result
      reference[prefix ? `${prefix}-${result.id}` : result.id] = result
    }

    return result
  }
}

export default performItem
