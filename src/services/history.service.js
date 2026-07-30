const db = require('../config/database');

const getWatchHistory = async (userId) => {
  const query = `
    SELECT id, user_id, tmdb_id, title, type, season, episode, watch_progress as progress, created_at, updated_at
    FROM public.watch_history
    WHERE user_id = $1
    ORDER BY updated_at DESC;
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

const addWatchHistory = async (userId, { tmdb_id, title, type, season, episode, progress }) => {
  const watchProgress = progress !== undefined ? progress : 0;
  const itemTitle = title || '';
  const itemSeason = season !== undefined ? season : null;
  const itemEpisode = episode !== undefined ? episode : null;

  const query = `
    INSERT INTO public.watch_history (user_id, tmdb_id, title, type, season, episode, watch_progress, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    ON CONFLICT (user_id, tmdb_id, season, episode)
    DO UPDATE SET
      watch_progress = EXCLUDED.watch_progress,
      title = COALESCE(EXCLUDED.title, watch_history.title),
      updated_at = NOW()
    RETURNING id, user_id, tmdb_id, title, type, season, episode, watch_progress as progress, created_at, updated_at;
  `;

  const result = await db.query(query, [
    userId,
    tmdb_id,
    itemTitle,
    type,
    itemSeason,
    itemEpisode,
    watchProgress,
  ]);

  return result.rows[0];
};

const deleteWatchHistoryItem = async (userId, historyId) => {
  const query = `
    DELETE FROM public.watch_history
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const result = await db.query(query, [historyId, userId]);

  if (result.rows.length === 0) {
    const err = new Error('Watch history item not found or unauthorized.');
    err.statusCode = 404;
    throw err;
  }

  return { id: historyId };
};

module.exports = {
  getWatchHistory,
  addWatchHistory,
  deleteWatchHistoryItem,
};
