import { redis_credentials } from "../../config/redisConfig";
import { REDIS_ENUMS } from "../../config/enums";
import Redis from "ioredis";
let redis: Redis;

try {
  redis = new Redis({
    username: redis_credentials.redis_user,
    password: redis_credentials.redis_password,
    host: redis_credentials.redis_host,
    port: parseInt(redis_credentials.redis_port ?? ""),
  });

  redis.on("connect", () => {
    console.log("[!]", REDIS_ENUMS.CONNECTED);
  });
  redis.on("error", (e: any) => {
    console.log("[!]", REDIS_ENUMS.FAILED, e.message);
  });

} catch (e: any) {
  console.log("[!] Error:", e.message);
}

export { redis as RedisClient };
