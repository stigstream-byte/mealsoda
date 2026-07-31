const db = require('../config/database');

const getContinueWatching = async (userId) => {
  const query = `
    SELECT id, user_id, tmdb_id, type, title, season, episode,
           progress_seconds, duration_seconds, progress_percentage,
           thumbnail_url, last_watched_at, created_at, updated_at
    FROM public.continue_watching
    WHERE user_id = $1
    ORDER BY last_watched_at DESC;
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

const saveContinueWatching = async (userId, data) => {
  const {
    tmdb_id,
    type,
    title,
    season,
    episode,
    progress,
    duration,
    thumbnail_url,
  } = data;

  const itemSeason = season !== undefined ? season : null;
  const itemEpisode = episode !== undefined ? episode : null;
  const progressSeconds = progress !== undefined ? Math.round(Number(progress)) : 0;
  const durationSeconds = duration !== undefined ? Math.round(Number(duration)) : null;
  const itemTitle = title || '';
  const itemThumbnail = thumbnail_url || null;

  let progressPercentage = 0;
  if (durationSeconds && durationSeconds > 0) {
    progressPercentage = Number(((progressSeconds / durationSeconds) * 100).toFixed(2));
  } else if (progressSeconds <= 100) {
    progressPercentage = progressSeconds;
  }

  const query = `
    INSERT INTO public.continue_watching (
      user_id, tmdb_id, type, title, season, episode,
      progress_seconds, duration_seconds, progress_percentage,
      thumbnail_url, last_watched_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    ON CONFLICT (user_id, tmdb_id, type)
    DO UPDATE SET
      season = EXCLUDED.season,
      episode = EXCLUDED.episode,
      progress_seconds = EXCLUDED.progress_seconds,
      duration_seconds = COALESCE(EXCLUDED.duration_seconds, continue_watching.duration_seconds),
      progress_percentage = EXCLUDED.progress_percentage,
      thumbnail_url = COALESCE(EXCLUDED.thumbnail_url, continue_watching.thumbnail_url),
      title = COALESCE(EXCLUDED.title, continue_watching.title),
      last_watched_at = NOW(),
      updated_at = NOW()
    RETURNING id, user_id, tmdb_id, type, title, season, episode,
              progress_seconds, duration_seconds, progress_percentage,
              thumbnail_url, last_watched_at, created_at, updated_at;
  `;

  const result = await db.query(query, [
    userId,
    tmdb_id,
    type,
    itemTitle,
    itemSeason,
    itemEpisode,
    progressSeconds,
    durationSeconds,
    progressPercentage,
    itemThumbnail,
  ]);

  return result.rows[0];
};

const deleteContinueWatchingItem = async (userId, itemId) => {
  const query = `
    DELETE FROM public.continue_watching
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const result = await db.query(query, [itemId, userId]);

  if (result.rows.length === 0) {
    const err = new Error('Continue watching item not found or unauthorized.');
    err.statusCode = 404;
    throw err;
  }

  return { id: itemId };
};

module.exports = {
  getContinueWatching,
  saveContinueWatching,
  deleteContinueWatchingItem,
};
