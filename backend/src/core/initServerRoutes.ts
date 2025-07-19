import type { FastifyInstance } from 'fastify'
import UserRoute from '../routes/userRoute'
import StatusRoute from '../routes/statusRoute'

/**
 * Initialize all server routes.
 * - - - -
 * @param {FastifyInstance} app The created fastify instance.
 */
export const initServerRoutes = (app: FastifyInstance) => {
  StatusRoute(app)
  UserRoute(app)
}
