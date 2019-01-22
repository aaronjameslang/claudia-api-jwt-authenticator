import {
    GetPublicKeyOrSecret as GetPublicKeyOrSecretCb,
    JwtHeader,
    Secret,
    SigningKeyCallback
} from 'jsonwebtoken'
export {
    JwtHeader,
    Secret,
    SigningKeyCallback
} from 'jsonwebtoken'

export type GetPublicKeyOrSecretPromise =
    (header: JwtHeader) => Promise<Secret>

export type SecretOrPublicKeyCb = string | Buffer | GetPublicKeyOrSecretCb
export type SecretOrPublicKeyCbP = SecretOrPublicKeyCb | GetPublicKeyOrSecretPromise

const depromisify = (key: SecretOrPublicKeyCbP): SecretOrPublicKeyCb => {
  if (typeof key === 'string' || key instanceof Buffer) {
    return key
  }
  const getKey: GetPublicKeyOrSecretCb | GetPublicKeyOrSecretPromise = key
  return (header: JwtHeader, callback: SigningKeyCallback): void => {
    const promise: Promise<Secret> | void = getKey(header, callback)
    if (promise) {
      promise
        .then((secret: Secret) => callback(null, secret))
        .catch((err: any) => callback(err))
    }
  }
}

export default depromisify
