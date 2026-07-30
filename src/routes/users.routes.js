const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Admin user search & management
router.get('/', authenticateToken, requireAdmin, usersController.searchUsers);
router.post('/admin/grant', authenticateToken, requireAdmin, usersController.grantAdmin);
router.post('/admin/revoke/:id', authenticateToken, requireAdmin, usersController.revokeAdmin);

// User profile endpoints
router.get('/me', authenticateToken, usersController.getOwnProfile);
router.put('/me', authenticateToken, usersController.updateOwnProfile);
router.get('/:id', usersController.getPublicProfile);

module.exports = router;
