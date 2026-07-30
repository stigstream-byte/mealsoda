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

const searchUsers = async (req, res, next) => {
  try {
    const { query, is_admin } = req.query;
    const users = await usersService.searchUsers({ query, is_admin });
    return successResponse(res, 200, { users });
  } catch (err) {
    next(err);
  }
};

const grantAdmin = async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await usersService.grantAdmin(username);
    return successResponse(res, 200, { user });
  } catch (err) {
    next(err);
  }
};

const revokeAdmin = async (req, res, next) => {
  try {
    const result = await usersService.revokeAdmin(req.params.id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicProfile,
  getOwnProfile,
  updateOwnProfile,
  searchUsers,
  grantAdmin,
  revokeAdmin,
};
