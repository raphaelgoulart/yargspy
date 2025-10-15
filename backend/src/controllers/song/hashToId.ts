import { TokenError } from 'fast-jwt'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler } from '../../lib.exports'
import { Song } from '../../models/Song'

export interface ISongHashToId {
  query: {
    hash: string
  }
}

// #region Handler

const songHashToIdHandler: ServerHandler<ISongHashToId> = async function (req, reply) {
  const song = await Song.findByHash(req.query.hash)
  if (!song) {
    if (req.query.hash) throw new ServerError('err_id_not_found', null, { id: req.query.hash })
    else throw new ServerError('err_invalid_query', null, { params: 'hash' })
  }

  serverReply(reply, 'ok', {
    id: song._id,
  })
}

// #region Error Handler

const songHashToIdErrorHandler: ServerErrorHandler<ISongHashToId> = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)
  // Mongoose ObjectID CastError
  if (error.name === 'CastError') return serverReply(reply, 'err_invalid_input')
  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const songHashToIdController = {
  errorHandler: songHashToIdErrorHandler,
  handler: songHashToIdHandler,
} as const
