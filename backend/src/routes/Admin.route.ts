import type { FastifyInstance } from 'fastify'
import { songUpdateController } from '../controllers.exports'
import { verifyAdmin, verifyUserJWT } from '../core.exports'

export default function AdminRoute(app: FastifyInstance) {
  app.route({
    method: ['POST', 'HEAD'],
    url: '/admin/songUpdate',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT, verifyAdmin], {relation: 'and'}),
    ...songUpdateController,
  })
}
