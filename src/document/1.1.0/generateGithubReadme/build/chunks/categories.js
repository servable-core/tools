import _generateBadge from "./_generateBadge.js"

export default async props => {
  const { mainPackage } = props
  const payload = []
  payload.push({
    h2: 'Categories'
  })

  if (!mainPackage || !mainPackage.categories || !mainPackage.categories.length) {
    payload.push({
      p: "No categories specified."
    })
    return { payload, name: 'Categories', id: 'categories', }
  }

  const rows = []
  mainPackage.categories.forEach((item) => {

    if (!item) {
      return
    }

    rows.push(_generateBadge(`${item}-orange`))
  })

  payload.push({
    p: rows.join(' ')
  })

  return { payload, name: 'Categories', id: 'categories', }
}
