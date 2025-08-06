import type { Difficulty, Instrument } from '../models/Song'

// #region Server Responses and internal objects
export interface GenericServerResponseObject {
  /**
   * The status code number.
   */
  statusCode: number
  /**
   * The status code name.
   */
  statusName: string
  /**
   * The status code number and name.
   */
  statusFullName: string
  /**
   * Internal code string that represents the status of the response.
   */
  code: string
  /**
   * A generic message of the response status (in English).
   */
  message: string
}

export interface GenericServerUserTokenObject {
  /**
   * The `ObjectID` of the user, encoded in Base64 string.
   */
  _id: string
  /**
   * Tells if the user has admin privileges.
   */
  admin: boolean
}

// #region YARGReplayValidator

export type ReplayCountObject = {
  [key in (typeof Instrument)[keyof typeof Instrument] as string]: {
    [key in (typeof Difficulty)[keyof typeof Difficulty] as string]: number
  }
}

export interface ReplayChecksumObject {
  hashBytes: string
}
export interface YARGReplayValidatorResults {
  replayInfo: {
    filePath: string
    replayName: string
    replayVersion: number
    engineVersion: number
    replayChecksum: ReplayChecksumObject
    songName: string
    artistName: string
    charterName: string
    songSpeed: number
    bandScore: number
    bandStars: number
    replayLength: number
    date: string
    songChecksum: ReplayChecksumObject
    stats: {
      '0': {
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
    '0': {
      profile: {
        id: string
        name: string
        isBot: boolean
        gameMode: number
        noteSpeed: number
        highwayLength: number
        leftyFlip: boolean
        rangeEnabled: boolean
        autoConnectOrder: null
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
        overstrums: number
        hoposStrummed: number
        ghostInputs: number
        committedScore: number
        pendingScore: number
        noteScore: number
        sustainScore: number
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

export interface YARGReplayValidatorHashResults {
  songChecksum: { hashBytes: string }
}
