// Favorites Routes: Manages user's movie favorites
const express = require("express");
const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favouritesController");
const authMiddleware = require("../middleware/authenticateToken");
const router = express.Router();

// All routes require authentication
router.post("/favourites", authMiddleware, addFavorite);           // Add movie to favorites
router.delete("/favourites/:movieId", authMiddleware, removeFavorite); // Remove movie from favorites
router.get("/favourites", authMiddleware, getFavorites);           // Get user's favorite movies

module.exports = router;