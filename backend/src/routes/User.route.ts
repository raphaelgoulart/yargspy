import type { FastifyInstance } from 'fastify'
import { userAllEntriesController, userLoginController, userProfileController, userRegisterController } from '../controllers.exports'
import { verifyUserJWT, verifyUserLoginBody } from '../core.exports'
import { isDev } from '../utils.exports'

export default function UserRoute(app: FastifyInstance) {
  app.route({
    method: ['GET', 'HEAD'],
    url: '/user/all',
    logLevel: 'warn',
    preHandler: isDev() ? undefined : app.auth([verifyUserJWT]),
    ...userAllEntriesController,
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
    preHandler: app.auth([verifyUserJWT]),
    ...userProfileController,
  })
}
