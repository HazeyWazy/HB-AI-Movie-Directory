const express = require("express");

const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favouritesController");

const authMiddleware = require("../middleware/authenticateToken");
const router = express.Router();

router.post("/favourites", authMiddleware, addFavorite);
router.delete("/favourites", authMiddleware, removeFavorite);
router.get("/favourites", authMiddleware, getFavorites);

module.exports = router;
