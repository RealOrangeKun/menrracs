/**
 * @module app
 * @author Youssef Tarek
 */

// Express.js framework for building web applications
import express from "express";

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

// Router for authentication routes
import authRouter from './routes/auth.mjs';

// Load environment variables from .env file
config();

// Create an instance of the Express application
const app = express();

// Connect to MongoDB database
mongoose.connect(process.env.DB)
    .then(() => {
        console.log("Connected to DB!");
        // Start the server once connected to the database
        app.listen(process.env.PORT || 5000, () => {
            console.log('Listening on port: ' + process.env.PORT);
        });
    })
    .catch(err => console.log(err.message));

// Middleware to parse JSON request bodies
app.use(express.json());

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
    // Session duration in milliseconds (30 minutes)
    cookie: {
        maxAge: 30 * 60 * 1000,
    },
    // MongoDB connection client and collection to store sessions
    store: MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: 'sessions'
    })
}));

// Initialize Passport.js for authentication
app.use(passport.initialize());

// Middleware to restore session data
app.use(passport.session());

// Mount authentication router at /api/auth
app.use('/api/auth', authRouter);

// Endpoint to check server status
app.get('/api/status', (req, res) => {
    console.log(req.sessionID);
    // Send a response with status 200
    res.sendStatus(200);
});
