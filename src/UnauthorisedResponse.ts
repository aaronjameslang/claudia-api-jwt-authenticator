import { ApiResponse } from 'claudia-api-builder'

/**
 * This response indicates that the request failed *authentication*
 */
class UnauthorisedResponse {
  constructor (message: string) {
    return new ApiResponse('Unauthorised: ' + message, {}, 401)
  }
}

export default UnauthorisedResponse
