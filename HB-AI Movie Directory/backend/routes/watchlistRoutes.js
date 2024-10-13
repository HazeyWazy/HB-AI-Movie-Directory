const express = require('express');
const { getWatchlists, createWatchlist, addMovieToWatchlist, getWatchlistById } = require('../controllers/watchlistController');
const authenticateToken = require('../middleware/authenticateToken')

const router = express.Router();

router.use(authenticateToken)

router.get('/', getWatchlists);
router.post('/create', createWatchlist);
router.post('/addMovie', addMovieToWatchlist);
router.get('/:id', getWatchlistById);


module.exports = router;