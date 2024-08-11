
export default ({ className, instances, path }) => {
  for (var i in instances) {
    const instance = instances[i]
    if ((instance.className === className)
      && (instance.path === path)) {
      return instance
    }
  }

  return null
}
