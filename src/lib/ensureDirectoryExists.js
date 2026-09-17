import fs from 'fs'
import path from 'path'
import checkFileExists from './checkFileExists.js'

/**
 * Ensures the directory containing `filePath` exists, creating any missing
 * parent directories along the way (like `mkdir -p`).
 *
 * Found via `checkJs` (lucide, PEAKUB DX initiative): the two-line body used to
 * call an undefined `ensureDirectoryExistence` and import `./checkFileExists`
 * with no extension - the latter throws `ERR_MODULE_NOT_FOUND` under Node ESM,
 * so this function has never actually worked. Nothing in this package calls it
 * today (confirmed via a repo-wide grep), so the bug was latent, not live.
 *
 * @param {string} filePath - a file path whose parent directory should exist.
 * @returns {Promise<true>} resolves once the directory exists (or already did).
 */
const operation = async filePath => {
  const dirname = path.dirname(filePath)
  if (await checkFileExists(dirname)) {
    return true
  }
  await fs.promises.mkdir(dirname, { recursive: true })
  return true
}

export default operation
