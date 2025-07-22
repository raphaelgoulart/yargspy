import { TokenError } from 'fast-jwt'
import { ServerError, type ControllerErrorHandler, type ControllerHandler, type FastifyMultipartDecorators } from '../app.exports'
import type { IUserProfileDecorators } from '../controllers.exports'
import { serverReply } from '../core.exports'

export interface IUserReplaySendController {}
export interface IUserReplaySendDecorators extends IUserProfileDecorators, FastifyMultipartDecorators {}

// #region Handler

const userReplaySendHandler: ControllerHandler<IUserReplaySendController, IUserReplaySendDecorators> = async function (req, reply) {
  const t = await req.file()
  // console.log(await t?.fields.replayFile?.toBuffer())
  serverReply(reply, 'ok')
}

// #region Error Handler

const userReplaySendErrorHandler: ControllerErrorHandler<IUserReplaySendController> = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })

  // Unknown error
  return serverReply(reply, 'err_not_implemented', { error: error, debug: ServerError.logErrors(error) })
}

// #region Opts

export const userReplaySendController = {
  routeOpts: {
    handler: userReplaySendHandler,
    errorHandler: userReplaySendErrorHandler,
  },
} as const
