// @ts-nocheck - lucide (PEAKUB DX initiative): the sharp resize helper this file calls is
// typed with several required options that this caller passes conditionally/optionally.
// Deferred rather than annotated here; see imageToBase64.js's own note for the same
// image-processing-library friction.
import checkFileExists from "../../../lib/checkFileExists.js"
import importJSONAsync from "../../../lib/importJSONAsync.js"
import sanitizePath from '../../../lib/sanitize.js'
import fs from "fs"
import fse from 'fs-extra'
import imageToBase64 from './imageToBase64.js'
import mime from 'mime'
import extractFileWithVariants from './extractFileWithVariants.js'

export default async (props) => {
  const {
    mimeType,
    fullPath,
    variants,
    params
  } = props

  const extensionType = mime.getExtension(mimeType)

  let documentation = null
  let md = `${sanitizePath(`${props.fullPath}.md`)}`
  if (!(await checkFileExists(md))) {
    md = `${sanitizePath(`${props.fullPath}.mdx`)}`
  }

  if (await checkFileExists(md)) {
    documentation = await fs.promises.readFile(md, 'utf8')
  }

  let moduleImporter = {}

  switch (mimeType) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/jpg':
    case 'image/gif':
    case 'image/webp': {
      moduleImporter = async ({ path }) => imageToBase64({
        path,
        mimeType,
        maxWidth: params.maxWidth,
        maxHeight: params.maxHeight
      })
      break
    }
    default:
    case 'text/markdown':
    case 'text/yaml':
      {
        moduleImporter = async ({ path }) => fse.readFile(path, 'utf8')
        break
      }
    case 'image/svg+xml': {
      moduleImporter = async ({ path }) => {
        let data = await fse.readFile(path, 'utf8')
        data = data.replace(/(\r\n|\n|\r)/gm, "")
        return data
      }
      break
    }
    case 'text/javascript': {
      moduleImporter = async ({ path }) => import(path)
      break
    }
    case 'application/json': {
      moduleImporter = async ({ path }) => importJSONAsync(path)
      break
    }
    // A duplicate `case 'text/yaml':` used to sit here - 'text/yaml' is already grouped with
    // `default`/`text/markdown` above, so this one was 100% dead (a switch always matches the
    // first case label reached); removed rather than kept, since JS switch fallthrough means it
    // could never run (found via eslint's `no-duplicate-case`, lucide/PEAKUB DX initiative).
  }

  const files = await extractFileWithVariants({
    variants,
    extensionType,
    moduleImporter,
    fullPath,
    payload: {
      mimeType,
      documentation,
    },
  })

  return files
}
