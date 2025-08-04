import type { ContextConfigDefault, FastifyError, FastifyInstance, FastifyReply, FastifyRequest, FastifySchema, preHandlerHookHandler, RouteGenericInterface } from 'fastify'
import type { FastifyAuthFunction, FastifyAuthRelation } from '@fastify/auth'
import type { FilePath } from 'node-lib'

export interface FastifyHandlerFnOpts {
  body?: Record<string, any>
  decorators?: Record<string, any>
}

export interface FastifyHandlerFn<T extends FastifyHandlerFnOpts = {}> {
  (this: FastifyInstance, req: FastifyRequest<{ Body: T['body'] }> & T['decorators'], reply: FastifyReply<{ Body: T['body'] }>): any
}

export interface FastifyErrorHandlerFn<T extends FastifyHandlerFnOpts = {}> {
  (this: FastifyInstance, error: FastifyError, req: FastifyRequest<{ Body: T['body'] }> & T['decorators'], reply: FastifyReply<{ Body: T['body'] }>): any
}

export interface FastifyAuthHandlerFn<T extends FastifyHandlerFnOpts = {}> {
  (this: FastifyInstance, req: FastifyRequest<{ Body: T['body'] }> & T['decorators'], reply: FastifyReply<{ Body: T['body'] }>, done: (error?: Error) => void): void
}

export interface FastifyInstanceWithAuth extends FastifyInstance {
  auth<Request extends FastifyRequest = FastifyRequest, Reply extends FastifyReply = FastifyReply>(
    functions: FastifyAuthFunction<Request, Reply>[] | (FastifyAuthFunction<Request, Reply> | FastifyAuthFunction<Request, Reply>[])[],
    options?: {
      relation?: FastifyAuthRelation
      run?: 'all'
    }
  ): preHandlerHookHandler<any, any, any, RouteGenericInterface, ContextConfigDefault, FastifySchema, any, any>
}

export interface FastifyFileFieldObject {
  filePath: FilePath
  key: string
  fileName: string
  encoding: string
  mimeType: string
}
