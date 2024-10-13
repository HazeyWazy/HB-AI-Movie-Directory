const express = require('express');
const {
  searchMovie,
  getMovieDetails,
  suggestMoviesAI,
  suggestAndFetchMoviesAI
} = require('../controllers/movieController');

const router = express.Router();

// Public routes (no authentication needed)
router.get('/search', searchMovie);
router.get('/movie/:id', getMovieDetails);
router.get('/suggest', suggestMoviesAI);
router.get('/suggestMoviesAI', suggestAndFetchMoviesAI);

module.exports = router;
