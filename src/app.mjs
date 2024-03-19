import express from "express";
import { config } from "dotenv";
import session from "express-session"
import passport from "passport";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRouter from './routes/auth.mjs'
config()
const app = express()

mongoose.connect(process.env.DB)
    .then(() => {
        console.log("Connected to DB!")
        app.listen(process.env.PORT || 5000, () => {
            console.log('Listening on port: ' + process.env.PORT)
        })
    })
    .catch(err => console.log(err.message))

app.use(express.json())

app.use(cookieParser(process.env.SECRET_KEY))

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 30 * 60 * 1000,
    }, store: MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: 'sessions'
    })
}))

app.use(passport.initialize())

app.use(passport.session())

app.use('/api/auth', authRouter)

app.get('/api/status', (req, res) => {
    console.log(req.sessionID);
    res.sendStatus(200)
})