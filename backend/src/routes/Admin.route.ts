import type { FastifyInstance } from 'fastify'
import { adminSongUpdateController, adminUserBanController, adminScoreDeleteController } from '../controllers.exports'
import { verifyAdmin, verifyUserJWT } from '../core.exports'

export default function AdminRoute(app: FastifyInstance) {
  app.route({
    method: ['POST', 'HEAD'],
    url: '/admin/songUpdate',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT, verifyAdmin], {relation: 'and'}),
    ...adminSongUpdateController,
  })
  app.route({
    method: ['POST', 'HEAD'],
    url: '/admin/userBan',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT, verifyAdmin], {relation: 'and'}),
    ...adminUserBanController,
  })
  app.route({
    method: ['POST', 'HEAD'],
    url: '/admin/scoreDelete',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT, verifyAdmin], {relation: 'and'}),
    ...adminScoreDeleteController,
  })
}
