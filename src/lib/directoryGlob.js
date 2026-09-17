import fg from 'fast-glob'

/**
 * Globs `path`, then dynamically imports every matching file, skipping test files and a
 * few common internal directories by default.
 *
 * @param {object} props
 * @param {string} props.path - a glob pattern.
 * @param {import('fast-glob').Options} [props.globOptions] - forwarded to `fast-glob`;
 *   its `ignore` patterns are unioned with (not replaced by) the defaults.
 * @returns {Promise<any[] | null>} the imported modules' default exports, or `null` on
 *   any error (logged, not thrown).
 */
export default async ({ path, globOptions = {} }) => {
  try {
    // Default options to skip test files and common internal dirs
    const defaultOptions = {
      // Was `mark: true` - fast-glob's real option name is `markDirectories` (found via
      // checkJs earlier in the lucide/PEAKUB DX initiative for this same option in
      // protocolLoader's own directoryGlob calls; missed in this shared utility at the time).
      markDirectories: true,
      ignore: [
        '**/lib/**',
        '**/__tests__/**',
        '**/tests/**',
        '**/test/**',
        '**/*.test.js',
        '**/*.spec.js',
      ],
    }

    // Merge caller options with defaults, unioning ignore patterns
    const mergedIgnore = Array.from(new Set([
      ...(defaultOptions.ignore || []),
      ...((globOptions && globOptions.ignore) || []),
    ]))

    const options = {
      ...defaultOptions,
      ...globOptions,
      ignore: mergedIgnore,
    }

    const entries = await fg([path], options)
    return Promise.all(entries.map(entry => import(entry)))
  } catch (e) {
    console.error(e)
    return null
  }
}
