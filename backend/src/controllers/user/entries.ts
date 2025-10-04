import type { infer as ZodInfer } from 'zod'
import { TokenError } from 'fast-jwt'
import { ServerError, userEntriesQuerystringSchema } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler } from '../../lib.exports'
import { User } from '../../models/User'
import { isDev } from '../../utils.exports'

export interface IUserEntries {
  query: {
    [key in keyof ZodInfer<typeof userEntriesQuerystringSchema>]: string
  }
}

// #region Handler

const userEntriesHandler: ServerHandler<IUserEntries> = async function (req, reply) {
  const { page, limit, username } = userEntriesQuerystringSchema.parse(req.query)
  const skip = (page - 1) * limit
  const filter = username ? { username: { $regex: username, $options: 'i' }, active: true } : { active: true }

  const [allUsers, totalEntries] = await Promise.all([
    User.find(filter).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);
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
            country: user.country
          }
    ),
  })
}

// #region Error Handler

const userEntriesErrorHandler: ServerErrorHandler = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const userEntriesController = {
  errorHandler: userEntriesErrorHandler,
  handler: userEntriesHandler,
} as const
