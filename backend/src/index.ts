import fastify from 'fastify'
import fastifyAuth from '@fastify/auth'
import cors from '@fastify/cors'
import { envCheck } from './utils.exports'
import { fastifyLoggerOptions, mongoDBConnectPlugin } from './app.exports'
import 'dotenv/config'
import { initServerRoutes } from './core/initServerRoutes'

const serverStart = async () => {
  // Init fastify
  const app = fastify({ logger: fastifyLoggerOptions })

  // Check environment variables
  const { port, mongoDBURI } = envCheck()

  // Connect to MongoDB and add plugins
  await app.register(mongoDBConnectPlugin, { mongoDBURI })
  app.register(cors)
  await app.register(fastifyAuth)

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
