
export default ({ instancesPathId, currentFeatureId }) => {
  const a = instancesPathId.map(i => {
    switch (i.type) {
      case 'class': {
        return `🌸 ${i.value.className}`
      }
      case 'feature': {
        return `🐝 ${i.value.id}`
      }
      default:
        return null
    }
  }).filter(a => a).join(' ')

  return `${a} 🐝 ${currentFeatureId}`
}
