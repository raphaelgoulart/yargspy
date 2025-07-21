import { serverReply } from '../core.exports'
import { User, type UserSchemaDocument } from '../models/User'
import { ServerError, type ControllerAuthFunction, type ControllerErrorHandler, type ControllerHandler } from '../app.exports'
import type { Schema } from 'mongoose'

export interface IUserProfileController {}
export interface IUserProfileDecorators {
  user: {
    _id: string
    username: string
    active: boolean
    admin: boolean
    createdAt: Date
    updatedAt: Date
  }
}

// #region Handler

const userProfileHandler: ControllerHandler<IUserProfileController, IUserProfileDecorators> = async function (req, reply) {
  const user = req.user
  serverReply(reply, 'success_user_profile', { user }, { username: user.username })
}

// #region Error Handler

const userProfileErrorHandler: ControllerErrorHandler<IUserProfileController> = function (error, _, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Unknown error
  return serverReply(reply, 'err_not_implemented', { error: error })
}

// #region Auth Methods

export const verifyUserJWT: ControllerAuthFunction<IUserProfileController, IUserProfileDecorators> = async function (req) {
  const { _id, username, password, createdAt, updatedAt, active, admin } = await User.findByToken(req.headers.authorization)
  req.user = {
    _id: _id as string,
    username,
    active,
    admin,
    createdAt,
    updatedAt,
  }
}

// #region Opts

export const userProfileController = {
  routeOpts: {
    errorHandler: userProfileErrorHandler,
    handler: userProfileHandler,
  },
} as const
