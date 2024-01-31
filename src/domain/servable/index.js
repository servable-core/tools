import _parse from './parse/index.js'

export default class Servable {


  constructor() {
    const __Parse = global.Parse ? global.Parse : {}
    this.App = {
      ...__Parse,
      ..._parse
    }
  }

  async hydrate({ servableConfig, engine, app }) {

  }


}
