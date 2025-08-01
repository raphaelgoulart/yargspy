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
  let replayPath = packageDir.gotoFile(`public/replay/${uniqueFileName}.replay`)
  let midiPath = packageDir.gotoFile(`public/chart/${uniqueFileName}.mid`)    // TODO: mids/charts should be named after their hash(?)
  let chartPath = packageDir.gotoFile(`public/chart/${uniqueFileName}.chart`) // TODO: mids/charts should be named after their hash(?)
  let songPath = midiPath;
  let iniPath = packageDir.gotoFile(`public/metadata/${uniqueFileName}.ini`)
  let dtaPath = packageDir.gotoFile(`public/metadata/${uniqueFileName}.dta`)
  const validatorPath = packageDir.gotoFile(Boolean(process.env.DEV) ? '../YARGReplayValidator/bin/Debug/net8.0/YARGReplayValidator.exe' : 'bin/YARGReplayValidator.exe')

  try {
    const parts = req.parts({ limits: { parts: 3 } })
    const fileFields = new Map<string, IReplayRegisterFileFieldObj>()
    const bodyMap = new Map<string, any>()

    // The file streams must have a handler so the streamed data can reach somewhere, otherwise the request will freeze here
    for await (const part of parts) { // TODO: improve this so each file has to come from the correct variable
      if (part.type === 'file') {
        let filePath: FilePath
        if (part.fieldname == "replayFile" && part.filename.endsWith('.replay')) filePath = replayPath;
        else if (part.fieldname == "chartFile" && part.filename.endsWith('.mid')) {
          // TODO: change midiPath so its named [SHA-1 filehash].mid(?)
          filePath = midiPath
        } else if (part.fieldname == "chartFile" && part.filename.endsWith('.chart')) {
          // TODO: change chartPath so its named [SHA-1 filehash].mid(?)
          filePath = chartPath;
          songPath = filePath;
        }
        else if (part.fieldname == "metadataFile" && part.filename.endsWith('.ini')) {
          filePath = iniPath;
        }
        else if (part.fieldname == "metadataFile" && part.filename.endsWith('.dta')) {
          filePath = dtaPath;
        }
        else throw new ServerError('err_replay_unsupportedfile') // TODO: NEW ERROR

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

    // TODO: run validator to get replay song hash
    // TODO: try to find song in database via hash
    let songFound = false;

    if (!songFound) {
      if (!fileFields.get('chartFile')) throw new ServerError('err_replay_missing_chart')

      if (midiPath.exists) {
        const midiMagic = (await midiPath.readOffset(0, 4)).toString()
        if (midiMagic !== 'MThd') {
          throw new ServerError('err_replay_invalid_midi_magic')
        }
      }

      if (chartPath.exists) {
        let chartMagicBytes = (await chartPath.readOffset(0, 9)).toString('hex')
        // Excluding BOM from UTF-8 files
        if (chartMagicBytes.toLowerCase().startsWith('efbbbf')) chartMagicBytes = Buffer.from(chartMagicBytes.substring(6), 'hex').toString()
        if (chartMagicBytes !== '[Song]') {
          throw new ServerError('err_replay_invalid_chart_magic')
        }
      }

      // TODO: parse metadata for song/validator
    }

    const { stdout, stderr } = await execAsync(`${validatorPath.fullname} "${replayPath.path}"${songPath ? ` "${songPath.path}"` : ''}`, { cwd: validatorPath.root, windowsHide: true })

    // This is where the runtime errors from YARGReplayValidator must be taken
    if (stderr) {
      const errString = stderr.trim()
      if (errString.endsWith('Missing MIDI path/parse settings.')) throw new ServerError('err_replay_missing_chart')
      else if (errString.endsWith("REPLAY band score and simulated band score don't match.")) throw new ServerError('err_replay_invalid_chart')
      throw new ServerError('err_unknown', { error: stderr })
    }

    const data = processReplayValidator<YARGReplayValidatorHashResults>(JSON.parse(stdout))

    // TODO: if !songFound, save song
    // TODO: save replay in db

    if (iniPath.exists) await chartPath.delete()
    if (dtaPath.exists) await chartPath.delete()

    throw new ServerError('ok', data)

    serverReply(reply, 'ok', data)
  } catch (err) {
    if (replayPath.exists) await replayPath.delete()
    if (midiPath.exists) await midiPath.delete()
    if (chartPath.exists) await chartPath.delete()
    if (iniPath.exists) await chartPath.delete()
    if (dtaPath.exists) await chartPath.delete()
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
