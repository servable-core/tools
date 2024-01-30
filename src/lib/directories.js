import checkFileExists from '../domain/lib/checkFileExists.js'
import fs from 'fs'
import _path from 'path'
import _ from 'underscore'

const perform = async ({ path, exlusions = [] }) => {
  try {
    if (!(await checkFileExists(path))) {
      return null
    }

    const items = await fs.promises.readdir(path)

    if (!items || !items.length) {
      return null
    }

    let results = (await Promise.all(items.map(async item => {
      if (exlusions.includes(item)
        || item.includes('.js')
        || item.includes('.json')) {
        return null
      }

      const __path = _path.join(path, item)

      const stat = await fs.promises.stat(__path)
      if (!stat) {
        return null
      }

      const isDir = stat.isDirectory()
      if (!isDir) {
        return null
      }

      return { name: item, stat }
    }))).filter(a => a)

    return results
  }
  catch (e) {
    console.error(e)
    return null
  }
}


export default perform
