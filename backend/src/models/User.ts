import bcrypt from 'bcryptjs'
import { type Document, model, type Model, Schema } from 'mongoose'
import { bearerTokenVerifier, jwtSign, jwtVerify, passwordValidator } from '../utils.exports'
import { ServerError } from '../app.exports'
import type { ServerRequest } from '../lib.exports'

export interface UserSchemaInput {
  /**
   * The username registered by the user.
   */
  username: string
  /**
   * The hashed password of the user.
   */
  password: string
  /**
   * The email address belonging to the user.
   */
  email: string
  /**
   * The profile photo URL.
   */
  profilePhotoURL: string
  /**
   * Tells if the user has verified its email address
   */
  emailVerified: boolean
  /**
   * Tells if the user registry is active
   */
  active: boolean
  /**
   * Tells if the user registered has admin privileges
   */
  admin: boolean
  /**
   * Tells when the user was originally created.
   */
  createdAt: Date
  /**
   * Tells when the user entry was last updated.
   */
  updatedAt: Date
  /**
   * The user's country code
   */
  country: string
  /**
   * The profile banner URL.
   */
  bannerURL: string
}

// Methods here
export interface UserSchemaDocument extends UserSchemaInput, Document {
  /**
   * Signs a token for the user with the `ObjectID` of the user for user requests validation.
   * - - - -
   */
  generateToken(): Promise<string>
  /**
   * Performs a case-insensitive username validation.
   * - - - -
   */
  checkUsernameEmailCaseInsensitive(): Promise<void>
  /**
   * Sets the user's country based on request header.
   * - - - -
   */
  setCountryAndSave(req: ServerRequest): Promise<void>
}

// Statics here
export interface UserSchemaModel extends Model<UserSchemaDocument> {
  /**
   * Finds a `User` registry by it's token by parsing it directly from the request authorization header.
   * - - - -
   * @param {string | undefined} auth The request authorization header where the user token is found.
   * @returns {Promise<UserSchemaDocument>}
   * @throws {ServerError} When no authorization header is found, when the authorization header is in invalid format, or when the provided user token is invalid/expired.
   */
  findByToken(auth: string | undefined): Promise<UserSchemaDocument>
  /**
   * Finds a `User` registry by checking basic credentials.
   * - - - -
   * @param {string} username The user name.
   * @param {string} password The user password.
   * @returns {Promise<UserSchemaDocument>}
   * @throws {ServerError} When no user is found using the provided username, or when the provided password doesn't match.
   */
  findByCredentials(username: string, password: string): Promise<UserSchemaDocument>
}

const userSchema = new Schema<UserSchemaInput, UserSchemaModel>(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    email: {
      type: String,
      required: true,
      select: false,
    },
    profilePhotoURL: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    updatedAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    country: {
      type: String,
      default: 'XX',
    },
    bannerURL: {
      type: String,
    },
  },
  {
    timestamps: true,
    methods: {
      async generateToken() {
        const token = jwtSign({ _id: this.id, admin: this.admin })
        return token
      },
      async checkUsernameEmailCaseInsensitive() {
        const users = User.find().select({ username: 1, email: 1 })
        let valid: boolean = true
        for await (const user of users) {
          if (user.username.toLowerCase() === this.username.toLowerCase() || user.email.toLowerCase() === this.email.toLowerCase()) {
            valid = false
            break
          }
        }

        if (!valid) throw new ServerError('err_user_register_duplicated_username', null)
      },
      async setCountryAndSave(req) {
        this.country = (req.headers['cloudfront-viewer-country'] as string | undefined) ?? 'XX'
        await this.save()
      },
    },
    statics: {
      async findByToken(auth?: string) {
        const token = bearerTokenVerifier(auth)
        const decoded = jwtVerify(token)
        const user = await this.findOne({ _id: decoded._id }).select('+emailVerified')
        if (!user) throw new ServerError('err_invalid_auth')
        if (!user.active) throw new ServerError('err_login_user_inactive')
        if (!user.emailVerified) throw new ServerError('err_login_user_email_unverified')
        return user
      },
      async findByCredentials(username: string, password: string) {
        const user = await this.findOne({ username }).select(['+password', '+emailVerified'])
        if (!user) throw new ServerError('err_login_user_notfound', null, { username })
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) throw new ServerError('err_login_password_validation')
        if (!user.active) throw new ServerError('err_login_user_inactive')
        if (!user.emailVerified) throw new ServerError('err_login_user_email_unverified')
        return user
      },
    },
  }
)

// Case insensitive usernames / emails
userSchema.index({ username: 1 }, { collation: { locale: 'en', strength: 2 } })
userSchema.index({ email: 1 }, { collation: { locale: 'en', strength: 2 } })

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(passwordValidator(this.password), salt)
  }
  this.updatedAt = new Date()
  next()
})

export const User = model<UserSchemaInput, UserSchemaModel>('User', userSchema)
