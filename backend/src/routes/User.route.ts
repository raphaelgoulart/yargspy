import { userLoginController, userProfileController, userRegisterController, replayRegisterController } from '../controllers.exports'
import { verifyUserJWT, verifyUserLoginBody } from '../core.exports'
import type { FastifyInstanceWithAuth } from '../lib.exports'

export default function UserRoute(app: FastifyInstanceWithAuth) {
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

  app.route({
    method: ['POST', 'HEAD'],
    url: '/user/replay/register',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT]),
    ...replayRegisterController,
  })
}
