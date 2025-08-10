import type { infer as ZodInfer } from 'zod'
import { TokenError } from 'fast-jwt'
import { ServerError, userAllEntriesQuerystringSchema } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler } from '../../lib.exports'
import { User } from '../../models/User'
import { isDev } from '../../utils.exports'

export interface IUserAllEntries {
  query: {
    [key in keyof ZodInfer<typeof userAllEntriesQuerystringSchema>]: string
  }
}

// #region Handler

const userAllEntriesHandler: ServerHandler<IUserAllEntries> = async function (req, reply) {
  const { page, limit } = userAllEntriesQuerystringSchema.parse(req.query)
  const skip = (page - 1) * limit

  const allUsers = await User.find().skip(skip).limit(limit)
  const totalEntries = await User.countDocuments()
  const totalPages = Math.ceil(totalEntries / limit)

  serverReply(reply, 'ok', {
    totalEntries,
    totalPages,
    page,
    limit,
    entries: allUsers.map((user) =>
      isDev()
        ? user.toJSON()
        : {
            // Filter for production env
            username: user.username,
            profilePhotoURL: user.profilePhotoURL,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }
    ),
  })
}

// #region Error Handler

const userAllEntriesErrorHandler: ServerErrorHandler = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const userAllEntriesController = {
  errorHandler: userAllEntriesErrorHandler,
  handler: userAllEntriesHandler,
} as const
