// Import the User model
import { matchedData, validationResult } from "express-validator";
import User from "../models/user.schema.mjs";

// Import the hashPassword function from the crypt module
import hashPassword from '../helpers/crypt.mjs';

// Import the bcrypt library for password hashing
import bcrypt from 'bcrypt';
import { sendEmail } from "../helpers/sendMail.mjs";
import { tokenTypes } from "../constants/tokenConstants.mjs";
import { generateAccessToken, generateEmailToken, verifyFromDatabase, generateRefreshToken } from "../helpers/token.helper.mjs";
import Token from '../models/token.schema.mjs';
import passport from 'passport';

/**
 * 
 * @description The function which is responsible for registration  
 * 
 * It starts by grabbing the body object from the `req` and checks if the user is already logged in
 * by checking to see if the `req.user` is not `undefined` or `null`, if it is it throws an error if not then the function continues.
 * 
 * Then the password is hashed and the property `body.password` is replaced with the hashed password.
 * 
 * Then checks if the username or email already exists in the Database and if it does then it throws an error if not then it continues.
 * 
 * Function then sends a verification link to the user so they can verify their email.
 * 
 * Function then adds the new user to the Database and sends a status of `201` with a json of to tell the user that the process was successfull.
 * @async
 * @param {import('express').Request} req - Express Request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Object} Success or error response.
 */
const register = async (req, res) => {
    // Check if user is already logged in
    if (req.user) return res.status(400).send({ success: false, error: "User is already logged in please logout first" });
    if (!req.body.username || !req.body.password || !req.body.email) return res.status(400).json({ success: false, error: "Username, Password and Email are required" })
    const result = validationResult(req);
    if (!result.isEmpty()) return res.status(400).json({ success: false, errors: result.array() })
    const data = matchedData(req);
    try {
        // Hash the password before saving it
        data.password = hashPassword(data.password);

        // Check if username or email already exists
        if (await User.findOne({ $or: [{ username: data.username }, { email: data.email }] })) throw new Error("User with this email or username already exists");

        // Create a new user and save to database
        const user = await User.create(data);
        const emailToken = await generateEmailToken(user.id);
        await sendEmail(data.email, process.env.MAIL_PASS, `Click this link to verify your account: ${req.protocol}://${req.hostname}${req.baseUrl}/email-verification?token=${emailToken}`,
            "Verify Account")
        return res.status(201).json({ success: true, message: "User registered successfully. Please look into your email to verify." });
    } catch (error) {
        console.log(error);
        // Return error response if registration fails
        res.status(400).send({ success: false, message: error.message });
    }
};

/**
 * @description Login function
 * 
 * Function is called after the `passport.js` `authenticate` middleware and only sends a status code of `200` with json message.
 * 
 *
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Object}
 */
const login = async (req, res) => {
    const { body: { username, password } } = req;
    if (!username || !password) return res.sendStatus(401);
    const user = await User.findOne({ username });
    if (!user) return res.sendStatus(401);
    if (!bcrypt.compareSync(password, user.password)) return res.sendStatus(401);
    const access = generateAccessToken(user.id);
    const refresh = await generateRefreshToken(user.id);
    user.lastLogin = new Date();
    await user.save();
    res.cookie('jwt', refresh.token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: refresh.expires });
    // Return success response for login
    res.status(200).json({ success: true, message: 'Logged in', token: access });
};

/**
 * @description Verify function
 * 
 * The callback function for the local strategy of the `passport-local`.
 * 
 * The function verifies the user by their username and password it checks if the username exists in the Database and if
 * their password is correct if they are then it calls the `done` function with 2 params `null` for the error and `user` for the user param
 * 
 * If it found any kind of error it calls the `done` function with the error in the error param and `null` for the user
 *
 * @async
 * @param {String} username
 * @param {String} password
 * @param {Function} done
 * @returns {Object}
 */
const verify = async (payload, done) => {
    try {
        if (payload.type != tokenTypes.ACCESS) return done();
        const user = await User.findById(payload.sub);
        if (!user) throw new Error("User not found");
        done(null, user);
    } catch (error) {
        console.error(error);
        done();
    }
};
/**
 * @description 
 * The function to mark the user as verified
 * 
 * Function tries to find the user by their token if it doesn't find the user then the user is
 * already verified or the link expired.
 * 
 * If it finds the user it sets their token to null and the verified to true.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 

 */
const verifyEmail = async (req, res) => {
    try {
        const { query: { token } } = req;
        const tokenDoc = await verifyFromDatabase(token, tokenTypes.EMAIL);
        const user = await User.findById(tokenDoc.user);
        user.verified = true;
        await user.save();
        await Token.findByIdAndDelete(tokenDoc.id);
        return res.status(200).json({ success: true, message: "Email verified" });
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}



/**
 * @description Logout function
 * 
 * The function which logs the user out, it starts by checking if the `req.user` exists if it does then it uses `req.logout`
 * to log him out and then uses `req.session.destroy` to delete the sessions from the Database
 * 
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const logout = (req, res) => {
    // Check if user is logged in
    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'strict' });
    res.sendStatus(204);
};
/**
 * @description Logged in function
 * 
 * The function which checks if the user is authorized by using `req.isAuthenticated` if its true
 * then it calls the `next()` function if its not then it throws an error
 * 
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const loggedIn = (req, res, next) => {
    passport.authenticate('jwt', {
        failureRedirect: '/api/v1/auth/error',
        session: false
    }, (err, user, info) => {
        if (err || info || !user) return res.sendStatus(401);
        req.user = user;
        next();
    })(req, res, next);
}
/**
 * @description 
 * 
 * Function which is called after passport.authenticate fails
 * 
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const incorrectCredentials = (req, res) => {
    res.status(401).json({ success: false, error: "Please make sure you are verified and check your username and password." })
}

// Export the functions for use in other modules
export { register, login, verify, logout, loggedIn, incorrectCredentials, verifyEmail };
