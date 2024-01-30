import _githubPackage from "../_githubPackage.js"
import gitUrlParse from "git-url-parse"

export default props => {
  const { items, } = props
  const payload = []

  if (!items || !items.length) {

    payload.push({
      p: 'No dependencies.'
    })
    return payload
  }


  items.forEach(p => {

    if (p.classes) {
      payload.push({
        h5: `Applies to classes: *${p.classes.join(', ')}*`
      })
    }
    const { owner, name } = gitUrlParse(p.url)
    payload.push(_githubPackage({ username: owner, name }))
  })

  return payload
}
