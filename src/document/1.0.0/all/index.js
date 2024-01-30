import buildFeature from './build/feature/index.js'
import writeFeature from './write/feature/index.js'


export default async props => {
  const { path, write = false, includeAuxiliary = true, print = false } = props
  const item = await buildFeature({ path })
  if (print) {
    console.log(item)
  }

  if (write) {
    const written = await writeFeature({ item, path, includeAuxiliary })
  }

  return item
}
