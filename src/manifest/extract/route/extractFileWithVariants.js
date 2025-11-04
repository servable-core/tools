
import checkFileExists from "../../../lib/checkFileExists.js"
import sanitizePath from '../../../lib/sanitizePath.js'

export default async (props) => {
  const {
    payload,
    fullPath,
    variants,
    moduleImporter,
    extensionType
  } = props

  let files = await Promise.all(variants.map(async variant => {
    const _variantFullPath = fullPathForVariant({ fullPath, variant, extensionType })
    if (!(await checkFileExists(_variantFullPath))) {
      return null
    }
    const _module = await moduleImporter({ path: _variantFullPath })
    return {
      ...payload,
      path: _variantFullPath,
      module: _module,
      variant
    }
  }))

  return files.filter(a => a)
}

const fullPathForVariant = ({ variant, fullPath, extensionType }) => {
  if (!variant) {
    return `${sanitizePath.default(`${fullPath}.${extensionType}`)}`
  }

  // return `/${sanitizePath.default(`${fullPath}${variant.trim()}.${extensionType}`)}`
  return `${fullPath}${variant.trim()}.${extensionType}`
}
