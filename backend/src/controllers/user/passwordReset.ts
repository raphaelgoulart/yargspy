// #region Handler

import { ZodError, type infer as ZodInfer } from 'zod'
import { TokenError } from "fast-jwt"
import { ServerError, userPasswordResetBodySchema } from "../../app.exports"
import { serverReply } from "../../core.exports"
import type { ServerErrorHandler, ServerHandler } from "../../lib.exports"
import { EmailToken, Purpose } from "../../models/EmailToken"
import { User } from "../../models/User"

export interface IPasswordReset {
  body: ZodInfer<typeof userPasswordResetBodySchema>
}

const userPasswordResetHandler: ServerHandler<IPasswordReset> = async function (req, reply) { 
  const { token, password } = userPasswordResetBodySchema.parse(req.body)

  const doc = await EmailToken.consume(Purpose.Reset, token);
  if (!doc) throw new ServerError('err_invalid_auth_token')

  const user = await User.findById(doc.user);
  if (!user) throw new ServerError('err_invalid_auth_token')

  user.password = password;
  await user.setCountryAndSave(req); // also saves the user
  serverReply(reply, 'ok')
}

// #region Error Handler

const userPasswordResetErrorHandler: ServerErrorHandler = function (error, req, reply) {
  if (error instanceof ZodError) {
    const issue = error.issues[0]
    if (issue.code === 'invalid_format' && issue.path[0] === 'password') {
      if (issue.pattern === '/[a-z]/') return serverReply(reply, 'err_user_register_password_nolowercase')
      if (issue.pattern === '/[A-Z]/') return serverReply(reply, 'err_user_register_password_nouppercase')
      if (issue.pattern === '/[0-9]/') return serverReply(reply, 'err_user_register_password_nonumber')
      if (issue.pattern === '/[^A-Za-z0-9]/') return serverReply(reply, 'err_user_register_password_nospecialchar')
    }
    return serverReply(reply, 'err_invalid_input', { errors: error.issues })
  }
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const userPasswordResetController = {
  errorHandler: userPasswordResetErrorHandler,
  handler: userPasswordResetHandler,
} as const
