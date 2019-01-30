import { ApiResponse } from 'claudia-api-builder'

/**
 * This response indicates that the request failed *authentication*
 */
class Response401Unauthorised {
  constructor (message: string) {
    return new ApiResponse('401 Unauthorised: ' + message, {}, 401)
  }
}

export default Response401Unauthorised
