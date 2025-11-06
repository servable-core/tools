import fg from 'fast-glob'

export default async ({ path, globOptions = {} }) => {
  try {
    // Default options to skip test files and common internal dirs
    const defaultOptions = {
      mark: true,
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
