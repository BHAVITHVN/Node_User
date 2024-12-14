const { getRedisClient } = require('../utils/redis');


/**
 * Cache Middleware for Optimized API Response Caching
 *
 * This middleware intercepts API requests and checks Redis for cached responses. 
 * If a cache hit occurs, it serves the cached response immediately, avoiding backend processing.
 * For cache misses, it allows the request to proceed and caches the response after processing.
 *
 * Key Features:
 * - Cache Lookup: Checks Redis for pre-cached responses using a unique key.
 * - Automatic Caching: Caches the response if not already available (cache miss).
 * - Key Namespacing: Includes parameters like user ID and query string for accurate keys.
 * - Expiration: Ensures cached data is refreshed periodically with a configurable TTL (default: 1 hour).
 * - Graceful Fallback: Allows the request to proceed in case of Redis errors.
 *
 * Usage:
 * - Attach this middleware to routes that benefit from caching, such as read-heavy endpoints.
 *
 * Example Key Format:
 * `cache:user:<userId>:filters:<queryString>`
 */
const cacheMiddleware = async (req, res, next) => {
  const redis = getRedisClient();

  // Construct a unique cache key using user ID and query string
  const cacheKey = `cache:user:${req.params.userId}:filters:${JSON.stringify(req.query)}`;

  try {
    // Check for cached data in Redis
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log('Cache hit:', cacheKey);
      return res.json(JSON.parse(cachedData)); // Serve cached response
    }

    console.log('Cache miss:', cacheKey);
    res.locals.cacheKey = cacheKey; // Save the cache key for use in the response

    // Override `res.json` to automatically cache the response
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      try {
        // Cache the response in Redis with a TTL of 1 hour
        await redis.set(cacheKey, JSON.stringify(data), 'EX', 3600);
        console.log('Response cached:', cacheKey);
      } catch (err) {
        console.error('Error caching response:', err);
      }
      originalJson(data); // Send the response to the client
    };

    next(); // Proceed to the next middleware/controller
  } catch (err) {
    console.error('Redis error:', err);
    next(); // Fallback to next middleware/controller if Redis fails
  }
};



module.exports = cacheMiddleware;
