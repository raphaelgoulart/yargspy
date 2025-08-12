import { pipeline } from 'node:stream/promises'
import { TokenError } from 'fast-jwt'
import type { FilePath } from 'node-lib'
import type { ServerErrorHandler, ServerHandler, ServerRequest, ServerRequestFileFieldObject } from '../../lib.exports'
import { checkChartFilesIntegrity, checkReplayFileIntegrity, createReplayRegisterTempPaths, createSongEntryInput, getChartFilePathFromSongEntry, getServerPublic, isDev, YARGReplayValidatorAPI } from '../../utils.exports'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import { GameMode, GameVersion, Modifier, Score, type ScoreSchemaDocument } from '../../models/Score'
import { type Difficulty, Instrument, Song, type SongSchemaDocument } from '../../models/Song'
import type { UserSchemaDocument } from '../../models/User'

type RouteRequest = ServerRequest<IReplayRegister> & { user: UserSchemaDocument }

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

    // CHECK: Must have a file in the request and one
    // of these files must be the replay file
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
    else if (isReqReplayOnly && isSongEntryFound && songEntry) {
      // TODO: Logic for registering score for song that's already registered
    }

    let eighthNoteHopo: boolean | undefined
    let hopoFreq: number | undefined

    // Here is when we know all needed files are provided
    // and the request will register both song and score,
    // so we have to do a LOT of checks!

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
      if (!songEntry) throw new ServerError('err_unknown', { error: "Unreachable code on 'src/controllers/replayRegister.ts'" })
      // TODO: in prod get file from S3 and put in temp folder if using AWS
      chartFilePath = getChartFilePathFromSongEntry(songEntry) // TODO: if DEV only
    }

    // Unreacheable code: Either the song entry is found or filled with the provided chart and song metadata files above
    if (!songEntry) throw new ServerError('err_unknown', { error: "Unreachable code on 'src/controllers/replayRegister.ts'" })

    // Validate REPLAY file
    const replayInfo = await YARGReplayValidatorAPI.returnReplayInfo(replayFilePath, chartFilePath, isSongEntryFound, songEntry, eighthNoteHopo, hopoFreq)

    if (replayInfo.replayInfo.bandScore == 0) throw new ServerError('err_replay_no_notes_hit') // TODO: NEW ERROR

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
        await chartFilePath.rename(getChartFilePathFromSongEntry(songEntry))
      } else {
        // TODO: on prod, upload to S3 instead of copy
        chartFilePath.delete(); // delete local file after uploading to S3
      }
      if (songDataPath) await songDataPath.delete()
      await songEntry.save()
    }

    const replayFileName = replayFilePath.name
    const currentGameVersion = GameVersion.v0_13; // hardcoded: change on each stable update
    const user = (req as RouteRequest).user
    // Create band score (don't save yet)
    const bandScore = new Score({
        song: songEntry.id,
        uploader: user.id,
        filePath: replayFileName,
        checksum: scoreHash,
        version: currentGameVersion,
        songSpeed: replayInfo.replayInfo.songSpeed,
        instrument: Instrument.Band,
        score: replayInfo.replayInfo.bandScore,
        stars: replayInfo.replayInfo.bandStars
    })
    let bandScoreValid = true;
    let validPlayers = 0;
    // Create player scores for each player (save)
    const childrenScores: ScoreSchemaDocument['childrenScores'] = []
    const replayDataKeys = Object.keys(replayInfo.replayData)
    for (const playerNumber in replayDataKeys) {
        const playerData = replayInfo.replayData[playerNumber].stats;
        if (playerData.totalScore == 0) continue; // don't save "non-players"
        const engine = replayInfo.replayData[playerNumber].engine;
        if (engine == -1) {
            // TODO: can we return additional info warning that some players were ignored due to custom engines being unsupported?
            bandScoreValid = false;
            continue;
        }
        const playerStats = replayInfo.replayInfo.stats[playerNumber];
        const playerProfile = replayInfo.replayData[playerNumber].profile;
        
        const playerInstrument = Number(playerProfile.currentInstrument) as (typeof Instrument)[keyof typeof Instrument]
        const playerScore = new Score({
            song: songEntry.id,
            uploader: user.id,
            filePath: replayFileName,
            checksum: scoreHash,
            version: currentGameVersion,
            songSpeed: replayInfo.replayInfo.songSpeed,
            instrument: playerInstrument,
            gamemode: Number(playerProfile.gameMode) as (typeof GameMode)[keyof typeof GameMode],
            difficulty: Number(playerProfile.currentDifficulty) as (typeof Difficulty)[keyof typeof Difficulty],
            engine: engine,
            modifiers: playerProfile.currentModifiers == 0 ? undefined : parseModifiers(playerProfile.currentModifiers),
            profileName: playerProfile.name,
            score: playerData.totalScore,
            stars: playerData.stars,
            notesHit: playerData.notesHit,
            maxCombo: playerData.maxCombo,
            starPowerPhrasesHit: playerData.starPowerPhrasesHit,
            starPowerActivationCount: playerData.starPowerActivationCount,
            averageMultiplier: playerStats.averageMultiplier,
            soloBonuses: playerData.soloBonuses,
            numPauses: playerStats.numPauses,
        })
        // Only store percent if vocals
        if (playerInstrument in [Instrument.Vocals, Instrument.Harmony]) playerScore.percent = playerData.percent
        // Overstrum if 5/6-fret, overhit if drums/keys, neither if vocals
        if (playerData.overstrums !== undefined) playerScore.overhits = playerData.overstrums
        else if (playerData.overhits !== undefined) playerScore.overhits = playerData.overhits
        // These two values are 5/6-fret only
        if (playerData.ghostInputs !== undefined) playerScore.ghostInputs = playerData.ghostInputs
        if (playerData.sustainScore !== undefined) playerScore.sustainScore = playerData.sustainScore
        // These values are drums only
        if (playerData.ghostsHit !== undefined) playerScore.ghostNotesHit = playerData.ghostsHit
        if (playerData.accentsHit !== undefined) playerScore.accentNotesHit = playerData.accentsHit

        await playerScore.save();
        childrenScores.push({ score: playerScore.id });
        validPlayers++;
    }
    if (validPlayers == 0) throw new ServerError('err_replay_no_valid_players') // TODO: NEW ERROR
    bandScore.childrenScores = childrenScores
    // Move replay file
    if (isDev()) {
      await replayFilePath.rename(getServerPublic().gotoFile(`replay/${replayFileName}${replayFilePath.ext}`))
    } else {
      // TODO: on prod, upload to S3 instead of copy
      replayFilePath.delete(); // delete local file after uploading to S3
    }
    // Save band score
    await bandScore.save()
    // TODO: REPLACE WITH ACTUAL SUCCESS REPLY
    throw new ServerError('success_replay_register', { replayInfo, songEntry: songEntry.toJSON(), hopoFreq, eighthNoteHopo })
  } catch (err) {
    await deleteAllTempFiles()
    throw err
  }
}

// #region Helper functions MOVE LATER

function parseModifiers(currentModifiers: number): { modifier: (typeof Modifier)[keyof typeof Modifier] }[] {
    let arr: { modifier: (typeof Modifier)[keyof typeof Modifier] }[] = [];
    for (const [modifier, index] of Object.entries(Modifier)) {
        if ((currentModifiers >> index) % 2) arr.push({ modifier: index })
    }
    return arr;
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
