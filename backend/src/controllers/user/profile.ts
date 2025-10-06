import { TokenError } from 'fast-jwt'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler, RouteRequest } from '../../lib.exports'
import { User, type UserSchemaDocument } from '../../models/User'

export interface IUserProfile {
  query: {
    username?: string
  }
}

// #region Handler

const userProfileHandler: ServerHandler<IUserProfile> = async function (req, reply) {
  const currentUser = req.headers.authorization ? await User.findByToken(req.headers.authorization) : null
  const select = []
  if (currentUser && currentUser.admin) select.push('+email','+emailVerified')
  const user = req.query.username ? await User.findOne({username: req.query.username}).select(select).lean() : 
    (currentUser ? await User.findById(currentUser._id).select(select).lean() : null);
  if (!user) {
    if (req.query.username) throw new ServerError([404, `User ${req.query.username} not found`])
    else throw new ServerError('err_auth_required')
  }

  serverReply(
    reply,
    'success_user_profile',
    {
      user
    },
    { username: user.username }
  )
}

// #region Error Handler

const userProfileErrorHandler: ServerErrorHandler<IUserProfile> = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const userProfileController = {
  errorHandler: userProfileErrorHandler,
  handler: userProfileHandler,
} as const
