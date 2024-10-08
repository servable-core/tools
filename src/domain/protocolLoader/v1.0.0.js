import BaseClass from './base.js'

import directories from '../../lib/directories.js'
import cleanProtocols from '../../lib/cleanProtocols.js'
import mergeClassProtocols from './lib/mergeClassProtocols.js'

import importJSONAsync from '../../lib/importJSONAsync.js'
import directoryGlob from '../../lib/directoryGlob.js'

import checkFileExists from '../../lib/checkFileExists.js'
import directoryFilesRecursive from '../../lib/directoryFilesRecursive.js'
import { ProtocolEnum } from '../../manifest/data/1.0.0/enums.js'

import triggerItems from './lib/triggerItems.js'
import fs from 'fs'
import fspath from 'path'
import semver from 'semver'

export default class ProtocolLoaderV1_0_0 extends BaseClass {

  // #region class

  async getClass({ className }) {
    const cacheKey = 'class'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = `${this.path}/classes/${className.toLowerCase()}/class/index.js`

    if (!(await checkFileExists(path))) {
      return null
    }

    return this._importJSDefault({ path, })
  }

  async classFunctions({ className }) {
    const cacheKey = 'classFunctions'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    let path = `${this.path}/classes/${className.toLowerCase()}/functions`
    if (!(await checkFileExists(path))) {
      path = `${this.path}/classes/${className.toLowerCase()}/cloudCode`
      if (!(await checkFileExists(path))) {
        return null
      }
    }

    const data = (await directoryFilesRecursive({ path }))
    return data
  }

  async classTriggers({ className }) {
    const cacheKey = 'classTriggers'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const prefix = `${this.path}/classes/${className.toLowerCase()}/triggers`

    const data = {}
    for (var i = 0; i < triggerItems.length; i++) {
      const item = triggerItems[i]
      const path = `${prefix}/${item}.js`
      if (!(await checkFileExists(path))) {
        continue
      }

      const itemData = (await import(path))
      if (!itemData || !itemData.default) {
        continue
      }

      data[item] = itemData.default
    }

    if (Object.keys(data).length > 0) {
      return data
    }

    return this.classTriggersMerged({ className })
  }

  async classTriggersMerged({ className }) {
    const cacheKey = 'classTriggers'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = `${this.path}/classes/${className.toLowerCase()}/triggers/index.js`
    if (!(await checkFileExists(path))) {
      return null
    }

    const data = (await import(path))
    //this.cache[cacheKey] = data
    return data
  }

  async classJobs({ className }) {
    const cacheKey = 'classJobs'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = `${this.path}/classes/${className.toLowerCase()}/jobs_`
    if (!(await checkFileExists(path))) {
      return null
    }

    const data = (await directoryFilesRecursive({ path }))
    //this.cache[cacheKey] = data
    return data
  }

  classSeedFolder({ className }) {
    return `${this.path}/classes/${className.toLowerCase()}/seed`
  }

  async classSeedMode(props) {
    const cacheKey = 'classSeedMode'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const classSeedFolder = this.classSeedFolder(props)
    let _path = `${classSeedFolder}/index.js`
    if ((await checkFileExists(_path))) {
      return 'manual'
    }

    _path = `${classSeedFolder}/transformer.js`
    if ((await checkFileExists(_path))) {
      return 'auto'
    }

    return 'none'
  }

  async classSeedManual(props) {
    const cacheKey = 'classSeedManual'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const classSeedFolder = this.classSeedFolder(props)
    let _path = `${classSeedFolder}/index.js`
    if (!(await checkFileExists(_path))) {
      return null
    }

    const data = (await import(_path)).default
    //this.cache[cacheKey] = data
    return data
  }

  async classSeedMetadata(props) {
    const cacheKey = 'classSeedMetadata'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const classSeedFolder = this.classSeedFolder(props)

    const _path = `${classSeedFolder}/metadata.json`
    if (!(await checkFileExists(_path))) {
      return null
    }

    const data = await importJSONAsync(_path)
    //this.cache[cacheKey] = data
    return data
  }

  async classSeedAutoFiles(props) {
    const { className } = props
    const cacheKey = 'classSeedAutoFiles'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = this.classSeedFolder({ className })
    const result = {}

    let _path = `${path}/data.json`
    if ((await checkFileExists(_path))) {
      result.data = await importJSONAsync(_path)
    }

    _path = `${path}/transformer.js`
    if ((await checkFileExists(_path))) {
      result.transformer = (await import(_path)).default
      // console.log("[Servable]", result.transformer)
    }

    _path = `${path}/validator.js`
    if ((await checkFileExists(_path))) {
      result.validator = (await import(_path)).default
    }

    _path = `${path}/ref.js`
    if ((await checkFileExists(_path))) {
      result.uniqueRef = (await import(_path)).default
    }

    return result
  }


  classConfigFolder({ className }) {
    return `${this.path}/classes/${className.toLowerCase()}/config`
  }

  async classConfigDataFiles({ className }) {
    const cacheKey = 'classConfigDataFiles'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = this.classConfigFolder({ className })
    const result = {}

    const valuesPath = `${path}/entries.json`
    if ((await checkFileExists(valuesPath))) {
      result.entries = await importJSONAsync(valuesPath)
    }

    const conditionsPath = `${path}/conditions.json`
    if ((await checkFileExists(conditionsPath))) {
      result.conditions = await importJSONAsync(conditionsPath)
    }

    const groupsPath = `${path}/groups.json`
    if ((await checkFileExists(groupsPath))) {
      result.groups = await importJSONAsync(groupsPath)
    }

    return result
  }


  async classProtocols({ className, withProtocolsProtocols = false }) {
    const cacheKey = 'class'
    // //console.log('classProtocols>', className, 'enter')
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }
    const items = []
    const seedMode = await this.classSeedMode({ className })
    // //console.log('classProtocols>', className, 'seedmode', seedMode)
    if (seedMode === 'auto') {
      items.push({ id: 'servableautoseedable' })
    }
    const _class = await this.getClass({ className })
    if (!_class) {
      //console.log('classProtocols>', className, 'no _class')
      return items
    }

    let data = mergeClassProtocols({ items, _class, withProtocolsProtocols })
    const path = `${this.path}/classes/${className.toLowerCase()}/class/protocols.js`

    if ((await checkFileExists(path))) {

      let _data = (await import(path)).default
      // //console.log('classProtocols>', className, '_data', _data)
      _data = _data ? _data : []
      data = [...data,
      ..._data]
    }

    //this.cache[cacheKey] = data
    data = cleanProtocols(data)
    // result = _.uniq(result, a => a.id)
    // //console.log('classProtocols>', className, 'finaldata', data)
    return data
  }

  // #endregion








  async afterInit() {
    const cacheKey = 'afterInit'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = `${this.path}/afterInit/index.js`
    if (!(await checkFileExists(path))) {
      return null
    }

    return this._importJSDefault({ path, })
  }

  async beforeInit() {
    const cacheKey = 'beforeInit'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = `${this.path}/beforeInit/index.js`
    if (!(await checkFileExists(path))) {
      return null
    }

    return this._importJSDefault({ path, })
  }

  configFolder() {
    return `${this.path}/config`
  }


  async configDataFiles() {
    const cacheKey = 'configData'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = this.configFolder()
    const result = {}

    const valuesPath = `${path}/entries.json`
    if ((await checkFileExists(valuesPath))) {
      result.entries = await importJSONAsync(valuesPath)
    }

    const conditionsPath = `${path}/conditions.json`
    if ((await checkFileExists(conditionsPath))) {
      result.conditions = await importJSONAsync(conditionsPath)
    }

    const groupsPath = `${path}/groups.json`
    if ((await checkFileExists(groupsPath))) {
      result.groups = await importJSONAsync(groupsPath)
    }

    return result
  }

  seedFolder() {
    return `${this.path}/seed`
  }

  async seedMode() {
    const cacheKey = 'seedMode'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const seedFolder = this.seedFolder()
    let _path = `${seedFolder}/index.js`
    if (await checkFileExists(_path)) {
      return 'manual'
    }

    //Auto not handled yet for protocols
    // _path = `${seedFolder}/transformer.js`
    // if (await checkFileExists(_path)) {
    //     return 'auto'
    // }

    return 'none'
  }

  async seedManual() {
    const cacheKey = 'seedManual'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }
    let _path = `${this.path}/seed/index.js`
    if (!(await checkFileExists(_path))) {
      return null
    }

    const data = (await import(_path)).default
    //this.cache[cacheKey] = data
    return data
  }

  async seedMetadata() {
    const cacheKey = 'seedMetadata'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = `${this.seedFolder()}/metadata.json`
    if (!(await checkFileExists(path))) {
      return null
    }

    const data = await importJSONAsync(path)
    //this.cache[cacheKey] = data
    return data
  }
















  async triggers() {
    const cacheKey = 'triggers'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const prefix = `${this.path}/triggers`

    const data = {}
    for (var i = 0; i < triggerItems.length; i++) {
      const item = triggerItems[i]
      const path = `${prefix}/${item}.js`
      if (!(await checkFileExists(path))) {
        continue
      }

      const itemData = (await import(path))
      if (!itemData || !itemData.default) {
        continue
      }

      data[item] = itemData.default
    }

    if (Object.keys(data).length > 0) {
      return data
    }

    return this.triggersMerged()
  }

  async triggersMerged() {
    const cacheKey = 'triggers'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = `${this.path}/triggers/index.js`
    if (!(await checkFileExists(path))) {
      return null
    }

    const data = (await import(path))
    // this.cache[cacheKey] = data
    return data
  }

  async triggersMetadata() {
    const cacheKey = 'triggersMetadata'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = `${this.path}/triggers/metadata.json`
    if (!(await checkFileExists(path))) {
      return null
    }

    const data = await importJSONAsync(path)
    this.cache[cacheKey] = data
    return data
  }



  //#region schema

  async classesSchemas(props) {
    // if (this.valueInCache('classes')) {
    //     return this.valueInCache('classes')
    // }

    const schema = await this.schemaRaw(props)
    if (schema && schema.managed) {
      return schema.managed.classes
    }

    const schemaPath = await this._schemaPath()
    let path = `${schemaPath}/classes.js`

    if ((await checkFileExists(path))) {
      const classes = await (await import(path)).default({ protocol: this.protocolInstance })
      // this.cache['classes'] = classes
      return classes
    }

    path = `${schemaPath}/classes.json`
    if (!(await checkFileExists(path))) {
      return []
    }

    const classes = await importJSONAsync(path)
    // this.cache['classes'] = classes
    return classes
  }

  async schemaFields(props) {
    // const cacheKey = 'schemaFields'
    // if (this.valueInCache(cacheKey)) {
    //     return this.valueInCache(cacheKey)
    // }
    const schema = await this.schemaRaw(props)
    if (schema && schema.target) {
      return schema.target.fields
    }

    const schemaPath = await this._schemaPath()
    const path = `${schemaPath}/fields.json`
    if (!(await checkFileExists(path))) {
      return null
    }

    return this._importJSONDefault({ path, })
  }

  async schemaIndexes(props) {
    // const cacheKey = 'schemaIndexes'
    // if (this.valueInCache(cacheKey)) {
    //     return this.valueInCache(cacheKey)
    // }
    const schema = await this.schemaRaw(props)
    if (schema && schema.target) {
      return schema.target.indexes
    }

    const schemaPath = await this._schemaPath()
    const path = `${schemaPath}/indexes.json`

    if (!(await checkFileExists(path))) {
      return null
    }

    return this._importJSONDefault({ path, })
  }

  async schemaRaw(props = {}) {
    const { ad } = props
    const a = await this._accessManifestItem({
      item: ProtocolEnum.Schema,
    })
    // const cacheKey = 'schemaIndexes'
    // if (this.valueInCache(cacheKey)) {
    //     return this.valueInCache(cacheKey)
    // }

    const schemaPath = await this._schemaPath()

    //#TODO: A dynamic schema needs protocols to be instantiated per class as to avoid class defintion collusions and edge case.
    // let path = `${schemaPath}/index.js`

    // if ((await checkFileExists(path))) {
    //     let data = (await import(path)).default
    //     //#TODO: don't use up protocol params
    //     data = await data({ ...props, params: this.protocolInstance.params })
    //     return data
    // }

    let path = `${schemaPath}/index.json`

    if (!(await checkFileExists(path))) {
      return null
    }

    const b = await this._importJSONDefault({ path, })
    return b
  }

  async schemaClassLevelPermissions(props) {
    // const cacheKey = 'schemaClassLevelPermissions'
    // if (this.valueInCache(cacheKey)) {
    //     return this.valueInCache(cacheKey)
    // }

    const schema = await this.schemaRaw(props)
    if (schema && schema.target) {
      return schema.target.classLevelPermissions
    }

    const schemaPath = await this._schemaPath()
    const path = `${schemaPath}/classlevelpermissions.json`

    if (!(await checkFileExists(path))) {
      return null
    }

    return this._importJSONDefault({ path, })
  }

  async _schemaPath() {
    //let version = this.currentProtocolVersion ? this.currentProtocolVersion : this.protocolInstanceVersion
    let version = this.protocolInstance.version
    let versions = await this.schemaVersions()

    if (!version) {
      return `${this.path}/schema`
    }

    if (!versions
      || !versions.length) {
      return `${this.path}/schema`
    }

    if (versions
      && versions.length
      && !versions.includes(version)) {
      return `${this.path}/schema`
    }

    if (versions
      && versions.length
      && version === 'latest') {
      version = versions[versions.length - 1] //#TODO: sort by semver
    }

    const path = `${this.path}/schema/${version}`
    return path
  }


  async schemaVersions() {
    const cacheKey = '_schemaVersions'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }
    const items = await directories({ path: `${this.path}/schema` })
    if (!items || !items.length) {
      return null
    }
    let data = items.map(i => i.name)
    data = data.sort()
    this.cache[cacheKey] = data
    return data
  }

  async schemaVersionOf({ version, subPath }) {
    const cacheKey = `_schemaVersionOf${subPath}`
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const versions = await this.schemaVersions()
    if (!versions || !versions.includes(version)) {
      return null
    }

    const path = `${this.path}/schema/${version}/migration/${subPath}/index.js`
    if (!(await checkFileExists(path))) {
      return null
    }

    const data = await import(path)
    this.cache[cacheKey] = data
    return data
  }

  //#endregion




  async ownProtocols() {
    const cacheKey = 'ownProtocols'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    let path = `${this.path}/class/protocols.js`
    if (!(await checkFileExists(path))) {
      return null
    }

    const data = (await import(path)).default

    //this.cache[cacheKey] = data
    return data
  }

  async ownProtocolsClass() {
    const cacheKey = 'ownProtocolsClass'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = `${this.path}/class/index.js`
    if (!(await checkFileExists(path))) {
      return null
    }
    // const _data = (await import(path))
    return this._importJSDefault({ path, })
  }

  async liveClasses() {
    const cacheKey = 'liveclasses'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = `${this.path}/liveclasses.js`
    if (!(await checkFileExists(path))) {
      return null
    }

    return this._importJSDefault({ path, })
  }
  //#region system
  async systemDockerCompose() {
    const cacheKey = 'systemDockerCompose'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = `${this.path}/system/docker/docker-compose.yaml`
    if (!(await checkFileExists(path))) {
      return null
    }

    const data = (await import(path))
    //this.cache[cacheKey] = data
    return data
  }

  async systemDockerComposeExists() {
    const path = this.systemDockerComposePath()
    return checkFileExists(path)
  }

  systemDockerComposePath() {
    return `${this.systemDockerComposeDirPath()}/docker-compose.yaml`
  }

  systemDockerDataPath() {
    return `${this.systemDockerComposeDirPath()}/data`
  }

  systemDockerComposeDirPath() {
    return `${this.path}/system/docker`
  }

  configDirPath_obs() {
    return `${this.path}/config`
  }

  async configData_obs() {
    // const cacheKey = 'schemaClassLevelPermissions'
    // if (this.valueInCache(cacheKey)) {
    //     return this.valueInCache(cacheKey)
    // }

    const schemaPath = await this._schemaPath()
    const path = `${this.configDirPath_obs()}/index.json`

    if (!(await checkFileExists(path))) {
      return null
    }

    return this._importJSONDefault({ path, })
  }

  async systemDockerPayloadAdapter() {
    const cacheKey = 'systemDockerPayloadAdapter'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = `${this.path}/system/docker/adaptpayload.js`
    if (!(await checkFileExists(path))) {
      return null
    }

    return this._importJSDefault({ path, })
  }

  //#endregion

  async functions() {
    const cacheKey = 'functions'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    let path = `${this.path}/cloudCode`
    if (!(await checkFileExists(path))) {
      path = `${this.path}/functions`
      if (!(await checkFileExists(path))) {
        path = `${this.path}/cloudcode`
        if (!(await checkFileExists(path))) {
          return null
        }
      }
    }

    const data = (await directoryFilesRecursive({ path }))
    //this.cache[cacheKey] = data
    return data
  }


  async services() {
    let path = `${this.path}/services`
    if (!(await checkFileExists(path))) {
      return null
    }

    const data = (await directoryFilesRecursive({ path }))
    //this.cache[cacheKey] = data
    return data
  }

  async routes() {
    let path = `${this.path}/routes`
    if (!(await checkFileExists(path))) {
      return null
    }

    let data = {}
    const items = await fs.promises.readdir(path)
    if (!items || !items.length) {
      return null
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item) {
        continue
      }

      if (item[0] !== 'v') {
        continue
      }

      if (!semver.valid(semver.coerce(item))) {
        continue
      }
      const __path = fspath.join(path, item)
      const _stat = await fs.promises.stat(__path)
      if (!_stat) {
        continue
      }

      const isDir = _stat.isDirectory()
      if (!isDir) {
        continue
      }

      let _data = (await directoryGlob({
        path: `${__path}/**/*.js`, globOptions: {
          mark: true,
          ignore: ['**/lib/**']
        }
      }))
      data[item] = _data
    }

    return data
  }


  async liveQueries() {
    let path = `${this.path}/livequeries`
    if (!(await checkFileExists(path))) {
      return null
    }

    const data = (await directoryGlob({
      path: `${path}/**/*.js`, globOptions: {
        mark: true,
        ignore: ['**/lib/**']
      }
    }))
    return data
  }


  async jobFiles() {
    const cacheKey = 'jobFiles'
    if (this._valueInCache(cacheKey)) {
      return this._valueInCache(cacheKey)
    }

    const path = `${this.path}/jobs_`
    if (!(await checkFileExists(path))) {
      return null
    }

    const data = (await directoryFilesRecursive({ path }))
    //this.cache[cacheKey] = data
    return data
  }
}

