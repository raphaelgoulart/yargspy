import { ServerError } from '../app/error'

/**
 * Validates the password to be used when registering new users.
 * - - - -
 * @param {string} password The password to be validated.
 * @throws {ServerError} When any of the validation criteria were not met. There errors can be catched in routes `errorHandler` function.
 * @returns {string}
 */
export const passwordValidator = (password: string): string => {
  if (!/[A-Z]/.test(password)) throw new ServerError('err_user_register_password_nouppercase')
  else if (!/[a-z]/.test(password)) throw new ServerError('err_user_register_password_nolowercase')
  else if (!/[0-9]/.test(password)) throw new ServerError('err_user_register_password_nonumber')
  else if (!/[^A-Za-z0-9]/.test(password)) throw new ServerError('err_user_register_password_nospecialchar')
  else if (password.length < 8) throw new ServerError('err_user_register_password_toosmall')
  return password
}
