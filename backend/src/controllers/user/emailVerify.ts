// #region Handler

import { TokenError } from "fast-jwt"
import { ServerError } from "../../app.exports"
import { serverReply } from "../../core.exports"
import type { ServerErrorHandler, ServerHandler } from "../../lib.exports"
import { EmailToken, Purpose } from "../../models/EmailToken"
import { User } from "../../models/User"

export interface IUserEmailVerify {
  query: {
    token: string
  }
}

const userEmailVerifyHandler: ServerHandler<IUserEmailVerify> = async function (req, reply) {
  if (!req.query.token) throw new ServerError('err_invalid_query', null, { params: "token" })

  const doc = await EmailToken.consume(Purpose.Verify, req.query.token);
  if (!doc) throw new ServerError('err_invalid_auth_token')

  const user = await User.findById(doc.user);
  if (!user) throw new ServerError('err_invalid_auth_token')

  if (!user.emailVerified) {
    user.emailVerified = true;
    await user.setCountry(req); // also saves the user
  }
  serverReply(reply, 'ok')
}

// #region Error Handler

const userEmailVerifyErrorHandler: ServerErrorHandler = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const userEmailVerifyController = {
  errorHandler: userEmailVerifyErrorHandler,
  handler: userEmailVerifyHandler,
} as const
