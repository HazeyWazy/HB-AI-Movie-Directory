// Handles movie trailer fetching operations
const { fetchMovieTrailerById } = require("../services/movieService");

// Fetches movie trailer by IMDB ID with error handling
exports.fetchTrailer = async (req, res) => {
  const { id } = req.params;
  console.log("constroller: ", id);
  try {
    const trailer = await fetchMovieTrailerById(id);
    if (trailer.error) {
      return res.status(404).json({ error: `trailer error: ${trailer.error}` });
    }
    res.status(200).json(trailer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trailer" });
  }
};