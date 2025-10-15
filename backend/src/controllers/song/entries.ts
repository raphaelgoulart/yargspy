import type { infer as ZodInfer } from 'zod'
import { TokenError } from 'fast-jwt'
import { ServerError, songEntriesQuerystringSchema } from '../../app.exports'
import { serverReply } from '../../core.exports'
import type { ServerHandler, ServerErrorHandler } from '../../lib.exports'
import { Song } from '../../models/Song'

export interface ISongEntries {
  query: {
    [key in keyof ZodInfer<typeof songEntriesQuerystringSchema>]: string
  }
}

export const Sort = {
  Name: 1,
  Artist: 2,
  Charter: 3,
} as const

// #region Handler

const SongEntriesHandler: ServerHandler<ISongEntries> = async function (req, reply) {
  const { page, limit, name, artist, charter, sort, descending } = songEntriesQuerystringSchema.parse(req.query)
  const skip = (page - 1) * limit
  const filter = {} as Record<string, Object>
  if (name) filter['name'] = { $regex: name, $options: 'i' }
  if (artist) filter['artist'] = { $regex: artist, $options: 'i' }
  if (charter) filter['charter'] = { $regex: charter, $options: 'i' }
  let sortingString: string | undefined
  if (sort) {
    switch (sort) {
      case Sort.Name:
        sortingString = 'name'
        break
      case Sort.Artist:
        sortingString = 'artist'
        break
      case Sort.Charter:
        sortingString = 'charter'
        break
      default:
        break
    }
    if (sortingString) sortingString = (descending ? '-' : '') + sortingString
  }

  const [allSongs, totalEntries] = await Promise.all([
    // .collation() is needed for case-insensitive sorting
    Song.find(filter).collation({ locale: 'en' }).sort(sortingString).skip(skip).limit(limit),
    Song.countDocuments(filter),
  ])
  const totalPages = Math.ceil(totalEntries / limit)

  serverReply(reply, 'ok', {
    totalEntries,
    totalPages,
    page,
    limit,
    entries: allSongs.map((song) => ({
      _id: song._id,
      name: song.name,
      artist: song.artist,
      charter: song.charter,
      album: song.album,
      year: song.year,
    })),
  })
}

// #region Error Handler

const SongEntriesErrorHandler: ServerErrorHandler = function (error, req, reply) {
  console.log(error)
  // Generic ServerError
  if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)

  // Incomplete Authorization string on headers (Only sent "Bearer " or "Bearer null", for example).
  if (error instanceof TokenError && error.code === 'FAST_JWT_MALFORMED') return serverReply(reply, 'err_invalid_auth_format', { token: req.headers.authorization })
  // Unknown error
  return serverReply(reply, 'err_unknown', { error, debug: ServerError.logErrors(error) })
}

// #region Controller

export const songEntriesController = {
  errorHandler: SongEntriesErrorHandler,
  handler: SongEntriesHandler,
} as const
