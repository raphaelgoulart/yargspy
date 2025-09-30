import { TokenError } from 'fast-jwt'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler, RouteRequest } from '../../lib.exports'
import { Song } from '../../models/Song'
import { AdminAction, AdminLog } from '../../models/AdminLog'
import type { UserSchemaDocument } from '../../models/User'
import { Score } from '../../models/Score'
import { getChartFilePathFromSongEntry, getServerFile } from '../../utils.exports'

export interface IAdminSongDelete {
  body: {
    id: string
    reason?: string
  }
}

// #region Handler

const adminSongDeleteHandler: ServerHandler<IAdminSongDelete> = async function (req, reply) {
  const missingParams = []
  if (!req.body.id) missingParams.push('id')
  if (!req.body.reason) missingParams.push('reason')
  if (missingParams.length) throw new ServerError('err_invalid_query', null, {params: missingParams.join(', ')})
      
  const song = await Song.findById(req.body.id)
  if (!song) throw new ServerError([404, `Song ${req.body.id} not found`])

  // fetch scores for the song; delete their replay file (if it exists), and the DB entries
  const scores = await Score.find({song: song})
  for (const score of scores) {
    const replayFilePath = getServerFile().gotoFile(`replay/${score.replayPath}.replay`)
    if (replayFilePath.exists) await replayFilePath.delete()
    await score.deleteOne()
  }
  // after deleting the scores, delete the chart file and the song's DB entry
  const chartFilePath = getChartFilePathFromSongEntry(song)
  if (chartFilePath.exists) await chartFilePath.delete()
  await song.deleteOne()

  // log admin action (this can be async)
  new AdminLog({
    admin: (req as RouteRequest<{ user: UserSchemaDocument }>).user,
    action: AdminAction.SongDelete,
    item: req.body.id,
    reason: req.body.reason,
  }).save()
  serverReply(
    reply,
    'ok'
  )
}

// #region Error Handler

const adminSongDeleteErrorHandler: ServerErrorHandler = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const adminSongDeleteController = {
  errorHandler: adminSongDeleteErrorHandler,
  handler: adminSongDeleteHandler,
} as const
