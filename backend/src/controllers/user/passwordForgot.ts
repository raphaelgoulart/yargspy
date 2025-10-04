// #region Handler

import { TokenError } from "fast-jwt"
import { ServerError } from "../../app.exports"
import { serverReply } from "../../core.exports"
import type { ServerErrorHandler, ServerHandler } from "../../lib.exports"
import { User } from "../../models/User"
import { issueAndSendReset } from '../../utils.exports'

export interface IPasswordForgot {
  body: {
    email: string
    // TODO: hCaptcha
  }
}

const userPasswordForgotHandler: ServerHandler<IPasswordForgot> = async function (req, reply) {
  if (!req.body.email) throw new ServerError('err_invalid_query', null, { params: "email" })
  // TODO: validate hCaptcha

  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (user) {
    await issueAndSendReset(user.id, req.body.email.toLowerCase());
  }
  
  serverReply(reply, 'ok')
}

// #region Error Handler

const userPasswordForgotErrorHandler: ServerErrorHandler = function (error, req, reply) {
    // Generic ServerError
    if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

    // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
    if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
    // Unknown error
    return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const userPasswordForgotController = {
    errorHandler: userPasswordForgotErrorHandler,
    handler: userPasswordForgotHandler,
} as const
