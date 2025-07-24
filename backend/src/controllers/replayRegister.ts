import { pipeline } from 'node:stream/promises'
import { TokenError } from 'fast-jwt'
import { execAsync, type FilePath } from 'node-lib'
import { ServerError, type ControllerErrorHandler, type ControllerHandler, type FastifyMultipartObject, type YARGReplayValidatorHashResults } from '../app.exports'
import type { IUserProfileDecorators } from '../controllers.exports'
import { serverReply } from '../core.exports'
import { buildUniqueFilename, packageDirPath, processReplayValidator } from '../utils.exports'

export interface IReplayRegisterController {}
export interface IReplayRegisterDecorators extends IUserProfileDecorators {}

export interface IReplayRegisterFileFieldObj {
  path: string
  fieldname: string
  filename: string
  encoding: string
  mimetype: string
}

// #region Handler

const replayRegisterHandler: ControllerHandler<IReplayRegisterController, IReplayRegisterDecorators> = async function (req, reply) {
  const packageDir = packageDirPath()
  const uniqueFileName = buildUniqueFilename()
  const replayPath = packageDir.gotoFile(`public/replay/${uniqueFileName}.replay`)
  const midiPath = packageDir.gotoFile(`public/mid/${uniqueFileName}.mid`)
  const chartPath = packageDir.gotoFile(`public/chart/${uniqueFileName}.chart`)
  const validatorPath = packageDir.gotoFile(Boolean(process.env.DEV) ? '../YARGReplayValidator/bin/Debug/net8.0/YARGReplayValidator.exe' : 'bin/YARGReplayValidator.exe')

  try {
    const parts = req.parts({ limits: { parts: 3 } })
    const fileFields = new Map<string, IReplayRegisterFileFieldObj>()
    const bodyMap = new Map<string, any>()

    // The file streams must be handler, otherwise the request will freeze here
    for await (const part of parts) {
      if (part.type === 'file') {
        let filePath: FilePath
        if (part.filename.endsWith('.replay')) filePath = replayPath
        else if (part.filename.endsWith('.mid')) filePath = midiPath
        else filePath = chartPath

        await pipeline(part.file, await filePath.createWriteStream())

        fileFields.set(part.fieldname, {
          path: filePath.path,
          fieldname: part.fieldname,
          filename: part.filename,
          encoding: part.encoding,
          mimetype: part.mimetype,
        })
      } else {
        bodyMap.set(part.fieldname, part.value)
      }
    }

    // It must have a file
    if (fileFields.size === 0) {
      throw new ServerError('err_replay_nofileuploaded')
    }

    // ...and one of these files must be the replay file
    if (!fileFields.has('replayFile')) {
      throw new ServerError('err_replay_nofileuploaded')
    }

    // Checking file signatures
    const replayMagic = (await replayPath.readOffset(0, 8)).toString()

    if (replayMagic !== 'YARGPLAY' && replayMagic !== 'YAREPLAY') {
      throw new ServerError('err_replay_invalid_magic')
    }

    if (midiPath.exists) {
      const midiMagic = (await midiPath.readOffset(0, 4)).toString()
      if (midiMagic !== 'MThd') {
        throw new ServerError('err_replay_invalid_midi_magic')
      }
    }

    if (chartPath.exists) {
      let chartMagicBytes = (await chartPath.readOffset(0, 9)).toString('hex')
      if (chartMagicBytes.startsWith('efbbbf')) chartMagicBytes = Buffer.from(chartMagicBytes.substring(6), 'hex').toString()
      if (chartMagicBytes !== '[Song]') {
        throw new ServerError('err_replay_invalid_chart_magic')
      }
    }

    this.log.info(Object.fromEntries(fileFields.entries()))

    let songPath: FilePath | undefined = undefined
    const chartFileType = fileFields.get('chartFile')
    if (!chartFileType) throw new ServerError('err_replay_missing_chart')
    if (chartFileType.filename.endsWith('.chart')) songPath = chartPath
    else songPath = midiPath

    this.log.info(songPath.path)

    const { stdout, stderr } = await execAsync(`${validatorPath.fullname} "${replayPath.path}"${songPath ? ` "${songPath.path}"` : ''}`, { cwd: validatorPath.root, windowsHide: true })
    if (stderr) {
      const errString = stderr.trim()
      if (errString.endsWith('Missing MIDI path/parse settings.')) throw new ServerError('err_replay_missing_chart')
      else if (errString.endsWith("REPLAY band score and simulated band score don't match.")) throw new ServerError('err_replay_invalid_chart')
      throw new ServerError('err_unknown', { error: stderr })
    }

    const data = processReplayValidator<YARGReplayValidatorHashResults>(JSON.parse(stdout))

    throw new ServerError('ok', data)

    serverReply(reply, 'ok', data)
  } catch (err) {
    if (replayPath.exists) await replayPath.delete()
    if (midiPath.exists) await midiPath.delete()
    if (chartPath.exists) await chartPath.delete()
    throw err
  }
}

// #region Error Handler

const replayRegisterErrorHandler: ControllerErrorHandler<IReplayRegisterController> = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })

  // Unknown error
  return serverReply(reply, 'err_not_implemented', { error: error, debug: ServerError.logErrors(error) }, { resolution: error.message })
}

// #region Opts

export const replayRegisterController = {
  routeOpts: {
    handler: replayRegisterHandler,
    errorHandler: replayRegisterErrorHandler,
  },
} as const
