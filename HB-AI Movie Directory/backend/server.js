// Main server configuration and initialization
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Configure CORS for specific origins with credentials
app.use(
  cors({
    origin: [
      "https://group-project-gwdp-monday-12pm-8mrf.onrender.com", // Deployed frontend
      "http://localhost:3000", // Local development
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware setup
app.use(cookieParser());           // Parse cookies for authentication
app.use(express.json());           // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve static files

// Import and configure routes
const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const favouritesRoutes = require("./routes/favouritesRoutes");
const profileRoutes = require("./routes/profileRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const trailerRoutes = require("./routes/trailerRoutes");

// Route middleware setup
app.use("/api/auth", authRoutes);      // Authentication endpoints
app.use("/api/movies", movieRoutes);    // Movie search and details
app.use("/api", favouritesRoutes);      // User favorites management
app.use("/api", profileRoutes);         // User profile management
app.use("/api", watchlistRoutes);       // Watchlist management
app.use("/api", trailerRoutes);         // Movie trailer endpoints

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;