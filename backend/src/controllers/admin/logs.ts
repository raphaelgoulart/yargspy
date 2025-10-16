import type { infer as ZodInfer } from 'zod'
import { TokenError } from 'fast-jwt'
import { ServerError, adminLogsQuerystringSchema } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler } from '../../lib.exports'
import { AdminLog } from '../../models/AdminLog'

export interface IAdminLogs {
  query: {
    [key in keyof ZodInfer<typeof adminLogsQuerystringSchema>]: string
  }
}

// #region Handler

const adminLogsHandler: ServerHandler<IAdminLogs> = async function (req, reply) {
  const { page, limit, admin, action, item, startDate, endDate } = adminLogsQuerystringSchema.parse(req.query)
  const skip = (page - 1) * limit
  const filter = {} as Record<string, any>
  if (admin !== undefined) filter['admin'] = admin
  if (Number(action) >= 0) filter['action'] = action
  if (item !== undefined) filter['item'] = item
  if (startDate !== undefined || endDate !== undefined) {
    const date = {} as Record<string, any>
    if (startDate !== undefined) date['$gte'] = startDate
    if (endDate !== undefined) date['$lte'] = endDate
    filter['createdAt'] = date
  }

  const [actions, totalEntries] = await Promise.all([AdminLog.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('admin', 'username'), AdminLog.countDocuments(filter)])
  const totalPages = Math.ceil(totalEntries / limit)

  serverReply(reply, 'ok', {
    totalEntries,
    totalPages,
    page,
    limit,
    entries: actions,
  })
}

// #region Error Handler

const adminLogsErrorHandler: ServerErrorHandler = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const adminLogsController = {
  errorHandler: adminLogsErrorHandler,
  handler: adminLogsHandler,
} as const
