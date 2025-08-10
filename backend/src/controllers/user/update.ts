import { TokenError } from 'fast-jwt'
import type { infer as ZodInfer } from 'zod'
import { ServerError, userUpdateBodySchema } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler, ServerRequest } from '../../lib.exports'
import { User, type UserSchemaDocument } from '../../models/User'

export interface IUserUpdate {
  body: ZodInfer<typeof userUpdateBodySchema>
}

type RouteRequest = ServerRequest<IUserUpdate> & { user: UserSchemaDocument }

// #region Handler

const userUpdateHandler: ServerHandler<IUserUpdate> = async function (req, reply) {
  const user = (req as RouteRequest).user
  const isAdmin = user.admin
  if (isAdmin) {
    // TODO: Admin editing other user entries or itself
  } else {
    const { profilePhotoURL } = userUpdateBodySchema.parse(req.body)

    if (profilePhotoURL) user.profilePhotoURL = profilePhotoURL

    await user.save()
  }
}

// #region Error Handler

const userUpdateErrorHandler: ServerErrorHandler = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const userUpdateController = {
  errorHandler: userUpdateErrorHandler,
  handler: userUpdateHandler,
} as const
