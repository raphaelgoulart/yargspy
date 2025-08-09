import type { infer as ZodInfer } from 'zod'
import { TokenError } from 'fast-jwt'
import { ServerError, userAllEntriesQuerystringSchema } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler } from '../../lib.exports'
import { User, type UserSchemaDocument } from '../../models/User'
import { isDev } from '../../utils.exports'
import { setDefaultOptions } from 'set-default-options'

export interface IUserAllEntries {
  decorators: {
    user?: UserSchemaDocument
  }
  query: {
    [key in keyof ZodInfer<typeof userAllEntriesQuerystringSchema>]: string
  }
}

// #region Handler

const userAllEntriesHandler: ServerHandler<IUserAllEntries> = async function (req, reply) {
  const user = req.user
  if (!isDev() && !user) throw new ServerError('err_invalid_auth')

  const { page, limit } = userAllEntriesQuerystringSchema.parse(req.query)
  const skip = (page - 1) * limit

  const allUsers = await User.find().skip(skip).limit(limit)
  const totalEntries = await User.countDocuments()
  const totalPages = Math.ceil(totalEntries / limit)

  serverReply(reply, 'ok', {
    user: user
      ? {
          _id: user._id,
          username: user.username,
          active: user.active,
          admin: user.admin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      : undefined,
    totalEntries,
    totalPages,
    page,
    limit,
    entries: allUsers.map((user) => user.toJSON()),
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
