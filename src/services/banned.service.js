const db = require('../config/database');

const getBannedContent = async () => {
  const query = `
    SELECT id, tmdb_id, type, title, reason, created_at, created_by
    FROM public.banned_content
    ORDER BY created_at DESC;
  `;
  const result = await db.query(query);
  return result.rows;
};

const addBannedContent = async (adminUserId, { tmdb_id, type, title, reason }) => {
  const itemTitle = title || '';
  const itemReason = reason || '';

  const query = `
    INSERT INTO public.banned_content (tmdb_id, type, title, reason, created_by)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (tmdb_id, type)
    DO UPDATE SET
      title = COALESCE(EXCLUDED.title, banned_content.title),
      reason = COALESCE(EXCLUDED.reason, banned_content.reason),
      created_by = EXCLUDED.created_by
    RETURNING id, tmdb_id, type, title, reason, created_at, created_by;
  `;

  const result = await db.query(query, [
    tmdb_id,
    type,
    itemTitle,
    itemReason,
    adminUserId,
  ]);

  return result.rows[0];
};

const deleteBannedContent = async (bannedId) => {
  const query = `
    DELETE FROM public.banned_content
    WHERE id = $1
    RETURNING id;
  `;
  const result = await db.query(query, [bannedId]);

  if (result.rows.length === 0) {
    const err = new Error('Banned content item not found.');
    err.statusCode = 404;
    throw err;
  }

  return { id: bannedId };
};

module.exports = {
  getBannedContent,
  addBannedContent,
  deleteBannedContent,
};
