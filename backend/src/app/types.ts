import type { Multipart, MultipartFile } from '@fastify/multipart'
import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply, RouteGenericInterface, ContextConfigDefault, FastifySchema, preHandlerHookHandler } from 'fastify'
import type { FastifyAuthFunction, FastifyAuthRelation } from '@fastify/auth'

// #region Controllers
export interface ControllerHandler<T extends RouteGenericInterface, D extends object = {}> {
  (this: FastifyInstance, req: FastifyRequest<T> & D, reply: FastifyReply<T>): any
}
export interface ControllerErrorHandler<T extends RouteGenericInterface> {
  (this: FastifyInstance, error: FastifyError, req: FastifyRequest<T>, reply: FastifyReply<T>): FastifyReply
}
export interface ControllerAuthFunction<T extends RouteGenericInterface, D extends object = {}> {
  (this: FastifyInstance, request: FastifyRequest<T> & D, reply: FastifyReply<T>, done: (error?: Error) => void): void
}

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

//  #region Fastify Decorators
export interface FastifyInstanceWithAuth extends FastifyInstance {
  auth<Request extends FastifyRequest = FastifyRequest, Reply extends FastifyReply = FastifyReply>(
    functions: FastifyAuthFunction<Request, Reply>[] | (FastifyAuthFunction<Request, Reply> | FastifyAuthFunction<Request, Reply>[])[],
    options?: {
      relation?: FastifyAuthRelation
      run?: 'all'
    }
  ): preHandlerHookHandler<any, any, any, RouteGenericInterface, ContextConfigDefault, FastifySchema, any, any>
}

export interface FastifyMultipartObject<F extends Record<string, Multipart> = {}> extends Omit<MultipartFile, 'fields'> {
  fields: F
}

// #region YARGReplayValidator

// ???
export interface ReplayCountObject {
  [key: '0' | '1' | '2' | '3' | string]: { [key: '0' | '1' | '2' | '3' | '4' | string]: number }
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
