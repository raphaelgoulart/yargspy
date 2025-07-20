import bcrypt from "bcryptjs";
import { Document, model, Model, Schema } from "mongoose";
import { jwtSign, jwtVerify, passwordValidator } from "../utils.exports";
import { ServerError } from "../config.exports";
import "dotenv/config";

export interface UserSchemaInput {
  username: string;
  password: string;
  profilePhotoURL: string;
  active: boolean;
  admin: boolean;
}

// Methods here
export interface UserSchemaDocument extends UserSchemaInput, Document {
  generateToken(): Promise<string>;
}

// Statics here
export interface UserSchemaModel extends Model<UserSchemaDocument> {
  findByToken(token: string): Promise<UserSchemaDocument>;
  findByCredentials(
    username: string,
    password: string
  ): Promise<UserSchemaDocument>;
}

const userSchema = new Schema<UserSchemaInput, UserSchemaModel>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    profilePhotoURL: {
      type: String,
      required: true,
      default:
        "https://media.discordapp.net/attachments/424076935056982046/1258691936777404458/image.png?ex=687d48f7&is=687bf777&hm=5c829a48aa823e525893074ae2ef03e0e19102020d7eed9d99506dbc2695b8a8&=&format=webp&quality=lossless&width=256&height=256",
    },
    active: {
      type: Boolean,
      default: false,
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  {
    methods: {
      async generateToken() {
        const token = jwtSign({ _id: this._id.toString() });
        return token;
      },
    },
    statics: {
      async findByToken(token: string) {
        const decoded = jwtVerify(token);
        const user = await this.findOne({
          _id: decoded._id,
        });
        if (!user) throw new ServerError("err_invalid_auth");
        return user;
      },
      async findByCredentials(username: string, password: string) {
        const user = await this.findOne({ username }).select([
          "+password",
          "+tokens",
        ]);
        if (!user)
          throw new ServerError("err_login_user_notfound", null, { username });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new ServerError("err_login_password_validation");
        return user;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(passwordValidator(this.password), salt);
  next();
});

export const User = model<UserSchemaInput, UserSchemaModel>("User", userSchema);
