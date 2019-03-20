import Response403Forbidden from './Response403Forbidden'

export const authorise = async (authorised: boolean | Promise<any>) => {
  if (await authorised) return
  throw new Response403Forbidden()
}
