import { REDIS_CONFIG } from "../../interface/interface";
require('dotenv').config();

export const redis_credentials: REDIS_CONFIG = {
    redis_host: process.env.REDIS_HOST || '',
    redis_port: process.env.REDIS_PORT,
    redis_user: process.env.REDIS_USER,
    redis_password: process.env.REDIS_PASSWORD
};