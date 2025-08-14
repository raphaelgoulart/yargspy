import { TokenError } from 'fast-jwt'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerErrorHandler, ServerHandler } from '../../lib.exports'
import { getServerPublic } from '../../utils.exports'
import type { UserSchemaDocument } from '../../models/User'

export interface IPublicSong {
  query: {
    type?: 'replay' | 'chart'
    id?: string
    accessKey?: string
  }
}

// #region Handler

const publicSongHandler: ServerHandler<IPublicSong> = async function (req, reply) {
  const missingQuery: string[] = []
  if (!req.query.id) missingQuery.push('id')
  if (!req.query.type) missingQuery.push('type')
  if (missingQuery.length > 0) throw new ServerError('err_song_invalid_query', null, { params: missingQuery.join(', ') })

  const { type, id } = req.query
  if (type === 'replay') {
    const replayPath = `replay/${id}.replay`
    const replay = getServerPublic().gotoFile(replayPath)
    if (replay.exists) reply.sendFile(replayPath)
    else throw new ServerError([404, `YARG REPLAY file with ID ${id} not found`])
  } else {
    // CHART/MIDI files requires a special key value to validate the request, the key is assigned in the server .env file
    if (!req.query.accessKey || !process.env.PUBLIC_CHART_FILE_ACCESS_KEY || req.query.accessKey !== process.env.PUBLIC_CHART_FILE_ACCESS_KEY) throw new ServerError([403, 'Forbidden'])
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

const publicSongErrorHandler: ServerErrorHandler<IPublicSong> = function (error, req, reply) {
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
