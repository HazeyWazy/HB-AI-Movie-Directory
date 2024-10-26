const express = require("express");

const { fetchTrailer } = require("../controllers/trailerController");

const router = express.Router();

router.get("/movie/:id/trailer", fetchTrailer);
module.exports = router;
