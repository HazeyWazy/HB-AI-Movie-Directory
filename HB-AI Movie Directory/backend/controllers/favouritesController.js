const Favorites = require("../models/Favourites");
const { fetchMovieDetailsById } = require("../services/movieService");

exports.addFavorite = async (req, res) => {
  const { movieId } = req.body;
  const userId = req.user.userId;

  if (!movieId) {
    return res.status(400).json({ error: "Movie ID is required" });
  }

  try {
    const movieDetails = await fetchMovieDetailsById(movieId);
    if (!movieDetails || movieDetails.Response === "False") {
      return res.status(404).json({ error: "Movie not found" });
    }

    let favorites = await Favorites.findOne({ userId });

    if (!favorites) {
      favorites = new Favorites({ userId, movies: [movieId] });
    } else if (!favorites.movies.includes(movieId)) {
      favorites.movies.push(movieId);
    }

    await favorites.save();
    res.status(200).json({ message: "Movie added to favorites", favorites });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res
      .status(500)
      .json({ error: "Error adding favorite", details: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  const { movieId } = req.body;
  const userId = req.user.userId;

  if (!movieId) {
    return res.status(400).json({ error: "Movie ID is required" });
  }

  try {
    const favorites = await Favorites.findOne({ userId });

    if (!favorites || !favorites.movies.includes(movieId)) {
      return res.status(404).json({ error: "Movie not found in favorites" });
    }

    favorites.movies = favorites.movies.filter((id) => id !== movieId);
    await favorites.save();

    res
      .status(200)
      .json({ message: "Movie removed from favorites", favorites });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res
      .status(500)
      .json({ error: "Error removing favorite", details: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  const userId = req.user.userId;

  try {
    const favorites = await Favorites.findOne({ userId });

    if (!favorites || favorites.movies.length === 0) {
      return res.status(404).json({ message: "No favorites found" });
    }

    const movieDetailsPromises = favorites.movies.map(fetchMovieDetailsById);
    const movieDetails = await Promise.all(movieDetailsPromises);

    res.status(200).json({ favorites: movieDetails });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res
      .status(500)
      .json({ error: "Error fetching favorites", details: error.message });
  }
};
