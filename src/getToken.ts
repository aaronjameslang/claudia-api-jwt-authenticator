import UnauthorisedResponse from './UnauthorisedResponse'

type Token = string
interface Event {
  headers?: {
    Authorization?: string,
    authorization?: string
  }
}

const getToken = (event: Event): Token | UnauthorisedResponse => {
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

export default getToken
