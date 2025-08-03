import { pipeline } from 'node:stream/promises'
import { TokenError } from 'fast-jwt'
import type { FilePath } from 'node-lib'
import { ServerError } from '../app.exports'
import { serverReply } from '../core.exports'
import type { FastifyErrorHandlerFn, FastifyFileFieldObject, FastifyHandlerFn } from '../lib.exports'
import { createReplayRegisterTempPaths, getValidatorPath, tempFolderCheck } from '../utils.exports'
import type { UserSchemaDocument } from '../models/User'

export interface IReplayRegister {
  decorators: { user?: UserSchemaDocument }
}

// #region Handler

const replayRegisterHandler: FastifyHandlerFn<IReplayRegister> = async function (req, reply) {
  // Check temp folder status
  await tempFolderCheck()
  const validatorPath = getValidatorPath()
  const { chartTemp, dtaTemp, iniTemp, midiTemp, replayTemp, deleteAllTempFiles } = createReplayRegisterTempPaths()

  try {
    const parts = req.parts({ limits: { parts: 4 } })
    const fileFields = new Map<string, FastifyFileFieldObject>()
    const bodyMap = new Map<string, any>()

    // The file streams must have a handler so the streamed data can reach somewhere, otherwise the request will freeze here and won't send any response
    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname === 'replayFile' || part.fieldname === 'chartFile' || part.fieldname === 'songDataFile') {
          const ext = part.filename.split('.')[1]
          let filePath: FilePath
          switch (ext) {
            case 'replay':
              filePath = replayTemp
              break
            case 'mid':
              filePath = midiTemp
              break
            case 'ini':
              filePath = iniTemp
              break
            case 'chart':
              filePath = chartTemp
              break
            case 'dta':
              filePath = dtaTemp
              break
            default:
              throw new ServerError('err_invalid_input')
          }

          await pipeline(part.file, await filePath.createWriteStream())

          fileFields.set(part.fieldname, {
            filePath: filePath.path,
            key: part.fieldname,
            fileName: part.filename,
            encoding: part.encoding,
            mimeType: part.mimetype,
          })
        } else throw new ServerError('err_invalid_input')
      } else {
        if (part.fieldname === 'reqType' && (part.value === 'complete' || part.value === 'replayOnly')) bodyMap.set(part.fieldname, part.value)
        else throw new ServerError('err_invalid_input')
      }
    }

    throw new ServerError('ok', {})
  } catch (err) {
    await deleteAllTempFiles()
    throw err
  }
}

// #region Error Handler

const replayRegisterErrorHandler: FastifyErrorHandlerFn<IReplayRegister> = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })

  // Unknown error
  return serverReply(reply, 'err_not_implemented', { error: error, debug: ServerError.logErrors(error) }, { resolution: error.message })
}

// #region Controller

export const replayRegisterController = {
  handler: replayRegisterHandler,
  errorHandler: replayRegisterErrorHandler,
} as const
