import cleanFeatures from "../../../lib/cleanFeatures.js"


export default ({ items = [], _class, withFeaturesFeatures }) => {
  let classFeatures = _class.features ? _class.features : []
  if (!withFeaturesFeatures) {
    return cleanFeatures([...items, ...classFeatures])
  }

  return cleanFeatures([...items])

  // let inheritedFeatures = _class.inheritedFeatures ? _class.inheritedFeatures : []
  // return cleanFeatures([
  //     ...classFeatures,
  //     ...inheritedFeatures
  // ])
}
