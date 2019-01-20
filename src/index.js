"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const claudia_api_builder_1 = require("claudia-api-builder");
const jsonwebtoken_1 = require("jsonwebtoken");
/**
 * This response indicates that the request failed *authentication*
 */
class UnauthorisedResponse {
    constructor(message) {
        return new claudia_api_builder_1.ApiResponse('Unauthorised: ' + message, {}, 401);
    }
}
exports.UnauthorisedResponse = UnauthorisedResponse;
const getToken = (event) => {
    const { headers } = event;
    if (!headers) {
        return new UnauthorisedResponse('no headers');
    }
    const authHeader = headers.Authorization;
    if (!authHeader) {
        return new UnauthorisedResponse('no authorization header');
    }
    const [scheme, token] = authHeader.trim().split(' ');
    if (!scheme || (scheme.toLowerCase() !== 'bearer')) {
        return new UnauthorisedResponse('authorization scheme must be bearer');
    }
    if (!token) {
        return new UnauthorisedResponse('no authorization token');
    }
    return token;
};
exports.interceptor = (secretOrPublicKey, options) => (event) => {
    const token = getToken(event);
    if (typeof token !== 'string') {
        return token; // return ApiResponse
    }
    return new Promise((resolve) => {
        jsonwebtoken_1.verify(token, secretOrPublicKey, Object.assign({}, options), (error) => {
            if (error) {
                resolve(new UnauthorisedResponse(`${error.name} ${error.message}`));
            }
            resolve(Object.assign({}, event, { jwt: jsonwebtoken_1.decode(token, { complete: true }) }));
        });
    });
};
exports.default = exports.interceptor;
