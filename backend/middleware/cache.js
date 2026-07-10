const { createClient } = require('redis');

let redisClient = null;
let isRedisConnected = false;

// Initialize Redis Client
const initRedis = async () => {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        redisClient = createClient({ url: redisUrl });

        redisClient.on('error', (err) => {
            console.warn('Redis Client Error (Caching disabled):', err.message);
            isRedisConnected = false;
        });

        redisClient.on('connect', () => {
            console.log('Redis connected successfully');
            isRedisConnected = true;
        });

        // await redisClient.connect();
        isRedisConnected = false;
    } catch (err) {
        console.warn('Failed to initialize Redis. Falling back to MongoDB.', err.message);
        isRedisConnected = false;
    }
};

// Initialize without blocking server startup
initRedis();

/**
 * Cache Middleware
 * @param {number} duration Expiration time in seconds
 */
const cache = (duration = 300) => {
    return async (req, res, next) => {
        // Bypass cache if redis is not connected or method is not GET
        if (!isRedisConnected || req.method !== 'GET') {
            return next();
        }

        const key = `__cache__${req.originalUrl || req.url}`;

        try {
            const cachedResponse = await redisClient.get(key);

            if (cachedResponse) {
                // Return cached data
                return res.status(200).json(JSON.parse(cachedResponse));
            } else {
                // Store original res.json
                const originalJson = res.json;

                // Override res.json to capture response
                res.json = function (body) {
                    // Only cache successful responses
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            redisClient.setEx(key, duration, JSON.stringify(body));
                        } catch (err) {
                            console.warn('Redis Set Error:', err.message);
                        }
                    }
                    
                    // Call original json method
                    originalJson.call(this, body);
                };

                next();
            }
        } catch (err) {
            console.warn('Redis Get Error (Bypassing cache):', err.message);
            next();
        }
    };
};

module.exports = cache;
