import fastify from 'fastify'
import fastifyAuth from '@fastify/auth'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { checkProcessEnv, checkTempAndFileFolders, getServerRoot, isDev } from './utils.exports'
import { fastifyLoggerOptions, mongoDBConnectPlugin } from './app.exports'
import { initServerRoutes } from './core/initServerRoutes'
import 'dotenv/config'

const serverStart = async () => {
  console.log('YARG Leaderboard Server v0.0.1\nBy raphaelgoulart and Ruggy\n__________________________________________________________________')
  // Init fastify
  const app = fastify({ logger: fastifyLoggerOptions, disableRequestLogging: true, trustProxy: process.env.PROXY === 'true' })

  app.log.info(isDev() ? 'Initializing Server in development mode...\n' : 'Initializing Server...\n')

  // Check environment variables
  const { port, mongoDBURI } = checkProcessEnv(app)

  await checkTempAndFileFolders()

  // Connect to MongoDB and add plugins
  await app.register(mongoDBConnectPlugin, { mongoDBURI })
  await app.register(fastifyCors)
  await app.register(fastifyAuth)
  await app.register(fastifyMultipart)
  await app.register(fastifyStatic, { root: getServerRoot().gotoDir('files/replay').path, prefix: '/file/replay' })

  initServerRoutes(app)

  try {
    await app.listen({
      port,
      host: process.env.HOST ? process.env.HOST : 'localhost',
      listenTextResolver(address) {
        return `Listening: ${address}...`
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
