const nconf = require('nconf')
const path = require('path')
const fs = require('fs')
const _ = require('lodash')

initNconf(process.env.ROOT_PATH || process.cwd())

function initNconf (dirname) {

  let addNconfFile = (nconf, filename) => {
    let filePath = path.join(dirname, 'config', filename + '.json')
    if (fs.existsSync(filePath)) {
      nconf.defaults(nconf.file(filePath))
      return true
    }
    console.log('Warning! APP and/or STATE are provided but config file ' +
        'wasn\'t found: ' + filePath)
    return false
  }

  const environment = require(path.join(dirname, 'environment.js'))
  console.log('ënvironment is', environment, 'in-path:)', dirname, '+ environment.js')
  addNconfFile(nconf, environment.getEnv())


  // Copy REDIS_URL into env if present (it'll be used by redis-url module)
  if (!process.env.REDIS_URL && nconf.get('REDIS_URL')) {
    process.env.REDIS_URL = nconf.get('REDIS_URL')
  }

  // Copy stuff required in Derby-part and vendor libs into ENV
  if (_.isArray(nconf.get('COPY_TO_ENV'))) {
    _.each(nconf.get('COPY_TO_ENV'), (option) => {
      process.env[option] = nconf.get(option)
    })
  }

  // Copy public env vars into global.env
  if (_.isArray(nconf.get('PUBLIC'))) {
    global.env = global.env || {}
    _.each(nconf.get('PUBLIC'), (option) => {
      global.env[option] = nconf.get(option)
    })
  }
}
