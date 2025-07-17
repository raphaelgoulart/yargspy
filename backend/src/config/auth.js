import User from '../models/user.js';
export async function asyncVerifyJWT(request, reply) {
    try {
        if (!request.headers.authorization) {
            throw new Error('No token was sent');
        }
        const token = request.headers.authorization.replace('Bearer ', '');
        const user = await User.findByToken(token);
        if (!user) {
            // handles logged out user with valid token
            throw new Error('Authentication failed!');
        }
        request.user = user;
        request.token = token; // used in logout route
    } catch (error) {
        reply.code(401).send(error);
    }
}
export async function asyncVerifyUsernameAndPassword(request, reply) {
    try {
        if (!request.body) {
            throw new Error('username and Password is required!');
        }
        const user = await User.findByCredentials(request.body.username, request.body.password);
        request.user = user;
    } catch (error) {
        reply.code(400).send(error);
    }
}