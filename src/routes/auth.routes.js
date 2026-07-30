const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin, validateChangePassword } = require('../middleware/validate.middleware');
const { authRateLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', authRateLimiter, validateRegister, authController.register);
router.post('/login', authRateLimiter, validateLogin, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticateToken, authController.getMe);

// Change password endpoints (supports both PUT and POST)
router.put('/change-password', authenticateToken, validateChangePassword, authController.changePassword);
router.post('/change-password', authenticateToken, validateChangePassword, authController.changePassword);

module.exports = router;
