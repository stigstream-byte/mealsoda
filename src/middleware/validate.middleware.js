const { errorResponse } = require('../utils/response.util');

const validateRegister = (req, res, next) => {
  const { email, username, password } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return errorResponse(res, 400, 'A valid email address is required.');
  }

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return errorResponse(res, 400, 'Username must be at least 3 characters long.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return errorResponse(res, 400, 'Password must be at least 6 characters long.');
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { login, email, username, identifier, password } = req.body;
  const resolvedIdentifier = login || email || username || identifier;

  if (!resolvedIdentifier || typeof resolvedIdentifier !== 'string') {
    return errorResponse(res, 400, 'Email or username is required.');
  }

  if (!password || typeof password !== 'string') {
    return errorResponse(res, 400, 'Password is required.');
  }

  // Attach resolved identifier to req.body.identifier
  req.body.identifier = resolvedIdentifier.trim();
  next();
};

const validateHistory = (req, res, next) => {
  const { tmdb_id, type } = req.body;

  if (!tmdb_id || isNaN(Number(tmdb_id))) {
    return errorResponse(res, 400, 'Valid numeric tmdb_id is required.');
  }

  if (!type || !['movie', 'tv'].includes(type)) {
    return errorResponse(res, 400, 'Type must be either "movie" or "tv".');
  }

  next();
};

const validateContinueWatching = (req, res, next) => {
  const { tmdb_id, type } = req.body;

  if (!tmdb_id || isNaN(Number(tmdb_id))) {
    return errorResponse(res, 400, 'Valid numeric tmdb_id is required.');
  }

  if (!type || !['movie', 'tv'].includes(type)) {
    return errorResponse(res, 400, 'Type must be either "movie" or "tv".');
  }

  next();
};

const validateWatchlist = (req, res, next) => {
  const { tmdb_id, type } = req.body;

  if (!tmdb_id || isNaN(Number(tmdb_id))) {
    return errorResponse(res, 400, 'Valid numeric tmdb_id is required.');
  }

  if (!type || !['movie', 'tv'].includes(type)) {
    return errorResponse(res, 400, 'Type must be either "movie" or "tv".');
  }

  next();
};

const validateBannedContent = (req, res, next) => {
  const { tmdb_id, type } = req.body;

  if (!tmdb_id || isNaN(Number(tmdb_id))) {
    return errorResponse(res, 400, 'Valid numeric tmdb_id is required.');
  }

  if (!type || !['movie', 'tv', 'all'].includes(type)) {
    return errorResponse(res, 400, 'Type must be "movie", "tv", or "all".');
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateHistory,
  validateContinueWatching,
  validateWatchlist,
  validateBannedContent,
};
