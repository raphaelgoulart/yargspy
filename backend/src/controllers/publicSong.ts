import { TokenError } from 'fast-jwt'
import { ServerError } from '../app.exports'
import { serverReply } from '../core.exports'
import type { FastifyErrorHandlerFn, FastifyHandlerFn } from '../lib.exports'
import type { UserSchemaDocument } from '../models/User'
import { getServerPublic } from '../utils.exports'

export interface IPublicSong {
  decorators: { user?: UserSchemaDocument }
  query: {
    type?: 'replay' | 'chart'
    id?: string
  }
}

// #region Handler

const publicSongHandler: FastifyHandlerFn<IPublicSong> = async function (req, reply) {
  const missingQuery: string[] = []
  if (!req.query.id) missingQuery.push('id')
  if (!req.query.type) missingQuery.push('type')
  if (!req.query.id || !req.query.type) throw new ServerError('err_song_invalid_query', null, { params: missingQuery.join(', ') })

  const { type, id } = req.query
  if (type === 'replay') {
    const replayPath = `replay/${id}.replay`
    const replay = getServerPublic().gotoFile(replayPath)
    if (replay.exists) reply.sendFile(replayPath)
    else throw new ServerError([404, `YARG REPLAY file with ID ${id} not found`])
  } else {
    const chartPath = `chart/${id}.chart`
    const midiPath = `chart/${id}.mid`
    const chart = getServerPublic().gotoFile(chartPath)
    const midi = getServerPublic().gotoFile(midiPath)
    if (chart.exists) reply.sendFile(chartPath)
    else if (midi.exists) reply.sendFile(midiPath)
    else throw new ServerError([404, `Chart file with ID ${id} not found`])
  }
}

// #region Error Handler

const publicSongErrorHandler: FastifyErrorHandlerFn<IPublicSong> = function (error, req, reply) {
  req.log.error(error)
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })

  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const publicSongController = {
  handler: publicSongHandler,
  errorHandler: publicSongErrorHandler,
} as const
