const db = require('../config/database');

const getWatchlist = async (userId) => {
  const query = `
    SELECT id, user_id, tmdb_id, title, type, poster_url, season, episode, created_at
    FROM public.watchlist
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

const addToWatchlist = async (userId, data) => {
  const { tmdb_id, title, type, poster_url, season, episode } = data;

  const itemTitle = title || '';
  const itemPoster = poster_url || null;
  const itemSeason = season !== undefined ? season : null;
  const itemEpisode = episode !== undefined ? episode : null;

  const query = `
    INSERT INTO public.watchlist (user_id, tmdb_id, title, type, poster_url, season, episode)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id, tmdb_id, type)
    DO UPDATE SET
      title = COALESCE(EXCLUDED.title, watchlist.title),
      poster_url = COALESCE(EXCLUDED.poster_url, watchlist.poster_url),
      season = COALESCE(EXCLUDED.season, watchlist.season),
      episode = COALESCE(EXCLUDED.episode, watchlist.episode)
    RETURNING id, user_id, tmdb_id, title, type, poster_url, season, episode, created_at;
  `;

  const result = await db.query(query, [
    userId,
    tmdb_id,
    itemTitle,
    type,
    itemPoster,
    itemSeason,
    itemEpisode,
  ]);

  return result.rows[0];
};

const deleteFromWatchlist = async (userId, itemId) => {
  const query = `
    DELETE FROM public.watchlist
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const result = await db.query(query, [itemId, userId]);

  if (result.rows.length === 0) {
    const err = new Error('Watchlist item not found or unauthorized.');
    err.statusCode = 404;
    throw err;
  }

  return { id: itemId };
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  deleteFromWatchlist,
};
