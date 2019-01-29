// tslint:disable-next-line: no-implicit-dependencies
import { APIGatewayProxyEvent } from 'aws-lambda' // @types
import getToken from './getToken'
import UnauthorisedResponse from './UnauthorisedResponse'
import verify, { Jwt, SecretOrPublicKey, VerifyOptions } from './verify'

export type Jwta = Jwt & {
    authorise: (any) => never
}

export { SecretOrPublicKey, VerifyOptions }
export type APIGatewayProxyEventJwt = APIGatewayProxyEvent & { jwt: Jwt }

export const authenticator =
  (secretOrPublicKey: SecretOrPublicKey, options?: VerifyOptions) =>
  (event: APIGatewayProxyEvent): APIGatewayProxyEventJwt | UnauthorisedResponse => {
    const token = getToken(event)
    if (typeof token !== 'string') {
      return token // return UnauthorisedResponse
    }
    return new Promise((resolve) => {
      verify(token, secretOrPublicKey, { ...options }, (error, jwt?: Jwt) => {
        if (error) {
          resolve(new UnauthorisedResponse(`${error.name} ${error.message}`))
        }
        resolve({ ...event, jwt })
      })
    })
  }

export default authenticator
