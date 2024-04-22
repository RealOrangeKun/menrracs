// Import Passport.js for authentication
import passport from "passport";

// Import the Passport Local Strategy
import { Strategy } from "passport-local";

// Import the User model
import User from "../models/user.schema.mjs";

// Import the verify function from the authentication controller
import { verify } from "../controllers/auth.controller.mjs";

// Serialize user into session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        // Check if the user exists in the DB
        const user = await User.findById(id);
        // If not then throw an error
        if (!user) return done();
        done(null, user);
    } catch (error) {
        console.log(error.message);
        done();
    }
});

// Configure Passport to use the Local Strategy with the verify function
export default passport.use(new Strategy(verify));
