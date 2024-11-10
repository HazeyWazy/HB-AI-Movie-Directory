const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema for user's favorite movies collection
const favoritesSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

module.exports = mongoose.model("Favorites", favoritesSchema);