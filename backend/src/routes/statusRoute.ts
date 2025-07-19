import type { FastifyInstance } from 'fastify'
import { serverReply } from '../core.exports'

export default function StatusRoute(app: FastifyInstance) {
  app.route({
    method: ['GET', 'HEAD'],
    url: '/status',
    logLevel: 'warn',
    errorHandler: (err, _, reply) => reply.status(503).send(),
    handler: (_, reply) => reply.send(),
  })
}
