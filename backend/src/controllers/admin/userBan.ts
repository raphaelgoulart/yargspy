import { TokenError } from "fast-jwt"
import { type infer as ZodInfer } from 'zod'
import { adminUserBanBodySchema, ServerError } from "../../app.exports"
import { serverReply } from "../../core.exports"
import type { RouteRequest, ServerErrorHandler, ServerHandler } from "../../lib.exports"
import { User, type UserSchemaDocument } from "../../models/User"
import { Score } from "../../models/Score"
import { AdminAction, AdminLog } from "../../models/AdminLog"

export interface IAdminUserBan {
  body: ZodInfer<typeof adminUserBanBodySchema>
}

// #region Handler

const adminUserBanHandler: ServerHandler<IAdminUserBan> = async function (req, reply) {
  const body = adminUserBanBodySchema.parse(req.body)
  const user = await User.findById(body.id)
  if (!user) throw new ServerError([404, `User ${body.id} not found`])
  if (user.active == body.active) throw new ServerError([400, `User already in requested active state`])
  Score.updateMany({ uploader: user }, { $set: { hidden: !body.active } }).then() // toggle user score visibility; this can be async
  user.active = body.active
  await user.save()
  // log admin action (this can be async)
  new AdminLog({
    admin: (req as RouteRequest<{ user: UserSchemaDocument }>).user,
    action: body.active ? AdminAction.UserUnban : AdminAction.UserBan,
    item: user,
    reason: body.reason,
  }).save()
  serverReply(
    reply,
    'ok',
    {
      user: user.id,
      active: user.active
    },
  )
}

// #region Error Handler

const adminUserBanErrorHandler: ServerErrorHandler = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const adminUserBanController = {
  errorHandler: adminUserBanErrorHandler,
  handler: adminUserBanHandler,
} as const
