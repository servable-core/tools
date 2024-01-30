
export default async ({
  adaptedClassesStructs,
  featuresExcerpt }) => {
  const candidates = adaptedClassesStructs.filter(a =>
    (a && a.features && a.features.length))

  if (!candidates || !candidates.length) {
    return
  }
  candidates.forEach(adaptedClassesStruct => {
    const { features, classSchema: { className } } = adaptedClassesStruct
    features.forEach(feature => {
      if (!featuresExcerpt[feature.id]) {
        featuresExcerpt[feature.id] = {
          classes: []
        }
      }
      if (!featuresExcerpt[feature.id].classes.includes(className)) {
        featuresExcerpt[feature.id].classes.push(className)
      }
    })
  })
}
