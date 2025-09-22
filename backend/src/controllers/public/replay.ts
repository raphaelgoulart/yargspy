import { TokenError } from 'fast-jwt'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerErrorHandler, ServerHandler } from '../../lib.exports'
import { getServerPublic, isDev } from '../../utils.exports'

export interface IPublicReplay {
  query: {
    filename?: string
  }
}

// #region Handler

const publicReplayHandler: ServerHandler<IPublicReplay> = async function (req, reply) {
  const missingQuery: string[] = []
  if (!req.query.filename) missingQuery.push('filename')
  if (missingQuery.length > 0) throw new ServerError('err_song_invalid_query', null, { params: missingQuery.join(', ') })

  const { filename } = req.query
  const replayPath = `replay/${filename}.replay`
  const replay = getServerPublic().gotoFile(replayPath)
  if (replay.exists) {
    if (isDev()) reply.header('Content-Disposition', `attachment; filename="${replay.fullname}"`)
    return reply.sendFile(replayPath)
  }
  else throw new ServerError([404, `YARG REPLAY file with ID ${filename} not found`])
}

// #region Error Handler

const publicReplayErrorHandler: ServerErrorHandler<IPublicReplay> = function (error, req, reply) {
  req.log.error(error)
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })

  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const publicReplayController = {
  handler: publicReplayHandler,
  errorHandler: publicReplayErrorHandler,
} as const
