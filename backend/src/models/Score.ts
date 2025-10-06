import { type Document, model, type Model, Schema } from 'mongoose'
import { Difficulty, Instrument } from './Song'

// #region Enums

export const Modifier = {
  AllStrums: 0,
  AllHopos: 1,
  AllTaps: 2,
  HoposToTaps: 3,
  TapsToHopos: 4,
  NoteShuffle: 5,
  NoKicks: 6,
  UnpitchedOnly: 7,
  NoDynamics: 8,
  NoVocalPercussion: 9,
  RangeCompress: 10,
} as const

export const Engine = {
  Default: 0,
  Casual: 1,
  Precision: 2,
} as const

export const GameMode = {
  // Game modes are reserved in multiples of 5
  // 0-4: Guitar
  FiveFretGuitar: 0,
  SixFretGuitar: 1,

  // 5-9: Drums
  FourLaneDrums: 5,
  FiveLaneDrums: 6,
  // EliteDrums = 7,

  // 10-14: Pro instruments
  ProGuitar: 10,
  ProKeys: 11,

  // 15-19: Vocals
  Vocals: 15,

  // 20-24: Other
  // Dj = 20,
} as const

export const GameVersion = {
  v0_13_1: 0,
}

//#region Types

export interface ScoreSchemaInput {
  song: Schema.Types.ObjectId
  uploader: Schema.Types.ObjectId
  replayPath: string
  replayFileHash: string
  childrenScores: Schema.Types.ObjectId[]
  version: (typeof GameVersion)[keyof typeof GameVersion]
  hidden: boolean
  instrument: (typeof Instrument)[keyof typeof Instrument]
  gamemode?: (typeof GameMode)[keyof typeof GameMode]
  difficulty?: (typeof Difficulty)[keyof typeof Difficulty]
  engine?: (typeof Engine)[keyof typeof Engine]
  modifiers: (typeof Modifier)[keyof typeof Modifier][]
  songSpeed: number
  createdAt: Date
  profileName?: string
  score: number
  stars: number
  notesHit?: number
  maxCombo?: number
  percent?: number
  starPowerPhrasesHit?: number
  starPowerActivationCount?: number
  overhits?: number
  ghostInputs?: number
  sustainScore?: number
  //averageMultiplier?: number
  soloBonuses?: number
  //numPauses?: number
  ghostNotesHit?: number
  accentNotesHit?: number
}

// Methods here
export interface ScoreSchemaDocument extends ScoreSchemaInput, Document {}

// Statics here
export interface ScoreSchemaModel extends Model<ScoreSchemaDocument> {
  findByHash(hash: string): Promise<ScoreSchemaDocument | null>
}

//#region Schema

const scoreSchema = new Schema<ScoreSchemaInput, ScoreSchemaModel>(
  {
    // system metadata
    song: {
      type: Schema.Types.ObjectId,
      ref: 'Song',
      required: true,
    },
    uploader: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    replayPath: {
      type: String,
      required: true,
    },
    replayFileHash: {
      // SHA-1 - while one replay upload can create multiple scores (i.e. band scores), this should be checked on score upload to ensure a replay file is uploaded a single time only
      type: String,
      required: true,
    },
    childrenScores: [
      // for band scores
      {
        type: Schema.Types.ObjectId,
        ref: 'Score',
        required: true,
      },
    ],
    version: {
      // which version of the game was used to parse this replay?
      type: Number,
      required: true,
      enum: Object.values(GameVersion),
    },
    hidden: {
      // cheated/bugged scores or banned users
      type: Boolean,
      default: false,
      required: true,
    },
    // main score metadata
    instrument: {
      type: Number,
      enum: Object.values(Instrument),
      required: true,
    },
    gamemode: {
      // can be null for band scores
      type: Number,
      enum: Object.values(GameMode),
    },
    difficulty: {
      // can be null for band scores
      type: Number,
      enum: Object.values(Difficulty),
    },
    engine: {
      // (Default / Casual / Precision) can be null for band scores
      type: Number,
      enum: Object.values(Engine),
    },
    modifiers: [
      {
        type: Number,
        required: true,
        enum: Object.values(Modifier),
      },
    ],
    songSpeed: {
      type: Number,
      required: true,
    },
    createdAt: {
      // can be fetched from server (upload time) or replay metadata; i'd rather go with server
      type: Schema.Types.Date,
      default: Date.now,
    },
    profileName: {
      type: String,
    },
    score: {
      type: Number,
      required: true,
    },
    stars: {
      type: Number,
      required: true,
    },
    notesHit: {
      // can be null for band scores
      // on vocals these are phrases
      type: Number,
    },
    maxCombo: {
      // can be null for band scores
      type: Number,
    },
    percent: {
      // this is needed for vocals since its % is calculated in ticks, and not phrases, but can be null for other instruments
      type: Number,
    },
    // less essential but "fun" score metadata (borrowed from scorespy)
    starPowerPhrasesHit: {
      // can be null for band scores
      type: Number,
    },
    starPowerActivationCount: {
      // can be null for band scores
      type: Number,
    },
    overhits: {
      // overstrums for 5-fret, unused in vocals (hence optional)
      type: Number,
    },
    ghostInputs: {
      // 5-fret only (hence optional)
      type: Number,
    },
    sustainScore: {
      // 5-fret only (hence optional)
      type: Number,
    },
    /*averageMultiplier: {
      // can be null for band scores
      type: Number,
    },*/
    soloBonuses: {
      // can be null for band scores
      type: Number,
    },
    /*numPauses: {
      // can be null for band scores
      type: Number,
    },*/
    ghostNotesHit: {
      // drums only
      type: Number,
    },
    accentNotesHit: {
      // drums only
      type: Number,
    },
  },
  {
    statics: {
      async findByHash(hash: string) {
        return await this.findOne({ replayFileHash: hash })
      },
    },
  }
)

export const Score = model<ScoreSchemaInput, ScoreSchemaModel>('Score', scoreSchema)
