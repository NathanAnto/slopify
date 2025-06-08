import express from 'express'
import jwt from "jsonwebtoken"

function authenticateToken(req, res, next) {
    const token = req.cookies?.token;
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

const router = express.Router()

router.get("/me", authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

export default router