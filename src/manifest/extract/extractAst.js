// https://jsdoc.app
// https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/xmldoc/recommended-tags

export default props => {
  const { ast } = props
  if (!ast || !ast.length) {
    return null
  }
  const targetAst = ast[0]
  const { tags, } = targetAst
  if (!tags || !tags.length) {
    return null
  }
  let tagsByTitle = null
  const params = []
  tags.forEach(tag => {
    const { title } = tag
    if (!title) {
      return
    }
    if (title === 'param') {
      params.push(tag)
    }
    if (title.indexOf('servable-') !== 0) {
      // return
    }

    if (!tagsByTitle) {
      tagsByTitle = {}
    }

    tagsByTitle[title] = tag
  })

  return { ...targetAst, tags, tagsByTitle, params }
}
