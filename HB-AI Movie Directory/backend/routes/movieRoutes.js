const express = require('express');
const {
  getMovieDetails,
  suggestAndFetchMoviesAI,
  getRecommendations
} = require('../controllers/movieController');

const router = express.Router();

// Main search route
router.get('/suggestAndFetch', suggestAndFetchMoviesAI);

// Movie detail routes
router.get('/movie/:id', getMovieDetails);
router.get('/movie/:id/recommendations', getRecommendations);

module.exports = router;