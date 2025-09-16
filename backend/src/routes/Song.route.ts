import type { FastifyInstance } from 'fastify'
import { songLeaderboardController } from '../controllers.exports'

export default function SongRoute(app: FastifyInstance) {
  app.route({
    method: ['GET', 'HEAD'],
    url: '/song/leaderboard',
    logLevel: 'warn',
    ...songLeaderboardController,
  })
}
