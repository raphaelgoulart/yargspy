import fastifyPlugin from 'fastify-plugin'
import mongoose from 'mongoose'

export const mongoDBConnectPlugin = fastifyPlugin<{ mongoDBURI: string }>(async (instance, { mongoDBURI }) => {
  instance.log.info('Trying to connect to MongoDB...')
  mongoose.connection.on('connected', () => instance.log.info(`MongoDB database connected successfully!\n`))
  mongoose.connection.on('disconnected', () => instance.log.fatal(`An error ocurred while trying to connect to MongoDB database. Please try again later.\n`))
  await mongoose.connect(mongoDBURI)
})
