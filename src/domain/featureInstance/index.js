import instancesPathIdUniqueId from '../feature/lib/instancesPathIdUniqueId.js'
import semver from 'semver'
const DEFAULT_VERSION = "1.0.0"
const DEFAULT_MIMIUM_COMAPATIBLE_VERSION = "0.0.0"

export default class FeatureInstance {
  _className = null
  _params = {}
  _instancesPathId = []
  _instancesPathIdString = null
  _loader = null
  _version = DEFAULT_VERSION
  _minimumCompatibleVersion = DEFAULT_MIMIUM_COMAPATIBLE_VERSION
  _loadState = 0
  _module = {}
  _path = null
  _id = null
  _featurePayload = null
  _schema = {
    classes: {
      managed: [],
      all: []
    }
  }

  constructor(props) {
    const {
      className,
      instancesPathId,
      featurePayload,
      loader
    } = props
    this._loader = loader
    this._loader._featureInstance = this
    this._className = className
    this._params = { ...featurePayload.params }
    this._path = featurePayload.path
    this._id = featurePayload.id
    this._featurePayload = { ...featurePayload }
    this._instancesPathId = [...instancesPathId]
    this._instancesPathIdString = instancesPathIdUniqueId({ instancesPathId, currentFeatureId: this._id })
    console.log(this._instancesPathIdString)
  }

  async load({ servableConfig } = {}) {
    switch (this.loadState) {
      case 1: {
        return
      }
      default: break
    }

    this.loadState = 1
    await this.loader.loadExtraction({ servableConfig })

    try {
      const module = await this.loader.getModule()
      this.module = module
      this.loadState = 2
    } catch (e) {
      this.loadState = 3
    }

    if (!servableConfig || !servableConfig.versions) {
      return
    }

    if (!servableConfig.versions[this.id]) {
      return
    }

    this.version = servableConfig.versions[this.id]
  }


  // #region getters and setters

  get className() {
    return this._className
  }
  set className(value) {
    this._className = value
  }

  get params() {
    return this._params
  }
  set params(value) {
    this._params = value
  }

  get featurePayload() {
    return this._featurePayload
  }
  set featurePayload(value) {
    this._featurePayload = value
  }
  // #endregion


  toString() {
    return `FeatureInstance: ${this.instancesPathIdString} (${this.path})`
  }


  get instancesPathIdString() {
    return this._instancesPathIdString
  }
  set instancesPathIdString(value) {
    this._instancesPathIdString = value
  }

  get instancesPathId() {
    return this._instancesPathId
  }
  set instancesPathId(value) {
    this._instancesPathId = value
  }


  get id() {
    return this._id
  }
  set id(value) {
    this._id = value
  }

  get path() {
    return this._path
  }
  set path(value) {
    this._path = value
  }

  get loadState() {
    return this._loadState
  }
  set loadState(value) {
    this._loadState = value
  }

  get module() {
    return this._module
  }

  set module(value) {
    this._module = value
    if (this._module) {
      this.version = this._module.version
      this.minimumCompatibleVersion = this._module.minimumCompatibleVersion
    }
  }

  get version() {
    return this._version
  }

  set version(value) {
    if (!value || !semver.valid(value)) {
      return
    }
    this._version = semver.clean(value)
  }

  get minimumCompatibleVersion() {
    return this._minimumCompatibleVersion
  }

  set minimumCompatibleVersion(value) {
    if (!value || !semver.valid(value)) {
      return
    }
    this._minimumCompatibleVersion = semver.clean(value)
  }



  get loader() {
    return this._loader
  }

  set loader(value) {
    this._loader = value
    this._loader.feature = this
  }

  get schema() {
    return this._schema
  }
  set schema(value) {
    this._schema = value
  }

  // #region loader
  async schemaRaw({ ad } = {}) {
    return this.loader.schemaRaw({ ad: 43 })
  }
  // #endregion
}
