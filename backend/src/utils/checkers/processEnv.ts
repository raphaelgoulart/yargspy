import 'dotenv/config'

export interface EnvironmentCheckerReturnObject {
  port: number
  mongoDBURI: string
}

/**
 * Checks the environment variables needed for the server to initialize.
 * - - - -
 * @returns {EnvironmentCheckerReturnObject}
 */
export const checkProcessEnv = (): EnvironmentCheckerReturnObject => {
  const port = Number(process.env.PORT || '5000')
  if (isNaN(port)) throw new TypeError(`Invalid server port number provided as environmente variable.`)

  const mongoDBURI = process.env.MONGODB_URI
  if (!mongoDBURI) throw new Error('No MongoDB URI provided as environmente variable.')

  return { port, mongoDBURI }
}
