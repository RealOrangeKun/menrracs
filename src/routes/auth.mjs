import { Router } from "express";
import express from 'express'
import passport from "passport";
import '../strategies/local-strategy.mjs'
import { register, login, checkLoggedIn, logout } from "../controllers/auth.controller.mjs";

const router = Router()
router.use(express.json())

router.post('/login', checkLoggedIn, passport.authenticate('local', {
    failureRedirect: '/login'
}), login)

router.post('/register', register)

router.post('/logout', logout)

export default router