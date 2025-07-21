import { Document, model, Model, Schema } from 'mongoose'
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

//#region Types

export interface ScoreSchemaInput {
  song: Schema.Types.ObjectId
  uploader: Schema.Types.ObjectId
  filePath: string
  checksum: string
  childrenScores: { score: Schema.Types.ObjectId }[]
  nightly: boolean
  yargCoreCommit: string
  hidden: boolean
  instrument: (typeof Instrument)[keyof typeof Instrument]
  difficulty?: number
  engine?: number
  modifiers: { modifier: (typeof Modifier)[keyof typeof Modifier] }[]
  songSpeed: number
  datetime: Date
  profileName: string
  score: number
  stars: number
  notesHit: number
  maxCombo: number
  percent: number
  starPowerPhrasesHit: number
  starPowerActivationCount: number
  overhits: number
  ghostInputs: number
  sustainScore: number
  averageMultiplier: number
  soloBonuses: number
  numPauses: number
}

// Methods here
export interface ScoreSchemaDocument extends ScoreSchemaInput, Document {}

// Statics here
export interface ScoreSchemaModel extends Model<ScoreSchemaDocument> {}

//#region Schema

const scoreSchema = new Schema<ScoreSchemaInput, ScoreSchemaModel>({
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
  filePath: {
    type: String,
    required: true,
  },
  checksum: {
    // SHA-1 - while one replay upload can create multiple scores (i.e. band scores), this should be checked on score upload to ensure a replay file is uploaded a single time only
    type: String,
    required: true,
  },
  childrenScores: [
    // for band scores
    {
      score: {
        type: Schema.Types.ObjectId,
        ref: 'Score',
        required: true,
      },
    },
  ],
  nightly: {
    // stable build or nightly build?
    type: Boolean,
    required: true,
  },
  yargCoreCommit: {
    // which version of YARG.Core was used to parse this replay?
    type: String,
    required: true,
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
    required: true,
    enum: Object.values(Instrument),
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
      modifier: {
        type: Number,
        required: true,
        enum: Object.values(Modifier),
      },
    },
  ],
  songSpeed: {
    type: Number,
    required: true,
  },
  datetime: {
    // can be fetched from server (upload time) or replay metadata; i'd rather go with server
    type: Date,
    required: true,
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
    // on vocals these are phrases
    type: Number,
    required: true,
  },
  maxCombo: {
    type: Number,
    required: true,
  },
  percent: {
    // this is needed for vocals since its % is calculated in ticks, and not phrases, but can be null for other instruments
    type: Number,
  },
  // less essential but "fun" score metadata (borrowed from scorespy)
  starPowerPhrasesHit: {
    type: Number,
    required: true,
  },
  starPowerActivationCount: {
    type: Number,
    required: true,
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
  averageMultiplier: {
    type: Number,
    required: true,
  },
  soloBonuses: {
    type: Number,
    required: true,
  },
  numPauses: {
    type: Number,
    required: true,
  },
  // the following stats aren't included in replay metadata yet, but might be in the future
  /*ghostNotesHit: { // drums only
        type: Number,
    },
    accentNotesHit: { // drums only
        type: Number,
    }*/
})

export const Score = model('Score', scoreSchema)
