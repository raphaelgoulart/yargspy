import type { ContextConfigDefault, FastifyError, FastifyInstance, FastifyReply, FastifyRequest, FastifySchema, preHandlerHookHandler, RouteGenericInterface } from 'fastify'
import type { FastifyAuthFunction, FastifyAuthRelation } from '@fastify/auth'
import type { BusboyConfig } from '@fastify/busboy'
import type { SendOptions } from '@fastify/static'
import type { FilePath } from 'node-lib'
import type { Multipart, FastifyMultipartBaseOptions, MultipartFile, SavedMultipartFile } from '@fastify/multipart'

export interface FastifyHandlerFnOpts {
  body?: Record<string, any>
  decorators?: Record<string, any>
  query?: Record<string, any>
}

export interface FastifyStaticDecoratons {
  sendFile(filename: string, rootPath?: string): FastifyReply
  sendFile(filename: string, options?: SendOptions): FastifyReply
  sendFile(filename: string, rootPath?: string, options?: SendOptions): FastifyReply
  download(filepath: string, options?: SendOptions): FastifyReply
  download(filepath: string, filename?: string): FastifyReply
  download(filepath: string, filename?: string, options?: SendOptions): FastifyReply
}

export interface FastifyMultipartDecorators {
  isMultipart: () => boolean

  formData: () => Promise<FormData>

  // promise api
  parts: (options?: Omit<BusboyConfig, 'headers'>) => AsyncIterableIterator<Multipart>

  // Stream mode
  file: (options?: Omit<BusboyConfig, 'headers'> | FastifyMultipartBaseOptions) => Promise<MultipartFile | undefined>
  files: (options?: Omit<BusboyConfig, 'headers'> | FastifyMultipartBaseOptions) => AsyncIterableIterator<MultipartFile>

  // Disk mode
  saveRequestFiles: (options?: Omit<BusboyConfig, 'headers'> & { tmpdir?: string }) => Promise<Array<SavedMultipartFile>>
  cleanRequestFiles: () => Promise<void>
  tmpUploads: Array<string> | null
  /** This will get populated as soon as a call to `saveRequestFiles` gets resolved. Avoiding any future duplicate work */
  savedRequestFiles: Array<SavedMultipartFile> | null
}

export interface FastifyHandlerFn<T extends FastifyHandlerFnOpts = {}> {
  (this: FastifyInstance, req: FastifyRequest<{ Body: T['body']; Querystring: T['query'] }> & FastifyMultipartDecorators & T['decorators'], reply: FastifyReply<{ Body: T['body']; Querystring: T['query'] }> & FastifyStaticDecoratons): any
}

export interface FastifyErrorHandlerFn<T extends FastifyHandlerFnOpts = {}> {
  (this: FastifyInstance, error: FastifyError, req: FastifyRequest<{ Body: T['body']; Querystring: T['query'] }> & FastifyMultipartDecorators & T['decorators'], reply: FastifyReply<{ Body: T['body']; Querystring: T['query'] }> & FastifyStaticDecoratons): any
}

export interface FastifyAuthHandlerFn<T extends FastifyHandlerFnOpts = {}> {
  (this: FastifyInstance, req: FastifyRequest<{ Body: T['body']; Querystring: T['query'] }> & FastifyMultipartDecorators & T['decorators'], reply: FastifyReply<{ Body: T['body']; Querystring: T['query'] }> & FastifyStaticDecoratons, done: (error?: Error) => void): void
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
