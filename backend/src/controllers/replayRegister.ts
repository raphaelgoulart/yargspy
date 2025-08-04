import { pipeline } from 'node:stream/promises'
import { TokenError } from 'fast-jwt'
import type { FilePath } from 'node-lib'
import { ServerError } from '../app.exports'
import { serverReply } from '../core.exports'
import type { FastifyErrorHandlerFn, FastifyFileFieldObject, FastifyHandlerFn } from '../lib.exports'
import { createReplayRegisterTempPaths, replayRegisterTempFileInputCheck, YARGReplayValidatorAPI } from '../utils.exports'
import type { UserSchemaDocument } from '../models/User'
import { Song } from '../models/Song'
import { Score } from '../models/Score'

export interface IReplayRegister {
  decorators: { user?: UserSchemaDocument }
}

export interface IReplayRegisterBody {
  reqType?: 'replayOnly' | 'complete'
}

export type IReplayRegisterFileFieldsObject = {
  [key in 'replayFile' | 'chartFile' | 'songDataFile']: FastifyFileFieldObject
}

// #region Handler

const replayRegisterHandler: FastifyHandlerFn<IReplayRegister> = async function (req, reply) {
  const { chartTemp, dtaTemp, iniTemp, midiTemp, replayTemp, deleteAllTempFiles } = createReplayRegisterTempPaths()

  try {
    const parts = req.parts({ limits: { parts: 4 } })
    const fileFields = new Map<string, FastifyFileFieldObject>()
    const bodyMap = new Map<string, any>()

    // The file streams must have a handler so the streamed data can reach somewhere,
    // otherwise the request will freeze here and won't send any response
    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname === 'replayFile' || part.fieldname === 'chartFile' || part.fieldname === 'songDataFile') {
          let filePath: FilePath

          if (part.filename.endsWith('.replay')) filePath = replayTemp
          else if (part.filename.endsWith('.mid')) filePath = midiTemp
          else if (part.filename.endsWith('.ini')) filePath = iniTemp
          else if (part.filename.endsWith('.chart')) filePath = chartTemp
          else if (part.filename.endsWith('.dta')) filePath = dtaTemp
          else throw new ServerError('err_invalid_input')

          await pipeline(part.file, await filePath.createWriteStream())

          fileFields.set(part.fieldname, {
            filePath: filePath,
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

    const { reqType } = Object.fromEntries(bodyMap.entries()) as IReplayRegisterBody

    if (!reqType) throw new ServerError('err_replay_register_no_reqtype')

    // It must have a file
    if (fileFields.size === 0) throw new ServerError('err_replay_nofileuploaded')

    // ...and one of these files must be the replay file
    if (!fileFields.has('replayFile')) throw new ServerError('err_replay_nofileuploaded')

    // ...and replay must not have been uploaded already
    const replayHash = await fileFields.get('replayFile')!.filePath.generateHash('sha256')
    if (await Score.findByHash(replayHash)) throw new ServerError('err_replay_alreadyuploaded') // TODO: NEW ERROR

    // This is for requests that we know it's provided only the REPLAY file by the request itself
    // Only two pathways:
    // - 1. The song doesn't exist in the DB, so the server replies the song data is required
    // - 2. The song exists or the song data have been supplied

    const replayOnly = (reqType === 'replayOnly');
    await replayRegisterTempFileInputCheck({ replayTemp, chartTemp, dtaTemp, iniTemp, midiTemp }, replayOnly);

    const songHash = await YARGReplayValidatorAPI.returnSongHash(replayTemp);
    let song = await Song.findByHash(songHash);
    const songFound = Boolean(song);

    if (replayOnly && !songFound) throw new ServerError('err_replay_songdata_required')

    // Here is when we know all needed files are provided
    // So we have to do a LOT of checks

    const {
      chartFile: { filePath: chartFilePath },
      replayFile: { filePath: replayFilePath },
      songDataFile: { filePath: songDataPath },
    } = Object.fromEntries(fileFields.entries()) as IReplayRegisterFileFieldsObject

    if (!songFound) { // If song isn't in database already...
      // Checks if the REPLAY file song hash matches the provided chart file hash
      const chartFileHash = await chartFilePath.generateHash('sha1')

      if (songHash !== chartFileHash) throw new ServerError('err_replay_songhash_nomatch', { songHash, chartFileHash })
      
      // TODO: 
      // Populate song object with ini/dta info (don't save to DB yet)
    }

    // Validate replay
    const reply = await YARGReplayValidatorAPI.returnReplayInfo(replayFilePath, chartFilePath, songFound) // TODO: add song/extra params
    // Throws a new server error so the server can delete all files (used for debugging)
    throw new ServerError('ok', reply);

    if (!songFound) {
        // Add remaining song info to song object (i.e. hopo_threshold, instruments diffs and notes etc.) then save to DB
        // TODO:
    }
    
    // TODO:
    // Create band score
    // For each player, save instrument score, adding it to band score's `childrenScores` variable
    // Save band score
  } catch (err) {
    await deleteAllTempFiles()
    throw err
  }
}

// #region Error Handler

const replayRegisterErrorHandler: FastifyErrorHandlerFn<IReplayRegister> = function (error, req, reply) {
  req.log.error(error)
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
