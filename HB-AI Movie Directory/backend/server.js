const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// CORS configuration
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

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
const authRoutes = require("./routes/authRoutes");
// const watchlistRoutes = require('./routes/watchlistRoutes');
const movieRoutes = require("./routes/movieRoutes");
const favouritesRoutes = require("./routes/favouritesRoutes");
const profileRoutes = require('./routes/profileRoutes');

app.use("/api/auth", authRoutes);
// app.use('/api/watchlists', watchlistRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api", favouritesRoutes);
app.use('/api', profileRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
