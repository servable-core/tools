import extract from '../extract/index.js'
import accessChildInTreeWithRoute from './accessChildInTreeWithRoute.js'
import sanitizePath from '../../lib/sanitizePath.js'
import { DataTemplateType } from '../data/1.0.0/enums.js'

export default async ({
  path,
  variant,
  mimeType,
  item,
  type = DataTemplateType.Protocol,
  formatData = true,
  extraction: _extraction
}) => {

  let extraction = _extraction
  if (!extraction && path) {
    extraction = await extract({ path: `${sanitizePath.default(path)}`, dataTemplateType: type })
  }

  if (!extraction) {
    return null
  }

  const { reference, tree } = extraction
  const result = accessChildInTreeWithRoute({ item, tree })
  if (!result) {
    return null
  }

  if (formatData && result.data) {
    switch (result.type) {
      default: break
      case 'file': {
        if (!result.data.length) {
          break
        }
        if (mimeType) {
          let candidates = result.data.filter(a => a.mimeType === mimeType)
          result.data = candidates
        }
        if (variant) {
          let candidates = result.data.filter(a => a.variant === variant)
          if (candidates && candidates.length) {
            result.data = candidates[0]
          } else {
            result.data = null
          }
        }
        else {
          result.data = result.data[0]
        }
      } break
    }
  }

  return result
}
