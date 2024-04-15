// createClient function from redis to create a client to store cache
import { createClient } from "redis";
// Create the redis client with the link
let options;
if (process.env.ENV === 'prod') options = {
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS,
        port: 15589
    }
}
else {
    options = {
        url: process.env.REDIS
    };
}
export const redisClient = createClient(options)