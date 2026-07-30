const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response.util');
const { getRefreshTokenCookieOptions, getClearCookieOptions } = require('../utils/jwt.util');

const register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const result = await authService.register({ email, username, password });

    res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());

    return successResponse(res, 201, {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const identifier = req.body.identifier || req.body.login || req.body.email || req.body.username;
    const { password } = req.body;

    const result = await authService.login({ identifier, password });

    res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());

    return successResponse(res, 200, {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const result = await authService.changePassword(req.user.id, { current_password, new_password });

    return successResponse(res, 200, { message: result.message });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    await authService.logout(userId, refreshToken);

    res.clearCookie('refreshToken', getClearCookieOptions());

    return successResponse(res, 200, { message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const result = await authService.refreshSession(refreshToken);

    res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());

    return successResponse(res, 200, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return successResponse(res, 200, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  changePassword,
  logout,
  refresh,
  getMe,
};
