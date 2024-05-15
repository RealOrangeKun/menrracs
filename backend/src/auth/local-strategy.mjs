// Import Passport.js for authentication
import passport from "passport";

// Import the Passport Local Strategy
import { Strategy, ExtractJwt } from "passport-jwt";


// Import the verify function from the authentication controller
import { verify } from "../controllers/auth.controller.mjs";


// Configure Passport to use the Local Strategy with the verify function
export default passport.use(new Strategy({ 
    secretOrKey: String(process.env.SECRET_KEY),
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()  
}, verify));
