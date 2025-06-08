import { Strategy as LocalStrategy } from "passport-local"
import { comparePassword } from "../password.js"

export function configurePassport(passport, db) {
    passport.use(
        "local",
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
            async function (email, password, done) {
                try {
                    const usersCollection = db.collection('users');
                    const user = await usersCollection.findOne({ email });
                    if (!user) {
                        return done(null, false, { message: "Utilisateur non trouvé" });
                    }
                    const isMatch = await comparePassword({ user, password });
                    if (!isMatch) {
                        return done(null, false, { message: "Mot de passe incorrect" });
                    }
                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            })
    );
}