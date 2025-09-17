import type { FastifyInstance } from 'fastify'
import { songLeaderboardController, songDataController, SongEntriesController } from '../controllers.exports'

export default function SongRoute(app: FastifyInstance) {
  app.route({
    method: ['POST', 'HEAD'],
    url: '/song/leaderboard',
    logLevel: 'warn',
    ...songLeaderboardController,
  })

  app.route({
    method: ['GET', 'HEAD'],
    url: '/song',
    logLevel: 'warn',
    ...songDataController,
  })

  app.route({
    method: ['GET', 'HEAD'],
    url: '/song/entries',
    logLevel: 'warn',
    ...SongEntriesController,
  })
}
