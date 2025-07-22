import { pipeline } from 'node:stream/promises'
import { TokenError } from 'fast-jwt'
import { ServerError, type ControllerErrorHandler, type ControllerHandler, type FastifyMultipartObject } from '../app.exports'
import type { IUserProfileDecorators } from '../controllers.exports'
import { serverReply } from '../core.exports'
import { packageDirPath } from '../utils.exports'
import { execAsync } from 'node-lib'
import { processReplayValidator } from '../utils/processReplayValidator'

export interface IReplayRegisterController {}
export interface IReplayRegisterDecorators extends IUserProfileDecorators {}

// #region Handler

const replayRegisterHandler: ControllerHandler<IReplayRegisterController, IReplayRegisterDecorators> = async function (req, reply) {
  const data = (await req.file()) as FastifyMultipartObject | undefined
  if (!data) throw new ServerError('err_replay_nofileuploaded')

  const packageDir = packageDirPath()

  // TO-DO: Logic for static filenames
  const newReplayPath = packageDir.gotoFile('public/replay/test.replay')
  await pipeline(data.file, await newReplayPath.createWriteStream())

  const magic = (await newReplayPath.readOffset(0, 8)).toString('ascii')
  if (magic !== 'YARGPLAY' && magic !== 'YAREPLAY') {
    if (newReplayPath.exists) await newReplayPath.delete()
    return serverReply(reply, 'err_replay_invalid_magic')
  }

  const validatorPath = packageDir.gotoFile('bin/YARGReplayValidator.exe')

  const { stdout, stderr } = await execAsync(`${validatorPath.path} ${newReplayPath.path}`)
  if (stderr) {
    if (stderr.trim().startsWith('System.Exception: Missing MIDI path/parse settings.')) throw new ServerError('err_replay_missing_chart')
    throw new ServerError('err_not_implemented', { error: stderr })
  }

  const results = processReplayValidator(JSON.parse(stdout))
  serverReply(reply, 'ok')
}

// #region Error Handler

const replayRegisterErrorHandler: ControllerErrorHandler<IReplayRegisterController> = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })

  // Unknown error
  return serverReply(reply, 'err_not_implemented', { error: error, debug: ServerError.logErrors(error) })
}

// #region Opts

export const replayRegisterController = {
  routeOpts: {
    handler: replayRegisterHandler,
    errorHandler: replayRegisterErrorHandler,
  },
} as const
