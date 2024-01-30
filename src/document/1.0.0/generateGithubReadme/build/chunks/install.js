
export default async props => {
  const { path, extraction, githubPackageName, npmPackageName } = props
  const payload = []

  payload.push({
    h2: 'Install'
  })

  payload.push({
    code: {
      "language": "bash",
      "content": `yarn add ${npmPackageName}`
    }
  })

  payload.push({
    p: 'or'
  })

  payload.push({
    code: {
      "language": "bash",
      "content": `npm install ${npmPackageName}`
    }
  })

  return { payload, name: 'After init', id: 'afterInit', }
}
