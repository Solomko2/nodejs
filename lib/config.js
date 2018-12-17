const environments = {}

// STAGING DEFAULT ENV
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'thisIsSecret'
}

// PRODUCTION ENV
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'thisIsAlsoSecret'
}

const currentEnvironment = typeof (process.env.NODE_ENV) === 'string'
  ? process.env.NODE_ENV.toLowerCase()
  : ''

const environmentToExport = typeof (environments[currentEnvironment]) === 'object'
  ? environments[currentEnvironment] : environments.staging

module.exports = environmentToExport