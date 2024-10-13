const Watchlist = require('../models/Watchlist');

// Fetch all watchlists for the authenticated user
exports.getWatchlists = async (req, res) => {
  try {
    const watchlists = await Watchlist.find({ user: req.user._id });
    res.json(watchlists);
  } catch (error) {
    console.error('Fetching Error:', error);
    res.status(500).json({ error: "Error fetching watchlists", details: error.message });
  }
};

// Create a new watchlist
exports.createWatchlist = async (req, res) => {
  const { name } = req.body;
  try {
    const newWatchlist = new Watchlist({
      name,
      user: req.user._id,
      movies: []
    });
    await newWatchlist.save();
    res.status(201).json({ message: "Watchlist created successfully", watchlist: newWatchlist });
  } catch (error) {
    res.status(500).json({ error: "Error creating watchlist", details: error.message });
  }
};

// Add movie to a watchlist
exports.addMovieToWatchlist = async (req, res) => {
  const { watchlistId, movieId } = req.body;
  try {
    const watchlist = await Watchlist.findOne({ _id: watchlistId, user: req.user._id });
    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found" });
    }
    if (!watchlist.movies.includes(movieId)) {
      watchlist.movies.push(movieId);
      await watchlist.save();
    }
    res.json({ message: "Movie added to watchlist successfully", watchlist });
  } catch (error) {
    res.status(500).json({ error: "Error adding movie to watchlist", details: error.message });
  }
};

// Fetch a single watchlist by ID for the authenticated user
exports.getWatchlistById = async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ _id: req.params.id});
    console.log(watchlist)
    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found" });
    }
    res.json(watchlist);
  } catch (error) {
    console.error('Fetching Watchlist Error:', error);
    res.status(500).json({ error: "Error fetching watchlist", details: error.message });
  }
};
