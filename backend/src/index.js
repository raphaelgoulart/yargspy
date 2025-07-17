import fastify from 'fastify';
import env from 'dotenv';
import db from './config/index.js';
import users from './routes/users.js';

env.config();

const Port = process.env.PORT;
const uri = process.env.MONGODB_URI;

const app = fastify({ logger: true });

// Activate plugins below:
app.register(db, { uri });
app.register(users);

// create server
const start = async () => {
    try {
        await app.listen({ port: Port });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
