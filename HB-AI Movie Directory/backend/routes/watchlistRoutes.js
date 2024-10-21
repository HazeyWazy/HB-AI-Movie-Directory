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

router.post("/watchlist", authMiddleware, createWatchlist);
router.get("/watchlists", authMiddleware, getUserWatchlists);
router.get("/watchlist/:id", authMiddleware, getWatchlistById);
router.post("/watchlist/add", authMiddleware, addToWatchlist);
router.post("/watchlist/remove", authMiddleware, removeFromWatchlist);
router.delete("/watchlist/:id", authMiddleware, deleteWatchlist);

module.exports = router;