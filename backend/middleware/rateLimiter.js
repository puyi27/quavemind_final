import redisClient from '../lib/redis.js';

/**
 * Sliding Window Counter Rate Limiter using Redis
 * @param {string} prefix - Prefix for the redis key (e.g., 'rl:search')
 * @param {number} limit - Max requests in the window
 * @param {number} windowSeconds - Window size in seconds
 */
export const slidingWindowRateLimiter = (prefix, limit, windowSeconds) => {
  return async (req, res, next) => {
    if (!redisClient.isOpen) return next(); // Fallback: allow if redis is down

    const ip = req.ip || req.headers['x-forwarded-for'];
    const key = `${prefix}:${ip}`;
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);

    try {
      // 1. Remove old entries outside the window
      await redisClient.zRemRangeByScore(key, 0, windowStart);

      // 2. Count requests in the current window
      const requestCount = await redisClient.zCard(key);

      if (requestCount >= limit) {
        return res.status(429).json({
          status: 'error',
          mensaje: 'Too Many Requests - Estás excediendo el límite de la "Sliding Window". Calma.',
          retryAfter: windowSeconds
        });
      }

      // 3. Add current request
      await redisClient.zAdd(key, { score: now, value: `${now}:${Math.random()}` });
      
      // 4. Set expiration for the whole set
      await redisClient.expire(key, windowSeconds);

      next();
    } catch (error) {
      console.error('Rate Limiter Error:', error);
      next();
    }
  };
};
