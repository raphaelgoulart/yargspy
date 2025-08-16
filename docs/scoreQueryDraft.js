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

// Aggregate so only the top score of each user is returned, instead of _all_ scores
const pipeline = [
  { $match: mongoQuery }, // apply filters
  { $sort: Object.fromEntries(sortingMethod) }, // apply sort order
  {
    $group: {
      _id: "$uploader",               // group by uploader
      topScore: { $first: "$$ROOT" }, // take the first (thanks to sort order)
    }
  },
  { $replaceRoot: { newRoot: "$topScore" } } // flatten back
];

const results = await Score.aggregate(pipeline); // Note: returns lean JSON instead of Mongoose model object. Not a problem, though

// TODO: Ideally some pagination will be added as well, but I don't know the most performatic way to do it in Mongoose/MongoDB.
// Could be done by adding `$skip` / `$limit` after the `$replaceRoot` in the pipeline.