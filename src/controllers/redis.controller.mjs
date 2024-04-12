import { redisClient } from '../constants/redisClient.mjs'


/**
 * @description 
 * Middleware for redis
 * 
 * The middleware checks for the key specified in the redis db
 * 
 * The key is `req.user.id:req.method:req.path`
 * 
 * If it finds it then there is no need to get the response from the server 
 * and it sends the same response again.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {Function} next
 */


export const redisMiddleware = async (req, res, next) => {
    try {
        if (!req.user.id) next();
        const cache = await redisClient.get(`${req.user.id}:${req.method}:${req.path}`);
        cache ? res.status(200).json(JSON.parse(cache)) : next();
    } catch (error) {
        next();
    }

}