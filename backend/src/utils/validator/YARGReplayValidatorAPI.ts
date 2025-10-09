import { execAsync, pathLikeToFilePath, type BufferEncodingOrNull, type FilePathLikeTypes } from 'node-lib'
import { ServerError } from '../../app.exports'
import type { Difficulty, Instrument, SongSchemaDocument } from '../../models/Song'
import { booleanToString, getValidatorPath, isDev } from '../../utils.exports'

export type ReplayCountObject = {
  [key in (typeof Instrument)[keyof typeof Instrument] as string]: {
    [key in (typeof Difficulty)[keyof typeof Difficulty] as string]: number
  }
}

export interface ReplayChecksumObject {
  hashBytes: string
}

export interface YARGReplayValidatorHashResults {
  songChecksum: { hashBytes: string }
}

export interface YARGReplayValidatorResults {
  replayInfo: {
    filePath: string
    replayName: string
    replayVersion: number
    engineVersion: number
    replayChecksum: YARGReplayValidatorHashResults['songChecksum']
    songName: string
    artistName: string
    charterName: string
    songSpeed: number
    bandScore: number
    bandStars: number
    replayLength: number
    date: string
    songChecksum: YARGReplayValidatorHashResults['songChecksum']
    stats: {
      [key: `${number}`]: {
        totalNotes: number
        numNotesHit: number
        percentageHit: number
        overstrums: number
        ghostInputs: number
        soloBonuses: number
        playerName: string
        score: number
        stars: number
        totalOverdrivePhrases: number
        numOverdrivePhrasesHit: number
        numOverdriveActivations: number
        averageMultiplier: number
        numPauses: number
      }
    }
  }
  replayData: {
    [key: `${number}`]: {
      profile: {
        id: string
        name: string
        isBot: boolean
        gameMode: number
        noteSpeed: number
        highwayLength: number
        leftyFlip: boolean
        rangeEnabled: boolean
        useCymbalModels: boolean
        splitProTomsAndCymbals: boolean
        swapSnareAndHiHat: boolean
        swapCrashAndRide: boolean
        autoConnectOrder: any
        inputCalibrationMilliseconds: number
        enginePreset: string
        themePreset: string
        colorProfile: string
        cameraPreset: string
        highwayPreset: string
        currentInstrument: number
        currentDifficulty: number
        difficultyFallback: number
        harmonyIndex: number
        inputCalibrationSeconds: number
        hasValidInstrument: boolean
        currentModifiers: number
      }
      stats: {
        overhits?: number
        sustainScore?: number
        ghostsHit?: number
        accentsHit?: number
        ghostInputs?: number

        overstrums: number
        hoposStrummed: number
        committedScore: number
        pendingScore: number
        noteScore: number
        multiplierScore: number
        combo: number
        maxCombo: number
        scoreMultiplier: number
        notesHit: number
        totalNotes: number
        starPowerTickAmount: number
        totalStarPowerTicks: number
        totalStarPowerBarsFilled: number
        starPowerActivationCount: number
        timeInStarPower: number
        starPowerWhammyTicks: number
        isStarPowerActive: boolean
        starPowerPhrasesHit: number
        totalStarPowerPhrases: number
        soloBonuses: number
        starPowerScore: number
        stars: number
        totalScore: number
        starScore: number
        comboInBandUnits: number
        bandComboUnits: number
        notesMissed: number
        percent: number
        starPowerPhrasesMissed: number
      }
      engine: number
    }
  }
  chartData: {
    noteCount: ReplayCountObject
    starPowerCount: ReplayCountObject
  }
  hopoFrequency: number
}

export interface FormattedYARGSongResults {
  chartData: {
    noteCount: ReplayCountObject
    starPowerCount: ReplayCountObject
  }
  hopoFrequency: number
}

export interface FormattedYARGReplayResults {
  replayInfo: {
    filePath: string
    replayName: string
    replayVersion: number
    engineVersion: number
    replayChecksum: string
    songName: string
    artistName: string
    charterName: string
    songSpeed: number
    bandScore: number
    bandStars: number
    replayLength: number
    date: string
    songChecksum: string
    stats: {
      totalNotes: number
      numNotesHit: number
      percentageHit: number
      overstrums: number
      ghostInputs: number
      soloBonuses: number
      playerName: string
      score: number
      stars: number
      totalOverdrivePhrases: number
      numOverdrivePhrasesHit: number
      numOverdriveActivations: number
      averageMultiplier: number
      numPauses: number
    }[]
  }
  replayData: {
    profile: {
      id: string
      name: string
      isBot: boolean
      gameMode: number
      noteSpeed: number
      highwayLength: number
      leftyFlip: boolean
      rangeEnabled: boolean
      useCymbalModels: boolean
      splitProTomsAndCymbals: boolean
      swapSnareAndHiHat: boolean
      swapCrashAndRide: boolean
      autoConnectOrder: any
      inputCalibrationMilliseconds: number
      enginePreset: string
      themePreset: string
      colorProfile: string
      cameraPreset: string
      highwayPreset: string
      currentInstrument: number
      currentDifficulty: number
      difficultyFallback: number
      harmonyIndex: number
      inputCalibrationSeconds: number
      hasValidInstrument: boolean
      currentModifiers: number
    }
    stats: {
      overhits?: number
      sustainScore?: number
      ghostsHit?: number
      accentsHit?: number
      ghostInputs?: number

      overstrums: number
      hoposStrummed: number
      committedScore: number
      pendingScore: number
      noteScore: number
      multiplierScore: number
      combo: number
      maxCombo: number
      scoreMultiplier: number
      notesHit: number
      totalNotes: number
      starPowerTickAmount: number
      totalStarPowerTicks: number
      totalStarPowerBarsFilled: number
      starPowerActivationCount: number
      timeInStarPower: number
      starPowerWhammyTicks: number
      isStarPowerActive: boolean
      starPowerPhrasesHit: number
      totalStarPowerPhrases: number
      soloBonuses: number
      starPowerScore: number
      stars: number
      totalScore: number
      starScore: number
      comboInBandUnits: number
      bandComboUnits: number
      notesMissed: number
      percent: number
      starPowerPhrasesMissed: number
    }
    engine: number
  }[]
  chartData: {
    noteCount: ReplayCountObject
    starPowerCount: ReplayCountObject
  }
  hopoFrequency: number
}

export class YARGReplayValidatorAPI {
  /**
   * Enum for read-mode `-m` parameter.
   */
  static readonly readMode = {
    replayOnly: 0,
    replayAndMidi: 1,
    midiOnly: 2,
    returnSongHash: 3,
  } as const

  private static unmountIndexObject(obj: Record<string, any>): any[] {
    const result: any[] = []

    for (const i in obj) {
      result.push(obj[i])
    }

    return result
  }

  static formatReplayInfoResults(results: YARGReplayValidatorResults): FormattedYARGReplayResults {
    const copy: Record<string, any> = { ...results }

    if (copy.replayInfo.replayChecksum.hashBytes) copy.replayInfo.replayChecksum = Buffer.from(copy.replayInfo.replayChecksum.hashBytes as string, 'base64').toString('hex')
    if (copy.replayInfo.songChecksum.hashBytes) copy.replayInfo.songChecksum = Buffer.from(copy.replayInfo.songChecksum.hashBytes as string, 'base64').toString('hex')

    if (copy.replayInfo.stats && Object.keys(copy.replayInfo.stats).length > 0) copy.replayInfo.stats = this.unmountIndexObject(copy.replayInfo.stats)

    if (copy.replayData && Object.keys(copy.replayData).length > 0) copy.replayData = this.unmountIndexObject(copy.replayData)

    return copy as FormattedYARGReplayResults
  }

  /**
   * Transforms the keys strings of a C#-key-style JSON object to camel case, used in JS environments.
   * - - - -
   * @template T
   * @param {Record<string, any>} obj The parsed JSON object to be transformed.
   * @returns {T}
   */
  static camelCaseKeyTransform<T extends object>(obj: Record<string, any>) {
    const output = new Map<string, any>()
    for (const objKeys of Object.keys(obj)) {
      const newKeys = `${objKeys.charAt(0).toLowerCase()}${objKeys.slice(1)}`
      const val = obj[objKeys] as unknown
      if (val && typeof val === 'object') output.set(newKeys, this.camelCaseKeyTransform(val))
      else output.set(newKeys, val)
    }

    return Object.fromEntries(output.entries()) as T
  }

  static formatErrorStringFromValidator(error: string) {
    return error.split('\n').map((e) => e.trim())[4]
  }

  /**
   * Reads a YARG REPLAY file and extracts the song's chart hash used to play this song.
   *
   * This method returns a raw unprocessed JSON object directly from the `YARGReplayValidator` process.
   * - - - -
   * @param {FilePathLikeTypes} replayFilePath The path to the YARG REPLAY file to extract the song's hash.
   * @returns {Promise<YARGReplayValidatorHashResults>}
   */
  static async returnSongHashRaw(replayFilePath: FilePathLikeTypes): Promise<YARGReplayValidatorHashResults> {
    const validatorPath = getValidatorPath()
    const replayFile = pathLikeToFilePath(replayFilePath)

    const dotnetExecutable = process.env.DOTNET_PATH ? process.env.DOTNET_PATH : 'dotnet'
    const prefix = process.platform === 'win32' ? '' : `${dotnetExecutable} `
    const command = `${prefix}"${validatorPath.fullname}" "${replayFile.path}" -m ${this.readMode.returnSongHash}`
    const { stdout, stderr } = await execAsync(command, { cwd: validatorPath.root, windowsHide: true })
    if (stderr) throw new ServerError('err_unknown', { error: stderr, errorOrigin: 'YARGReplayValidatorAPI.returnSongHash()' })

    return this.camelCaseKeyTransform<YARGReplayValidatorHashResults>(JSON.parse(stdout))
  }

  /**
   * Reads a YARG REPLAY file and extracts the song's chart hash used to play this song.
   * - - - -
   * @param {FilePathLikeTypes} replayFilePath The path to the YARG REPLAY file to extract the song's hash.
   * @param {BufferEncodingOrNull} [encoding] `OPTIONAL` The encoding of the hash. Default is `'hex'`.
   * @returns {Promise<string>}
   */
  static async returnSongHash(replayFilePath: FilePathLikeTypes, encoding: BufferEncodingOrNull = 'hex'): Promise<string> {
    const replayFile = pathLikeToFilePath(replayFilePath)
    const {
      songChecksum: { hashBytes: checksumRaw },
    } = await this.returnSongHashRaw(replayFile)

    return Buffer.from(checksumRaw, 'base64').toString(encoding ?? 'hex')
  }

  static async returnReplayInfo(replayFilePath: FilePathLikeTypes, chartFilePath: FilePathLikeTypes, isSongEntryFound: boolean, song: SongSchemaDocument, eighthNoteHopo?: boolean, hopoFreq?: number): Promise<FormattedYARGReplayResults> {
    const validatorPath = getValidatorPath()
    const replayFile = pathLikeToFilePath(replayFilePath)
    const chartFile = pathLikeToFilePath(chartFilePath)

    const readMode = isSongEntryFound ? this.readMode.replayOnly : this.readMode.replayAndMidi

    const dotnetExecutable = process.env.DOTNET_PATH ? process.env.DOTNET_PATH : 'dotnet'
    const prefix = process.platform === 'win32' ? '' : `${dotnetExecutable} `
    let command = `${prefix}"./${validatorPath.fullname}" "${replayFile.path}" "${chartFile.path}" -m ${readMode}`

    // Input parameters from Song model
    if (song.isRb3con) command += ' -c true'
    if (song.proDrums !== undefined) command += ` -p ${booleanToString(song.proDrums)}`
    if (song.fiveLaneDrums !== undefined) command += ` -g ${booleanToString(song.fiveLaneDrums)}`
    if (song.sustainCutoffThreshold !== undefined) command += ` -s ${song.sustainCutoffThreshold.toString()}`
    if (song.multiplierNote !== undefined) command += ` -n ${song.multiplierNote.toString()}`

    // Other input params
    if (eighthNoteHopo !== undefined) command += ` -e ${booleanToString(eighthNoteHopo)}`
    if (hopoFreq !== undefined) command += ` -f ${hopoFreq.toString()}`

    const { stdout, stderr } = await execAsync(command, { cwd: validatorPath.root, windowsHide: true })
    if (stderr) throw new ServerError('err_unknown', isDev() ? { error: this.formatErrorStringFromValidator(stderr), errorOrigin: 'YARGReplayValidatorAPI.returnReplayInfo()' } : {})

    return this.formatReplayInfoResults(this.camelCaseKeyTransform<YARGReplayValidatorResults>(JSON.parse(stdout)))
  }

  static async returnSongInfo(chartFilePath: FilePathLikeTypes, song: SongSchemaDocument, eighthNoteHopo?: boolean, hopoFreq?: number): Promise<FormattedYARGSongResults> {
    // TODO: bunch of duplicate code, refactor later
    const validatorPath = getValidatorPath()
    const chartFile = pathLikeToFilePath(chartFilePath)

    const readMode = this.readMode.midiOnly

    const dotnetExecutable = process.env.DOTNET_PATH ? process.env.DOTNET_PATH : 'dotnet'
    const prefix = process.platform === 'win32' ? '' : `${dotnetExecutable} `
    let command = `${prefix}"./${validatorPath.fullname}" _ "${chartFile.path}" -m ${readMode}`

    // Input parameters from Song model
    if (song.isRb3con) command += ' -c true'
    if (song.proDrums !== undefined) command += ` -p ${booleanToString(song.proDrums)}`
    if (song.fiveLaneDrums !== undefined) command += ` -g ${booleanToString(song.fiveLaneDrums)}`
    if (song.sustainCutoffThreshold !== undefined) command += ` -s ${song.sustainCutoffThreshold.toString()}`
    if (song.multiplierNote !== undefined) command += ` -n ${song.multiplierNote.toString()}`

    // Other input params
    if (eighthNoteHopo !== undefined) command += ` -e ${booleanToString(eighthNoteHopo)}`
    if (hopoFreq !== undefined) command += ` -f ${hopoFreq.toString()}`

    const { stdout, stderr } = await execAsync(command, { cwd: validatorPath.root, windowsHide: true })
    if (stderr) throw new ServerError('err_unknown', isDev() ? { error: this.formatErrorStringFromValidator(stderr), errorOrigin: 'YARGReplayValidatorAPI.returnSongInfo()' } : {})

    return this.camelCaseKeyTransform<FormattedYARGSongResults>(JSON.parse(stdout))
  }
}
