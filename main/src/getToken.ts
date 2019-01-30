// tslint:disable-next-line: no-implicit-dependencies
import { APIGatewayProxyEvent } from 'aws-lambda'
import Response401Unauthorised from './Response401Unauthorised' // @types

type Token = string

const getToken = (event: APIGatewayProxyEvent): Token | Response401Unauthorised => {
  const { headers } = event
  if (!headers) {
    return new Response401Unauthorised('no headers')
  }
  const authHeader = headers.Authorization
  if (!authHeader) {
    return new Response401Unauthorised('no authorization header')
  }
  const [scheme, token] = authHeader.trim().split(' ')
  if (!scheme || (scheme.toLowerCase() !== 'bearer')) {
    return new Response401Unauthorised('authorization scheme must be bearer')
  }
  if (!token) {
    return new Response401Unauthorised('no authorization token')
  }
  return token
}

export default getToken
