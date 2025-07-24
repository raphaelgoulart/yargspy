import type { PinoLoggerOptions } from 'fastify/types/logger'

export const fastifyLoggerOptions: PinoLoggerOptions = {
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
}
