import fastify from 'fastify'
import fastifyAuth from '@fastify/auth'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { checkProcessEnv, getServerRoot, isDev } from './utils.exports'
import { fastifyLoggerOptions, mongoDBConnectPlugin } from './app.exports'
import { initServerRoutes } from './core/initServerRoutes'
import 'dotenv/config'

const serverStart = async () => {
  console.log('YARGLB Server v0.0.1\n')
  // Init fastify
  const app = fastify({ logger: fastifyLoggerOptions, disableRequestLogging: true })

  app.log.info('Initializing Server...')

  // Check environment variables
  const { port, mongoDBURI } = checkProcessEnv()

  if (isDev()) app.log.warn('Server running in development mode!')

  // Connect to MongoDB and add plugins
  await app.register(mongoDBConnectPlugin, { mongoDBURI })
  await app.register(fastifyCors)
  await app.register(fastifyAuth)
  await app.register(fastifyMultipart)
  await app.register(fastifyStatic, { root: getServerRoot().gotoDir('public').path, prefix: '/public/' })

  initServerRoutes(app)

  try {
    await app.listen({
      port,
      listenTextResolver(address) {
        return address
      },
    })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

serverStart().then(() => {
  // Do nothing
})
