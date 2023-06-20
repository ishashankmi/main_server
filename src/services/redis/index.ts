require('dotenv').config();
import { REDIS_ENUMS } from "../../config/enums";
import { RedisClient } from "./connection";

let token_expiry: any = process.env.TOKEN_EXPIRY_MINUTES || 1440;
token_expiry *= 60;
class Main { 
    public static async setCache(key: string, value: string): Promise<boolean> {
      try {
        await RedisClient.set(key, value);
        await RedisClient.expire(key, token_expiry);
        return true;
      } catch (error) {
        console.error('[x]', REDIS_ENUMS.TTL_ERROR, error);
        return false;
      }
    };

    public static async getCache(key: string): Promise<null | string> {
      const data = await RedisClient.get(key);
      return data;
    }
}

export { Main as CacheUtil }