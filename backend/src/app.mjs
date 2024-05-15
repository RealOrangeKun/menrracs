/**
 * @module app
 * @author Youssef Tarek
 */

// Express.js framework for building web applications
import express from "express";


// Load environment variables from .env file
import { config } from "dotenv";

// Passport.js for authentication
import passport from "passport";

// MongoDB session store for Express sessions
import MongoStore from "connect-mongo";

// MongoDB object modeling tool
import mongoose from "mongoose";

// Parse cookies in request headers
import cookieParser from "cookie-parser";

// Cors
import cors from "cors"



// rateLimit to rate limit the requests
import { rateLimit } from 'express-rate-limit'

// startCronJobs to start the scheduled jobs
import { startCronJobs } from "./tasks/inactiveUsersCleanup.task.mjs";

// Router for authentication routes
import authRouter from './routes/auth.mjs';
import filesRouter from './routes/files.mjs'
import { loggedIn } from "./controllers/auth.controller.mjs";
import profileRouter from './routes/profile.mjs'
import { redisClient } from "./constants/redisClient.mjs";
import { redisMiddleware } from "./controllers/redis.controller.mjs";





// Load environment variables from .env file
config();

// Create an instance of the Express application
const app = express();


// Create a rate limiter middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    headers: true, // Send appropriate headers with the response
});

// Connect to MongoDB database
mongoose.connect(process.env.DB)
    .then(async () => {
        console.log("Connected to DB!");
        await redisClient.connect();
        startCronJobs();
        app.listen(process.env.PORT || 5000, () => console.log('Listening on port ' + process.env.PORT || 5000));
    })
    .catch(err => console.log(err.message));

// Middleware to limit the incoming requests
app.use(limiter)



// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL Encoded request bodies
app.use(express.urlencoded({ extended: true }))

// Middleware to parse cookies
app.use(cookieParser(process.env.SECRET_KEY));

// Initialize Passport.js for authentication
app.use(passport.initialize());

// Middleware to store cache for repeated requests
app.use(redisMiddleware);

// Setting up cors
app.use(cors({
    origin: "*",
    credentials: true
}))



// Mount authentication router at /api/v1/auth
app.use('/api/v1/auth', authRouter);

// Mount file handling router at /api/v1/files
app.use('/api/v1/files', loggedIn, filesRouter)

// Mount the profile router at /api/v1/profile
app.use('/api/v1/profile', loggedIn, profileRouter)

// To handle all 404 not found
app.all('*', (req, res) => {
    return res.status(404).send("This endpoint doesn't exist")
})

