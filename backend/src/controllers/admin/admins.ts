import { TokenError } from 'fast-jwt'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler } from '../../lib.exports'
import { User } from '../../models/User'

// #region Handler

const adminAdminsHandler: ServerHandler = async function (req, reply) {
  const result = await User.find({admin: true}).select('username')

  serverReply(reply, 'ok', {
    entries: result
  })
}

// #region Error Handler

const adminAdminsErrorHandler: ServerErrorHandler = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const adminAdminsController = {
  errorHandler: adminAdminsErrorHandler,
  handler: adminAdminsHandler,
} as const
