import { TokenError } from 'fast-jwt'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler, RouteRequest } from '../../lib.exports'
import { Song } from '../../models/Song'
import { AdminAction, AdminLog } from '../../models/AdminLog'
import type { UserSchemaDocument } from '../../models/User'

export interface IAdminSongUpdate {
  body: {
    id: string
    name?: string
    artist?: string
    charter?: string
    album?: string
    year?: string
    proDrums?: boolean
    fiveLaneDrums?: boolean
    sustainCutoffThreshold?: number
    hopoFrequency?: number
    multiplierNote?: number
    reason?: string
  }
}

// #region Handler

const adminSongUpdateHandler: ServerHandler<IAdminSongUpdate> = async function (req, reply) {
  const song = await Song.findById(req.body.id)
  if (!song) {
    if (req.body.id) throw new ServerError([404, `Song ${req.body.id} not found`])
    else throw new ServerError([400, `id parameter missing from request body`])
  }

  if (req.body.name !== undefined) song.name = req.body.name
  if (req.body.artist !== undefined) song.artist = req.body.artist
  if (req.body.charter !== undefined) song.charter = req.body.charter
  if (req.body.album !== undefined) song.album = req.body.album
  if (req.body.year !== undefined) song.year = req.body.year
  if (req.body.proDrums !== undefined) song.proDrums = req.body.proDrums
  if (req.body.fiveLaneDrums !== undefined) song.fiveLaneDrums = req.body.fiveLaneDrums
  if (req.body.sustainCutoffThreshold !== undefined) song.sustainCutoffThreshold = req.body.sustainCutoffThreshold
  if (req.body.hopoFrequency !== undefined) song.hopoFrequency = req.body.hopoFrequency
  if (req.body.multiplierNote !== undefined) song.multiplierNote = req.body.multiplierNote

  await song.save()
  // log admin action (this can be async)
  new AdminLog({
    admin: (req as RouteRequest<{ user: UserSchemaDocument }>).user,
    action: AdminAction.SongUpdate,
    item: song,
    reason: req.body.reason,
  }).save()
  serverReply(
    reply,
    'ok',
     {
     song
    },
  )
}

// #region Error Handler

const adminSongUpdateErrorHandler: ServerErrorHandler = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const adminSongUpdateController = {
  errorHandler: adminSongUpdateErrorHandler,
  handler: adminSongUpdateHandler,
} as const
