const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response.util');

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 429, 'Too many requests from this IP, please try again after 15 minutes.');
  },
});

module.exports = {
  authRateLimiter,
};
