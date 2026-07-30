const watchlistService = require('../services/watchlist.service');
const { successResponse } = require('../utils/response.util');

const getWatchlist = async (req, res, next) => {
  try {
    const watchlist = await watchlistService.getWatchlist(req.user.id);
    return successResponse(res, 200, { watchlist });
  } catch (err) {
    next(err);
  }
};

const addToWatchlist = async (req, res, next) => {
  try {
    const item = await watchlistService.addToWatchlist(req.user.id, req.body);
    return successResponse(res, 201, { item });
  } catch (err) {
    next(err);
  }
};

const deleteFromWatchlist = async (req, res, next) => {
  try {
    const result = await watchlistService.deleteFromWatchlist(req.user.id, req.params.id);
    return successResponse(res, 200, { message: 'Watchlist item removed.', id: result.id });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  deleteFromWatchlist,
};
