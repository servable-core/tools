import gitUrlParse from "git-url-parse"
import { FeatureEnum } from "../../../../manifest/data/1.0.0/enums.js"
// import append from "../utils/builder/append.js"
import access from '../../../../manifest/access/index.js'
import buildSeed from '../../chunks/build/feature/seed.js'
import buildFeatureClass from '../../chunks/build/feature/class.js'
import buildConfig from '../../chunks/build/feature/config.js'
import buildLiveClasses from '../../chunks/build/feature/liveClasses.js'
import buildAfterInit from '../../chunks/build/feature/afterInit.js'
import buildBeforeInit from '../../chunks/build/feature/beforeInit.js'
import buildFunctions from '../../chunks/build/feature/functions.js'
import buildSchema from '../../chunks/build/feature/schema.js'
import buildSystem from '../../chunks/build/feature/system.js'
import buildLib from '../../chunks/build/feature/lib.js'
import buildGithubTags from './chunks/githubTags.js'
import buildRegistry from './chunks/registry.js'
import buildInstall from './chunks/install.js'
import buildUsage from './chunks/usage.js'
import buildFooter from './chunks/footer.js'
import buildPackages from './chunks/packages.js'
import buildDependencies from './chunks/dependencies/index.js'
import buildTriggers from '../../chunks/build/feature/triggers.js'
import buildAdapters from './chunks/adapters.js'
import buildApis from './chunks/apis.js'
import buildCategories from './chunks/categories.js'

export default async props => {
  const { path, includeChunksInMain = true } = props
  let payload = []
  const chunks = {}
  let extraction = null
  let githubPackageName = null
  let npmPackageName = null
  let mainPackage = null
  let packages
  let version = null
  let index = await access({
    item: FeatureEnum.Index,
    extraction,
    path
  })

  if (index && index.data && index.data.module) {
    packages = index.data.module.packages
    mainPackage = index.data.module
    const { name, description, id, } = mainPackage
    version = mainPackage.version
    payload.push({ h1: `${name} *feature for Servable*` })
    payload.push({ p: `**${id}**` })

    npmPackageName = id
    if (mainPackage.repository) {
      const { owner, name: _packageName } = gitUrlParse(mainPackage.repository.url)
      githubPackageName = `${owner}/${_packageName}`
    } else if (npmPackageName) {
      githubPackageName = npmPackageName.replace('@')
    }
  }

  chunks.githubTags = await buildGithubTags({ path, npmPackageName, githubPackageName })
  // payload.push({ h2: chunks.githubTags.name })
  payload = payload.concat(chunks.githubTags.payload)

  let icon = await access({
    item: FeatureEnum.Assets.Icon,
    // variant: FeatureEnum.Assets.Icon.variants.x2,
    mimeType: FeatureEnum.Assets.Icon.mimeTypes.SVG,
    extraction,
    path
  })


  // if (icon && icon.data && icon.data.module) {
  // Github does not displaya svg
  if (false) {
    const data = icon.data.module.replace('<svg ', '<svg width="100px" height="100px" ')
    payload.push({
      // p: icon.data.module,
      p: data
    })
  }
  else {
    icon = await access({
      item: FeatureEnum.Assets.Icon,
      variant: FeatureEnum.Assets.Icon.variants.x2,
      mimeType: FeatureEnum.Assets.Icon.mimeTypes.PNG,
      extraction,
      path
    })
    if (icon && icon.data && icon.data.module && icon.data.module.base64) {
      // Github does not displaya svg
      // payload.push({
      //   img: {
      //     title: 'icon',
      //     source: `${icon.data.module.base64}`,
      //     alt: 'icon',
      //     style: { width: "20px" }
      //   }
      // })
      // Can't resize
      // payload.push({
      //   img: {
      //     title: 'icon',
      //     source: `src/assets/icon.png`,
      //     alt: 'icon',
      //     style: { width: "20px" }
      //   }
      // })
      payload.push({
        p: '<img src="src/assets/icon.png" alt="drawing" style="width:80px;" />'
      })
      payload.push({
        p: '\n'
      })
    }
  }




  if (index && index.data && index.data.documentation) {
    payload.push({ p: index.data.documentation })
    // payload.push({ p: '' })
  } else if (index && index.data && index.data.module) {
    payload.push({ p: description })
  }

  chunks.registry = await buildRegistry({ path, mainPackage, index })
  // payload.push({ h2: chunks.githubTags.name })
  payload = payload.concat(chunks.registry.payload)


  chunks.install = await buildInstall({ path, npmPackageName, githubPackageName })
  // payload.push({ h2: chunks.githubTags.name })
  payload = payload.concat(chunks.install.payload)

  chunks.adapters = await buildAdapters({ mainPackage })
  // payload.push({ h2: chunks.githubTags.name })
  payload = payload.concat(chunks.adapters.payload)

  chunks.apis = await buildApis({ mainPackage })
  // payload.push({ h2: chunks.githubTags.name })
  payload = payload.concat(chunks.apis.payload)

  chunks.categories = await buildCategories({ mainPackage })
  // payload.push({ h2: chunks.githubTags.name })
  payload = payload.concat(chunks.categories.payload)


  chunks.packages = await buildPackages({ packages })
  // payload.push({ h2: chunks.githubTags.name })
  payload = payload.concat(chunks.packages.payload)

  chunks.dependencies = await buildDependencies({ dependencies: mainPackage.dependencies })
  // payload.push({ h2: chunks.githubTags.name })
  payload = payload.concat(chunks.dependencies.payload)

  chunks.usage = await buildUsage({ path, mainPackage, index })
  // payload.push({ h2: chunks.githubTags.name })
  payload = payload.concat(chunks.usage.payload)

  // payload.push({ hr: `` })
  // payload.push({ p: `*Generated documentation below*` })

  chunks.seed = await buildSeed({ path })
  payload.push({ h2: chunks.seed.name })
  payload = payload.concat(chunks.seed.payload)



  chunks.featureClass = await buildFeatureClass({ path })
  payload.push({ h2: chunks.featureClass.name })
  payload = payload.concat(chunks.featureClass.payload)

  chunks.beforeInit = await buildBeforeInit({ path })
  payload.push({ h2: chunks.beforeInit.name })
  payload = payload.concat(chunks.beforeInit.payload)

  chunks.afterInit = await buildAfterInit({ path })
  payload.push({ h2: chunks.afterInit.name })
  payload = payload.concat(chunks.afterInit.payload)

  chunks.config = await buildConfig({ path })
  payload.push({ h2: chunks.config.name })
  payload = payload.concat(chunks.config.payload)

  chunks.functions = await buildFunctions({ path })
  payload.push({ h2: chunks.functions.name })
  payload = payload.concat(chunks.functions.payload)

  chunks.liveClasses = await buildLiveClasses({ path })
  payload.push({ h2: chunks.liveClasses.name })
  payload = payload.concat(chunks.liveClasses.payload)

  chunks.schema = await buildSchema({ path, version })
  payload.push({ h2: chunks.schema.name })
  payload = payload.concat(chunks.schema.payload)

  chunks.system = await buildSystem({ path })
  payload.push({ h2: chunks.system.name })
  payload = payload.concat(chunks.system.payload)

  chunks.lib = await buildLib({ path })
  payload.push({ h2: chunks.lib.name })
  payload = payload.concat(chunks.lib.payload)

  chunks.triggers = await buildTriggers({ path })
  payload.push({ h2: chunks.triggers.name })
  payload = payload.concat(chunks.triggers.payload)

  chunks.footer = await buildFooter({ path })
  payload = payload.concat(chunks.footer.payload)

  payload = payload.filter(a => a)




  return {
    payload,
    chunks,
  }
}
