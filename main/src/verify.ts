import {
    decode as jwtDecode,
    GetPublicKeyOrSecret,
    verify as jwtVerify,
    VerifyOptions
} from 'jsonwebtoken'

export { VerifyOptions }

export type SecretOrPublicKey = string | Buffer | GetPublicKeyOrSecret

export interface Jwt {
  header: {
    alg?: string,
    typ?: string,
    [key: string]: any
  },
  payload: { [key: string]: any },
  signature: string
}

const decode = (token: string): Jwt => jwtDecode(token, { complete: true }) as Jwt

export type VerifyCallback = (error: any, jwt?: Jwt) => void

export const verify = (
    token: string,
    secretOrPublicKey: SecretOrPublicKey,
    options: VerifyOptions,
    callback: VerifyCallback
) => {
  jwtVerify(token, secretOrPublicKey, { ...options }, (error) => {
    if (error) {
      callback(error)
    }
    callback(null, decode(token))
  })
}

export default verify
