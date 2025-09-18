import type { infer as ZodInfer } from 'zod'
import { TokenError } from 'fast-jwt'
import { ServerError, userScoresQuerystringSchema } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler } from '../../lib.exports'
import { Score } from '../../models/Score'

export interface IUserScores {
  query: {
    [key in keyof ZodInfer<typeof userScoresQuerystringSchema>]: string
  }
}

// #region Handler

const userScoresHandler: ServerHandler<IUserScores> = async function (req, reply) {
  const { page, limit, id } = userScoresQuerystringSchema.parse(req.query)

  const skip = (page - 1) * limit
  const filter = { uploader: id }

  const [allScores, totalEntries] = await Promise.all([
    Score.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Score.countDocuments(filter)
  ]);
  const totalPages = Math.ceil(totalEntries / limit)

  serverReply(reply, 'ok', {
    totalEntries,
    totalPages,
    page,
    limit,
    entries: allScores
  })
}

// #region Error Handler

const userScoresErrorHandler: ServerErrorHandler = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const userScoresController = {
  errorHandler: userScoresErrorHandler,
  handler: userScoresHandler,
} as const
