import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify'

export interface ControllerHandler<T extends RouteGenericInterface, D extends object = {}> {
  (this: FastifyInstance, req: FastifyRequest<T> & D, reply: FastifyReply<T>): any
}
export interface ControllerErrorHandler<T extends RouteGenericInterface> {
  (this: FastifyInstance, error: FastifyError, req: FastifyRequest<T>, reply: FastifyReply<T>): FastifyReply
}
export interface ControllerAuthFunction<T extends RouteGenericInterface, D extends object = {}> {
  (this: FastifyInstance, request: FastifyRequest<T> & D, reply: FastifyReply<T>, done: (error?: Error) => void): void
}
