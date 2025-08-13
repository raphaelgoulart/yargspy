// Warning: this is an untested DRAFT of how score querying for a given song will work, and not actual code (can _probably_ be turned into actual code later)
// I'm also using numbers instead of enums purely due to laziness. The real implementation should use enums accordingly.

//#region Variables
// Each leaderboard pertains to a song
const songId = 'objectID of song'

// Each instrument ("Band" counts as an instrument) has its own leaderboard
const instrument = 255;

// Each difficulty has its own leaderboard, EXCEPT FOR BAND - this value should be unused in the query if instrument is 255
const difficulty = 4;

// Each non-custom engine has its own leaderboard , EXCEPT FOR BAND - this value should be unused in the query if instrument is 255
const engine = 0;

// Modifiers can be filtered in or out by the user; by default we only allow the ones that make the song as difficult or harder
const allowedModifiers = [0, 4, 5, 8, 9, 10];

// Songs below 100% speed are hidden by default
const allowSlowdowns = false;

// Sorting can be done in two ways: Score-based (default) or Notes hit
const sortByNotesHit = false;

//#region Actual querying using the variables above
// Query
let mongoQuery = {
  song: songId,
  instrument: instrument,
  // Ensure no "modifier" exists outside of the allowed set
  modifiers: {
    $not: {
      $elemMatch: { modifier: { $nin: allowedModifiers } }
    }
  },
  hidden: false
}
if (instrument != 255) {// Only use these values if it's not a band (255) score
    query['difficulty'] = difficulty
    query['engine'] = engine
}
if (!allowSlowdowns) query['songSpeed'] = { $gte: 1 }

// Sorting method
const sortingMethod = sortByNotesHit ? [['notesHit', -1], ['maxCombo', -1], ['datetime', 1]] : [['score', -1], ['datetime', 1]]

const results = await Score.find(mongoQuery).sort(sortingMethod);

// TODO: Ideally some pagination will be added as well, but I don't know the most performatic way to do it in Mongoose/MongoDB.