import { TokenError } from 'fast-jwt'
import { ServerError } from '../app.exports'
import { serverReply } from '../core.exports'
import type { FastifyErrorHandlerFn, FastifyFileFieldObject, FastifyHandlerFn } from '../lib.exports'
import type { UserSchemaDocument } from '../models/User'
import { checkChartFilesIntegrity, checkReplayFileIntegrity, createReplayRegisterTempPaths, createSongEntryInput, YARGReplayValidatorAPI } from '../utils.exports'
import type { FilePath } from 'node-lib'
import { pipeline } from 'node:stream/promises'
import { Score } from '../models/Score'
import { Difficulty, Instrument, Song, type SongSchemaDocument } from '../models/Song'

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

    // CHECK: Must have a file in the request
    if (fileFields.size === 0) throw new ServerError('err_replay_nofileuploaded')

    // CHECK: One of these files must be the replay file
    if (!fileFields.has('replayFile')) throw new ServerError('err_replay_nofileuploaded')

    const {
      chartFile: { filePath: chartFilePath },
      replayFile: { filePath: replayFilePath },
      songDataFile: { filePath: songDataPath },
    } = Object.fromEntries(fileFields.entries()) as IReplayRegisterFileFieldsObject

    // CHECK: Provided YARG REPLAY file must not have been uploaded already
    const scoreHash = await replayFilePath.generateHash()
    if (await Score.findByHash(scoreHash)) throw new ServerError('err_replay_duplicated_score')

    // CHECK: Replay file integrity (magic bytes)
    await checkReplayFileIntegrity(replayTemp)

    // If there's no entry for the song played on the REPLAY file, throw songdata required error response
    const songHash = await YARGReplayValidatorAPI.returnSongHash(replayTemp)

    let songEntry = await Song.findByHash(songHash)
    const isSongEntryFound = Boolean(songEntry)
    let eighthNoteHopo: boolean | undefined
    let hopoFreq: number | undefined

    const isReqReplayOnly = reqType === 'replayOnly'
    if (isReqReplayOnly && !isSongEntryFound) throw new ServerError('err_replay_songdata_required')

    // Here is when we know all needed files are provided
    // So we have to do a LOT of checks

    // CHECK: Chart files integrity (magic bytes)

    // TODO: Better REPLAY file check (maybe header?)
    await checkChartFilesIntegrity(chartTemp, midiTemp)
    // TODO: Since text is very hard to check integrity, maybe trying to parse
    //       both INI and DTA and reassure these files even
    //       exists would be a good idea to avoid any malicious file
    //       being injected in the server

    if (!isSongEntryFound) {
      // If song isn't in database already...
      // Checks if the REPLAY file song hash matches the provided chart file hash
      const chartFileHash = await chartFilePath.generateHash('sha1')
      if (songHash !== chartFileHash) throw new ServerError('err_replay_songhash_nomatch', { songHash, chartFileHash })

      const { eighthNoteHopo: e, hopoFreq: f, ...newSongEntryOptions } = await createSongEntryInput(chartFilePath, chartFileHash, songDataPath)
      songEntry = new Song(newSongEntryOptions)
    }

    // Unreacheable code?
    if (!songEntry) throw new ServerError('err_unknown')

    // Validate REPLAY file
    const replayInfo = await YARGReplayValidatorAPI.returnReplayInfo(replayFilePath, chartFilePath, isSongEntryFound, songEntry, eighthNoteHopo, hopoFreq)

    if (!isSongEntryFound) {
      // Add remaining song info to song object (i.e. hopo_threshold, instruments diffs and notes etc.) then save to DB
      const { hopoFrequency } = replayInfo
      if (songEntry.hopoFrequency === undefined && hopoFrequency >= 0) songEntry.hopoFrequency = hopoFrequency
      const availableInstruments: SongSchemaDocument['availableInstruments'] = []

      const noteCountObjKeys = Object.keys(replayInfo.chartData.noteCount)
      for (const instrumentValue of noteCountObjKeys) {
        const partDiffObjKeys = Object.keys(replayInfo.chartData.noteCount[instrumentValue])

        for (const partDifficultyValue of partDiffObjKeys) {
          availableInstruments.push({
            instrument: Number(instrumentValue) as (typeof Instrument)[keyof typeof Instrument],
            difficulty: Number(partDifficultyValue) as (typeof Difficulty)[keyof typeof Difficulty],
            notes: replayInfo.chartData.noteCount[instrumentValue][partDifficultyValue],
            starPowerPhrases: replayInfo.chartData.starPowerCount[instrumentValue][partDifficultyValue],
          })
        }
      }

      songEntry.availableInstruments = availableInstruments
    }
    throw new ServerError('ok', { replayInfo, songEntry: songEntry.toJSON(), hopoFreq, eighthNoteHopo }) // TODO: DEBUG REMOVE LATER
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
