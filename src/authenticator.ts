import {
  decode,
  GetPublicKeyOrSecret,
  verify,
  VerifyOptions
} from 'jsonwebtoken'
import getToken from './getToken'
import UnauthorisedResponse from './UnauthorisedResponse'

export type SecretOrPublicKey = string | Buffer | GetPublicKeyOrSecret

export const authenticator =
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

export default authenticator
