import zod, { ZodError } from 'zod'
import { serverReply } from '../core.exports'
import { MongoError } from 'mongodb'
import { User } from '../models/User'
import { ServerError, type ControllerErrorHandler, type ControllerHandler } from '../app.exports'

// #region Body Schema Validator
export const userRegisterBodySchema = zod.object({
  username: zod.string().min(3).max(32),
  password: zod
    .string()
    .min(8)
    .max(32)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
})

export interface IUserRegisterController {
  Body: zod.infer<typeof userRegisterBodySchema>
}

// #region Handler

const userRegisterHandler: ControllerHandler<IUserRegisterController> = async function (req, reply) {
  const body = userRegisterBodySchema.parse(req.body)
  const user = new User(body)
  await user.save()
  return serverReply(reply, 'success_user_register')
}

//#region Error Handler

const userRegisterErrorHandler: ControllerErrorHandler<IUserRegisterController> = function (error, _, reply) {
  if (error instanceof ZodError) {
    const issue = error.issues[0]
    if (issue.code === 'invalid_type') {
      // Empty body
      if (issue.message === 'Invalid input: expected object, received undefined' && issue.path.length === 0) return serverReply(reply, 'err_user_register_no_body')
      // No username
      if (issue.message === 'Invalid input: expected string, received undefined' && issue.path[0] === 'username') return serverReply(reply, 'err_user_register_no_username')
      // No password
      if (issue.message === 'Invalid input: expected string, received undefined' && issue.path[0] === 'password') return serverReply(reply, 'err_user_register_no_password')
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

    return serverReply(reply, 'err_unknown', { error: error })
  }

  // Faulty JSON serialization
  if (error instanceof SyntaxError) return serverReply(reply, 'err_syntax_json_body', null, { additionalMessage: error.message })

  // Duplicated username
  if (error instanceof MongoError && Number(error.code) === 11000 && 'keyValue' in error && error.keyValue !== null && error.keyValue !== undefined && 'username' in (error.keyValue as Record<string, string>)) {
    const username = (error.keyValue as Record<string, string>).username

    return serverReply(reply, 'err_user_register_duplicated_username', undefined, { username })
  }

  // Empty body but with Content-Type in request headers
  if (error.code === 'FST_ERR_CTP_EMPTY_JSON_BODY') return serverReply(reply, 'err_empty_json_body')

  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Unknown error
  return serverReply(reply, 'err_not_implemented', { error: error })
}

// #region Opts

export const userRegisterController = {
  routeOpts: {
    errorHandler: userRegisterErrorHandler,
    handler: userRegisterHandler,
  },
} as const
