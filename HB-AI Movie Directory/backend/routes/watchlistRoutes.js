// Watchlist Routes: Manages movie watchlists for users
const express = require("express");
const {
  createWatchlist,
  getUserWatchlists,
  getWatchlistById,
  addToWatchlist,
  removeFromWatchlist,
  deleteWatchlist
} = require("../controllers/watchlistController");
const authMiddleware = require("../middleware/authenticateToken");
const router = express.Router();

// All routes require authentication
router.post("/watchlist", authMiddleware, createWatchlist);          // Create new watchlist
router.get("/watchlists", authMiddleware, getUserWatchlists);        // Get all user's watchlists
router.get("/watchlist/:id", authMiddleware, getWatchlistById);      // Get specific watchlist
router.post("/watchlist/add", authMiddleware, addToWatchlist);       // Add movie to watchlist
router.post("/watchlist/remove", authMiddleware, removeFromWatchlist); // Remove movie from watchlist
router.delete("/watchlist/:id", authMiddleware, deleteWatchlist);    // Delete entire watchlist

module.exports = router;