
export default async props => {
  const { mainPackage } = props
  const payload = []
  payload.push({
    h2: 'Compatible engines'
  })

  if (!mainPackage || !mainPackage.adapters || !mainPackage.adapters.length) {
    payload.push({
      p: "No adapters specified."
    })
    return { payload, name: 'Adapters', id: 'adapters', }
  }

  const rows = []
  mainPackage.adapters.forEach((adapter) => {
    const { id, version = "*", url = "" } = adapter
    if (!id) {
      return
    }

    rows.push([
      id,
      version,
      url
    ])
  })

  if (rows && rows.length) {
    payload.push({
      table: {
        headers: ["Adapter", "Version", "Link"],
        rows
      }
    })
  }

  return { payload, name: 'Adapters', id: 'adapters', }
}
