import type { FastifyInstance } from 'fastify'
import PublicRoute from '../routes/Public.route'
import ReplayRoute from '../routes/Replay.route'
import SongRoute from '../routes/Song.route'
import StatusRoute from '../routes/Status.route'
import UserRoute from '../routes/User.route'

/**
 * Initialize all server routes.
 * - - - -
 * @param {FastifyInstance} app The created fastify instance.
 */
export const initServerRoutes = (app: FastifyInstance) => {
  PublicRoute(app)
  ReplayRoute(app)
  SongRoute(app)
  StatusRoute(app)
  UserRoute(app)
}
