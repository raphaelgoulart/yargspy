import type { FastifyInstance } from 'fastify'
import { userEntriesController, userLoginController, userProfileController, userRegisterController, userScoresController } from '../controllers.exports'
import { verifyUserJWT, verifyUserLoginBody } from '../core.exports'

export default function UserRoute(app: FastifyInstance) {
  app.route({
    method: ['GET', 'HEAD'],
    url: '/user/entries',
    logLevel: 'warn',
    ...userEntriesController,
  })
  app.route({
    method: ['POST', 'HEAD'],
    url: '/user/register',
    logLevel: 'warn',
    ...userRegisterController,
  })

  app.route({
    method: ['POST', 'HEAD'],
    url: '/user/login',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserLoginBody]),
    ...userLoginController,
  })

  app.route({
    method: ['GET', 'HEAD'],
    url: '/user/profile',
    logLevel: 'warn',
    ...userProfileController,
  })

  app.route({
    method: ['GET', 'HEAD'],
    url: '/user/scores',
    logLevel: 'warn',
    ...userScoresController,
  })
}
