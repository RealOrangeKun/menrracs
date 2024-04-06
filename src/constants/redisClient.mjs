// createClient function from redis to create a client to store cache
import { createClient } from "redis";
export const redisClient = createClient({ url: process.env.REDIS })