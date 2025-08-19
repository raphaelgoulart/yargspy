import { userLoginBodySchema } from '../app.exports'
import { type IUserLogin, type IUserProfile } from '../controllers.exports'
import type { ServerAuthHandler, RouteRequest } from '../lib.exports'
import { User, type UserSchemaDocument } from '../models/User'


export const verifyUserLoginBody: ServerAuthHandler<IUserLogin> = async function (req) {
  const { username, password } = userLoginBodySchema.parse(req.body)
  const user = await User.findByCredentials(username, password)
  ;(req as RouteRequest<{user?: UserSchemaDocument}>).user = user
}

export const verifyUserJWT: ServerAuthHandler<IUserProfile> = async function (req) {
  const user = await User.findByToken(req.headers.authorization)
  ;(req as RouteRequest<{user?: UserSchemaDocument}>).user = user
}
