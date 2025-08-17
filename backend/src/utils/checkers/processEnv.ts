import type { FastifyInstance } from 'fastify'

export interface EnvironmentCheckerReturnObject {
  port: number
  mongoDBURI: string
  jwtSecret: string
  publicChartFileAccessKey: string
}

/**
 * Checks the environment variables needed for the server to initialize.
 * - - - -
 * @returns {EnvironmentCheckerReturnObject}
 */
export const checkProcessEnv = (app: FastifyInstance): EnvironmentCheckerReturnObject => {
  app.log.info('Checking environment file...')
  const port = Number(process.env.PORT || '5000')
  if (isNaN(port)) throw new TypeError(`Invalid server port number provided as environmente variable.`)

  const mongoDBURI = process.env.MONGODB_URI as string | undefined
  if (!mongoDBURI) throw new Error('No MongoDB URI provided as environmente variable.')

  const jwtSecret = process.env.JWT_SECRET as string | undefined
  if (!jwtSecret) throw new Error('No JWT secret provided as environmente variable.')

  const publicChartFileAccessKey = process.env.PUBLIC_CHART_FILE_ACCESS_KEY as string | undefined
  if (!publicChartFileAccessKey) throw new Error('No public chart file access key provided as environmente variable.')

  app.log.info(`Using the following environment variables:\n\tPORT: ${port}\n\tMONGODB URI: ${mongoDBURI}\n\tJWT SECRET: ${jwtSecret}\n\tPUBLIC CHART FILE ACCESS KEY: ${publicChartFileAccessKey}\n`)

  return { port, mongoDBURI, jwtSecret, publicChartFileAccessKey }
}
