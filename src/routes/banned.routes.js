const express = require('express');
const router = express.Router();
const bannedController = require('../controllers/banned.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const { validateBannedContent } = require('../middleware/validate.middleware');

router.get('/', bannedController.getBannedContent);
router.post('/', authenticateToken, requireAdmin, validateBannedContent, bannedController.addBannedContent);
router.delete('/:id', authenticateToken, requireAdmin, bannedController.deleteBannedContent);

module.exports = router;
