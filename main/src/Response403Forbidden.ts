import { ApiResponse } from 'claudia-api-builder'

/**
 * This response indicates that the request failed *authorisation*
 */
class Response403Forbidden {
  constructor (message: string) {
    return new ApiResponse('403 Forbidden: ' + message, {}, 403)
  }
}

export default Response403Forbidden
