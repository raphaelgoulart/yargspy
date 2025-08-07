import { publicSongController, userRegisterController } from '../controllers.exports'
import type { FastifyInstanceWithAuth } from '../lib.exports'

export default function PublicRoute(app: FastifyInstanceWithAuth) {
  app.route({
    method: ['GET', 'HEAD'],
    url: '/public/song',
    logLevel: 'warn',
    ...publicSongController,
  })
}
