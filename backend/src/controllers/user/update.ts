import { TokenError } from 'fast-jwt'
import type { infer as ZodInfer } from 'zod'
import { ServerError, userUpdateBodySchema } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler, RouteRequest } from '../../lib.exports'
import { User, type UserSchemaDocument } from '../../models/User'
import { AdminAction, AdminLog } from '../../models/AdminLog'

export interface IUserUpdate {
  body: ZodInfer<typeof userUpdateBodySchema>
}

// #region Handler

const userUpdateHandler: ServerHandler<IUserUpdate> = async function (req, reply) {
  const user = (req as RouteRequest<{ user: UserSchemaDocument }>).user
  const { id, reason, profilePhotoURL, bannerURL } = userUpdateBodySchema.parse(req.body)
  if (id) {
    // has id = admin editing someone else
    const isAdmin = user.admin
    if (!isAdmin) throw new ServerError('err_invalid_auth_admin')
    if (!reason) throw new ServerError('err_invalid_query', null, { params: 'reason' })
    const userEdit = await User.findById(id)
    if (!userEdit) throw new ServerError('err_id_not_found', null, { id })
    if (profilePhotoURL !== undefined) userEdit.profilePhotoURL = profilePhotoURL
    if (bannerURL !== undefined) userEdit.bannerURL = bannerURL
    // TODO: more fields for admin-only editing? username? email?
    await userEdit.save()
    // log admin action (this can be async)
    new AdminLog({
      admin: (req as RouteRequest<{ user: UserSchemaDocument }>).user,
      action: AdminAction.UserUpdate,
      item: userEdit,
      reason: reason,
    }).save()
    serverReply(reply, 'ok', {
      user: userEdit,
    })
  } else {
    if (profilePhotoURL !== undefined) user.profilePhotoURL = profilePhotoURL
    if (bannerURL !== undefined) user.bannerURL = bannerURL
    await user.setCountryAndSave(req)
    serverReply(reply, 'ok', {
      user,
    })
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
