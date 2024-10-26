const express = require("express");

const { fetchTrailer } = require("../controllers/trailerController");

const router = express.Router();

router.get("/movie/:moveId/trailer", fetchTrailer);
module.exports = router;
