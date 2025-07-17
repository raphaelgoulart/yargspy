import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createSigner, createVerifier } from 'fast-jwt'
import env from 'dotenv';

env.config();

const signer = createSigner({ key: process.env.JWT_SECRET, expiresIn: "30 days" })
const verifier = createVerifier({ key: process.env.JWT_SECRET })

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // other data (avatar, bio, etc?)
    active: {
        type: Boolean,
        default: true,
        required: true
    },
    admin: {
        type: Boolean,
        default: false,
        required: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
});
// encrypt password using bcrypt conditionally. Only if the user is newly created.
// Hash the plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        const error = validatePassword(user.password);
        if (error) {
            throw new Error(error);
        }
        user.password = await bcrypt.hash(user.password, 12);
    }
    next();
});
userSchema.methods.generateToken = async function() {
    let user = this;
    const token = signer({ _id: user._id.toString() });
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};
// create a custom model method to find user by token for authenticationn
userSchema.statics.findByToken = async function(token) {
    let User = this;
    let decoded;
    if (!token) {
        return new Error('Missing token header');
    }
    decoded = verifier(token);
    return await User.findOne({
        _id: decoded._id,
        'tokens.token': token
    })
};
// create a new mongoose method for user login authenticationn
userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error('Unable to login. Wrong username!');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Unable to login. Wrong Password!');
    }
    return user;
};

function validatePassword(password) { // returns error string if any
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase character"
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase character"
    if (!/[0-9]/.test(password)) return "Password must contain at least one numeric digit"
    if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character"
    if (password.length < 8) return "Password must be at least 8 characters long"
    return false; // no error
}

const User = mongoose.model('user', userSchema);
export default User;
