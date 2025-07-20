import type { FastifyError, FastifyRequest } from 'fastify'
import type { DirectMessage, ReplyCodeNames } from '../core.exports'
import type { LiteralUnion } from 'type-fest'
import { ZodError } from 'zod'
import { MongoError } from 'mongodb'
import { TokenError } from 'fast-jwt'

export interface ServerErrorLogObject {
  isError: boolean
  isTypeError: boolean
  isRangeError: boolean
  isMongoError: boolean
  isTokenError: boolean
  isSyntaxError: boolean
  isServerError: boolean
  isZodError: boolean
  error: FastifyError
}

/**
 * A generic error that helps formatting the `serverReply()` functionality.
 *
 * You can also debug error classes by using the static method `logErrors()` on any error handler function.
 */
export class ServerError extends Error {
  serverErrorCode: LiteralUnion<ReplyCodeNames, string> | DirectMessage
  data?: Record<string, any> | null
  messageValues?: Record<string, string>

  /**
   * Builds and throws stardardized error objects throughout the server routes.
   * - - - -
   * @param {LiteralUnion<ReplyCodeNames, string> | DirectMessage} codeOrMessage A code of the error (status code and message will be retrieved from the internal code map), or an array with the status code and the custom message.
   * @param {Record<string, any> | null} [data] `OPTIONAL` Values that will be placed on the reply JSON object.
   * @param {Record<string, string>} [messageValues] `OPTIONAL` An object with key values that can be replaced parameters inside the message string by using `{{paramName}}` flags inside the string.
   */
  constructor(codeOrMessage: LiteralUnion<ReplyCodeNames, string> | DirectMessage, data?: Record<string, any> | null, messageValues?: Record<string, string>) {
    super('')
    this.serverErrorCode = codeOrMessage
    this.data = data
    this.messageValues = messageValues
  }

  /**
   * A function that helps identifying the classes behind errors on a route error handler function, returning an object with commam checked error instances.
   * - - - -
   * @param {FastifyError} error The fastify instance of the error.
   * @param {FastifyRequest} [req] `OPTIONAL` By giving the fastify request instance, it automatically logs the error on the console.
   * @returns {ServerErrorLogObject}
   */
  static logErrors(error: FastifyError, req?: FastifyRequest): ServerErrorLogObject {
    const isError = error instanceof Error
    const isTypeError = error instanceof TypeError
    const isRangeError = error instanceof RangeError
    const isMongoError = error instanceof MongoError
    const isTokenError = error instanceof TokenError
    const isSyntaxError = error instanceof SyntaxError
    const isServerError = error instanceof ServerError
    const isZodError = error instanceof ZodError
    const output = {
      isError,
      isTypeError,
      isRangeError,
      isMongoError,
      isTokenError,
      isSyntaxError,
      isServerError,
      isZodError,
      error,
    }
    if (req) req.log.error(output, 'An error occurred')
    return output
  }
}
