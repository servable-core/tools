import _githubPackage from "./_githubPackage.js"

export default async props => {
  const { packages, } = props
  const payload = []



  if (!packages || !packages.length) {
    return { payload, name: 'Packages', id: 'packages', }
  }

  payload.push({
    h3: 'Companion packages'
  })

  packages.forEach(p => {
    if (!p.repository) {
      return
    }

    payload.push(_githubPackage({ username: p.username, name: p.name }))
  })

  return { payload, name: 'Packages', id: 'packages', }
}
