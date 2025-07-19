import type { PinoLoggerOptions } from 'fastify/types/logger'

export const fastifyLoggerOptions: PinoLoggerOptions = {
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
}
