import mongoose from 'mongoose';

export const Difficulty = {
    Beginner: 0,
    Easy: 1,
    Medium: 2,
    Hard: 3,
    Expert: 4,
    ExpertPlus: 5,
};

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
    Band: 255 // byte.MaxValue
}

const songSchema = mongoose.Schema({
    // regular metadata
    name: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    charter: {
        type: String,
    },
    album: {
        type: String,
    },
    year: {
        type: String,
    },
    // chart-affecting metadata
    pro_drums: { //pro_drums //pro_drum
        type: Boolean,
    },
    five_lane_drums: {
        type: Boolean,
    },
    delay: {
        type: Number,
    },
    sustain_cutoff_threshold: {
        type: Number,
    },
    hopo_frequency: { //hopo_frequency //hopofreq //eighthnote_hopo
        type: Number,
    },
    multiplier_note: { //multiplier_note //star_power_note
        type: Number,
    },
    // system metadata (hash etc)
    checksum: { // SHA-1
        type: String,
        required: true
    },
    isChart: { // filename will be checksum + .chart if isChart, else .mid
        type: Boolean,
        required: true
    },
    availableInstruments: [ // should probably fetch these using YARG.Core for consistency with the actual game
        {
            instrument: {
                type: Number,
                required: true,
                enum: Object.keys(Instrument)
            },
            difficulty: {
                type: Number,
                required: true,
                enum: Object.keys(Difficulty)
            },
            notes: {
                type: Number,
                required: true
            }
        }
    ]
});

// custom methods
// TODO: method to select all scores for that song (in a given instrument/diff)
// (if a player has multiple scores, only the top-most in the selected criteria (score/notes hit) should be selected);
// TODO: method to find song by hash

const Song = mongoose.model('song', songSchema);
export default Song;