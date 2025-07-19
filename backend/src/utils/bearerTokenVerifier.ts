import { ServerError } from '../config.exports'

/**
 * Verify and extracts the bearer auth token out of the request header authorization string.
 * - - - -
 * @param {string} auth The authorization header from a user request.
 * @returns {string}
 */
export const bearerTokenVerifier = (auth: string | undefined): string => {
  if (!auth) throw new ServerError('err_auth_required')
  if (!auth.startsWith('Bearer ')) throw new ServerError('err_invalid_auth_format')
  if (auth.length < 7) throw new ServerError('err_invalid_auth_format')
  return auth.slice(7)
}
