const db = require('../config/database');

const getUserProfile = async (id) => {
  const query = `
    SELECT id, name, username, created_at
    FROM public.users
    WHERE id = $1;
  `;
  const result = await db.query(query, [id]);

  if (result.rows.length === 0) {
    const err = new Error('User profile not found.');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

const getOwnProfile = async (userId) => {
  const query = `
    SELECT id, name, username, email, is_admin, created_at, updated_at
    FROM public.users
    WHERE id = $1;
  `;
  const result = await db.query(query, [userId]);

  if (result.rows.length === 0) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

const updateOwnProfile = async (userId, { name, username, email }) => {
  // Verify user exists
  const currentRes = await db.query('SELECT id, email, username, name FROM public.users WHERE id = $1', [userId]);
  if (currentRes.rows.length === 0) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const currentUser = currentRes.rows[0];

  const updatedName = name !== undefined ? name.trim() : currentUser.name;
  let updatedUsername = currentUser.username;
  let updatedEmail = currentUser.email;

  if (username && username.trim() !== currentUser.username) {
    const checkUser = await db.query(
      'SELECT id FROM public.users WHERE LOWER(username) = LOWER($1) AND id != $2',
      [username.trim(), userId]
    );
    if (checkUser.rows.length > 0) {
      const err = new Error('This username is already in use.');
      err.statusCode = 409;
      throw err;
    }
    updatedUsername = username.trim();
  }

  if (email && email.trim().toLowerCase() !== (currentUser.email || '').toLowerCase()) {
    const checkEmail = await db.query(
      'SELECT id FROM public.users WHERE LOWER(email) = LOWER($1) AND id != $2',
      [email.trim().toLowerCase(), userId]
    );
    if (checkEmail.rows.length > 0) {
      const err = new Error('This email address is already in use.');
      err.statusCode = 409;
      throw err;
    }
    updatedEmail = email.trim().toLowerCase();
  }

  const updateQuery = `
    UPDATE public.users
    SET name = $1, username = $2, email = $3, updated_at = NOW()
    WHERE id = $4
    RETURNING id, name, username, email, is_admin, created_at, updated_at;
  `;

  const result = await db.query(updateQuery, [updatedName, updatedUsername, updatedEmail, userId]);
  return result.rows[0];
};

const searchUsers = async ({ query, is_admin }) => {
  let sql = 'SELECT id, username, email, is_admin, created_at FROM public.users WHERE 1=1';
  const params = [];

  if (query) {
    params.push(`%${query.trim()}%`);
    sql += ` AND (username ILIKE $${params.length} OR email ILIKE $${params.length})`;
  }

  if (is_admin === 'true' || is_admin === true) {
    sql += ' AND is_admin = true';
  }

  sql += ' ORDER BY created_at DESC LIMIT 50';

  const result = await db.query(sql, params);
  return result.rows;
};

const grantAdmin = async (username) => {
  if (!username) {
    const err = new Error('Username is required.');
    err.statusCode = 400;
    throw err;
  }

  const query = `
    UPDATE public.users
    SET is_admin = true
    WHERE username ILIKE $1
    RETURNING id, username, is_admin, created_at;
  `;
  const result = await db.query(query, [username.trim()]);

  if (result.rows.length === 0) {
    const err = new Error(`No user found named "@${username}"`);
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

const revokeAdmin = async (id) => {
  const query = `
    UPDATE public.users
    SET is_admin = false
    WHERE id = $1
    RETURNING id, username, is_admin;
  `;
  const result = await db.query(query, [id]);

  if (result.rows.length === 0) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return { message: 'Admin access revoked', user: result.rows[0] };
};

module.exports = {
  getUserProfile,
  getOwnProfile,
  updateOwnProfile,
  searchUsers,
  grantAdmin,
  revokeAdmin,
};
