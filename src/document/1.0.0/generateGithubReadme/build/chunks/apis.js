
export default async props => {
  const { mainPackage } = props
  const payload = []
  payload.push({
    h2: 'Used APIs'
  })

  if (!mainPackage || !mainPackage.apis || !mainPackage.apis.length) {
    payload.push({
      p: "No apis specified."
    })
    return { payload, name: 'APIs', id: 'apis', }
  }

  const rows = []
  mainPackage.apis.forEach((adapter) => {
    const { id, version = "*", url = "" } = adapter
    if (!id) {
      return
    }

    rows.push([
      id,
      version,
    ])
  })

  if (rows && rows.length) {
    payload.push({
      table: {
        headers: ["Api", "Version",],
        rows
      }
    })
  }

  return { payload, name: 'APIs', id: 'apis', }
}
