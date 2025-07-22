import { userLoginController, userProfileController, userRegisterController } from '../controllers.exports'
import { userReplaySendController } from '../controllers/userReplaySend'
import { verifyUserJWT, verifyUserLoginBody } from '../core.exports'
import type { FastifyInstanceWithAuth } from '../app.exports'

export default function UserRoute(app: FastifyInstanceWithAuth) {
  app.route({
    method: ['POST', 'HEAD'],
    url: '/user/register',
    logLevel: 'warn',
    ...userRegisterController.routeOpts,
  })

  app.route({
    method: ['POST', 'HEAD'],
    url: '/user/login',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserLoginBody]),
    ...userLoginController.routeOpts,
  })

  app.route({
    method: ['GET', 'HEAD'],
    url: '/user/profile',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT]),
    ...userProfileController.routeOpts,
  })

  app.route({
    method: ['POST', 'HEAD'],
    url: '/user/replay/send',
    logLevel: 'warn',
    preHandler: app.auth([verifyUserJWT]),
    ...userReplaySendController.routeOpts,
  })
}
