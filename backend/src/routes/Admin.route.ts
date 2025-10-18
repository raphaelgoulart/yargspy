import type { FastifyInstance } from 'fastify'
import { adminSongUpdateController, adminUserBanController, adminScoreDeleteController, adminSongDeleteController, adminSongAddController, adminAdminsController, adminLogsController, adminBackfillController } from '../controllers.exports'
import { verifyAdmin, verifyUserJWT } from '../core.exports'

export default function AdminRoute(app: FastifyInstance) {
  app.route({
    method: ['POST', 'HEAD'],
    url: '/admin/songUpdate',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT, verifyAdmin], { relation: 'and' }),
    ...adminSongUpdateController,
  })
  app.route({
    method: ['POST', 'HEAD'],
    url: '/admin/userBan',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT, verifyAdmin], { relation: 'and' }),
    ...adminUserBanController,
  })
  app.route({
    method: ['POST', 'HEAD'],
    url: '/admin/scoreDelete',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT, verifyAdmin], { relation: 'and' }),
    ...adminScoreDeleteController,
  })
  app.route({
    method: ['POST', 'HEAD'],
    url: '/admin/songDelete',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT, verifyAdmin], { relation: 'and' }),
    ...adminSongDeleteController,
  })
  app.route({
    method: ['POST', 'HEAD'],
    url: '/admin/songAdd',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT, verifyAdmin], { relation: 'and' }),
    ...adminSongAddController,
  })
  app.route({
    method: ['GET', 'HEAD'],
    url: '/admin/admins',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT, verifyAdmin], { relation: 'and' }),
    ...adminAdminsController,
  })
  app.route({
    method: ['GET', 'HEAD'],
    url: '/admin/logs',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT, verifyAdmin], { relation: 'and' }),
    ...adminLogsController,
  })
  app.route({
    method: ['GET', 'HEAD'],
    url: '/admin/backfill',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT, verifyAdmin], { relation: 'and' }),
    ...adminBackfillController,
  })
}
