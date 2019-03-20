import test from 'ava'
import ApiBuilder from 'claudia-api-builder'
import {
    APIGatewayProxyEventJwt,
    authenticate,
    authorise,
    JwtHeader,
    Secret,
    SigningKeyCallback
} from '../../package/'
import { testApi } from './authenticate'

test('authorise is a function', (t) => {
  t.is(typeof authorise, 'function')
})

// tslint:disable-next-line:max-line-length
const TOKEN_RS512_ROLES = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkplYW5uZSBCaWNoZSIsInJvbGVzIjpbImJ1dGNoZXIiLCJiYWtlciIsImNhbmRsZXN0aWNrLW1ha2VyIl0sImlhdCI6MTUxNjIzOTAyMn0.Dw8iPACnZfPnwBOBAQpTq734G1Du5o9sBWZc0ssptx81H05s8CIb4TmPbzoz3e5fpJ6jbbvozmeLDJJhrv2HpWknwWQ2iCHRKB1zdSoG_nvuAVLBX2_T0XHBHl_-xqiD_ajqf3NbPqKy64mnqVrp4P937nn3PRvMNUhuUaf7gsUk-iwfc9yDVO6An3FEbjsuOgGk6RLPCelIsuA8E5VnF7ZUl7-UDgEbrDmyUiQYsB1TkkfQm9L0_jORtkJI_Q5yycn5KS7vu4w3TCmyAgyJ-nUalLv3S9oLA8jHtewmjRzqE6uIcHer4C6A5DVxJe63-mPNBPgIkRN3-bQ0krIUjQ'

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAry0bg77WbExsds8R4eJo
fNqbeWnu1QqRqG0wOk35JenMXDU6mCfUFas0ANgS/2PhxOoem5dtxKpJEzXF8eQh
xrO3J9zD9HMbLVMfodpG9Up9u+AUICGvMCAbAuCHcp7vTZtc+OmmSyk5qF1ApGnU
rWromBB8TDFVx0UdOR6I+1F3DvIk7mgjLAhwzycgsLRZFwXxS2mwHVAafD6QYbxZ
I655+ltaf3Gb3CBJSz888i3DfaKT30cCC/7r3rnOqbKjUcG8qxrsp+yOo8l6BeeJ
g57ITeuaRrSza7zdvS0Vydp9RS7VS9JdHQv9b48b7rsx+WLghI/AQ3kK0Xg85C9R
TQIDAQAB
-----END PUBLIC KEY-----`

test.cb('authorise true', (t) => {
  const api = new ApiBuilder()
  api.intercept(authenticate(PUBLIC_KEY))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => {
    authorise(true)
    return `Hello ${event.jwt.payload.name}!`
  })

  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_RS512_ROLES }
  }, {
    body: '"Hello Jeanne Biche!"',
    statusCode: 200
  })
})

test.cb('authorise false', (t) => {
  const api = new ApiBuilder()
  api.intercept(authenticate(PUBLIC_KEY))
  api.get('/greeting', (event: APIGatewayProxyEventJwt) => {
    authorise(false)
    return `Hello ${event.jwt.payload.name}!`
  })

  testApi(t, api, {
    context: { method: 'GET', path: '/greeting' },
    headers: { Authorization: 'bearer ' + TOKEN_RS512_ROLES }
  }, {
    body: '"Hello Jeanne Biche!"',
    statusCode: 200
  })
})
