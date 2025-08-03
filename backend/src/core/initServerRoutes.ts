import type { FastifyInstance } from 'fastify'
import UserRoute from '../routes/User.route'
import StatusRoute from '../routes/Status.route'
import type { FastifyInstanceWithAuth } from '../lib.exports'

/**
 * Initialize all server routes.
 * - - - -
 * @param {FastifyInstance} app The created fastify instance.
 */
export const initServerRoutes = (app: FastifyInstance) => {
  StatusRoute(app)
  UserRoute(app as FastifyInstanceWithAuth)
}
