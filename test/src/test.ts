import test from 'ava'
import ApiBuilder from 'claudia-api-builder'
import * as fs from 'fs'
import authenticator, {
    APIGatewayProxyEventJwt,
    authenticator as authenticator2,
    JwtHeader,
    Secret,
    SigningKeyCallback
} from '../../package/'

test('authenticator is exported', (t) => {
  t.is(typeof authenticator, 'function')
  t.is(authenticator, authenticator2)
})

/**
 * ## Using a Public Key
 *
 * Using a public key with an algorithm such as RS256 is recommended
 * for security and convenience. The public key can be kept inline with
 * your code without any security concerns.
 */

// tslint:disable-next-line:max-line-length
const TOKEN_RS512 = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.iNa6ZAKSn3J8GvG6hgfydtbRsKekSp1RunRceNhrRtUSZVvlSz4X1g1OXSJwCG2OyYXhaN0pyxuR7JlI1n663DnkEvop3T7Whxoy5uMxji9vSZ5MrvtLXY75On0ALqZuPuyuH4x6o1xI0huKHJGmRM2OVqD9W80AkpYtszwRwXkjiXdfJHMry9czXm5JrYNp9VowA9jATpkH2IatfSIVAK0c6hJg6Gz05PdtMjFwHpJJFn0qzfexf97pZgqITOX4f-pHZQ6i_jnBciocjMrn62tz8XpGrgjSGNqeUxROPjKCTnmwi0kpMAuBp2rUgj7Ns5wHaKE1riz_qrQqCgxrww'

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAry0bg77WbExsds8R4eJo
fNqbeWnu1QqRqG0wOk35JenMXDU6mCfUFas0ANgS/2PhxOoem5dtxKpJEzXF8eQh
xrO3J9zD9HMbLVMfodpG9Up9u+AUICGvMCAbAuCHcp7vTZtc+OmmSyk5qF1ApGnU
rWromBB8TDFVx0UdOR6I+1F3DvIk7mgjLAhwzycgsLRZFwXxS2mwHVAafD6QYbxZ
I655+ltaf3Gb3CBJSz888i3DfaKT30cCC/7r3rnOqbKjUcG8qxrsp+yOo8l6BeeJ
g57ITeuaRrSza7zdvS0Vydp9RS7VS9JdHQv9b48b7rsx+WLghI/AQ3kK0Xg85C9R
TQIDAQAB
-----END PUBLIC KEY-----`

test.cb('Authenticate with public key', (t) => {
  // Begin by creating your Api Builder as normal
  const api = new ApiBuilder()
  // Next pass in the authenticator along with your key and any config
  api.intercept(authenticator(PUBLIC_KEY))
  // Register your routes as normal
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
    // Export the proxyRouter normally in your code
    // export handler = api.proxyRouter

    // Here we call it instead to test it
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_RS512 }
  }, {
    body: '"Hello John Doe!"',
    statusCode: 200
  })
})

/**
 * ## Using a Secret Key
 *
 * When using a secret key you cannot safely include it in your code.
 * You must fetch the secret key securely at run time, either from a
 * file on you server or using a service like AWS Secrets Manager.
 *
 * Create a function that fetches the secret key like below,
 * and returns it via the callback or as a promise.
 * Be sure to decode from base64 if needed.
 */

// tslint:disable-next-line:max-line-length
const TOKEN_HS512 = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.Hk1Qgr18H-VwmDnMcljqEFy8_F1zeIVS-FY-3Xl2pKsMEeFii5-WEVDyBNRPredB9JjoNAkR23iOkTDN4Mu-Xg'

const getSecretKeyCb = (header: JwtHeader, callback: SigningKeyCallback) => {
  const filename = `test/test.secret.${header.alg.toLowerCase()}.b64.txt`
  fs.readFile(filename, (err, b64) => {
    if (err) {
      return callback(err)
    }
        // toString is important, if the first arg is a buffer the second is ignored
    const secret = Buffer.from(b64.toString(), 'base64')
    return callback(null, secret)
  })
}

const getSecretKeyP = (header: JwtHeader) =>
    new Promise((res, rej) => {
      getSecretKeyCb(header, (err, secret) => {
        if (err) {
          rej(err)
        } else {
          res(secret)
        }
      })
    })

test.cb('Authenticate with secret key, via promise', (t) => {
    // Begin by creating your Api Builder as normal
  const api = new ApiBuilder()
    // Next pass in the authenticator along with your key and any config
  api.intercept(authenticator(getSecretKeyP))
    // Register your routes as normal
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
    // Export the proxyRouter normally in your code
    // export handler = api.proxyRouter

    // Here we call it instead to test it
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_HS512 }
  }, {
    body: '"Hello John Doe!"',
    statusCode: 200
  })
})

test.cb('Authenticate with secret key, via callback', (t) => {
    // Begin by creating your Api Builder as normal
  const api = new ApiBuilder()
    // Next pass in the authenticator along with your key and any config
  api.intercept(authenticator(getSecretKeyCb))
    // Register your routes as normal
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
    // Export the proxyRouter normally in your code
    // export handler = api.proxyRouter

    // Here we call it instead to test it
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_HS512 }
  }, {
    body: '"Hello John Doe!"',
    statusCode: 200
  })
})

/**
 * ## JWT Headers & Signature
 *
 * You can access the headers, payload and signature of the JWT
 */

test.cb('Headers & Signature access', (t) => {
  const api = new ApiBuilder()
  api.intercept(authenticator(PUBLIC_KEY))
  api.get('/token', (event: APIGatewayProxyEventJwt) => ({
    algorithm: event.jwt.header.alg,
    signature: event.jwt.signature.substr(0, 12),
    subscriber: event.jwt.payload.sub
  }))

  testApi(t, api, {
    context: { method: 'GET', path: '/token' },
    headers: { Authorization: 'bearer ' + TOKEN_RS512 }
  }, {
    body: JSON.stringify({
      algorithm: 'RS512',
      signature: 'iNa6ZAKSn3J8',
      subscriber: '1234567890'
    }),
    statusCode: 200
  })
})

/**
 * ## Extra Config
 *
 * You can specify more arguments to increase security and help catch bugs
 *
 * For a full list see https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
 */

test.cb('Specify algorithm - success', (t) => {
  const api = new ApiBuilder()
  api.intercept(authenticator(PUBLIC_KEY, { algorithms: ['RS512'] }))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_RS512 }
  }, {
    body: '"Hello John Doe!"',
    statusCode: 200
  })
})

test.cb('Specify algorithm - failure', (t) => {
  const api = new ApiBuilder()
  api.intercept(authenticator(PUBLIC_KEY, { algorithms: ['RS256'] }))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_RS512 }
  }, {
    body: '"Unauthorised: JsonWebTokenError invalid algorithm"',
    statusCode: 401
  })
})

test.cb('Specify audience - success', (t) => {
    // tslint:disable-next-line:max-line-length
  const TOKEN_RS512_AUD = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJhdWQiOiJGNDJFRDA4Mi03OTlGLTQ3NkItQjc3RS0xMjAxM0Y1Mzc5QTUifQ.VAnH9ozEAcL3foiSgqJspqS05AdYchn57uKrbCUEwX9uXbsg8nct9bL7y8Omw6qg5ZdTcNsnor8tysGW460yOmg06Pbx0SRHJifJGLpy1bOCWRPG_5NB5aM6uKf78T2QCJXm9f73nKfZ9QJUlfzW41bT2khnsO8gTVYo9yd3yesrKegMlSomxd4VrZFYz4jbNh2f9FUe8MNkubfOxVbM5U7sh5aZMs_uoef08Gxp3Aqx7fPpzj16uW2JTNlhoIYUF4J33T0SufgiR1Xw3R3Jn2BnwdlfgqjLrv0lxzDzHoPyPP8i6TSl3notTcTmLc_GItdcnLNPn8wtjxKNW81tMQ'

  const api = new ApiBuilder()
  api.intercept(authenticator(PUBLIC_KEY, { audience: 'F42ED082-799F-476B-B77E-12013F5379A5' }))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_RS512_AUD }
  }, {
    body: '"Hello John Doe!"',
    statusCode: 200
  })
})

test.cb('Specify audience - failure', (t) => {
  const api = new ApiBuilder()
  api.intercept(authenticator(PUBLIC_KEY, { audience: 'F42ED082-799F-476B-B77E-12013F5379A5' }))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_RS512 }
  }, {
    body: '"Unauthorised: JsonWebTokenError jwt audience invalid. expected: F42ED082-799F-476B-B77E-12013F5379A5"',
    statusCode: 401
  })
})

/**
 * ## When is a JWT not a JWT?
 */

test.cb('XWT', (t) => {
    // tslint:disable-next-line:max-line-length
  const TOKEN_RS512_XWT = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IlhXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.liqYAp9dbby9IzokHKbLkQb5mUAHoO0Ef7hn4Wz-Oh6kVcdqGQjtUFZPbONe9NPLLCuX_82_TkWXdKja5ISHLw3m028d2NGEQ2cbBxOCjHSqeuztUavwzQPeJUNUREh07IQK_MTw-BCskKLoJToIx2NZ3AfttCu4QWXBaJTZkIds0sQIQR11Z3w48QQS7Bjbtmrhzufpw_yfk8Fh0a0PjAlYmTgkE7JAUBT0NwqVPuqrTNUKxHe5DrqeuSAr0VeHSM05HvJFqrncF0KuBfTj0HUzwi6JpZxzlwxx_gzfaHEw2lFtRLJIonVLMAKM1aFj5m67FyfxqUQx0JnqRkEWrQ'

  const api = new ApiBuilder()
  api.intercept(authenticator(PUBLIC_KEY))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_RS512_XWT }
  }, {
    body: '"Hello John Doe!"',
    statusCode: 200
  })
})

/**
 * ## Failures and Errors
 *
 * Here follow a number of error cases
 */

test.cb('Expired', (t) => {
    // tslint:disable-next-line:max-line-length
  const TOKEN_RS512_EXP = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNTE2MjM5MDIyfQ.ed_PPzBaYmalmwTp1OxF9--QlPATgTWYVuc2Qg-tofDe4Mhn98B0aEZ-3wN9h2loQG05xhhUy_ZOyLYPYhZrKavU7UiVEIRmDUj2VYzmX575_GdGmxsaoluNP3xYqGjxs4U1-uQN1YIEQRvGx2pn-QeK9crawvzLVdZgyBr69-xVUbsDNIR5msx2Qg2uZLrPWe4ZGoYlpecUDfSoktHAkxsTfcjtE2niS_-Y8yoRqGemu8MWNwMca7edg2xJn-J0z5DDMYgzdVyI9oHkf-vu_lb535ekuYAigXBKLRBbPO9zzXv3LmJFlDJKJzkKGU8CSkUTR11ftsEc7BbUvsQ6Zg'

  const api = new ApiBuilder()
  api.intercept(authenticator(PUBLIC_KEY))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_RS512_EXP }
  }, {
    body: '"Unauthorised: TokenExpiredError jwt expired"',
    statusCode: 401
  })
})

test.cb('Invalid/Forged token signature', (t) => {
    // tslint:disable-next-line:max-line-length
  const TOKEN_RS512_INV = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNTE2MjM5MDIyfQ.ed_PPzBaYmalmwTp1OxF9--QlPATgTWYVuc2Qg-tofDe4Mhn98B0aEZ-3wN9h2loQG05xhhUy_ZOyLYPYhZrKavU7UiVEIRmDUj2VYzmX575_GdGmxsaoluNP3xYqGjxs4U1-uQN1YIEQRvGx2pn-QeK9crawvzLVdZgyBr69-xVUbsDNIR5msx2Qg2uZLrPWe4ZGoYlpecUDfSoktHAkxsTfcjtE2niS_-Y8yoRqGemu8MWNwMca7edg2xJn-J0z5DDMYgzdVyI9oHkf-vu_lb535ekuYAigXBKLRBbPO9zzXv3LmJFlDJKJzkKGU7CSkUTR11ftsEc7BbUvsQ6Zg'

  const api = new ApiBuilder()
  api.intercept(authenticator(PUBLIC_KEY))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_RS512_INV }
  }, {
    body: '"Unauthorised: JsonWebTokenError invalid signature"',
    statusCode: 401
  })
})

test.cb('Forgot to provide secret/key', (t) => {
  const api = new ApiBuilder()
  api.intercept(authenticator) // sic
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_RS512 }
  },
        undefined,
        'event does not contain routing information'
    )
})

const getSecretKeyPFail = () =>
    new Promise((res, rej) => {
      getSecretKeyCb({ alg: 'fail' }, (err, secret) => {
        if (err) {
          rej(err)
        } else {
          res(secret)
        }
      })
    })

test.cb('Failure fetching key', (t) => {
  const api = new ApiBuilder()
  api.intercept(authenticator(getSecretKeyPFail))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_HS512 }
  }, {
    // tslint:disable-next-line:max-line-length
    body: '"Unauthorised: JsonWebTokenError error in secret or public key callback: ENOENT: no such file or directory, open \'test/test.secret.fail.b64.txt\'"',
    statusCode: 401
  })
})

test.cb('No headers in event', (t) => {
  const api = new ApiBuilder()
  api.intercept(authenticator(PUBLIC_KEY))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' }
  }, {
    body: '"Unauthorised: no headers"',
    statusCode: 401
  })
})

test.cb('No authorization in headers', (t) => {
  const api = new ApiBuilder()
  api.intercept(authenticator(PUBLIC_KEY))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: {}
  }, {
    body: '"Unauthorised: no authorization header"',
    statusCode: 401
  })
})

test.cb('No bearer in authorization header', (t) => {
  const api = new ApiBuilder()
  api.intercept(authenticator(PUBLIC_KEY))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'Basic QWxhZGRpbjpPcGVuU2VzYW1l' }
  }, {
    body: '"Unauthorised: authorization scheme must be bearer"',
    statusCode: 401
  })
})

test.cb('No token in authorization header', (t) => {
  const api = new ApiBuilder()
  api.intercept(authenticator(PUBLIC_KEY))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => `Hello ${event.jwt.payload.name}!`)
  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' }
  }, {
    body: '"Unauthorised: no authorization token"',
    statusCode: 401
  })
})

const testApi = (t: any, api: any, event: any, expectedResponse: any, expectedError: any = null) => {
  t.plan(1)
  const done = async (error: any, response: any) => {
        // await error
        // await response
    if (response) delete response.headers
    t.deepEqual(
            { error, response },
            { error: expectedError, response: expectedResponse }
        )
    t.end()
  }
  api.proxyRouter(event, { done }, done)
}
