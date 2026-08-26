const rateLimit = require('express-rate-limit');

const tooMany = (message) => (req, res) => {
    res.status(429).json({ success: false, message });
};

const base = {
    standardHeaders: true,
    legacyHeaders: false,
    // Rate limiting is a launch-safety net, not a dev annoyance.
    skip: () => process.env.DISABLE_RATE_LIMIT === 'true'
};

// Broad ceiling for the whole API. Generous enough that a normal user browsing
// workers and bookings never notices it.
exports.apiLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 600,
    handler: tooMany('Too many requests. Please wait a moment and try again.')
});

// Credential endpoints. A 6-digit OTP is trivially brute-forceable without this.
exports.authLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 12,
    skipSuccessfulRequests: true,
    handler: tooMany('Too many login attempts. Please try again in 15 minutes.')
});

// Account creation and password reset: slower still, and successful calls count.
exports.sensitiveLimiter = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 10,
    handler: tooMany('Too many attempts. Please try again in an hour.')
});

// Endpoints a logged-out visitor can write to (leads, callbacks, emergency,
// area requests). Keeps spam out of the admin queue.
exports.publicWriteLimiter = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 30,
    handler: tooMany('Too many requests from this device. Please try again later.')
});
