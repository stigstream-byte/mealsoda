const bannedService = require('../services/banned.service');
const { successResponse } = require('../utils/response.util');

const getBannedContent = async (req, res, next) => {
  try {
    const items = await bannedService.getBannedContent();
    return successResponse(res, 200, { items });
  } catch (err) {
    next(err);
  }
};

const addBannedContent = async (req, res, next) => {
  try {
    const item = await bannedService.addBannedContent(req.user.id, req.body);
    return successResponse(res, 201, { item });
  } catch (err) {
    next(err);
  }
};

const deleteBannedContent = async (req, res, next) => {
  try {
    const result = await bannedService.deleteBannedContent(req.params.id);
    return successResponse(res, 200, { message: 'Banned content entry removed.', id: result.id });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBannedContent,
  addBannedContent,
  deleteBannedContent,
};
