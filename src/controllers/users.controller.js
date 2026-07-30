const usersService = require('../services/users.service');
const { successResponse } = require('../utils/response.util');

const getPublicProfile = async (req, res, next) => {
  try {
    const profile = await usersService.getUserProfile(req.params.id);
    return successResponse(res, 200, { profile });
  } catch (err) {
    next(err);
  }
};

const getOwnProfile = async (req, res, next) => {
  try {
    const profile = await usersService.getOwnProfile(req.user.id);
    return successResponse(res, 200, { profile });
  } catch (err) {
    next(err);
  }
};

const updateOwnProfile = async (req, res, next) => {
  try {
    const updatedProfile = await usersService.updateOwnProfile(req.user.id, req.body);
    return successResponse(res, 200, { profile: updatedProfile });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicProfile,
  getOwnProfile,
  updateOwnProfile,
};
