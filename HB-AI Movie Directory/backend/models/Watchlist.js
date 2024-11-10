const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const watchlistSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    movies: [
      {
        type: String, // Stores IMDB IDs
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Watchlist", watchlistSchema);