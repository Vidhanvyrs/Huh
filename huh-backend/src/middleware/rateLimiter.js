const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware to prevent abuse of the AI API endpoint.
 * Currently set to 15 requests per 15 minutes per IP address.
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { error: "Too many explanations requested from this IP, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter
};
