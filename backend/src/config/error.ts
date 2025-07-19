import type { FastifyError, FastifyRequest } from 'fastify'
import type { DirectMessage, ReplyCodeNames } from '../core.exports'
import type { LiteralUnion } from 'type-fest'
import { ZodError } from 'zod'
import { MongoError } from 'mongodb'
import { TokenError } from 'fast-jwt'

export class ServerError extends Error {
  serverErrorCode: LiteralUnion<ReplyCodeNames, string> | DirectMessage
  data?: Record<string, any> | null
  messageValues?: Record<string, string>

  constructor(codeOrMessage: LiteralUnion<ReplyCodeNames, string> | DirectMessage, data?: Record<string, any> | null, messageValues?: Record<string, string>) {
    super('')
    this.serverErrorCode = codeOrMessage
    this.data = data
    this.messageValues = messageValues
  }

  static logErrors(error: FastifyError, req: FastifyRequest) {
    const isError = error instanceof Error
    const isTypeError = error instanceof TypeError
    const isRangeError = error instanceof RangeError
    const isMongoError = error instanceof MongoError
    const isTokenError = error instanceof TokenError
    const isSyntaxError = error instanceof SyntaxError
    const isServerError = error instanceof ServerError
    const isZodError = error instanceof ZodError
    req.log.error(
      {
        isError,
        isTypeError,
        isRangeError,
        isMongoError,
        isTokenError,
        isSyntaxError,
        isServerError,
        isZodError,
        error,
      },
      'An error occurred'
    )
  }
}
