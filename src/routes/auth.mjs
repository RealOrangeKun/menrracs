// Import the Router from Express
import { Router } from "express";

// Import Express.js framework for building web applications
import express from 'express';

// Import Passport.js for authentication
import passport from "passport";

// Import local authentication strategy
import '../strategies/local-strategy.mjs';

// Import authentication controller functions
import { register, login, checkLoggedIn, logout, incorrectCredentials, verifyEmail } from "../controllers/auth.controller.mjs";
import { checkSchema } from "express-validator";
import { createUserValidationSchema } from "../constants/validationSchema.mjs";

// Create a new router instance
const router = Router();

// Middleware to parse JSON request bodies
router.use(express.json());

// Route for user login
router.post('/login', checkLoggedIn, passport.authenticate('local', {
    failureRedirect: '/api/v1/auth/error'
}), login);

// Route for user registration
router.post('/register', checkSchema(createUserValidationSchema), register);

// Route for user logout
router.post('/logout', logout);

//Router for error if user not in Database
router.get('/error', incorrectCredentials)

router.get('/verifyEmail', verifyEmail)


// Export the router
export default router;
