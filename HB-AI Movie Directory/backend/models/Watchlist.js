const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const watchlistSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    movies: [
      { 
        type: String // Assuming you store movie IDs as strings, adjust if necessary
      }
    ]
  },
  { 
    timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
  }
);

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;
