import Redis from "ioredis";

const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;
const password = process.env.REDIS_PASSWORD;

if (!host || !port) {
  console.error("❌ Redis configuration is missing in environment variables.");
  process.exit(1);
}

const redis = new Redis({
  host,
  port,
  password,

  keepAlive: 30000, // 30 seconds
  tcpNoDelay: true,

  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },

  maxRetriesPerRequest: 3,

  reconnectOnError: (err) => {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) return true;
    return false;
  },
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis Cloud successfully!");
});

redis.on("error", (err) => {
  console.error("❌ Redis Connection Error:", err);
});

export default redis;
