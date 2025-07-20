import { bearerTokenVerifier } from '../utils.exports'
import { serverReply } from '../core.exports'
import { User, type UserSchemaDocument } from '../models/User'
import { ServerError, type ControllerAuthFunction, type ControllerErrorHandler, type ControllerHandler } from '../config.exports'

export interface IUserProfileController {}
export interface IUserProfileDecorators {
  user?: UserSchemaDocument
  token?: string
}

// #region Handler

const userProfileHandler: ControllerHandler<IUserProfileController, IUserProfileDecorators> = async function (req, reply) {
  const user = req.user!
  const username = user.username
  serverReply(reply, 'success_user_profile', { user }, { username })
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
  const auth = req.headers.authorization
  const token = bearerTokenVerifier(auth)
  const user = await User.findByToken(token)

  req.user = user
  req.token = token
}

// #region Opts

export const userProfileController = {
  routeOpts: {
    errorHandler: userProfileErrorHandler,
    handler: userProfileHandler,
  },
} as const
