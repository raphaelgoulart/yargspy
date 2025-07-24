import { pipeline } from 'node:stream/promises'
import { TokenError } from 'fast-jwt'
import { execAsync, type FilePath } from 'node-lib'
import { ServerError, type ControllerErrorHandler, type ControllerHandler, type FastifyMultipartObject, type YARGReplayValidatorHashResults } from '../app.exports'
import type { IUserProfileDecorators } from '../controllers.exports'
import { serverReply } from '../core.exports'
import { buildUniqueFilename, packageDirPath, processReplayValidator } from '../utils.exports'
import { Song } from '../models/Song'

export interface IReplayRegisterController {}
export interface IReplayRegisterDecorators extends IUserProfileDecorators {}

// #region Handler

const replayRegisterHandler: ControllerHandler<IReplayRegisterController, IReplayRegisterDecorators> = async function (req, reply) {
  const packageDir = packageDirPath()
  const uniqueFileName = buildUniqueFilename()
  const replayPath = packageDir.gotoFile(`public/replay/${uniqueFileName}.replay`)
  const midiPath = packageDir.gotoFile(`public/mid/${uniqueFileName}.mid`)
  const chartPath = packageDir.gotoFile(`public/chart/${uniqueFileName}.chart`)
  const validatorPath = packageDir.gotoFile(Boolean(process.env.DEV) ? '../YARGReplayValidator/bin/Debug/net8.0/YARGReplayValidator.exe' : 'bin/YARGReplayValidator.exe')

  async function deleteAllFilesFromRequest() {
    if (replayPath.exists) await replayPath.delete()
    if (midiPath.exists) await midiPath.delete()
    if (chartPath.exists) await chartPath.delete()
  }

  const parts = req.parts({ limits: { parts: 3 } })
  const fileFields = new Map()
  const bodyMap = new Map()
  let chartType: 'mid' | 'chart'

  for await (const part of parts) {
    if (part.type === 'file') {
      let fileType: 'replay' | 'mid' | 'chart'
      if (part.filename.endsWith('.replay')) {
        await pipeline(part.file, await replayPath.createWriteStream())
        fileType = 'replay'
      } else if (part.filename.endsWith('.mid')) {
        await pipeline(part.file, await midiPath.createWriteStream())
        fileType = 'mid'
        chartType = 'mid'
      } else {
        await pipeline(part.file, await chartPath.createWriteStream())
        fileType = 'chart'
        chartType = 'chart'
      }
      fileFields.set(part.fieldname, {
        path: fileType === 'replay' ? replayPath.path : fileType === 'mid' ? midiPath.path : chartPath.path,
        type: part.type,
        fieldname: part.fieldname,
        filename: part.filename,
        encoding: part.encoding,
        mimetype: part.mimetype,
        value: null,
      })
    } else {
      bodyMap.set(part.fieldname, part.value)
    }
  }
  // It must have a file
  if (fileFields.size === 0) {
    throw new ServerError('err_replay_nofileuploaded')
  }

  // One of these files must be a replay file
  if (!replayPath.exists) {
    await deleteAllFilesFromRequest()
    throw new ServerError('err_replay_nofileuploaded')
  }

  // Checking file signatures
  const replayMagic = (await replayPath.readOffset(0, 8)).toString('ascii')

  if (replayMagic !== 'YARGPLAY' && replayMagic !== 'YAREPLAY') {
    await deleteAllFilesFromRequest()
    throw new ServerError('err_replay_invalid_magic')
  }
  if (midiPath.exists) {
    const midiMagic = (await midiPath.readOffset(0, 4)).toString('ascii')
    if (midiMagic !== 'MThd') {
      await deleteAllFilesFromRequest()
      throw new ServerError('err_replay_invalid_midi_magic')
    }
  }

  // TO-DO: Chart file check?
  // const chartMagic = (await replayPath.readOffset(0, 8)).toString('ascii')

  const { stdout, stderr } = await execAsync(`${validatorPath.fullname} "${replayPath.path}" "${midiPath.path}"`, { cwd: validatorPath.root, windowsHide: true })
  if (stderr) {
    await deleteAllFilesFromRequest()
    if (stderr.trim().startsWith('System.Exception: Missing MIDI path/parse settings.')) {
      throw new ServerError('err_replay_missing_chart')
    }
    throw new ServerError('err_unknown', { error: stderr })
  }

  const data = processReplayValidator(JSON.parse(stdout))

  // const checksum = Buffer.from(hashBytes, 'base64')
  // const song = await Song.findByChecksum(checksum)

  // if (!song && fileFields.size === 1) {
  //   await deleteAllFilesFromRequest()
  //   throw new ServerError('err_replay_missing_chart')
  // }

  // For debugging
  await deleteAllFilesFromRequest()

  serverReply(reply, 'ok', data)
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
