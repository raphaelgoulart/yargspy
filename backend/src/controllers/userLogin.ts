import { ZodError, type infer as ZodInfer } from 'zod'
import type { UserSchemaDocument } from '../models/User'
import { ServerError, type userLoginBodySchema } from '../app.exports'
import { serverReply } from '../core.exports'
import type { FastifyErrorHandlerFn, FastifyHandlerFn } from '../lib.exports'

export interface IUserLogin {
  body: ZodInfer<typeof userLoginBodySchema>
  decorators: {
    user?: UserSchemaDocument
  }
}

// #region Handler

const userLoginHandler: FastifyHandlerFn<IUserLogin> = async function (req, reply) {
  const user = req.user!
  const token = await user.generateToken()
  serverReply(reply, 'suceess_user_login', { token })
}

// #region Error Handler

const userLoginErrorHandler: FastifyErrorHandlerFn<IUserLogin> = function (error, _, reply) {
  if (error instanceof ZodError) {
    const issue = error.issues[0]
    if (issue.code === 'invalid_type') {
      // Empty body
      if (issue.message === 'Invalid input: expected object, received undefined' && issue.path.length === 0) return serverReply(reply, 'err_user_login_no_body')
      // No username
      if (issue.message === 'Invalid input: expected string, received undefined' && issue.path[0] === 'username') return serverReply(reply, 'err_user_login_no_username')
      // No password
      if (issue.message === 'Invalid input: expected string, received undefined' && issue.path[0] === 'password') return serverReply(reply, 'err_user_login_no_password')
    }
    if (issue.code === 'too_small') {
      // Too small username
      if (issue.path[0] === 'username') return serverReply(reply, 'err_user_register_username_toosmall')
      // Too small password
      if (issue.path[0] === 'password') return serverReply(reply, 'err_user_register_password_toosmall')
    }
    if (issue.code === 'too_big') {
      // Too big username
      if (issue.path[0] === 'username') return serverReply(reply, 'err_user_register_username_toobig')
      // Too big password
      if (issue.path[0] === 'password') return serverReply(reply, 'err_user_register_password_toobig')
    }

    // Password validation
    if (issue.code === 'invalid_format' && issue.path[0] === 'password') {
      if (issue.pattern === '/[a-z]/') return serverReply(reply, 'err_user_register_password_nolowercase')
      if (issue.pattern === '/[A-Z]/') return serverReply(reply, 'err_user_register_password_nouppercase')
      if (issue.pattern === '/[0-9]/') return serverReply(reply, 'err_user_register_password_nonumber')
      if (issue.pattern === '/[^A-Za-z0-9]/') return serverReply(reply, 'err_user_register_password_nospecialchar')
    }
  }

  // Faulty JSON serialization
  if (error instanceof SyntaxError) return serverReply(reply, 'err_syntax_json_body', null, { additionalMessage: error.message })

  // Empty body but with Content-Type in request headers
  if (error.code === 'FST_ERR_CTP_EMPTY_JSON_BODY') return serverReply(reply, 'err_empty_json_body')

  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const userLoginController = {
  errorHandler: userLoginErrorHandler,
  handler: userLoginHandler,
} as const
