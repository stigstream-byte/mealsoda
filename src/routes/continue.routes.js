const express = require('express');
const router = express.Router();
const continueController = require('../controllers/continue.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateContinueWatching } = require('../middleware/validate.middleware');

router.use(authenticateToken);

router.get('/', continueController.getContinueWatching);
router.post('/', validateContinueWatching, continueController.saveContinueWatching);
router.delete('/:id', continueController.deleteContinueWatching);

module.exports = router;
