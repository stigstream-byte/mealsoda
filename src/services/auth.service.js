const bcrypt = require('bcrypt');
const db = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.util');

const register = async ({ email, username, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.trim();

  // Check if user already exists
  const existingCheck = await db.query(
    'SELECT id, email, username FROM public.users WHERE LOWER(email) = $1 OR LOWER(username) = LOWER($2)',
    [normalizedEmail, normalizedUsername]
  );

  if (existingCheck.rows.length > 0) {
    const existing = existingCheck.rows[0];
    if (existing.email.toLowerCase() === normalizedEmail) {
      const err = new Error('An account with this email already exists.');
      err.statusCode = 409;
      throw err;
    }
    if (existing.username.toLowerCase() === normalizedUsername.toLowerCase()) {
      const err = new Error('This username is already taken.');
      err.statusCode = 409;
      throw err;
    }
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Insert user
  const insertQuery = `
    INSERT INTO public.users (name, email, username, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, username, is_admin, created_at, updated_at;
  `;
  const result = await db.query(insertQuery, [
    normalizedUsername,
    normalizedEmail,
    normalizedUsername,
    passwordHash,
  ]);

  const user = result.rows[0];

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token
  await db.query('UPDATE public.users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const login = async ({ identifier, password }) => {
  const normalizedIdentifier = identifier.toLowerCase().trim();

  // Find user by email OR username
  const query = `
    SELECT id, name, email, username, password_hash, is_admin, created_at, updated_at
    FROM public.users
    WHERE LOWER(email) = $1 OR LOWER(username) = $1;
  `;
  const result = await db.query(query, [normalizedIdentifier]);

  if (result.rows.length === 0) {
    const err = new Error('Invalid email/username or password.');
    err.statusCode = 401;
    throw err;
  }

  const user = result.rows[0];

  if (!user.password_hash) {
    const err = new Error('Invalid authentication method for this account.');
    err.statusCode = 400;
    throw err;
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const err = new Error('Invalid email/username or password.');
    err.statusCode = 401;
    throw err;
  }

  // Sanitize user object
  delete user.password_hash;

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token
  await db.query('UPDATE public.users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const logout = async (userId, refreshToken) => {
  if (userId) {
    await db.query('UPDATE public.users SET refresh_token = NULL WHERE id = $1', [userId]);
  } else if (refreshToken) {
    await db.query('UPDATE public.users SET refresh_token = NULL WHERE refresh_token = $1', [refreshToken]);
  }
};

const refreshSession = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    const err = new Error('Refresh token is required.');
    err.statusCode = 400;
    throw err;
  }

  const decoded = verifyRefreshToken(incomingRefreshToken);
  if (!decoded) {
    const err = new Error('Invalid or expired refresh token.');
    err.statusCode = 401;
    throw err;
  }

  const userId = decoded.id || decoded.sub;
  const result = await db.query(
    'SELECT id, name, email, username, is_admin, refresh_token FROM public.users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const user = result.rows[0];

  if (!user.refresh_token || user.refresh_token !== incomingRefreshToken) {
    const err = new Error('Refresh token has been revoked or invalidated.');
    err.statusCode = 401;
    throw err;
  }

  delete user.refresh_token;

  // Rotate tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await db.query('UPDATE public.users SET refresh_token = $1 WHERE id = $2', [newRefreshToken, user.id]);

  return {
    user,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const getMe = async (userId) => {
  const result = await db.query(
    'SELECT id, name, email, username, is_admin, created_at, updated_at FROM public.users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

module.exports = {
  register,
  login,
  logout,
  refreshSession,
  getMe,
};
