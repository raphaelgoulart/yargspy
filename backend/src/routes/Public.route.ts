import type { FastifyInstance } from 'fastify'
import { publicSongController } from '../controllers.exports'

export default function PublicRoute(app: FastifyInstance) {
  app.route({
    method: ['GET', 'HEAD'],
    url: '/public/song',
    logLevel: 'warn',
    ...publicSongController,
  })
}
