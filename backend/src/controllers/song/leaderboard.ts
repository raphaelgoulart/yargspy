import { TokenError } from 'fast-jwt'
import { ServerError } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerErrorHandler, ServerHandler } from '../../lib.exports'
import { Engine, Modifier, Score } from '../../models/Score'
import { Difficulty, Instrument } from '../../models/Song'
import { ObjectId } from 'mongodb'

export interface ISongLeaderboard {
    body: {
        id?: string,
        instrument?: (typeof Instrument)[keyof typeof Instrument],
        difficulty?: (typeof Difficulty)[keyof typeof Difficulty],
        engine?: (typeof Engine)[keyof typeof Engine],
        allowedModifiers?: Array<(typeof Modifier)[keyof typeof Modifier]>,
        allowSlowdowns?: boolean,
        sortByNotesHit?: boolean,
        page?: number,
        limit?: number
    }
}

export interface ISongLeaderboardQuery {
    song: ObjectId,
    instrument: (typeof Instrument)[keyof typeof Instrument],
    // Ensure no "modifier" exists outside of the allowed set
    modifiers: {
        $not: {
            $elemMatch: { modifier: { $nin: Array<(typeof Modifier)[keyof typeof Modifier]> } }
        }
    },
    hidden: boolean,
    difficulty?: (typeof Difficulty)[keyof typeof Difficulty],
    engine?: (typeof Engine)[keyof typeof Engine],
    songSpeed?: { $gte: number }
}

const songLeaderboardHandler: ServerHandler<ISongLeaderboard> = async function (req, reply) {
    if (!req.body.id) throw new ServerError('err_song_invalid_query', null, { params: "id" })
    // Each leaderboard pertains to a song
    const songId = req.body.id
    // Each instrument ("Band" counts as an instrument) has its own leaderboard
    const instrument = req.body.instrument ?? Instrument.Band;
    // Each difficulty has its own leaderboard, EXCEPT FOR BAND - this value should be unused in the query if instrument is 255
    const difficulty = req.body.difficulty ?? Difficulty.Expert;
    // Each non-custom engine has its own leaderboard , EXCEPT FOR BAND - this value should be unused in the query if instrument is 255
    const engine = req.body.engine ?? Engine.Default;
    // Modifiers can be filtered in or out by the user; by default we only allow the ones that make the song as difficult or harder
    const allowedModifiers = req.body.allowedModifiers ?? [Modifier.AllStrums, Modifier.TapsToHopos, Modifier.NoteShuffle, Modifier.NoDynamics, Modifier.NoVocalPercussion, Modifier.RangeCompress];
    // Songs below 100% speed are hidden by default
    const allowSlowdowns = req.body.allowSlowdowns ?? false;
    // Sorting can be done in two ways: Score-based (default) or Notes hit
    const sortByNotesHit = req.body.sortByNotesHit ?? false;
    // Pagination data
    const page = req.body.page ?? 0;
    const limit = req.body.limit ?? 25;

    // Query
    let mongoQuery = { // Using native mongo query instead of mongoose for perf gains with aggregate
        song: new ObjectId(songId),
        instrument: instrument,
        // Ensure no "modifier" exists outside of the allowed set
        modifiers: {
            $not: {
                $elemMatch: { modifier: { $nin: allowedModifiers } }
            }
        },
        hidden: false
    } as ISongLeaderboardQuery
    if (instrument != Instrument.Band) { // Only use these values if it's not a band (255) score
        mongoQuery.difficulty = difficulty
        mongoQuery.engine = engine
    }
    if (!allowSlowdowns) mongoQuery.songSpeed = { $gte: 1 }

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
        { $replaceRoot: { newRoot: "$topScore" } }, // flatten back
        // Facet to get both paginated results and total count in one pass
        {
            $facet: {
                paginatedResults: [
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                    // JOIN uploader data
                    {
                        $lookup: {
                            from: "users",
                            localField: "uploader",
                            foreignField: "_id",
                            as: "uploaderInfo"
                        }
                    },
                    { $unwind: "$uploaderInfo" },
                    {
                        $addFields: {
                            uploader: {
                                username: "$uploaderInfo.username",
                                // TODO: more info? country flag?
                            }
                        }
                    },
                    { $project: { uploaderInfo: 0 } },
                    // JOIN children scores
                    // (TODO: do we want this right now? or do we separate it into a replay-specific endpoint, so it's only called if the user clicks to see the children scores of a band score?)
                    {
                        $lookup: {
                            from: "scores",
                            localField: "childrenScores.score",
                            foreignField: "_id",
                            as: "childrenScores.score",
                            // As of right now, one user uploads a band score and all children scores are associated with this same user.
                            // Which means we don't need to fetch uploader info for children scores since they're the same as the band score.
                            // However, this might change in the future with i.e. online play. So, just uncomment the pipeline below to fetch uploader data for children scores.
                            /*pipeline: [
                                // Populate uploader for each child score
                                {
                                    $lookup: {
                                        from: "users",
                                        localField: "uploader",
                                        foreignField: "_id",
                                        as: "uploaderInfo"
                                    }
                                },
                                { $unwind: "$uploaderInfo" },
                                {
                                    $addFields: {
                                        uploader: {
                                            username: "$uploaderInfo.username",
                                            profilePhotoURL: "$uploaderInfo.profilePhotoURL"
                                        }
                                    }
                                },
                                { $project: { uploaderInfo: 0 } }
                            ]*/
                        }
                    }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ];
    
    const result = await Score.aggregate(pipeline); // Note: returns lean JSON instead of Mongoose model object. Not a problem, though
    const scores = result[0].paginatedResults;
    const totalCount = result[0].totalCount[0]?.count ?? 0;

    serverReply(reply, 'ok', { 'count': totalCount, 'scores': scores })
}

const songLeaderboardErrorHandler: ServerErrorHandler = function (error, req, reply) {
    req.log.error(error)
    // Generic ServerError
    if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

    // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
    if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })

    // Unknown error
    return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

export const songLeaderboardController = {
    handler: songLeaderboardHandler,
    errorHandler: songLeaderboardErrorHandler,
} as const