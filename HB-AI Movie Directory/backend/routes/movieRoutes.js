// Movie Routes: Handles movie search and details
const express = require('express');
const {
  getMovieDetails,
  suggestAndFetchMoviesAI,
  getRecommendations
} = require('../controllers/movieController');

const router = express.Router();

// Public routes - no authentication required
router.get('/suggestAndFetch', suggestAndFetchMoviesAI);      // Get AI-powered movie suggestions
router.get('/movie/:id', getMovieDetails);                    // Get detailed movie information
router.get('/movie/:id/recommendations', getRecommendations); // Get movie recommendations

module.exports = router;