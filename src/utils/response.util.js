/**
 * Utility functions for consistent API JSON responses
 */

const successResponse = (res, statusCode = 200, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

const errorResponse = (res, statusCode = 400, message = 'An error occurred') => {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
