// tslint:disable-next-line: no-implicit-dependencies
import { APIGatewayProxyEvent } from 'aws-lambda' // @types
import getToken from './getToken'
import Response401Unauthorised from './Response401Unauthorised'
import Response403Forbidden from './Response403Forbidden'
import verify, { Jwt, SecretOrPublicKey, VerifyOptions } from './verify'

export type JwtAuthoriser = Jwt & Authoriser

export interface Authoriser {
  authorise: (a: any) => never,
  allowRoles: (allowed: string[]) => never
}

export { SecretOrPublicKey, VerifyOptions }
export type APIGatewayProxyEventJwt = APIGatewayProxyEvent & { jwt: JwtAuthoriser }

export type Role = string
export type Authenticate = (secretOrPublicKey: SecretOrPublicKey, options?: VerifyOptions) => Interceptor
export type Interceptor = (event: APIGatewayProxyEvent) => InterceptorResult
export type InterceptorResult = APIGatewayProxyEventJwt | Response401Unauthorised | Response403Forbidden
export type InterceptorX = Interceptor & {withRoles: WithRoles}
export type WithRoles = (getRoles: GetRoles) => Interceptor
export type GetRoles = (jwt: Jwt) => Role[]

export const authenticate: Authenticate = (
  secretOrPublicKey: SecretOrPublicKey,
  options?: VerifyOptions
) => {
  const interceptor: Interceptor = (event: APIGatewayProxyEvent): InterceptorResult => {
    const token = getToken(event)
    if (typeof token !== 'string') {
      return token // return UnauthorisedResponse
    }
    return new Promise((resolve) => {
      verify(token, secretOrPublicKey, { ...options }, (error, jwt?: Jwt) => {
        if (error) {
          resolve(new Response401Unauthorised(`${error.name} ${error.message}`))
        }
        resolve({ ...event, jwt })
      })
    })
  }
  return interceptor
}
