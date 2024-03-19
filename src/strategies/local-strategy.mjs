import passport from "passport";
import { Strategy } from "passport-local";
import User from "../models/user.schema.mjs";
import { verify } from "../controllers/auth.controller.mjs";

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        if (!user) throw new Error("User not found")
        done(null, user)
    } catch (error) {
        console.log(error);
        done(error, null)
    }
})

export default passport.use(new Strategy(verify))