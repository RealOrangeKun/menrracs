import { redisClient } from '../constants/redisClient.mjs'


/**
 * @description 
 * 
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {Function} next
 */


export const redisMiddleware = async (req, res, next) => {
    const cache = await redisClient.get(`${req.user.id}:${req.method}:${req.path}`);
    console.log(cache);
    cache ? res.status(200).json(JSON.parse(cache)) : next();
}