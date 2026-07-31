const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response.util');

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Limit each client IP to 100 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  handler: (req, res) => {
    return errorResponse(res, 429, 'Too many requests from this IP, please try again after 15 minutes.');
  },
});

module.exports = {
  authRateLimiter,
};
