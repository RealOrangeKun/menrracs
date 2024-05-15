import jwt from 'jsonwebtoken';
import Token from '../models/token.schema.mjs';
import { tokenTypes } from '../constants/tokenConstants.mjs';
import 'dotenv/config';
const secret = process.env.SECRET_KEY;
import moment from 'moment';

const emailExp = process.env.JWT_EMAIL_EXPIRE;
const accessExp = process.env.JWT_ACCESS_EXPIRE;
const refreshExp = process.env.JWT_REFRESH_EXPIRE;
export const generateToken = (id, exp, type) => {
    const payload = {
        sub: id,
        iat: moment().unix(),
        exp,
        type
    };
    return jwt.sign(payload, secret);
}

export const saveToken = async (token) => {
    return await Token.create(token);
}

export const verifyFromDatabase = async (token, type) => {
    const payload = jwt.verify(token, secret);
    const tokenDoc = await Token.findOne({ token, type, user: payload.sub });
    if (!tokenDoc) throw new Error("Token not found");
    return tokenDoc;
}

export const generateEmailToken = async (id) => {
    const exp = moment().add(emailExp, 'minutes').unix();
    const token = generateToken(id, exp, tokenTypes.EMAIL);
    await saveToken({
        token,
        type: tokenTypes.EMAIL,
        expires: exp,
        user: id
    });
    return token;
}
export const generateAccessToken = (id) => {
    const exp = moment().add(accessExp, 'days').unix();
    const token = generateToken(id, exp, tokenTypes.ACCESS);
    return token;
}
export const generateRefreshToken = async (id) => {
    const exp = moment().add(refreshExp, 'minutes').unix();
    const token = generateToken(id, exp, tokenTypes.REFRESH);
    const tokenDoc = await saveToken({
        token,
        type: tokenTypes.REFRESH,
        expires: exp,
        user: id
    });
    return tokenDoc;
}