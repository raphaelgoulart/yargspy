// #region Handler

import { TokenError } from "fast-jwt"
import { ServerError } from "../../app.exports"
import { serverReply } from "../../core.exports"
import type { ServerErrorHandler, ServerHandler } from "../../lib.exports"
import { User } from "../../models/User"
import { issueAndSendVerification } from '../../utils.exports'

export interface IUserEmailResend {
  body: {
    email: string
  }
}

const userEmailResendHandler: ServerHandler<IUserEmailResend> = async function (req, reply) {
  if (!req.body.email) throw new ServerError('err_invalid_query', null, { params: "email" })

  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (user && !user.emailVerified) {
    await issueAndSendVerification(user.id, req.body.email.toLowerCase());
  }
  
  serverReply(reply, 'ok')
}

// #region Error Handler

const userEmailResendErrorHandler: ServerErrorHandler = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const userEmailResendController = {
  errorHandler: userEmailResendErrorHandler,
  handler: userEmailResendHandler,
} as const
