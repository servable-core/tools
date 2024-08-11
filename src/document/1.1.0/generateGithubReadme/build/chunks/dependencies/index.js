import build from "./build.js"

export default async props => {
  const { dependencies, } = props
  let payload = []

  payload.push({
    h3: 'Dependencies'
  })

  if ((!dependencies || !dependencies.length)) {
    payload.push({
      p: 'This protocol has no protocol dependencies.'
    })
    return { payload, name: 'Dependencies', id: 'dependencies', }
  }
  const managed = dependencies.filter(a => a.appliesto === 'managed')
  const target = dependencies.filter(a => a.appliesto === 'target')

  if ((!managed || !managed.length)
    && (!target || !target.length)) {
    payload.push({
      p: 'This protocol has no protocol dependencies.'
    })
    return { payload, name: 'Dependencies', id: 'dependencies', }
  }

  payload.push({
    h4: 'Target classes'
  })
  payload = payload.concat(build({ items: target }))
  payload.push({
    h4: 'Managed classes'
  })
  payload = payload.concat(build({ items: managed }))

  payload = payload.filter(a => a)

  return { payload, name: 'Packages', id: 'packages', }
}
