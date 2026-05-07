import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

const memoryCache = new Map();

redisClient.on('error', (err) => {
  // Solo loguear si no es un error de conexión esperable en local
  if (process.env.NODE_ENV === 'production') console.error('Redis Client Error', err);
});

// Intentar conectar al iniciar
(async () => {
  try {
    if (process.env.REDIS_URL || process.env.NODE_ENV === 'production') {
      await redisClient.connect();
      console.log('Redis Client Connected');
    }
  } catch (err) {
    console.warn('Could not connect to Redis, using in-memory fallback');
  }
})();

export const cacheData = async (key, data, expirationSeconds = 3600) => {
  try {
    if (redisClient.isOpen) {
      return await redisClient.set(key, JSON.stringify(data), {
        EX: expirationSeconds
      });
    }
  } catch (e) {
    console.warn('Redis set error:', e.message);
  }
  
  // Fallback a memoria
  memoryCache.set(key, {
    data: JSON.stringify(data),
    expiry: Date.now() + (expirationSeconds * 1000)
  });
};

export const getCachedData = async (key) => {
  try {
    if (redisClient.isOpen) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    }
  } catch (e) {
    console.warn('Redis get error:', e.message);
  }

  // Fallback a memoria
  const cached = memoryCache.get(key);
  if (cached) {
    if (Date.now() > cached.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return JSON.parse(cached.data);
  }
  
  return null;
};

export default redisClient;
