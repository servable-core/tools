
export default async props => {
  const { path, extraction, mainPackage, index } = props
  const payload = []


  if (!mainPackage || !mainPackage.usage) {
    return { payload, name: 'Usage', id: 'usage', }
  }

  const { howTo, template, parameters } = mainPackage.usage
  payload.push({
    h2: 'Usage'
  })

  payload.push({
    h3: 'Template'
  })

  payload.push({
    p: "Add this template to your class' features.json file. Fill the values to fit your needs with the right parameters."
  })

  payload.push({
    code: {
      "language": "json",
      "content": JSON.stringify(template, null, 2)
    }
  })

  payload.push({
    h3: 'Parameters'
  })

  // payload.push({
  //   code: {
  //     "language": "json",
  //     "content": JSON.stringify(parameters)
  //   }
  // })

  if (parameters && parameters.length) {
    const rows = []
    parameters.forEach(param => {
      const { type = "", name: id = "", message = "", defaultValue = "", validators } = param
      rows.push([
        type,
        id,
        message,
        defaultValue,
      ])
    })
    if (rows && rows.length) {
      payload.push({
        table: {
          headers: ["type", "id", "Message", "Default value"],
          rows
        }
      })
    }
  } else {
    payload.push({
      p: 'No parameters'
    })
  }

  return { payload, name: 'Usage', id: 'usage', }
}
