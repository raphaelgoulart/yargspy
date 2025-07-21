import { type FastifyInstance } from 'fastify'
import { userLoginController, userProfileController, userRegisterController, verifyUserJWT, verifyUserLoginBody } from '../controllers.exports'

export default function UserRoute(app: FastifyInstance) {
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
}
