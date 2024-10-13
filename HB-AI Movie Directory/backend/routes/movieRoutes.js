const express = require('express');
const {
  searchMovie,
  getMovieDetails,
  suggestMoviesAI,
  suggestAndFetchMoviesAI
} = require('../controllers/movieController');
const authenticateToken = require('../middleware/authenticateToken'); // Import middleware

const router = express.Router();

// Public routes (no authentication needed)
router.get('/search', searchMovie);
router.get('/movie/:id', getMovieDetails);
router.get('/suggest', suggestMoviesAI);
router.get('/suggestMoviesAI', suggestAndFetchMoviesAI);

// Protected routes (require authentication)
router.post('/watchlist/add', authenticateToken, (req, res) => {
  // Add movie to watchlist logic here
});

module.exports = router;
