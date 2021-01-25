const Redis = require("ioredis");
const redis = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_END_POINT,
  });

// create redis client
redis.on('connect', () => console.log('Connected to Redis'))

module.exports = redis