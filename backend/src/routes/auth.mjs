// Import the Router from Express
import { Router } from "express";

// Import Express.js framework for building web applications
import express from 'express';

// Import Passport.js for authentication
import passport from "passport";

// Import local authentication strategy
import '../auth/local-strategy.mjs';

// Import authentication controller functions
import { register, login, logout, incorrectCredentials, verifyEmail, loggedIn } from "../controllers/auth.controller.mjs";

// Import the checkschema function from express-validator to validate user input
import { checkSchema } from "express-validator";

// Import createUserValidationSchema to have the schema which is passed to checkSchema
import { createUserValidationSchema } from "../constants/validationSchema.mjs";
import { generateAccessToken, generateRefreshToken, verifyFromDatabase } from "../helpers/token.helper.mjs";
import { tokenTypes } from "../constants/tokenConstants.mjs";

// Create a new router instance
const router = Router();

// Middleware to parse JSON request bodies
router.use(express.json());

// Route for user login
router.post('/login', login);

// Route for user registration
router.post('/register', checkSchema(createUserValidationSchema), register);

// Route for user logout
router.post('/logout', loggedIn, logout);

//Router for error if user not in Database
router.get('/error', incorrectCredentials)

// Route for verifying the user email
router.get('/email-verification', verifyEmail)

router.post('/refresh-token', async (req, res) => {
    const oldRefresh = req.cookies.jwt;
    const { user } = await verifyFromDatabase(oldRefresh, tokenTypes.EMAIL);
    const newRefresh = await generateRefreshToken(user);
    const newAccess = generateAccessToken(user);
    res.cookie('jwt', newRefresh.token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: newRefresh.expires });
    // Return success response for login
    res.status(200).json({ success: true, message: 'Token Refreshed', token: newAccess });
});


// Export the router
export default router;
