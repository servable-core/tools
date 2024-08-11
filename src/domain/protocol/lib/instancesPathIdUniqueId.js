
export default ({ instancesPathId, currentProtocolId }) => {
  const a = instancesPathId.map(i => {
    switch (i.type) {
      case 'class': {
        return `🌸 ${i.value.className}`
      }
      case 'protocol': {
        return `🐝 ${i.value.id}`
      }
      default:
        return null
    }
  }).filter(a => a).join(' ')

  return `${a} 🐝 ${currentProtocolId}`
}
