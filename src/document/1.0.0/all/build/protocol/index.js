import { ProtocolEnum } from "../../../../../manifest/data/1.0.0/enums.js"
// import append from "../utils/builder/append.js"
import access from '../../../../../manifest/access/index.js'
import buildSeed from '../../../chunks/build/protocol/seed.js'
import buildProtocolClass from '../../../chunks/build/protocol/class.js'
import buildConfig from '../../../chunks/build/protocol/config.js'
import buildLiveClasses from '../../../chunks/build/protocol/liveClasses.js'
import buildAfterInit from '../../../chunks/build/protocol/afterInit.js'
import buildBeforeInit from '../../../chunks/build/protocol/beforeInit.js'
import buildFunctions from '../../../chunks/build/protocol/functions.js'
import buildSchema from '../../../chunks/build/protocol/schema.js'
import buildSystem from '../../../chunks/build/protocol/system.js'
import buildLib from '../../../chunks/build/protocol/lib.js'
import buildTriggers from '../../../chunks/build/protocol/triggers.js'
import documentClass from '../class/index.js'

export default async props => {
  const { path, includeChunksInMain = true } = props
  let payload = []

  let extraction = null
  let index = await access({
    item: ProtocolEnum.Index,
    extraction,
    path
  })
  if (index && index.data && index.data.module) {
    const { name, description, id, version } = index.data.module
    payload.push({ h1: name })
    payload.push({ p: `@${id}, #${version}` })
    payload.push({ p: description })
    // payload.push({ p: '' })
  }

  let icon = await access({
    item: ProtocolEnum.Assets.Icon,
    // variant: ProtocolEnum.Assets.Icon.variants.x2,
    mimeType: ProtocolEnum.Assets.Icon.mimeTypes.SVG,
    extraction,
    path
  })

  // if (icon && icon.data && icon.data.module) {
  if (false) {
    payload.push({
      p: icon.data.module,
    })
  }
  else {
    icon = await access({
      item: ProtocolEnum.Assets.Icon,
      variant: ProtocolEnum.Assets.Icon.variants.x2,
      mimeType: ProtocolEnum.Assets.Icon.mimeTypes.PNG,
      extraction,
      path
    })
    if (icon && icon.data && icon.data.module && icon.data.module.base64) {
      payload.push({
        img: {
          title: 'icon',
          source: `${icon.data.module.base64}`,
          alt: 'icon',
          style: { width: "20px" }
        }
      })
    }
  }
  payload.push({ p: '' })
  const chunks = {}

  chunks.seed = await buildSeed({ path })
  payload.push({ h2: chunks.seed.name })
  payload = payload.concat(chunks.seed.payload)

  chunks.protocolClass = await buildProtocolClass({ path })
  payload.push({ h2: chunks.protocolClass.name })
  payload = payload.concat(chunks.protocolClass.payload)

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

  chunks.schema = await buildSchema({ path })
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

  payload = payload.filter(a => a)



  let classes = null
  const _classes = await access({
    item: ProtocolEnum.Classes,
    path
  })
  if (_classes && _classes.children) {
    classes = await Promise.all(_classes.children.map(async _class => documentClass({
      path: _class.fullPath
    })))
  }

  return {
    payload,
    chunks,
    classes
  }
}
