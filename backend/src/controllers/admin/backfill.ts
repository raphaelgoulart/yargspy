import { TokenError } from 'fast-jwt'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler } from '../../lib.exports'
import { Difficulty, Instrument, Song, type SongSchemaDocument } from '../../models/Song'
import { getChartFilePathFromSongEntry, YARGReplayValidatorAPI } from '../../utils.exports'

// #region Handler

const adminBackfillHandler: ServerHandler = async function (req, reply) {
  const allSongs = await Song.find({})

  for (const songEntry of allSongs) {
    const chartFilePath = getChartFilePathFromSongEntry(songEntry)
    const songInfo = await YARGReplayValidatorAPI.returnSongInfo(chartFilePath, songEntry)

    const availableInstruments: SongSchemaDocument['availableInstruments'] = []
    const instrObjKeys = Object.keys(songInfo.chartData.noteCount)
    for (const instrumentValue of instrObjKeys) {
      const partDiffObjKeys = Object.keys(songInfo.chartData.noteCount[instrumentValue])

      for (const partDifficultyValue of partDiffObjKeys) {
        let noteArray = songInfo.chartData.noteCount[instrumentValue][partDifficultyValue] as number[]
        availableInstruments.push({
          instrument: Number(instrumentValue) as (typeof Instrument)[keyof typeof Instrument],
          difficulty: Number(partDifficultyValue) as (typeof Difficulty)[keyof typeof Difficulty],
          notes: noteArray[0], // chord-based noteCount for 5L
          notes5LK: noteArray[1] ?? undefined, // note-based noteCount for 5L, undefined for other instrument types
          starPowerPhrases: songInfo.chartData.starPowerCount[instrumentValue][partDifficultyValue] as number,
        })
      }
    }

    songEntry.availableInstruments = availableInstruments
    await songEntry.save()
  }

  serverReply(reply, 'ok', {
    processed: allSongs.length,
  })
}

// #region Error Handler

const adminBackfillErrorHandler: ServerErrorHandler = function (error, req, reply) {
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const adminBackfillController = {
  errorHandler: adminBackfillErrorHandler,
  handler: adminBackfillHandler,
} as const
