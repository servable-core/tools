import semver from 'semver'
import * as FeatureInstanceFactory from '../featureInstance/factory/index.js'

export default class Feature {
  _id = null
  _type = null

  _instances = []
  _extractionStatus = 0

  constructor(props) {
    const {
      id,
      type,
    } = props

    this._id = id
    this._type = type
  }

  async addInstanceIfNeeded({
    featurePayload,
    servableConfig,
    instancesPathId }) {
    return FeatureInstanceFactory.getWithCache({
      featurePayload,
      servableConfig,
      instancesPathId,
      instances: this.instances
    })
  }

  // #region getters and setters
  get instances() {
    return this._instances
  }
  set instances(value) {
    this._instances = value
  }

  instancesClassesPayloads() {
    return this.instances.map(instance =>
    ({
      featurePayload: instance.featurePayload,
      instancesPathId: instance.instancesPathId,
      instancesPathIdString: instance._instancesPathIdString,
      instance
    }))
  }

  get mainInstance() {
    if (!this.instances || !this.instances.length) {
      return null
    }

    if (this.instances.length === 1) {
      return this.instances[0]
    }

    let _versions = this.instances.sort((a, b) => {
      if (!a.module || !b.module) {
        return 0
      }

      const order = semver.compare(a.version, b.version)
      return order
    })

    return _versions[0]
  }

  set mainInstance(value) {
  }

  get version() {
    return this.mainInstance.version
  }
  set version(value) {
    this.mainInstance.version = semver.clean(value)
  }

  get params() {
    return this.mainInstance.params
  }
  set params(value) {
    this.mainInstance.params = value
  }

  get loader() {
    return this.mainInstance
  }
  set loader(value) {
    // this.defaultVersion.loader = value
  }

  get extractionStatus() {
    return this._extractionStatus
  }
  set extractionStatus(value) {
    this._extractionStatus = value
  }

  get schema() {
    return this.mainInstance.schema
  }
  set schema(value) {
    this.mainInstance.schema = value
  }

  get id() {
    return this._id
  }
  set id(value) {
    this._id = value
  }
  // #endregion
}
