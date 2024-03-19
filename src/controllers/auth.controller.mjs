import User from "../models/user.schema.mjs";
import hashPassword from './crypt.mjs';
import bcrypt from 'bcrypt'

const register = async (req, res) => {
    let { body } = req;
    try {
        if (req.user) throw new Error("User is logged in, please logout to register");
        body.password = hashPassword(body.password);
        if (await User.findOne({ $or: [{ username: body.username }, { email: body.email }] })) throw new Error("User with this email or username already exists");
        const user = await User.create(body);
        return res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
};

const login = async (req, res) => {
    res.status(200).json({ success: true, message: 'Logged in' });
};
const verify = async (username, password, done) => {
    try {
        const user = await User.findOne({ username })
        if (!user) throw new Error("User not found")
        if (!bcrypt.compareSync(password, user.password)) throw new Error("Password is incorrect")
        done(null, user)
    } catch (error) {
        done(error, null)
    }
}
const checkLoggedIn = (req, res, next) => {
    try {
        if (req.user) throw new Error("User already logged in")
        next()
    } catch (error) {
        res.status(403).json({ success: false, message: error.message })
    }
}
const logout = (req, res) => {
    req.user ? req.logout(err => {
        if (err) {
            return res.sendStatus(500);
        }
        req.session.destroy(err => err ? res.status(500).json({ success: false, message: 'Failed to logout due to server error' }) :
            res.status(200).json({ success: true, message: "User logged out successfully" }))
    }) : res.status(401).json({ success: false, message: "User not logged in" });
};

export { register, login, verify, checkLoggedIn, logout }; // Exporting individual functions
