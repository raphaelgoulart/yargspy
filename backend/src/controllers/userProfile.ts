import { serverReply } from '../core.exports'
import { ServerError, type ControllerErrorHandler, type ControllerHandler } from '../app.exports'
import type { UserSchemaDocument } from '../models/User'
import { TokenError } from 'fast-jwt'

export interface IUserProfileController {}
export interface IUserProfileDecorators {
  user?: UserSchemaDocument
}

// #region Handler

const userProfileHandler: ControllerHandler<IUserProfileController, IUserProfileDecorators> = async function (req, reply) {
  const user = req.user!
  serverReply(
    reply,
    'success_user_profile',
    {
      user: {
        _id: user._id,
        username: user.username,
        active: user.active,
        admin: user.admin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
    { username: user.username }
  )
}

// #region Error Handler

const userProfileErrorHandler: ControllerErrorHandler<IUserProfileController> = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_not_implemented', { error: error, debug: ServerError.logErrors(error) })
}

// #region Opts

export const userProfileController = {
  routeOpts: {
    errorHandler: userProfileErrorHandler,
    handler: userProfileHandler,
  },
} as const
