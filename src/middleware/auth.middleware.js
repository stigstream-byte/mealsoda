const { verifyAccessToken } = require('../utils/jwt.util');
const { errorResponse } = require('../utils/response.util');

const authenticateToken = (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return errorResponse(res, 401, 'Authentication token missing or invalid.');
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return errorResponse(res, 401, 'Invalid or expired access token.');
  }

  req.user = {
    id: decoded.id || decoded.sub,
    email: decoded.email,
    username: decoded.username,
    is_admin: decoded.is_admin || false,
  };

  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return errorResponse(res, 403, 'Access denied. Admin privileges required.');
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
};
