import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ApolloServer } from "apollo-server-express"
import { bootstrap } from './bootstrap.js'
import passport from "passport"

import { client, db } from './db.js'
import allowedOrigins from './allowedOrigins.js'
import { configurePassport } from './auth/passport.js'
import { getSpotifyAccessToken } from './spotify/token.js'
import jwt from "jsonwebtoken";
import typeDefs from "./graphql/types.js"
import resolvers from "./graphql/resolvers.js"
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'

const app = express()
const port = 4000

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

configurePassport(passport, db);

app.use(express.json());
app.use(passport.initialize());
app.use(cookieParser());

await client.connect();

app.use(authRoutes);
app.use(userRoutes);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const token = req.cookies?.token;
        let user = null;
        let spotifyToken = null;

        console.log(`Received token: ${token}`);

        if (!token) return { db };

        try {
            user = jwt.verify(token, process.env.JWT_SECRET);
            spotifyToken = await getSpotifyAccessToken()
        } catch (err) {
            console.error('JWT verification failed:', err);
        }

        console.log(`Authenticated user: ${user ? user.email : 'No user'}`);
        return { user, db, spotifyToken };
    },
});

await server.start();
server.applyMiddleware({ app, cors: false })

app.listen(port, async () => {
    await bootstrap()
    console.log(`Slopify listening on port: ${port}`)
})

export default app;