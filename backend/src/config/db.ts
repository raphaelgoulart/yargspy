import fastifyPlugin from 'fastify-plugin'
import mongoose from 'mongoose'

export const mongoDBConnectPlugin = fastifyPlugin<{ mongoDBURI: string }>(async (instance, { mongoDBURI }) => {
  mongoose.connection.on('connected', () => instance.log.info(`MongoDB database connected successfully`))
  mongoose.connection.on('disconnected', () => instance.log.error(`An error ocurred while trying to connect to MongoDB database.`))
  await mongoose.connect(mongoDBURI)
})
