import test from 'ava'
import ApiBuilder from 'claudia-api-builder'
import * as fs from 'fs'
import authenticator, { APIGatewayProxyEventJwt } from '../../package/'

test('authenticator is a function', (t) => {
  t.is(typeof authenticator, 'function')
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
  t.plan(3)
  const event = {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_RS512 }

  }
  const done = async (error: any, response: any) => {
    t.is(await error, null)
    t.is(await response.body, '"Hello John Doe!"')
    t.is(await response.statusCode, 200)
    t.end()
  }

  // Begin by creating your Api Builder as normal
  const api = new ApiBuilder()
  // Next pass in the authenticator along with your key and any config
  api.intercept(authenticator(PUBLIC_KEY))
  // Register your routes as normal
  api.get('/greeting', (evnt: APIGatewayProxyEventJwt) => `Hello ${evnt.jwt.payload.name}!`)
  // Export the proxyRouter normally in your code
  // Here we call it instead to test it
  api.proxyRouter(event, { done }, done)
})
