import { pipeline } from 'node:stream/promises'
import { TokenError } from 'fast-jwt'
import type { FilePath } from 'node-lib'
import type { RouteRequest, ServerErrorHandler, ServerHandler, ServerRequestFileFieldObject } from '../../lib.exports'
import { checkChartFilesIntegrity, createReplayRegisterTempPaths, createSongEntryInput, getChartFilePathFromSongEntry, getServerFile, isDev, parsePlayerModifiersForScoreEntry, YARGReplayValidatorAPI } from '../../utils.exports'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import { type Difficulty, Instrument, Song, type SongSchemaDocument } from '../../models/Song'
import { AdminAction, AdminLog } from '../../models/AdminLog'
import type { UserSchemaDocument } from '../../models/User'

export interface IAdminSongAddFileFieldsObject {
  chartFile: ServerRequestFileFieldObject
  songDataFile: ServerRequestFileFieldObject
}

// #region Handler

const adminSongAddHandler: ServerHandler = async function (req, reply) {
  const { chartTemp, dtaTemp, iniTemp, midiTemp, replayTemp, deleteAllTempFiles } = createReplayRegisterTempPaths()

  try {
    const parts = req.parts({ limits: { parts: 2 } })
    const fileFields = new Map<string, ServerRequestFileFieldObject>()

    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname === 'chartFile' || part.fieldname === 'songDataFile') {
          let filePath: FilePath

          if (part.filename.endsWith('.mid')) filePath = midiTemp
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
        throw new ServerError('err_invalid_input')
      }
    }

    const {
      chartFile: { filePath: chartFilePath },
      songDataFile: { filePath: songDataPath },
    } = Object.fromEntries(fileFields.entries()) as unknown as IAdminSongAddFileFieldsObject

    if (!chartFilePath || !songDataPath) throw new ServerError('err_song_songdata_required')
    const songHash = await chartFilePath.generateHash()
    if (await Song.findByHash(songHash)) throw new ServerError('err_song_duplicated_song')
    await checkChartFilesIntegrity(chartTemp, midiTemp)

    let eighthNoteHopo: boolean | undefined
    let hopoFreq: number | undefined

    const { eighthNoteHopo: e, hopoFreq: f, ...newSongEntryOptions } = await createSongEntryInput(chartFilePath, songHash, songDataPath)
    const songEntry = new Song(newSongEntryOptions)
    eighthNoteHopo = e
    hopoFreq = f

    const songInfo = await YARGReplayValidatorAPI.returnSongInfo(chartFilePath, songEntry, eighthNoteHopo, hopoFreq)

    // TODO: bunch of duplicate code, refactor later
    const { hopoFrequency } = songInfo
    if (songEntry.hopoFrequency === undefined && hopoFrequency >= 0) songEntry.hopoFrequency = hopoFrequency
    const availableInstruments: SongSchemaDocument['availableInstruments'] = []

    const instrObjKeys = Object.keys(songInfo.chartData.noteCount)
    for (const instrumentValue of instrObjKeys) {
      const partDiffObjKeys = Object.keys(songInfo.chartData.noteCount[instrumentValue])

      for (const partDifficultyValue of partDiffObjKeys) {
        availableInstruments.push({
          instrument: Number(instrumentValue) as (typeof Instrument)[keyof typeof Instrument],
          difficulty: Number(partDifficultyValue) as (typeof Difficulty)[keyof typeof Difficulty],
          notes: songInfo.chartData.noteCount[instrumentValue][partDifficultyValue],
          starPowerPhrases: songInfo.chartData.starPowerCount[instrumentValue][partDifficultyValue],
        })
      }
    }

    songEntry.availableInstruments = availableInstruments

    if (isDev() || process.env.FILE_ROOT) {
      await chartFilePath.copy(getChartFilePathFromSongEntry(songEntry))
      await chartFilePath.delete()
    } else {
      // TODO: on prod, upload to S3 instead of copy
      chartFilePath.delete() // delete local file after uploading to S3
    }
    await songDataPath.delete()
    await songEntry.save()
    new AdminLog({
      // log action (this can be async)
      admin: (req as RouteRequest<{ user: UserSchemaDocument }>).user,
      action: AdminAction.SongUpdate,
      item: songEntry,
    }).save()
    serverReply(reply, 'ok', { song: songEntry })
  } catch (err) {
    await deleteAllTempFiles()
    throw err
  }
}

// #region Error Handler

const adminSongAddErrorHandler: ServerErrorHandler = function (error, req, reply) {
  req.log.error(error)
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })

  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const adminSongAddController = {
  handler: adminSongAddHandler,
  errorHandler: adminSongAddErrorHandler,
} as const
