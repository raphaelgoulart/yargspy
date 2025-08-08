import { pipeline } from 'node:stream/promises'
import { TokenError } from 'fast-jwt'
import type { FilePath } from 'node-lib'
import type { ServerErrorHandler, ServerHandler, ServerRequestFileFieldObject } from '../../lib.exports'
import { checkChartFilesIntegrity, checkReplayFileIntegrity, createReplayRegisterTempPaths, createSongEntryInput, getChartFilePathFromSongEntry, isDev, YARGReplayValidatorAPI } from '../../utils.exports'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import { Score } from '../../models/Score'
import { type Difficulty, type Instrument, Song, type SongSchemaDocument } from '../../models/Song'
import type { UserSchemaDocument } from '../../models/User'

export interface IReplayRegister {
  decorators: { user?: UserSchemaDocument }
}

export interface IReplayRegisterBody {
  reqType?: 'replayOnly' | 'complete'
}

export interface IReplayRegisterFileFieldsObject {
  replayFile: ServerRequestFileFieldObject
  chartFile?: ServerRequestFileFieldObject
  songDataFile?: ServerRequestFileFieldObject
}

// #region Handler

const replayRegisterHandler: ServerHandler<IReplayRegister> = async function (req, reply) {
  const { chartTemp, dtaTemp, iniTemp, midiTemp, replayTemp, deleteAllTempFiles } = createReplayRegisterTempPaths()

  try {
    const parts = req.parts({ limits: { parts: 4 } })
    const fileFields = new Map<string, ServerRequestFileFieldObject>()
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
    if (fileFields.size === 0) throw new ServerError('err_replay_no_replay_uploaded')

    // CHECK: One of these files must be the replay file
    if (!fileFields.has('replayFile')) throw new ServerError('err_replay_no_replay_uploaded')

    const isReqReplayOnly = reqType === 'replayOnly'

    const {
      replayFile: { filePath: replayFilePath },
      ...completeFieldsObj
    } = Object.fromEntries(fileFields.entries()) as unknown as IReplayRegisterFileFieldsObject

    let chartFilePath: FilePath | null = null
    let songDataPath: FilePath | null = null

    if (completeFieldsObj.chartFile) chartFilePath = completeFieldsObj.chartFile.filePath
    if (completeFieldsObj.songDataFile) songDataPath = completeFieldsObj.songDataFile.filePath

    // CHECK: Provided YARG REPLAY file must not have been uploaded already
    const scoreHash = await replayFilePath.generateHash()
    if (await Score.findByHash(scoreHash)) throw new ServerError('err_replay_duplicated_score')

    // CHECK: Replay file integrity (magic bytes)
    // TODO: Better REPLAY file check (maybe entire header?)
    await checkReplayFileIntegrity(replayTemp)

    const songHash = await YARGReplayValidatorAPI.returnSongHash(replayTemp)
    let songEntry = await Song.findByHash(songHash)
    const isSongEntryFound = Boolean(songEntry)

    // If there's no entry for the song played on the REPLAY file for REPLAY only requests, throw songdata required error response
    if (isReqReplayOnly && !isSongEntryFound) throw new ServerError('err_replay_songdata_required')

    let eighthNoteHopo: boolean | undefined
    let hopoFreq: number | undefined

    // Here is when we know all needed files are provided
    // So we have to do a LOT of checks

    // CHECK: Chart files integrity (magic bytes)
    await checkChartFilesIntegrity(chartTemp, midiTemp)
    // TODO: Since text is very hard to check integrity, maybe trying to parse
    //       both INI and DTA and reassure these files even
    //       exists would be a good idea to avoid any malicious file
    //       being injected in the server

    if (!isSongEntryFound) {
      // If song isn't in database already...
      // Narrowing down: For this path, chart and song data are required and must return an error if now provided
      if (!chartFilePath) throw new ServerError('err_replay_songdata_required')
      if (!songDataPath) throw new ServerError('err_replay_songdata_required')

      // Checks if the REPLAY file song hash matches the provided chart file hash
      const chartFileHash = await chartFilePath.generateHash('sha1')
      if (songHash !== chartFileHash) throw new ServerError('err_replay_songhash_nomatch')

      const { eighthNoteHopo: e, hopoFreq: f, ...newSongEntryOptions } = await createSongEntryInput(chartFilePath, chartFileHash, songDataPath)
      songEntry = new Song(newSongEntryOptions)
      eighthNoteHopo = e
      hopoFreq = f
    } else {
      if (!songEntry) throw new ServerError('err_unknown', { error: "Unreachable code on 'src/controllers/replayRegister.ts', line 132" })
      // TODO: test
      // TODO: in prod get file from S3 and put in temp folder if using AWS
      chartFilePath = getChartFilePathFromSongEntry(songEntry) // TODO: if DEV only
    }

    // Unreacheable code: Either the song entry is found or filled with the provided chart and song metadata files above
    if (!songEntry) throw new ServerError('err_unknown', { error: "Unreachable code on 'src/controllers/replayRegister.ts', line 139" })

    // Validate REPLAY file
    const replayInfo = await YARGReplayValidatorAPI.returnReplayInfo(replayFilePath, chartFilePath, isSongEntryFound, songEntry, eighthNoteHopo, hopoFreq)

    if (!isSongEntryFound) {
      // Add remaining song info to song object (i.e. hopo_threshold, instruments diffs and notes etc.) then save to DB
      const { hopoFrequency } = replayInfo
      if (songEntry.hopoFrequency === undefined && hopoFrequency >= 0) songEntry.hopoFrequency = hopoFrequency
      const availableInstruments: SongSchemaDocument['availableInstruments'] = []

      const instrObjKeys = Object.keys(replayInfo.chartData.noteCount)
      for (const instrumentValue of instrObjKeys) {
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

      if (isDev()) {
        await chartFilePath.rename(getChartFilePathFromSongEntry(songEntry));
      } else {
        // TODO: on prod, upload to S3 instead of copy
        await chartFilePath.delete();
      }
      await songDataPath!.delete();
      await songEntry.save()
    }

    throw new ServerError('ok', { replayInfo, songEntry: songEntry.toJSON(), hopoFreq, eighthNoteHopo }) // TODO: DEBUG REMOVE LATER
  } catch (err) {
    await deleteAllTempFiles()
    throw err
  }
}

// #region Error Handler

const replayRegisterErrorHandler: ServerErrorHandler<IReplayRegister> = function (error, req, reply) {
  req.log.error(error)
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })

  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const replayRegisterController = {
  handler: replayRegisterHandler,
  errorHandler: replayRegisterErrorHandler,
} as const
