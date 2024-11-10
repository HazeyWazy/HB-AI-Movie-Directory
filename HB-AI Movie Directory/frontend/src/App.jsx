// Main application component managing routing and global state
import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import SearchBar from "./components/SearchBar";
import MovieList from "./components/MovieList";
import MovieDetail from "./components/MovieDetail";
import Favourites from "./components/Favourites";
import Watchlist from "./components/Watchlist";
import WatchlistDetail from "./components/WatchlistDetail";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Profile from "./components/Profile";
import NavigationBar from "./components/NavigationBar";
import { useUser } from "./context/UserContext";
import logo from "./imgs/film-roll.png";
import userLogo from "./imgs/user.png";

import "./index.css";
import { apiUrl } from "./config";

function App() {
  // State management for theme and app data
  const [darkMode, setDarkMode] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const { user, isLoggedIn, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearching, setIsSearching] = useState(false);

  // Initial setup effect
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
  }, []);

  // Update dark mode effect
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Helper function to check if it's a page refresh
  const isPageRefresh = () => {
    try {
      return performance?.navigation?.type === 1;
    } catch (e) {
      return false;
    }
  };

  // Update the movies state initialization
  const [movies, setMovies] = useState(() => {
    try {
      // Only initialize from sessionStorage if this is not a page refresh
      if (!isPageRefresh()) {
        const savedMovies = sessionStorage.getItem("searchResults");
        return savedMovies ? JSON.parse(savedMovies) : [];
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  // Handle page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        sessionStorage.clear();
      } catch (e) {
        console.error('Error clearing session storage:', e);
      }
    };

    // Clear everything on page load if it's a refresh
    if (isPageRefresh()) {
      try {
        sessionStorage.clear();
        setMovies([]);
      } catch (e) {
        console.error('Error handling page refresh:', e);
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Movie Search Handler
  const handleSearch = async (searchTerm) => {
    // If there are already results in sessionStorage for this search term, use them
    const savedResults = sessionStorage.getItem("searchResults");
    const savedTerm = sessionStorage.getItem("searchTerm");

    if (savedResults && savedTerm === searchTerm) {
      setMovies(JSON.parse(savedResults));
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${apiUrl}/movies/suggestAndFetch?userPrompt=${encodeURIComponent(
          searchTerm
        )}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();

      // Process and normalize the results
      const processedMovies = (data.results || [])
        .map((movie) => ({
          imdbID: movie.imdbID || movie.id?.toString(),
          Title: movie.Title || movie.title,
          Year: movie.Year || movie.release_date?.split("-")[0] || "N/A",
          Poster:
            movie.Poster ||
            (movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : "N/A"),
          Type: "movie",
          Plot: movie.Plot || movie.overview || "N/A",
          Rating: movie.imdbRating || movie.vote_average || "N/A",
          Popularity: movie.popularity || 0,
        }))
        .filter((movie) => movie.Poster !== "N/A" && movie.Title);

      setMovies(processedMovies);
      // Save to sessionStorage with the search term
      sessionStorage.setItem("searchResults", JSON.stringify(processedMovies));
      sessionStorage.setItem("searchTerm", searchTerm);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
      sessionStorage.removeItem("searchResults");
      sessionStorage.removeItem("searchTerm");
    } finally {
      setIsSearching(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Add to favourites handler
  const handleAddToFavourites = async (movieId) => {
    console.log("imdbID being added:", movieId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/favourites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId }),
      });
      if (response.ok) {
        console.log(`Movie ${movieId} added to favourites`);
      } else {
        throw new Error("Failed to add movie to favourites");
      }
    } catch (error) {
      console.error("Error adding to favourites:", error);
    }
  };

  // Remove from favourites handler
  const handleRemoveFromFavourites = async (movieId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/favourites/${movieId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        setFavorites((prev) =>
          prev.filter((movie) => movie.imdbID !== movieId)
        );
        console.log(`Movie ${movieId} removed from favourites`);
      } else {
        throw new Error("Failed to remove movie from favourites");
      }
    } catch (error) {
      console.error("Error removing from favourites:", error);
    }
  };

  // Add to watchlist handler
  const handleAddToWatchlist = async (watchlistId, movieId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/watchlist/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ watchlistId, movieId }),
      });
      if (response.ok) {
        console.log(`Movie ${movieId} added to watchlist ${watchlistId}`);
      } else {
        throw new Error("Failed to add movie to watchlist");
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-white transition-all duration-300">
      {/* Navigation bar */}
      <NavigationBar 
        user={user}
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        logo={logo}
        userLogo={userLogo}
      />

      {/* Main content */}
      <main className="flex-grow p-4 flex flex-col relative transition-all duration-300">
        {/* Welcome Message */}
        {location.pathname === "/" && (
          <h1 className="text-center text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-medium mt-72 mb-5">
            Welcome, {user ? user.name : "Guest"}!
          </h1>
        )}

        {/* Route Configuration */}
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <SearchBar onSearch={handleSearch} isLoading={isSearching} />
                <MovieList movies={movies} />
              </div>
            }
          />
          <Route
            path="/movie/:id"
            element={
              <MovieDetail
                onAddToFavourites={handleAddToFavourites}
                onRemoveFromFavourites={handleRemoveFromFavourites}
                onAddToWatchlist={handleAddToWatchlist}
              />
            }
          />
          <Route path="/signin" element={<SignIn darkMode={darkMode} />} />
          <Route path="/signup" element={<SignUp darkMode={darkMode} />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route
            path="/watchlist"
            element={<Watchlist darkMode={darkMode} />}
          />
          <Route path="/watchlist/:id" element={<WatchlistDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="mt-auto p-4">
        <p className="text-sm text-center text-slate-600 dark:text-slate-400">&copy; 2024 HB-AI Movie Directory</p>
        <p className="text-sm text-center text-slate-600 dark:text-slate-400">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </footer>
    </div>
  );
}

export default App;
