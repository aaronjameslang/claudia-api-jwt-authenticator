import authenticatr from './authenticator'
export * from './authenticator'
export const authenticator = authenticatr
export default authenticatr
export {
    JwtHeader,
    Secret,
    SigningKeyCallback
} from 'jsonwebtoken'
