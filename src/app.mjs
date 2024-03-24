/**
 * @module app
 * @author Youssef Tarek
 */

// Express.js framework for building web applications
import express from "express";

// HTTPS module for creating HTTPS servers
import https from 'https';

// Load environment variables from .env file
import { config } from "dotenv";

// Session middleware for Express
import session from "express-session";

// Passport.js for authentication
import passport from "passport";

// MongoDB session store for Express sessions
import MongoStore from "connect-mongo";

// MongoDB object modeling tool
import mongoose from "mongoose";

// Parse cookies in request headers
import cookieParser from "cookie-parser";

// File system module for reading files
import { readFileSync } from "fs";

// Router for authentication routes
import authRouter from './routes/auth.mjs';
import filesRouter from './routes/files.mjs'
import { checkLoggedIn, loggedIn } from "./controllers/auth.controller.mjs";
import profileRouter from './routes/profile.mjs'


// Load environment variables from .env file
config();

// Create an instance of the Express application
const app = express();

// Connect to MongoDB database
mongoose.connect(process.env.DB || 'mongodb://localhost:27017/menracs')
    .then(() => {
        console.log("Connected to DB!");
        // Create HTTPS server
        const sslServer = https.createServer({
            // Read SSL certificate key and certificate files
            key: readFileSync(process.env.KEY_PATH),
            cert: readFileSync(process.env.CERT_PATH)
        }, app)
        // Start HTTPS server
        sslServer.listen(process.env.PORT || 5000, () => console.log('Listening on port ' + process.env.PORT || 5000))
    })
    .catch(err => console.log(err.message));

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL Encoded request bodies
app.use(express.urlencoded({ extended: true }))

// Middleware to parse cookies
app.use(cookieParser(process.env.SECRET_KEY));

// Configure session middleware
app.use(session({
    // Secret used to sign the session ID cookie
    secret: process.env.SECRET_KEY,
    // Do not save sessions if they have not been modified
    resave: false,
    // Save new sessions that have not been modified
    saveUninitialized: true,
    // Session duration in milliseconds (2 Weeks)
    cookie: {
        maxAge: 2 * 7 * 24 * 60 * 60 * 1000,
    },
    // MongoDB connection client and collection to store sessions
    store: MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: 'sessions',
        touchAfter: 24 * 3600
    })
}));

// Initialize Passport.js for authentication
app.use(passport.initialize());

// Middleware to restore session data
app.use(passport.session());

// Mount authentication router at /api/auth
app.use('/api/auth', authRouter);

// Mount file handling router at /api/files
app.use('/api/files', loggedIn, filesRouter)

app.use('/api/profile', loggedIn, profileRouter)

// Middleware to handle 404 errors
app.all('*', (req, res) => {
    // Set the HTTP status code to 404
    res.status(404).json({
        error: 'Not Found',
        message: 'Oops! Looks like the page you are looking for does not exist.'
    });
});



