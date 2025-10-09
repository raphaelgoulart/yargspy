import { pipeline } from 'node:stream/promises'
import { TokenError } from 'fast-jwt'
import type { FilePath } from 'node-lib'
import type { RouteRequest, ServerErrorHandler, ServerHandler, ServerRequest, ServerRequestFileFieldObject } from '../../lib.exports'
import { checkChartFilesIntegrity, checkReplayFileIntegrity, createReplayRegisterTempPaths, createSongEntryInput, getChartFilePathFromSongEntry, getServerFile, isDev, parsePlayerModifiersForScoreEntry, YARGReplayValidatorAPI } from '../../utils.exports'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import { Engine, GameMode, GameVersion, Modifier, Score, type ScoreSchemaDocument } from '../../models/Score'
import { type Difficulty, Instrument, Song, type SongSchemaDocument } from '../../models/Song'
import type { UserSchemaDocument } from '../../models/User'
import type { Schema } from 'mongoose'

export interface IReplayRegisterBody {
  reqType?: 'replayOnly' | 'complete'
}

export interface IReplayRegisterFileFieldsObject {
  replayFile: ServerRequestFileFieldObject
  chartFile?: ServerRequestFileFieldObject
  songDataFile?: ServerRequestFileFieldObject
}

// #region Handler

const replayRegisterHandler: ServerHandler = async function (req, reply) {
  const { chartTemp, dtaTemp, iniTemp, midiTemp, replayTemp, deleteAllTempFiles } = createReplayRegisterTempPaths()
  const playerScores: ScoreSchemaDocument[] = []

  try {
    const parts = req.parts({ limits: { parts: 4 } })
    const fileFields = new Map<string, ServerRequestFileFieldObject>()
    const bodyMap = new Map<keyof IReplayRegisterBody, any>()

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

    // Must have a file in the request and one of these files must be the replay file
    if (fileFields.size === 0 || !fileFields.has('replayFile')) throw new ServerError('err_replay_no_replay_uploaded')

    const isReqReplayOnly = reqType === 'replayOnly'

    const {
      replayFile: { filePath: replayFilePath },
      ...completeFieldsObj
    } = Object.fromEntries(fileFields.entries()) as unknown as IReplayRegisterFileFieldsObject

    let chartFilePath: FilePath | null = null
    let songDataPath: FilePath | null = null

    if (completeFieldsObj.chartFile) chartFilePath = completeFieldsObj.chartFile.filePath
    if (completeFieldsObj.songDataFile) songDataPath = completeFieldsObj.songDataFile.filePath

    // Provided YARG REPLAY file must not have been uploaded already
    const scoreHash = await replayFilePath.generateHash()
    if (await Score.findByHash(scoreHash)) throw new ServerError('err_replay_duplicated_score')

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
    // and the request will register both song and score,
    // so we have to do a LOT of checks!

    // CHECK: Chart files integrity (magic bytes)
    await checkChartFilesIntegrity(chartTemp, midiTemp)
    // TODO: Since text is very hard to check integrity, maybe trying to parse both INI and DTA and reassure these files even
    //       exists would be a good idea to avoid any malicious file being injected in the server

    if (!isSongEntryFound) {
      // If song isn't in database already...
      // Narrowing down: For this path, chart and song data are required and must return an error if now provided
      if (!chartFilePath) throw new ServerError('err_replay_songdata_required')
      if (!songDataPath) throw new ServerError('err_replay_songdata_required')

      const { eighthNoteHopo: e, hopoFreq: f, ...newSongEntryOptions } = await createSongEntryInput(chartFilePath, songHash, songDataPath)
      songEntry = new Song(newSongEntryOptions)
      eighthNoteHopo = e
      hopoFreq = f
    } else {
      if (!songEntry) throw new ServerError('err_unknown', { error: "Unreachable code on 'src/controllers/replayRegister.ts'" })
      if (isDev() || process.env.FILE_ROOT) {
        chartFilePath = getChartFilePathFromSongEntry(songEntry)
      } else {
        // TODO: in prod, remove the line below, get file from S3 and put in temp folder if using AWS
        chartFilePath = getChartFilePathFromSongEntry(songEntry)
      }
    }

    // Unreacheable code: Either the song entry is found or filled with the provided chart and song metadata files above
    if (!songEntry) throw new ServerError('err_unknown', { error: "Unreachable code on 'src/controllers/replayRegister.ts'" })

    // Validate REPLAY file
    const replayInfo = await YARGReplayValidatorAPI.returnReplayInfo(replayFilePath, chartFilePath, isSongEntryFound, songEntry, eighthNoteHopo, hopoFreq)

    if (replayInfo.replayInfo.bandScore == 0) throw new ServerError('err_replay_no_notes_hit')

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

      if (isDev() || process.env.FILE_ROOT) {
        const newChartFilePath = await chartFilePath.copy(getChartFilePathFromSongEntry(songEntry))
        await chartFilePath.delete()
        chartFilePath = newChartFilePath
      } else {
        // TODO: on prod, upload to S3 instead of copy
        chartFilePath.delete() // delete local file after uploading to S3
      }
      if (songDataPath) await songDataPath.delete()
      await songEntry.save()
    }

    const user = (req as RouteRequest<{ user: UserSchemaDocument }>).user

    // Create band score (don't save yet)
    const bandScore = new Score({
      song: songEntry._id,
      uploader: user._id,
      replayPath: replayFilePath.name,
      replayFileHash: scoreHash,
      version: GameVersion.v0_13_1, // hardcoded: change on each stable update
      songSpeed: replayInfo.replayInfo.songSpeed,
      instrument: Instrument.Band,
      score: replayInfo.replayInfo.bandScore,
      stars: replayInfo.replayInfo.bandStars,
    })

    let bandScoreValid = true
    let validPlayers = 0
    let i = 0

    // Create player scores for each player (save)
    const childrenScores: Schema.Types.ObjectId[] = []
    const bandModifiers: (typeof Modifier)[keyof typeof Modifier][] = []

    for (const playerObj of replayInfo.replayData) {
      const playerData = playerObj.stats
      if (playerData.totalScore === 0) continue // don't save "non-players"

      const engine: (typeof Engine)[keyof typeof Engine] | -1 = Number(playerObj.engine) as (typeof Engine)[keyof typeof Engine] | -1
      if (engine === -1) {
        // TODO: can we return additional info warning that some players were ignored due to custom engines being unsupported?
        bandScoreValid = false
        continue
      }

      const playerStats = replayInfo.replayInfo.stats[i]
      const playerProfile = playerObj.profile

      const playerInstrument = Number(playerProfile.currentInstrument) as (typeof Instrument)[keyof typeof Instrument]
      const playerModifiers = playerProfile.currentModifiers === 0 ? undefined : parsePlayerModifiersForScoreEntry(playerProfile.currentModifiers)

      const playerScore = new Score({
        song: songEntry._id,
        uploader: user._id,
        replayPath: replayFilePath.name,
        replayFileHash: scoreHash,
        version: GameVersion.v0_13_1,
        songSpeed: replayInfo.replayInfo.songSpeed,
        instrument: playerInstrument,
        gamemode: Number(playerProfile.gameMode) as (typeof GameMode)[keyof typeof GameMode],
        difficulty: Number(playerProfile.currentDifficulty) as (typeof Difficulty)[keyof typeof Difficulty],
        engine,
        modifiers: playerModifiers,
        profileName: playerProfile.name,
        score: playerData.totalScore,
        stars: playerData.stars,
        notesHit: playerData.notesHit,
        maxCombo: playerData.maxCombo,
        starPowerPhrasesHit: playerData.starPowerPhrasesHit,
        starPowerActivationCount: playerData.starPowerActivationCount,
        //averageMultiplier: playerStats.averageMultiplier,
        soloBonuses: playerData.soloBonuses,
        //numPauses: playerStats.numPauses,
      })

      playerScore.percent = playerData.percent

      // Overstrum if 5/6-fret, overhit if drums/keys, neither if vocals
      if (playerData.overstrums !== undefined) playerScore.overhits = playerData.overstrums
      else if (playerData.overhits !== undefined) playerScore.overhits = playerData.overhits

      // These two values are 5/6-fret only
      if (playerData.ghostInputs !== undefined) playerScore.ghostInputs = playerData.ghostInputs
      if (playerData.sustainScore !== undefined) playerScore.sustainScore = playerData.sustainScore

      // These values are drums only
      if (playerData.ghostsHit !== undefined) playerScore.ghostNotesHit = playerData.ghostsHit
      if (playerData.accentsHit !== undefined) playerScore.accentNotesHit = playerData.accentsHit

      playerScores.push(playerScore.toJSON())
      await playerScore.save()

      childrenScores.push(playerScore._id as Schema.Types.ObjectId)

      // Add modifiers to band score if there are any
      // (making sure there are no repeats if multiple players used the same modifier)
      // TODO: test with multiple players
      if (bandScoreValid && playerModifiers && playerModifiers.length > 0) {
        for (const playerModifier of playerModifiers) {
          if (!bandModifiers.find((mod) => mod === playerModifier)) bandModifiers.push(playerModifier)
        }
      }

      validPlayers++
      i++
    }

    if (validPlayers === 0) throw new ServerError('err_replay_no_valid_players')

    bandScore.childrenScores = childrenScores
    bandScore.modifiers = bandModifiers

    // Move replay file
    if (isDev() || process.env.FILE_ROOT) {
      await replayFilePath.copy(getServerFile().gotoFile(`replay/${replayFilePath.fullname}`))
      await replayFilePath.delete()
    } else {
      // TODO: on prod, upload to S3 instead of copy
      replayFilePath.delete() // delete local file after uploading to S3
    }

    // Save band score (if valid)
    if (bandScoreValid) await bandScore.save()

    // Delete temp files if the player needlessly uploaded chart/metadata files despite the song already existing
    if (isSongEntryFound && !isReqReplayOnly) await deleteAllTempFiles()

    // Done! Reply with song ID for front-end redirection
    //serverReply(reply, 'success_replay_register', { playerScoreIDs: playerScores.map((score) => score._id), bandScoreID: bandScore._id })

    user.setCountryAndSave(req) // take opportunity to update the user's country flag (this can be async)
    serverReply(reply, 'success_replay_register', { song: songEntry._id })
  } catch (err) {
    await deleteAllTempFiles()
    throw err
  }
}

// #region Error Handler

const replayRegisterErrorHandler: ServerErrorHandler = function (error, req, reply) {
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
