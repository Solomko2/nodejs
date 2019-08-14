const environments = {}

// STAGING DEFAULT ENV
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'thisIsSecret',
  maxChecks: 5,
  twilio: {
    accountSid: 'AC56ffc87ef7407fd789235035714860e5',
    authToken: 'cc3161e909e2cfe8350e6e63f8b75a10',
    fromPhone: '+12564641817'
  }
}

// PRODUCTION ENV
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'thisIsAlsoSecret',
  maxChecks: 5,
  twilio: {
    accountSid: 'AC56ffc87ef7407fd789235035714860e5',
    authToken: 'cc3161e909e2cfe8350e6e63f8b75a10',
    fromPhone: '+12564641817'
  }
}

const currentEnvironment = typeof (process.env.NODE_ENV) === 'string'
  ? process.env.NODE_ENV.toLowerCase()
  : ''

const environmentToExport = typeof (environments[currentEnvironment]) === 'object'
  ? environments[currentEnvironment] : environments.staging

module.exports = environmentToExport
