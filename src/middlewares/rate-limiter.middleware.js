const { rateLimit } = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    message: {
        code: 'TOO_MANY_REQUESTS',
    },
});

const googleApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 15,
    message: {
        code: 'TOO_MANY_REQUESTS',
    },
});

module.exports = {
    limiter,
    googleApiLimiter,
}