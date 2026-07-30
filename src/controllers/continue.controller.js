const continueService = require('../services/continue.service');
const { successResponse } = require('../utils/response.util');

const getContinueWatching = async (req, res, next) => {
  try {
    const items = await continueService.getContinueWatching(req.user.id);
    return successResponse(res, 200, { items });
  } catch (err) {
    next(err);
  }
};

const saveContinueWatching = async (req, res, next) => {
  try {
    const item = await continueService.saveContinueWatching(req.user.id, req.body);
    return successResponse(res, 200, { item });
  } catch (err) {
    next(err);
  }
};

const deleteContinueWatching = async (req, res, next) => {
  try {
    const result = await continueService.deleteContinueWatchingItem(req.user.id, req.params.id);
    return successResponse(res, 200, { message: 'Continue watching item removed.', id: result.id });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getContinueWatching,
  saveContinueWatching,
  deleteContinueWatching,
};
