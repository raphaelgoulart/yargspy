import type { FastifyInstance } from 'fastify'
import { replayRegisterController } from '../controllers.exports'
import { verifyUserJWT } from '../core.exports'

export default function ReplayRoute(app: FastifyInstance) {
  app.route({
    method: ['POST', 'HEAD'],
    url: '/replay/register',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT]),
    ...replayRegisterController,
  })
}
