import { TokenError } from 'fast-jwt'
import { serverReply } from '../core.exports'
import { ServerError } from '../app.exports'
import type { UserSchemaDocument } from '../models/User'
import type { FastifyErrorHandlerFn, FastifyHandlerFn } from '../lib.exports'

export interface IUserProfile {
  decorators: {
    user?: UserSchemaDocument
  }
}

// #region Handler

const userProfileHandler: FastifyHandlerFn<IUserProfile> = async function (req, reply) {
  const user = req.user
  if (!user) throw new ServerError('err_invalid_auth')

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

const userProfileErrorHandler: FastifyErrorHandlerFn = function (error, req, reply) {
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
