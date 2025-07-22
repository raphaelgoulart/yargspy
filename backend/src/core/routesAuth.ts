import type { ControllerAuthFunction } from '../app/types'
import { userLoginBodySchema, type IUserLoginController, type IUserLoginDecorators, type IUserProfileController, type IUserProfileDecorators } from '../controllers.exports'
import { User } from '../models/User'

export const verifyUserLoginBody: ControllerAuthFunction<IUserLoginController, IUserLoginDecorators> = async function (req) {
  const { username, password } = userLoginBodySchema.parse(req.body)
  const user = await User.findByCredentials(username, password)
  req.user = user
}

export const verifyUserJWT: ControllerAuthFunction<IUserProfileController, IUserProfileDecorators> = async function (req) {
  const user = await User.findByToken(req.headers.authorization)
  req.user = user
}
