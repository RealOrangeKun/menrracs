// Import the User model
import User from "../models/user.schema.mjs";

// Import the hashPassword function from the crypt module
import hashPassword from './crypt.mjs';

// Import the bcrypt library for password hashing
import bcrypt from 'bcrypt';

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
 * Function then adds the new user to the Database and sends a status of `201` with a json of to tell the user that the process was successfull.
 * @async
 * @param {import('express').Request} req - Express Request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Object} Success or error response.
 */
const register = async (req, res) => {
    let { body } = req;
    try {
        // Check if user is already logged in
        if (req.user) throw new Error("User is logged in, please logout to register");

        // Hash the password before saving it
        body.password = hashPassword(body.password);

        // Check if username or email already exists
        if (await User.findOne({ $or: [{ username: body.username }, { email: body.email }] })) throw new Error("User with this email or username already exists");

        // Create a new user and save to database
        const user = await User.create(body);
        return res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (error) {
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
    // Return success response for login
    res.status(200).json({ success: true, message: 'Logged in' });
};


const verify = async (username, password, done) => {
    try {
        // Find user by username in the database
        const user = await User.findOne({ username });
        if (!user) throw new Error("User not found");

        // Compare hashed password with provided password
        if (!bcrypt.compareSync(password, user.password)) throw new Error("Password is incorrect");

        // Call done callback with user object if authentication is successful
        done(null, user);
    } catch (error) {
        // Call done callback with error if authentication fails
        done(error, null);
    }
};

// Middleware to check if user is already logged in
const checkLoggedIn = (req, res, next) => {
    try {
        // If user is already logged in, throw error
        if (req.user) throw new Error("User already logged in");

        // Call next middleware if user is not logged in
        next();
    } catch (error) {
        // Return error response if user is already logged in
        res.status(403).json({ success: false, message: error.message });
    }
};

// Function to handle user logout
const logout = (req, res) => {
    // Check if user is logged in
    req.user ? req.logout(err => {
        if (err) {
            // Return server error response if logout fails
            return res.sendStatus(500);
        }
        // Destroy session and return success response if logout is successful
        req.session.destroy(err => err ? res.status(500).json({ success: false, message: 'Failed to logout due to server error' }) :
            res.status(200).json({ success: true, message: "User logged out successfully" }))
    }) : res.status(401).json({ success: false, message: "User not logged in" });
};

// Export the functions for use in other modules
export { register, login, verify, checkLoggedIn, logout };
