import type { FastifyInstance } from 'fastify'
import { publicReplayController } from '../controllers.exports'

export default function PublicRoute(app: FastifyInstance) {
  app.route({
    method: ['GET', 'HEAD'],
    url: '/public/replay',
    logLevel: 'warn',
    ...publicReplayController,
  })
}
