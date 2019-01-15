import { ApiResponse } from 'claudia-api-builder'
import {
  decode,
  GetPublicKeyOrSecret,
  verify,
  VerifyOptions
} from 'jsonwebtoken'

/**
 * This response indicates that the request failed *authentication*
 */
export class UnauthorisedResponse {
  constructor (message: string) {
    return new ApiResponse('Unauthorised: ' + message, {}, 401)
  }
}

type Token = string

const getToken = (event: any): Token | UnauthorisedResponse => {
  const { headers } = event
  if (!headers) {
    return new UnauthorisedResponse('no headers')
  }
  const authHeader = headers.Authorization
  if (!authHeader) {
    return new UnauthorisedResponse('no authorization header')
  }
  const [scheme, token] = authHeader.trim().split(' ')
  if (!scheme || (scheme.toLowerCase() !== 'bearer')) {
    return new UnauthorisedResponse('authorization scheme must be bearer')
  }
  if (!token) {
    return new UnauthorisedResponse('no authorization token')
  }
  return token
}

export type SecretOrPublicKey = string | Buffer | GetPublicKeyOrSecret

export const interceptor =
  (secretOrPublicKey: SecretOrPublicKey, options?: VerifyOptions) =>
  <E>(event: E): E | UnauthorisedResponse => {
    const token = getToken(event)
    if (typeof token !== 'string') {
      return token // return ApiResponse
    }
    return new Promise((resolve) => {
      verify(token, secretOrPublicKey, { ...options }, (error) => {
        if (error) {
          resolve(new UnauthorisedResponse(`${error.name} ${error.message}`))
        }
        resolve({ ...event, jwt: decode(token, { complete: true }) })
      })
    })
  }

export default interceptor
