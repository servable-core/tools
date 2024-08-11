import { ProtocolEnum } from "../../../../../manifest/data/1.0.0/enums.js"
import access from '../../../../../manifest/access/index.js'

export default async props => {
  const { path, extraction } = props
  const payload = []
  let githubPackageName = null
  let npmPackageName = null

  let index = await access({
    item: ProtocolEnum.Index,
    extraction,
    path
  })

  if (index && index.data && index.data.module) {
    githubPackageName = 'servable-core/publishable'
    npmPackageName = `@${githubPackageName}`
  }

  const target = await access({
    item: ProtocolEnum.AfterInit,
    path,
    extraction
  })
  if (target && target.data) {
    const { astAdapted } = target.data
    if (astAdapted) {
    }
  }

  // payload.push({
  //   p: `> [!WARNING] \> Servable is still experimental and its api may change in the future.
  // ` })

  payload.push({
    p: `[![npm Package](https://img.shields.io/npm/v/${npmPackageName}.svg?style=flat-square)](https://www.npmjs.org/package/${npmPackageName}) [![NPM Downloads](https://img.shields.io/npm/dm/${npmPackageName}.svg)](https://npmjs.org/package/${npmPackageName}) [![Build Status](https://github.com/${githubPackageName}/actions/workflows/release.yml/badge.svg)](https://github.com/${githubPackageName}/actions/tests.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
`
  })

  return { payload, name: 'After init', id: 'afterInit', auxiliary: (target && target.data) ? target.data.documentation : null }
}
