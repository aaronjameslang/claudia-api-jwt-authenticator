import { ApiResponse } from 'claudia-api-builder'

/**
 * This response indicates that the request failed *authorisation*
 */
class Response403Forbidden {
  constructor () {
    return new ApiResponse('403 Forbidden', {}, 403)
  }
}

export default Response403Forbidden
