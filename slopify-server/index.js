import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from "mongodb";

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { comparePassword, hashPassword } from "./password.js";
import jwt from "jsonwebtoken";
import cookieParser from 'cookie-parser';

import { ApolloServer } from "apollo-server-express";
import typeDefs from "./graphql/types.js";
import resolvers from "./graphql/resolvers.js";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const app = express()
const port = 4000

const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4000',
    'http://127.0.0.1:4000',
    'https://studio.apollographql.com'
]; // Add your origins here

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

app.use(express.json());

app.use(passport.initialize());

app.use(cookieParser());

await client.connect();
let db = client.db();

passport.use(
    "local",
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
        async function (email, password, done) {
            try {
                // Connect to the database
                const usersCollection = db.collection('users');

                // Find the user by email
                const user = await usersCollection.findOne({ email });

                // If the user is not found, return an error
                if (!user) {
                    console.log("No user found");
                    return done(null, false, { message: "Utilisateur non trouvé" });
                }

                // Check if the password matches
                const isMatch = await comparePassword({
                    user,
                    password,
                });

                // If the password is incorrect, return an error
                if (!isMatch) {
                    return done(null, false, { message: "Mot de passe incorrect" });
                }

                // If authentication is successful, return the user
                return done(null, user);
            } catch (error) {
                // Handle any errors during the process
                return done(error);
            }
        })
);

const getCookieOptions = () => {
    return {
        httpOnly: true,
        secure: process.env.DEV_MODE ? false : true,
        sameSite: process.env.DEV_MODE ? "Lax" : "None",
    };
};

app.post("/signup", async (req, res, next) => {
    const { email, password } = req.body;
    try {
        await client.connect();
        const db = client.db();
        const usersCollection = db.collection('users');
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "L'utilisateur existe déjà" });
        }
        const hashedPassword = await hashPassword(password);
        const newUser = {
            email,
            password: hashedPassword,
        };
        await usersCollection.insertOne(newUser);
        res.status(201).json({ message: "User created successfuly" });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        res.status(500).json({ error: 'Impossible de créer l\'utilisateur' });
    }
});

app.post("/login", (req, res, next) => {
    const auth = passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            // Authentification échouée : on renvoie un message JSON
            return res
                .status(401)
                .json({ message: info?.message || "Échec de la connexion" });
        }
        // Authentification réussie : génération d'un token ajouté à un cookie sur le client
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        res.cookie("token", token, getCookieOptions());
        res.status(200).json({ message: "Login Succesful" });
    });
    auth(req, res, next);
});

app.post("/logout", (req, res) => {
    res.clearCookie("token", getCookieOptions()).sendStatus(200);
});

function authenticateToken(req, res, next) {
    const token = req.cookies?.token;
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // invalid token
        req.user = user;
        next();
    });
}

app.get("/me", authenticateToken, (req, res) => {
    res.json({ user: req.user }); // user info from decoded token
});

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const token = req.cookies?.token;
        let user = null;

        if (!token) return { db }; // no user
    
        try {
          user = jwt.verify(token, process.env.JWT_SECRET);
        } catch {}

        return { user, db };
      },
});

await server.start();
server.applyMiddleware({ app, cors: false })

app.listen(port, () => {
    console.log(`Slopify listening on port: ${port}`)
})