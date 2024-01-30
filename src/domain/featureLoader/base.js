import extract from '../../manifest/extract/index.js'
import { DataTemplateType, FeatureEnum } from '../../manifest/data/1.0.0/enums.js'
import sanitizePath from '../../lib/sanitizePath.js'
import importJSDefault from './lib/importJSDefault.js'
import importJSONDefault from './lib/importJSONDefault.js'
import access from '../../manifest/access/index.js'
import fs from 'fs'


export default class FeatureLoader {
  _cache = {}
  _extraClasses = {}
  _extraction = null

  _path = null
  _featureInstance = null

  constructor(props) {
    const { path, extraClasses } = props
    this._path = path
    this._extraClasses = extraClasses
  }

  get path() {
    return this._path
  }
  set path(value) {
    this._path = value
  }

  get cache() { return this._cache }
  set cache(value) { this._cache = value }

  get extraction() { return this._extraction }
  set extraction(value) { this._extraction = value }


  get featureInstance() { return this._featureInstance }
  set featureInstance(value) { this._featureInstance = value }



  async loadExtraction({ servableConfig } = {}) {
    try {
      this.extraction = await extract({
        path: `${sanitizePath(this.path)}`,
        dataTemplateType: DataTemplateType.Feature
      })
      // const e = JSON.stringify(this.extraction)
      // console.log(this.extraction)
      // console.log(e.length)
      // const a = JSON.parse(e)
      // console.log(a)

      // const schemaAa = await access({
      //   item: FeatureEnum.Schema,
      //   extraction: this.extraction,
      // })
      // const schemaB = await access({
      //   item: FeatureEnum.Schema,
      //   extraction: a,
      // })
      // console.log(schemaAa, schemaB)
    } catch (e) {
      console.info(e)
    }
  }

  async _accessManifestItem({ item }) {
    return access({
      item,
      extraction: this.extraction,
    })
  }

  async isValid() {
    const _stat = await fs.promises.stat(this.path)
    if (!_stat || !_stat.isDirectory()) {
      return false
    }
    return true
  }

  async getModule() {
    const mo = await this._accessManifestItem({
      item: FeatureEnum.Index,
    })
    return mo.data.module
  }

  async _importJSDefault({ path, cacheKey }) {
    return importJSDefault({ path, cache: this._cache, cacheKey })
  }

  async _importJSONDefault({ path, cacheKey }) {
    return importJSONDefault({ path, cache: this._cache, cacheKey })
  }

  _valueInCache(value) { return this.cache[value] }
}
