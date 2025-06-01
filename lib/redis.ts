import Redis from "ioredis";

let redis: Redis | null = null;
let redisConnectionAttempted = false;

function createRedisConnection() {
  if (redisConnectionAttempted) return redis;

  redisConnectionAttempted = true;

  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
    });

    redis.on("error", (err) => {
      console.warn("Redis connection error (non-critical):", err.message);
    });

    return redis;
  } catch (error) {
    console.warn("Failed to create Redis connection:", error);
    return null;
  }
}

export function getRedis() {
  return createRedisConnection();
}
