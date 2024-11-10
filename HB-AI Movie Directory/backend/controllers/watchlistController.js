// Manages user watchlists for tracking movies to watch later
const Watchlist = require("../models/Watchlist");
const { fetchMovieDetailsById } = require("../services/movieService");

// Creates a new empty watchlist for the user
exports.createWatchlist = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;

  try {
    const newWatchlist = new Watchlist({ userId, name, movies: [] });
    await newWatchlist.save();
    res.status(201).json({ message: "Watchlist created", watchlist: newWatchlist });
  } catch (error) {
    console.error("Error creating watchlist:", error);
    res.status(500).json({ error: "Error creating watchlist", details: error.message });
  }
};

// Retrieves all watchlists for the authenticated user
exports.getUserWatchlists = async (req, res) => {
  const userId = req.user.userId;

  try {
    const watchlists = await Watchlist.find({ userId });
    res.status(200).json({ watchlists });
  } catch (error) {
    console.error("Error fetching watchlists:", error);
    res.status(500).json({ error: "Error fetching watchlists", details: error.message });
  }
};

// Gets detailed information about a specific watchlist including movie details
exports.getWatchlistById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const watchlist = await Watchlist.findOne({ _id: id, userId });

    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found" });
    }

    // Fetch detailed information for each movie in the watchlist
    const movieDetailsPromises = watchlist.movies.map(fetchMovieDetailsById);
    const movieDetails = await Promise.all(movieDetailsPromises);

    res.status(200).json({ watchlist: { _id: watchlist._id, name: watchlist.name, movies: movieDetails } });
  } catch (error) {
    console.error("Error fetching specific watchlist:", error);
    res.status(500).json({ error: "Error fetching specific watchlist", details: error.message });
  }
};

// Adds a movie to a specified watchlist if not already present
exports.addToWatchlist = async (req, res) => {
  const { watchlistId, movieId } = req.body;
  const userId = req.user.userId;

  try {
    const watchlist = await Watchlist.findOne({ _id: watchlistId, userId });

    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found" });
    }

    if (!watchlist.movies.includes(movieId)) {
      watchlist.movies.push(movieId);
      await watchlist.save();
    }

    res.status(200).json({ message: "Movie added to watchlist", watchlist });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    res.status(500).json({ error: "Error adding to watchlist", details: error.message });
  }
};

// Removes a movie from a specified watchlist
exports.removeFromWatchlist = async (req, res) => {
  const { watchlistId, movieId } = req.body;
  const userId = req.user.userId;

  try {
    const watchlist = await Watchlist.findOne({ _id: watchlistId, userId });

    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found" });
    }

    watchlist.movies = watchlist.movies.filter(id => id !== movieId);
    await watchlist.save();

    res.status(200).json({ message: "Movie removed from watchlist", watchlist });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    res.status(500).json({ error: "Error removing from watchlist", details: error.message });
  }
};

// Deletes an entire watchlist and its contents
exports.deleteWatchlist = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await Watchlist.findOneAndDelete({ _id: id, userId });

    if (!result) {
      return res.status(404).json({ error: "Watchlist not found" });
    }

    res.status(200).json({ message: "Watchlist deleted successfully" });
  } catch (error) {
    console.error("Error deleting watchlist:", error);
    res.status(500).json({ error: "Error deleting watchlist", details: error.message });
  }
};