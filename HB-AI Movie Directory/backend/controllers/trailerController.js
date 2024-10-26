const { fetchMovieTrailerById } = require("../services/movieService");

exports.fetchTrailer = async (req, res) => {
  const { moveId } = req.params;
  console.log("constroller: ", moveId);
  try {
    const trailer = await fetchMovieTrailerById(moveId);
    if (trailer.error) {
      return res.status(404).json({ error: `trailer error: ${trailer.error}` });
    }
    res.status(200).json(trailer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trailer" });
  }
};
