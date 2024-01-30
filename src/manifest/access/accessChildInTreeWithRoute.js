export default ({ item, tree, }) => {

  if (!item.parents || !item.parents.length) {
    if (tree.id === item.id) {
      return tree
    }
    if (tree.id !== 'root') {
      return null
    }
    if (!tree.children) {
      return null
    }

    let candidates = tree.children.filter(a => (a.id === item.id))
    if (candidates && candidates.length) {
      return candidates[0]
    }
  }

  const parents = [...(item.parents ? item.parents : [])]
  let result
  let subTree = tree
  for (var i = 0; i < parents.length; i++) {

    if (!subTree.children || !subTree.children.length) {
      break
    }
    const parent = parents[i]
    let candidates = subTree.children.filter(a => (a.id === parent))
    if (!candidates || !candidates.length) {
      break
    }

    if (i === parents.length - 1) {
      result = candidates[0]
      break
    }
    subTree = candidates[0]
  }

  if (result && result.children && result.children.length) {
    let candidates = result.children.filter(a => (a.id === item.id))
    if (candidates && candidates.length) {
      return candidates[0]
    }
  }

  return null
}
