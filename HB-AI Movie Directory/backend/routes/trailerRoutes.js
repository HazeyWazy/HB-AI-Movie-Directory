// Trailer Routes: Handles movie trailer fetching
const express = require("express");
const { fetchTrailer } = require("../controllers/trailerController");
const router = express.Router();

// Public route - no authentication required
router.get("/movie/:id/trailer", fetchTrailer);    // Get movie trailer by movie ID

module.exports = router;