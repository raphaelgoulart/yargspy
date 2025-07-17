import FastifyAuth from '@fastify/auth';
import User from '../models/user.js';
import { asyncVerifyJWT, asyncVerifyUsernameAndPassword } from '../config/auth.js'
const usersRoutes = async (fastify, opts) => {
    fastify
    .register(FastifyAuth)
    .after(() => { 
        // our routes goes here
        fastify.route({
            method: [ 'POST', 'HEAD' ],
            url: '/register',
            logLevel: 'warn',
            handler: async (req, reply) => {
                const user = new User(req.body);
                try {
                    await user.save();
                    const token = await user.generateToken();
                    reply.status(201).send({ user });
                } catch (error) {
                    reply.status(400).send(error);
                }
            }
        });
        
        // login route
        fastify.route({
            method: [ 'POST', 'HEAD' ],
            url: '/login',
            logLevel: 'warn',
            preHandler: fastify.auth([ asyncVerifyUsernameAndPassword ]),
            handler: async (req, reply) => {
                const token = await req.user.generateToken();
                reply.send({ status: 'You are logged in', user: req.user });
            }
        });
        
        // profile route
        fastify.route({
            method: [ 'GET', 'HEAD' ],
            url: '/profile',
            logLevel: 'warn',
            preHandler: fastify.auth([ asyncVerifyJWT ]),
            handler: async (req, reply) => {
                reply.send({ status: 'Authenticated!', user: req.user });
            }
        });
        
        // logout route
        fastify.route({
            method: [ 'GET', 'HEAD' ],
            url: '/logout',
            logLevel: 'warn',
            preHandler: fastify.auth([ asyncVerifyJWT ]),
            handler: async (req, reply) => {
                try {
                    req.user.tokens = req.user.tokens.filter((token) => {
                        return token.token !== req.token;
                    });
                    const loggedOutUser = await req.user.save();
                    reply.send({ status: 'You are logged out!', user: loggedOutUser });
                } catch (e) {
                    reply.status(500).send(e);
                }
            }
        });
    });
};
export default usersRoutes;
