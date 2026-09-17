import extract from '../extract/index.js'
import accessChildInTreeWithRoute from './accessChildInTreeWithRoute.js'
import sanitizePath from '../../lib/sanitize.js'
import { DataTemplateType } from '../data/1.0.0/enums.js'

/**
 * Reads one item (by manifest route, e.g. a schema, a class, a config file) out of a
 * protocol's manifest tree, either from an already-extracted tree or by extracting
 * `path` itself first.
 *
 * @param {object} props
 * @param {string} [props.path] - protocol root to extract from, if `extraction` isn't
 *   already provided.
 * @param {string} [props.variant] - manifest variant to read, when the item has more
 *   than one (engine-specific).
 * @param {string} [props.mimeType] - for file-type items, filters results to this mime
 *   type.
 * @param {string} props.item - the `ProtocolEnum` route identifying what to read.
 * @param {string} [props.type] - the extraction's `DataTemplateType`. Defaults to
 *   `DataTemplateType.Protocol`.
 * @param {boolean} [props.formatData] - post-process file-type results (mime filtering,
 *   single-vs-array collapsing). Defaults to `true`.
 * @param {object} [props.extraction] - an already-extracted manifest tree, to skip
 *   re-extracting `path`.
 * @returns {Promise<object | null>} the manifest item's data, or `null` if not found.
 */
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
    extraction = await extract({ path: `${sanitizePath(path)}`, dataTemplateType: type })
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
