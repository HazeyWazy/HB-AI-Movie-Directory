import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useUser } from "../context/UserContext";
import "../index.css";
import { apiUrl } from "../config";

const MovieDetail = ({
  onAddToFavourites,
  onRemoveFromFavourites,
  onAddToWatchlist,
}) => {
  // State management
  const [movie, setMovie] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const { id } = useParams();
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [showNewWatchlistModal, setShowNewWatchlistModal] = useState(false);
  const [selectedWatchlists, setSelectedWatchlists] = useState(new Set());
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [modalError, setModalError] = useState("");
  const { isLoggedIn } = useUser();
  const [watchlistMovies, setWatchlistMovies] = useState({});
  const [updateError, setUpdateError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        setLoading(true);

        // Fetch movie details
        const response = await fetch(`${apiUrl}/movies/movie/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch movie details");
        }

        const data = await response.json();
        setMovie(data);        
        const trailerResponse = await fetch(`${apiUrl}/movie/${id}/trailer`);
        console.log("tomma :", trailerResponse);

        if (trailerResponse.ok) {
          const trailerData = await trailerResponse.json();
          setTrailerUrl(trailerData.trailerUrl);
        } else {
          setTrailerUrl(null);
        }

        // Only fetch user-specific data if logged in
        if (isLoggedIn) {
          // Fetch user's watchlists
          const watchlistsResponse = await fetch(`${apiUrl}/watchlists`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          });

          if (watchlistsResponse.ok) {
            const watchlistsData = await watchlistsResponse.json();
            setWatchlists(watchlistsData.watchlists || []);
            
            // Create a Set of already selected watchlists based on movie presence
            const selectedWatchlistsSet = new Set(
              watchlistsData.watchlists
                .filter(watchlist => watchlist.movies.includes(id))
                .map(watchlist => watchlist._id)
            );
            setSelectedWatchlists(selectedWatchlistsSet);

            // Create a mapping of watchlist IDs to their movies
            const moviesMap = {};
            watchlistsData.watchlists.forEach(watchlist => {
              moviesMap[watchlist._id] = new Set(watchlist.movies);
            });
            setWatchlistMovies(moviesMap);
          }
          
          // Check if the movie is in favorites
          const favouritesResponse = await fetch(`${apiUrl}/favourites`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          });         

          if (favouritesResponse.ok) {
            const favouritesData = await favouritesResponse.json();
            if (favouritesData && favouritesData.favorites) {
              setIsFavourite(
                favouritesData.favorites.some((fav) => fav.imdbID === id)
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching movie details or watchlists:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieDetail();
  }, [id, isLoggedIn]);

  const handleDone = async () => {
    try {
      // Get the current watchlists that contain this movie
      const currentWatchlists = new Set(
        Object.entries(watchlistMovies)
          .filter(([_, movies]) => movies.has(id))
          .map(([watchlistId]) => watchlistId)
      );

      // Determine which watchlists to add to and remove from
      const toAdd = [...selectedWatchlists].filter(watchlistId => !currentWatchlists.has(watchlistId));
      const toRemove = [...currentWatchlists].filter(watchlistId => !selectedWatchlists.has(watchlistId));

      // Add movie to newly selected watchlists
      for (const watchlistId of toAdd) {
        await onAddToWatchlist(watchlistId, movie.imdbID);
      }

      // Remove movie from unselected watchlists
      for (const watchlistId of toRemove) {
        try {
          const response = await fetch(`${apiUrl}/watchlist/remove`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ watchlistId, movieId: movie.imdbID }),
          });

          if (!response.ok) {
            throw new Error("Failed to remove movie from watchlist");
          }
        } catch (err) {
          console.error("Error removing movie from watchlist:", err);
        }
      }

      // Update local state to reflect changes
      const updatedMoviesMap = { ...watchlistMovies };
      toAdd.forEach(watchlistId => {
        updatedMoviesMap[watchlistId] = new Set([...(updatedMoviesMap[watchlistId] || []), id]);
      });
      toRemove.forEach(watchlistId => {
        const movies = new Set(updatedMoviesMap[watchlistId]);
        movies.delete(id);
        updatedMoviesMap[watchlistId] = movies;
      });
      setWatchlistMovies(updatedMoviesMap);

      setShowWatchlistModal(false);
    } catch (error) {
      console.error("Error updating watchlists:", error);
      setError("Failed to update watchlists");
    }
  };

  const handleFavouriteChange = async () => {
    try {
      if (!movie || !movie.imdbID) {
        throw new Error("Movie data is not available");
      }

      if (isFavourite) {
        await onRemoveFromFavourites(movie.imdbID);
      } else {
        await onAddToFavourites(movie.imdbID);
      }
      setIsFavourite(!isFavourite);
    } catch (error) {
      console.error("Error updating favourite status:", error);
      setError(
        error.message || "Failed to update favourite status. Please try again."
      );
    }
  };

  const handleCreateWatchlist = async (e) => {
    e.preventDefault();
    const trimmedName = newWatchlistName.trim();
  
    const isDuplicate = watchlists.some(
      (watchlist) => watchlist.name.toLowerCase() === trimmedName.toLowerCase()
    );
  
    if (isDuplicate) {
      setModalError("A watchlist with this name already exists.");
      return;
    }
  
    try {
      const response = await fetch(`${apiUrl}/watchlist`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });
  
      if (response.ok) {
        const newWatchlist = await response.json();

        // Update the watchlists array with the new watchlist
        setWatchlists(prevWatchlists => [...prevWatchlists, newWatchlist.watchlist]);
        
        // Add the new watchlist to selected watchlists
        setSelectedWatchlists(new Set([...selectedWatchlists, newWatchlist.watchlist._id]));
        
        // Close the new watchlist modal
        setShowNewWatchlistModal(false);
        setNewWatchlistName("");
        setModalError("");
      } else {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create watchlist");
      }
    } catch (err) {
      setModalError(err.message);
    }
  };
  
  const toggleWatchlist = (watchlistId) => {
    const newSelected = new Set(selectedWatchlists);
    if (newSelected.has(watchlistId)) {
      newSelected.delete(watchlistId);
    } else {
      newSelected.add(watchlistId);
    }
    setSelectedWatchlists(newSelected);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-[85vh] text-center justify-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-orange-300 border-t-gray-300"></div>
        <p className="mt-4 text-lg text-slate-900 dark:text-white">Loading...</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Rolling out the details, just for you</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-[85vh] text-center justify-center">
        <p className="text-xl text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col min-h-[85vh] text-center justify-center">
        <p className="text-xl text-slate-900 dark:text-white">Movie not found</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white py-12 px-4">
      {/* Movie details layout */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-2/5">
          <img
            src={
              movie.Poster !== "N/A"
                ? movie.Poster
                : "https://via.placeholder.com/350x500?text=No+Image"
            }
            alt={movie.Title}
            className="mx-auto rounded-lg shadow-md"
          />
        </div>
        <div className="md:w-3/5 md:ml-10 mt-8 md:mt-0">
          <h1 className="text-4xl font-bold mb-4">{movie.Title}</h1>

          {/* Movie Details Table */}
          <table className="table-auto w-full text-left text-lg mb-4">
            <tbody>
              <tr>
                <td className="font-semibold pr-4 align-top">Director:</td>
                <td>{movie.Director}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4 align-top">Cast:</td>
                <td>{movie.Actors}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4 align-top">Genre:</td>
                <td>{movie.Genre}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4 align-top">Year:</td>
                <td>{movie.Year}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4 align-top">Rated:</td>
                <td>{movie.Rated}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4 align-top">Runtime:</td>
                <td>{movie.Runtime}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4 align-top">Rating:</td>
                <td>{movie.imdbRating}/10</td>
              </tr>
            </tbody>
          </table>

          <p className="mb-4 text-lg">{movie.Plot}</p>

          {/* Action Buttons or Sign In Message */}
          <div className="pt-4">
            {isLoggedIn ? (
              <div className="flex gap-4">
                {/* Favorites Button */}
                <div className="w-full max-w-52">
                  <input
                    type="checkbox"
                    id="favorite"
                    name="favorite-checkbox"
                    className="hidden peer"
                    checked={isFavourite}
                    onChange={handleFavouriteChange}
                  />
                  <label
                    htmlFor="favorite"
                    className="bg-white flex items-center gap-2 p-3 cursor-pointer select-none rounded-lg shadow-lg text-black w-full"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 -2 22 28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`flex-shrink-0 transition-all duration-100 ${isFavourite ? "fill-red-500 stroke-red-500" : ""}`}
                    >
                      <path d="M17.5.917a6.4,6.4,0,0,0-5.5,3.3A6.4,6.4,0,0,0,6.5.917,6.8,6.8,0,0,0,0,7.967c0,6.775,10.956,14.6,11.422,14.932l.578,.409,.578-.409C13.044,22.569,24,14.742,24,7.967A6.8,6.8,0,0,0,17.5.917Z"/>
                    </svg>
                    <div className="relative overflow-hidden flex-grow">
                      <div className="transition-all duration-500 transform flex flex-col h-6">
                        <span
                          className={`transition-all duration-500 transform ${isFavourite ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"} whitespace-nowrap`}
                        >
                          Add to Favourites
                        </span>
                        <span
                          className={`transition-all duration-500 transform ${isFavourite ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"} whitespace-nowrap absolute top-0 left-0`}
                        >
                          Added to Favourites
                        </span>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Watchlist Button */}
                <button
                  onClick={() => setShowWatchlistModal(true)}
                  className="bg-white text-black flex items-center gap-2 p-3 pl-4 rounded-lg shadow-lg w-52 transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 -3 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.6"
                  >
                    <path fill="#000000" d="M15.5 20c-0.143 0-0.283-0.062-0.38-0.175l-5.62-6.557-5.62 6.557c-0.136 0.159-0.357 0.216-0.553 0.144s-0.327-0.26-0.327-0.469v-18c0-0.276 0.224-0.5 0.5-0.5h12c0.276 0 0.5 0.224 0.5 0.5v18c0 0.209-0.13 0.396-0.327 0.469-0.057 0.021-0.115 0.031-0.173 0.031zM9.5 12c0.146 0 0.285 0.064 0.38 0.175l5.12 5.974v-16.148h-11v16.148l5.12-5.974c0.095-0.111 0.234-0.175 0.38-0.175z"></path>
                  </svg>
                  Add to Watchlist
                </button>
              </div>
            ) : (
              <p className="text-lg">
                Please <Link to="/signin" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">sign in</Link> to add the movie to favourites and watchlists.
              </p>
            )}
          </div>
        </div>
      </div>
      {trailerUrl ? (
  <div className="my-6 w-full flex justify-center">
    <div className="w-full max-w-6xl">
      <h2 className="text-xl font-semibold mb-4 text-center">Watch Trailer:</h2>
      <iframe
        className="w-full aspect-video"
        src={trailerUrl} // Updated YouTube embed link
        title="Movie Trailer"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  </div>
) : (
      <p className="text-slate-600 dark:text-slate-400 text-center mt-6">Trailer not available.</p>
    )}

      {/* Watchlist Selection Modal */}
      {showWatchlistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
              Add to Watchlist
            </h3>
            <div className="max-h-64 overflow-y-auto">
              {watchlists.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4">
                  You have no watchlist yet.
                </p>
              ) : (
                watchlists.map((watchlist) => (
                  <div
                    key={watchlist._id}
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                    onClick={() => toggleWatchlist(watchlist._id)}
                  >
                    <div
                      className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center transition-colors ${
                        selectedWatchlists.has(watchlist._id)
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedWatchlists.has(watchlist._id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth={0.5}
                          viewBox="0 0 24 24"
                        >
                          <path d="M22.319,4.431,8.5,18.249a1,1,0,0,1-1.417,0L1.739,12.9a1,1,0,0,0-1.417,0h0a1,1,0,0,0,0,1.417l5.346,5.345a3.008,3.008,0,0,0,4.25,0L23.736,5.847a1,1,0,0,0,0-1.416h0A1,1,0,0,0,22.319,4.431Z"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-slate-900 dark:text-white">
                      {watchlist.name}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* New Watchlist Button */}
            <button
              onClick={() => {
                setShowNewWatchlistModal(true);
              }}
              className="w-full h-10 p-2 flex items-center gap-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 524 512"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <g>
                  <path d="M490.667,234.667H277.333V21.333C277.333,9.551,267.782,0,256,0c-11.782,0-21.333,9.551-21.333,21.333v213.333H21.333   C9.551,234.667,0,244.218,0,256c0,11.782,9.551,21.333,21.333,21.333h213.333v213.333c0,11.782,9.551,21.333,21.333,21.333   c11.782,0,21.333-9.551,21.333-21.333V277.333h213.333c11.782,0,21.333-9.551,21.333-21.333   C512,244.218,502.449,234.667,490.667,234.667z"/>
                </g>
              </svg>
              New Watchlist
            </button>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowWatchlistModal(false);
                  setSelectedWatchlists(new Set());
                }}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDone}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Watchlist Modal */}
      {showNewWatchlistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
              New Watchlist
            </h3>
            <form onSubmit={handleCreateWatchlist}>
              <input
                type="text"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                placeholder="Enter watchlist name"
                className={`w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  modalError ? 'border-red-500' : ''
                }`}
                autoFocus
              />
              {modalError && (
                <p className="text-red-500 text-sm mt-1">{modalError}</p>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewWatchlistModal(false);
                    setNewWatchlistName("");
                    setModalError("");
                  }}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newWatchlistName.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// propTypes validation
MovieDetail.propTypes = {
  onAddToFavourites: PropTypes.func.isRequired,
  onRemoveFromFavourites: PropTypes.func.isRequired,
  onAddToWatchlist: PropTypes.func.isRequired,
};

export default MovieDetail;
