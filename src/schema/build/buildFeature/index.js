import classStruct from './classStruct/index.js'
import _ from 'underscore'
import extractClassesFeature from './extractClassesFeature.js'

const perform = async ({
  featureFactory,
  feature,
  updateFeaturesExcerpt,
  instancesPathId = []
}) => {

  const defaultResult = [
    feature
  ]

  //#TODO: feature.loader
  if (!(await feature.loader.isValid())) {
    console.log('feature not valid', feature.id, feature.loader.path)
    return defaultResult
  }

  //#TODO: feature.loader
  const classesSchemas = await feature.loader.classesSchemas()
  if (!classesSchemas) {
    return defaultResult
  }

  if (feature.id === 'app') {
    await Servable.frameworkBridge.formatAppClassesSchemas({ classesSchemas })
  }

  let adaptedClassesStructs = []
  let classesFeatures = []

  for (var i in classesSchemas) {
    const classSchema = classesSchemas[i]
    const adaptedClassStruct = await classStruct({
      feature,
      classSchema,
      featureFactory,
      instancesPathId: [
        ...instancesPathId,
        { type: 'class', value: { className: classSchema.className } }
      ]
    })
    adaptedClassesStructs = adaptedClassesStructs.concat(adaptedClassStruct)

    let { featuresPayloads } = adaptedClassStruct
    if (!featuresPayloads || !featuresPayloads.length) {
      continue
    }

    featuresPayloads = featuresPayloads.filter(a => (a && a.id !== feature.id))
    //#TODO Move from uniq to cleanfeatures
    featuresPayloads = _.uniq(featuresPayloads, a => a.id)

    const classFeatures = await extractClassesFeature({
      featuresPayloads,
      featureFactory,
      updateFeaturesExcerpt,
      instancesPathId: [
        ...instancesPathId,
        {
          type: 'class',
          value: { className: classSchema.className }
        }
      ],
      extractFeature: perform
    })
    classesFeatures = classesFeatures.concat(classFeatures)
  }

  await updateFeaturesExcerpt({ adaptedClassesStructs })
  let ownClasses = adaptedClassesStructs.map(i => i.classSchema).filter(a => a)
  let jsClasses = adaptedClassesStructs.map(i => i._class).filter(a => a)


  classesFeatures = _.uniq(classesFeatures, a => a.id)
  if (!classesFeatures.length) {
    //#TODO: feature.schema
    feature.schema = {
      ...feature.schema,
      classes: {
        managed: ownClasses,
        all: ownClasses
      },
      jsClasses
    }
    return [feature]
  }

  //#TODO: feature.schema
  let all = [...ownClasses]
  classesFeatures.forEach(element => {
    const { classes: { managed: _own = [], all: _all = [] } = {} } = element.schema
    all = [...all, ..._all]
    all = _.uniq(all, 'className')
  })

  //#TODO: feature.schema
  feature.schema = {
    ...feature.schema,
    classes: {
      managed: ownClasses,
      all
    },
    jsClasses
  }

  feature.extractionStatus = 2

  return [
    feature,
    ...classesFeatures
  ]
}

export default perform

