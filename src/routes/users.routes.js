const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/me', authenticateToken, usersController.getOwnProfile);
router.put('/me', authenticateToken, usersController.updateOwnProfile);
router.get('/:id', usersController.getPublicProfile);

module.exports = router;
