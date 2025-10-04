import zod from 'zod'

export const userLoginBodySchema = zod.object({
  username: zod.string().nonempty().min(3).max(32),
  password: zod.string().nonempty().min(8).max(48),
})

export const userRegisterBodySchema = zod.object({
  username: zod
    .string()
    .min(3)
    .max(32)

    // Some other stuff

    .refine(
      (arg) => {
        // No spaces allowed
        if (arg.match(/\s+/)) return false
        return true
      },
      { error: 'err_user_register_username_nospace', params: { pattern: '/\\s+/' } }
    )
    .refine(
      (arg) => {
        // Real bad guys
        if (arg.match(/\#|\%|\+/)) return false
        return true
      },
      { error: 'err_user_register_username_invalid_type1', params: { pattern: '/\\#|\\%|\\+/' } }
    )
    .refine(
      (arg) => {
        // Cannot start or end with period, underscore, or hyphen
        if (arg.match(/\.\.+|__+|--+/)) return false
        return true
      },
      { error: 'err_user_register_username_invalid_type2', params: { pattern: '/\\.\\.+|__+/' } }
    ),

  password: zod
    .string()
    .min(8)
    .max(48)

    // Trigger not lowercase, uppercase, and numbers validation
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)

    // In the end, any symbol is required
    .regex(/[^A-Za-z0-9]/),
  email: zod.email(),
  // TODO: hCaptcha
})

export const userUpdateBodySchema = zod.object({
  profilePhotoURL: zod.union([zod.url(), zod.string()]).optional(),
  // username: {
  //       type: String,
  //       required: true,
  //     },
  //     password: {
  //       type: String,
  //       required: true,
  //       select: false,
  //     },
  //     profilePhotoURL: {
  //       type: String,
  //     },
  //     active: {
  //       type: Boolean,
  //       default: true,
  //     },
  //     admin: {
  //       type: Boolean,
  //       default: false,
  //     },
  //     createdAt: {
  //       type: Schema.Types.Date,
  //       default: Date.now(),
  //     },
  //     updatedAt: {
  //       type: Schema.Types.Date,
  //       default: Date.now(),
  //     },
})

export const adminUserBanBodySchema = zod.object({
    id: zod.string().nonoptional(),
    active: zod.boolean().nonoptional(),
    reason: zod.string().nonempty()
})