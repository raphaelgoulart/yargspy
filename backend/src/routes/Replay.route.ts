import type { FastifyInstance } from 'fastify'
import { replayRegisterController } from '../controllers.exports'
import { verifyUserJWT } from '../core.exports'

export default function ReplayRoute(app: FastifyInstance) {
  app.route({
    method: ['POST', 'HEAD'],
    url: '/replay/register',
    limits: {
      files: 3,
      fields: 1,
      fileSize: 5242880, // 5MB
    },
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT]),
    ...replayRegisterController,
  })
}
