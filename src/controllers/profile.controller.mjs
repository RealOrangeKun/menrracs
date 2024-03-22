import { matchedData, validationResult } from 'express-validator';
import User from '../models/user.schema.mjs';
import hashPassword from './crypt.mjs';

/**
 * @description 
 * 
 * 
 * 
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const getProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        res.status(200).json({
            success: true, data: {
                username: user.username, email: user.email, filesUploaded: user.files
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
}
/**
 * @description 
 * 
 * 
 * 
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const updateProfile = async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) return res.status(400).json({ success: false, errors: result.array() })
    if (!req.query.username && !req.query.password && !req.query.email) return res.status(400).json({ success: false, error: "Nothing was provided in the request query" })
    const data = matchedData(req);
    try {
        if (data.username) {
            await User.updateOne({ _id: req.user.id }, { $set: { username: data.username } })
            req.user.username = data.username;
        }
        if (data.password) {
            data.password = hashPassword(data.password);
            await User.updateOne({ _id: req.user.id }, { $set: { password: data.password } })
            req.user.password = data.password;
        }
        if (data.email) {
            await User.updateOne({ _id: req.user.id }, { $set: { email: data.email } })
            req.user.email = data.email;
        }
        res.status(200).json({ success: true, message: "Profile updated successfully" })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
}

export { getProfile, updateProfile }