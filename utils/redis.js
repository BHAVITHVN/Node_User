const Redis = require('ioredis');


let redisClient;

const initializeRedis = () => {
    if (!redisClient) {
        return new Promise((resolve, reject) => {
        redisClient = new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || null, // Optional
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
            retryStrategy(times) {
                return Math.min(times * 50, 2000); // Exponential backoff up to 2 seconds
            },
        });

        redisClient.on('connect', () => console.log('Connected to Redis'));
        redisClient.on('error', (err) => console.error('Redis error:', err));
        redisClient.on('end', () => console.log('Redis connection closed.'));
    
});
    }
    return Promise.resolve(redisClient);
};

const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis client is not initialized. Call initializeRedis first.');
    }
    return redisClient;
};

module.exports = { initializeRedis, getRedisClient };
