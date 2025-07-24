import checkFileExists from "../../../lib/checkFileExists.js"
import directoryFilesRecursive from '../../../lib/directoryFilesRecursive.js'
import formatFile from '../formatFile.js'
import foldersInFolder from '../../../lib/foldersInFolder.js'
import extractFiles from './extractFiles.js'
import sanitizePath from '../../../lib/sanitizePath.js'

export default async (props) => {
  const { item, route, parentLeafPath } = props
  const { type,
    mimeTypes,
    variants = [''],
    params = {}
  } = route

  let fullPath = `${sanitizePath(`${parentLeafPath}/${route.path}`)}`
  let files = null
  const result = {
    ...route,
    type,
    mimeTypes,
    fullPath,
    leafPath: parentLeafPath
  }
  try {
    switch (type) {
      case 'folder': {
        result.leafPath = `${parentLeafPath}/${route.path}`
        break
      }
      case 'templateCollection': {
        result.leafPath = `${parentLeafPath}/${route.path}`

        if (!(await checkFileExists(fullPath))) {
          break
        }
        const folders = await foldersInFolder({ path: fullPath, })
        result.templateCollection = {
          folders
        }

        break
      }
      case 'filesCollection': {
        if (!(await checkFileExists(fullPath))) {
          break
        }

        files = await directoryFilesRecursive({
          path: fullPath,
          includeMeta: true
        })

        if (files && files.length) {
          files = files.map(file => ({
            path: file.path,
            module: file.module,
            //TODO: extensionType,
          }))
        }

      } break
      case 'file': {
        let _variants = variants
        if (!_variants.includes('')) {
          _variants = ['', ..._variants]
        }
        _variants = _variants.sort()
        for (var i = 0; i < mimeTypes.length; i++) {
          const mimeType = mimeTypes[i]

          const _files = await extractFiles({
            mimeType,
            fullPath,
            variants: _variants,
            params
          })
          if (_files && _files.length) {
            if (!files) {
              files = []
            }
            files = files.concat(_files)
          }
        }
      } break
      default: break
    }


    result.leafPath = `${sanitizePath(result.leafPath)}`

    if (files && files.length) {
      files = files.filter(a => a.module)
      if (files.length) {
        result.data = await Promise.all(files.map(async file => formatFile({ file })))
      }
    }
  } catch (e) {
    console.error('[SERVABLE]', 'performRoute', JSON.stringify(item), item, route, e)
  }
  return result
}
