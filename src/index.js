import extractProtocol from './manifest/extract/index.js'
import accessManifest from './manifest/access/index.js'
import * as ManifestEnums from './manifest/data/1.0.0/enums.js'
import * as ManifestEnumsV1_1_0 from './manifest/data/1.0.0/enums.js'

import buildSchema from './schema/build/index.js'
import validateSchema from './schema/validate/index.js'
// import validateProtocol from './lib/config/validate/protocol/index.js'
import cleanProtocols from './lib/cleanProtocols.js'


import documentProtocol from './document/gateway/all/index.js'
import generateGithubReadme from './document/gateway/generateGithubReadme/index.js'

import Servable from './domain/servable/index.js'
const Domain = { Servable }

export {
  accessManifest,
  documentProtocol,
  extractProtocol,
  ManifestEnums,
  ManifestEnumsV1_1_0,
  buildSchema,
  validateSchema,
  cleanProtocols,
  generateGithubReadme,
  Domain
}
