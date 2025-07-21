import { type Document, type Model, model, Schema } from 'mongoose'

// #region Enums

export const Difficulty = {
  Beginner: 0,
  Easy: 1,
  Medium: 2,
  Hard: 3,
  Expert: 4,
  ExpertPlus: 5,
} as const

export const Instrument = {
  // Instruments are reserved in multiples of 10
  // 0-9: 5-fret guitar
  FiveFretGuitar: 0,
  FiveFretBass: 1,
  FiveFretRhythm: 2,
  FiveFretCoopGuitar: 3,
  Keys: 4,
  // 10-19: 6-fret guitar
  SixFretGuitar: 10,
  SixFretBass: 11,
  SixFretRhythm: 12,
  SixFretCoopGuitar: 13,
  // 20-29: Drums
  FourLaneDrums: 20,
  ProDrums: 21,
  FiveLaneDrums: 22,
  EliteDrums: 23,
  // 30-39: Pro instruments
  ProGuitar_17Fret: 30,
  ProGuitar_22Fret: 31,
  ProBass_17Fret: 32,
  ProBass_22Fret: 33,
  ProKeys: 34,
  // 40-49: Vocals
  Vocals: 40,
  Harmony: 41,
  // 50-59: DJ
  // DjSingle: 50,
  // DjDouble: 51,
  Band: 255, // byte.MaxValue
} as const

// #region Types

export interface SongSchemaInput {
  name: string
  artist: string
  charter?: string
  album?: string
  year?: string
  pro_drums?: boolean
  five_lane_drums?: boolean
  sustain_cutoff_threshold?: number
  hopo_frequency?: number
  multiplier_note?: number
  checksum: string
  isChart: boolean
  isRb3con: boolean
  availableInstruments: {
    instrument: (typeof Instrument)[keyof typeof Instrument]
    difficulty: (typeof Difficulty)[keyof typeof Difficulty]
    notes: number
  }[]
}
// Methods here
export interface SongSchemaDocument extends SongSchemaInput, Document {}

// Statics here
export interface SongSchemaModel extends Model<SongSchemaDocument> {
  findBySongHash(hash: string): Promise<SongSchemaDocument | null>
}

// #region Schema

const songSchema = new Schema<SongSchemaInput, SongSchemaModel>(
  {
    // regular metadata
    name: { type: String, required: true },
    artist: { type: String, required: true },
    charter: { type: String },
    album: { type: String },
    year: { type: String },
    // chart-affecting metadata
    pro_drums: {
      //pro_drums //pro_drum
      type: Boolean,
    },
    five_lane_drums: { type: Boolean },
    sustain_cutoff_threshold: { type: Number },
    hopo_frequency: {
      //hopo_frequency //hopofreq //eighthnote_hopo
      type: Number,
    },
    multiplier_note: {
      //multiplier_note //star_power_note
      type: Number,
    },
    // system metadata (hash etc)
    // SHA-1
    checksum: { type: String, required: true },
    // filename will be checksum + .chart if isChart, else .mid
    isChart: { type: Boolean, required: true },
    isRb3con: { type: Boolean, default: false, required: true }, // info needed for replay validation
    // should probably fetch these using YARG.Core for consistency with the actual game
    availableInstruments: [
      {
        instrument: {
          type: Number,
          required: true,
          enum: Object.values(Instrument),
        },
        difficulty: {
          type: Number,
          required: true,
          enum: Object.values(Difficulty),
        },
        notes: {
          type: Number,
          required: true,
        },
        starPowerPhrases: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    statics: {
      async findBySongHash(hash: string) {
        const song = await this.findOne({ checksum: hash })

        return song
      },
    },
  }
)

// custom methods
// TODO: method to select all scores for that song (in a given instrument/diff)
// (if a player has multiple scores, only the top-most in the selected criteria (score/notes hit) should be selected);

export const Song = model<SongSchemaInput, SongSchemaModel>('Song', songSchema)
