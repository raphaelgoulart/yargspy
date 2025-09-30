import { TokenError } from 'fast-jwt'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler, RouteRequest } from '../../lib.exports'
import { Score } from '../../models/Score'
import { AdminAction, AdminLog } from '../../models/AdminLog'
import type { UserSchemaDocument } from '../../models/User'
import { getServerFile, isDev } from '../../utils.exports'

export interface IAdminScoreDelete {
  body: {
    id: string
    reason: string
  }
}

// #region Handler

const adminScoreDeleteHandler: ServerHandler<IAdminScoreDelete> = async function (req, reply) {
  const missingParams = []
  if (!req.body.id) missingParams.push('id')
  if (!req.body.reason) missingParams.push('reason')
  if (missingParams.length) throw new ServerError('err_invalid_query', null, {params: missingParams.join(', ')})
    
  const score = await Score.findById(req.body.id)
  if (!score) throw new ServerError([404, `Score ${req.body.id} not found`])

  // delete replay file
  const replayPath = score.replayPath
  if (isDev()) {
    const replayFilePath = getServerFile().gotoFile(`replay/${replayPath}.replay`)
    if (replayFilePath.exists) replayFilePath.delete() // this can be async
  } else {
    // TODO: on prod, delete file in S3
  }
  // (DB) delete scores associated to that replay file
  const result = await Score.deleteMany({replayPath: replayPath})
  // log admin action (this can be async)
  new AdminLog({
    admin: (req as RouteRequest<{ user: UserSchemaDocument }>).user,
    action: AdminAction.ScoreDelete,
    item: req.body.id,
    reason: req.body.reason,
  }).save()
  serverReply(
    reply,
    'ok',
    {
      count: result.deletedCount
    },
  )
}

// #region Error Handler

const adminScoreDeleteErrorHandler: ServerErrorHandler = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const adminScoreDeleteController = {
  errorHandler: adminScoreDeleteErrorHandler,
  handler: adminScoreDeleteHandler,
} as const
