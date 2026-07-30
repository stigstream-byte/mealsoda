const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateHistory } = require('../middleware/validate.middleware');

router.use(authenticateToken);

router.get('/', historyController.getHistory);
router.post('/', validateHistory, historyController.addHistory);
router.delete('/:id', historyController.deleteHistory);

module.exports = router;
