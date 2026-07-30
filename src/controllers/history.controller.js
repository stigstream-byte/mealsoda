const historyService = require('../services/history.service');
const { successResponse } = require('../utils/response.util');

const getHistory = async (req, res, next) => {
  try {
    const history = await historyService.getWatchHistory(req.user.id);
    return successResponse(res, 200, { history });
  } catch (err) {
    next(err);
  }
};

const addHistory = async (req, res, next) => {
  try {
    const item = await historyService.addWatchHistory(req.user.id, req.body);
    return successResponse(res, 201, { item });
  } catch (err) {
    next(err);
  }
};

const deleteHistory = async (req, res, next) => {
  try {
    const result = await historyService.deleteWatchHistoryItem(req.user.id, req.params.id);
    return successResponse(res, 200, { message: 'Watch history item removed.', id: result.id });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHistory,
  addHistory,
  deleteHistory,
};
