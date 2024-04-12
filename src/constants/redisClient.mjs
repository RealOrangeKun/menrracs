// createClient function from redis to create a client to store cache
import { createClient } from "redis";
// Create the redis client with the link
export const redisClient = createClient({ url: process.env.REDIS })