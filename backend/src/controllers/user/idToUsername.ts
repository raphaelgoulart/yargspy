import { TokenError } from 'fast-jwt'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler } from '../../lib.exports'
import { User } from '../../models/User'

export interface IUserIdToUsername {
  query: {
    id: string
  }
}

// #region Handler

const userIdToUsernameHandler: ServerHandler<IUserIdToUsername> = async function (req, reply) {
  const user = await User.findById(req.query.id)
  if (!user) {
    if (req.query.id) throw new ServerError('err_id_not_found', null, { id: req.query.id })
    else throw new ServerError('err_invalid_query', null, { params: 'id' })
  }

  serverReply(reply, 'ok', {
    username: user.username,
  })
}

// #region Error Handler

const userIdToUsernameErrorHandler: ServerErrorHandler<IUserIdToUsername> = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)
  // Mongoose ObjectID CastError
  if (error.name === 'CastError') return serverReply(reply, 'err_invalid_input')
  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const userIdToUsernameController = {
  errorHandler: userIdToUsernameErrorHandler,
  handler: userIdToUsernameHandler,
} as const
