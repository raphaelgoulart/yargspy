import type { Multipart, FastifyMultipartBaseOptions, MultipartFile, SavedMultipartFile } from '@fastify/multipart'
import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply, RouteGenericInterface, ContextConfigDefault, FastifySchema, preHandlerHookHandler } from 'fastify'
import type { BusboyConfig } from '@fastify/busboy'
import type { FastifyAuthFunction, FastifyAuthRelation } from '@fastify/auth'

// Controllers
export interface ControllerHandler<T extends RouteGenericInterface, D extends object = {}> {
  (this: FastifyInstance, req: FastifyRequest<T> & D, reply: FastifyReply<T>): any
}
export interface ControllerErrorHandler<T extends RouteGenericInterface> {
  (this: FastifyInstance, error: FastifyError, req: FastifyRequest<T>, reply: FastifyReply<T>): FastifyReply
}
export interface ControllerAuthFunction<T extends RouteGenericInterface, D extends object = {}> {
  (this: FastifyInstance, request: FastifyRequest<T> & D, reply: FastifyReply<T>, done: (error?: Error) => void): void
}

// Server Responses and internal objects
export interface GenericServerResponseObject {
  /**
   * The status code number.
   */
  statusCode: number
  /**
   * The status code name.
   */
  statusName: string
  /**
   * The status code number and name.
   */
  statusFullName: string
  /**
   * Internal code string that represents the status of the response.
   */
  code: string
  /**
   * A generic message of the response status (in English).
   */
  message: string
}

export interface GenericServerUserTokenObject {
  /**
   * The `ObjectID` of the user, encoded in Base64 string.
   */
  _id: string
  /**
   * Tells if the user has admin privileges.
   */
  admin: boolean
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
