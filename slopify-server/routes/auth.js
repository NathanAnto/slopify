import express from 'express'
import passport from "passport"
import jwt from "jsonwebtoken"
import { getCookieOptions } from '../auth/cookieOptions.js'
import { hashPassword } from '../password.js'
import { client, db } from '../db.js'

const router = express.Router()

router.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    try {
        await client.connect();
        const usersCollection = db.collection('users');
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "L'utilisateur existe déjà" });
        }
        const hashedPassword = await hashPassword(password);
        const newUser = { email, password: hashedPassword };
        await usersCollection.insertOne(newUser);
        res.status(201).json({ message: "User created successfuly" });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de créer l\'utilisateur' });
    }
});

router.post("/login", (req, res, next) => {
    const auth = passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ message: info?.message || "Échec de la connexion" });
        }
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.cookie("token", token, getCookieOptions());
        res.status(200).json({ message: "Login Succesful" });
    });
    auth(req, res, next);
});

router.post("/logout", (req, res) => {
    res.clearCookie("token", getCookieOptions()).sendStatus(200);
});

export default router