import fastify from 'fastify'
import fastifyAuth from '@fastify/auth'
import fastifyMultipart from '@fastify/multipart'
import cors from '@fastify/cors'
import { envCheck } from './utils.exports'
import { fastifyLoggerOptions, mongoDBConnectPlugin } from './app.exports'
import { initServerRoutes } from './core/initServerRoutes'
import 'dotenv/config'

const serverStart = async () => {
  // Init fastify
  const app = fastify({ logger: fastifyLoggerOptions, disableRequestLogging: true })

  // Check environment variables
  const { port, mongoDBURI } = envCheck()

  // Connect to MongoDB and add plugins
  await app.register(mongoDBConnectPlugin, { mongoDBURI })
  await app.register(cors)
  await app.register(fastifyAuth)
  await app.register(fastifyMultipart)

  initServerRoutes(app)

  try {
    await app.listen({ port })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

serverStart().then(() => {
  // Do nothing
})
