const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlist.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateWatchlist } = require('../middleware/validate.middleware');

router.use(authenticateToken);

router.get('/', watchlistController.getWatchlist);
router.post('/', validateWatchlist, watchlistController.addToWatchlist);
router.delete('/:id', watchlistController.deleteFromWatchlist);

module.exports = router;
