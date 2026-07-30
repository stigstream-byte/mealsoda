const { errorResponse } = require('../utils/response.util');

const globalErrorHandler = (err, req, res, next) => {
  console.error(`[Global Error Handler] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  return errorResponse(res, statusCode, message);
};

module.exports = globalErrorHandler;
