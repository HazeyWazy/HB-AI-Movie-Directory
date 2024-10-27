import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../config";
import watchlistLight from "../imgs/watchlist-light.png";
import watchlistDark from "../imgs/watchlist-dark.png";
import PropTypes from 'prop-types';

function Watchlist({ darkMode }) {
  // State variables to store watchlists, movie details, form inputs, and UI states
  const [watchlists, setWatchlists] = useState([]);
  const [movieDetails, setMovieDetails] = useState({});
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Conditionally set the watchlist icon based on dark mode
  const watchlistIcon = darkMode ? watchlistDark : watchlistLight;

  // Fetch all watchlists on component mount
  useEffect(() => {
    fetchWatchlists();
  }, []);

  // Clear modal error message when new watchlist name changes
  useEffect(() => {
    if (modalError) setModalError("");
  }, [newWatchlistName]);

  // Fetch details for movies in each watchlist after watchlists are updated
  useEffect(() => {
    const fetchMovieDetails = async () => {
      const allMovieIds = [...new Set(watchlists.flatMap(w => w.movies))];
      const newMovieDetails = { ...movieDetails };
      
      // Fetch details only for movies not already in state
      for (const movieId of allMovieIds) {
        if (!newMovieDetails[movieId]) {
          try {
            const response = await fetch(`${apiUrl}/movies/movie/${movieId}`);
            if (response.ok) {
              const data = await response.json();
              newMovieDetails[movieId] = data;
            }
          } catch (err) {
            console.error(`Error fetching movie ${movieId}:`, err);
          }
        }
      }
      
      setMovieDetails(newMovieDetails);
    };

    // Fetch movie details if watchlists are present
    if (watchlists.length > 0) {
      fetchMovieDetails();
    }
  }, [watchlists]);

  // Function to fetch the user's watchlists
  const fetchWatchlists = async () => {
    try {
      const response = await fetch(`${apiUrl}/watchlists`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWatchlists(data.watchlists || []);
      } else {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch watchlists");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching watchlists:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new watchlist
  const handleCreateWatchlist = async (e) => {
    e.preventDefault();  
    const trimmedName = newWatchlistName.trim();

    // Check if the watchlist name is already used
    const isDuplicate = watchlists.some(
      (watchlist) => watchlist.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setModalError("A watchlist with this name already exists.");
      return;
    }

    // Make POST request to create new watchlist
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
        setNewWatchlistName("");
        setIsModalOpen(false);
        fetchWatchlists();  // Refresh the list of watchlists
      } else {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create watchlist");
      }
    } catch (err) {
      setModalError(err.message);
      console.error("Error creating watchlist:", err);
    }
  };

  // Handle deleting an existing watchlist
  const handleDeleteWatchlist = async (watchlistId) => {
    try {
      const response = await fetch(`${apiUrl}/watchlist/${watchlistId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setWatchlists((prevWatchlists) =>
          prevWatchlists.filter((w) => w._id !== watchlistId)
        );
      } else {
        throw new Error("Failed to delete watchlist");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error deleting watchlist:", err);
    }
  };

  // Close modal and reset input fields
  const closeModal = () => {
    setIsModalOpen(false);
    setNewWatchlistName("");
    setModalError("");
  };

  // Render movie grid for watchlist cover display
  const renderMovieGrid = (watchlist) => {
    if (watchlist.movies.length === 0) {
      return (
        <img
          src={watchlistIcon}
          alt="Empty watchlist"
          className="w-full h-full object-cover"
        />
      );
    }

    if (watchlist.movies.length === 1) {
      const movie = movieDetails[watchlist.movies[0]];
      return movie ? (
        <img
          src={movie.Poster !== "N/A" ? movie.Poster : watchlistIcon}
          alt={movie.Title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = watchlistIcon;
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 dark:bg-slate-700 animate-pulse" />
      );
    }

    // Create a movies array of length 4 by repeating items
    let moviesToShow = [...Array(4)].map(
      (_, i) => watchlist.movies[i % watchlist.movies.length]
    );

    // If there are exactly 2 unique movies, reverse the second row
    if (new Set(watchlist.movies).size === 2) {
      moviesToShow = [moviesToShow[0], moviesToShow[1], moviesToShow[1], moviesToShow[0]];
    }

    return (
      <div className="grid grid-rows-2 grid-cols-2 gap-1 h-full">
        {moviesToShow.map((movieId, index) => {
          const movie = movieDetails[movieId];
          return (
            <div key={index} className="w-full h-full">
              {movie ? (
                <img
                  src={movie.Poster !== "N/A" ? movie.Poster : watchlistIcon}
                  alt={movie.Title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = watchlistIcon;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-slate-700 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Loader
  if (loading) {
    return (
      <div className="flex flex-col min-h-[85vh] text-center justify-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-orange-300 border-t-gray-300"></div>
        <p className="mt-4 text-lg text-slate-900 dark:text-white">Loading...</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Fetching your watchlists
        </p>
      </div>
    );
  }

  // Show error if fetching failed
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex-col flex-wrap justify-center gap-10 px-4 py-6 relative min-h-[85vh]">
      <h2 className="text-center text-4xl font-medium">Your Watchlists</h2>

      {watchlists.length === 0 ? (
        <p className="mt-10 text-xl text-center">You have no watchlists yet.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-7 mt-6">
          {watchlists.map((watchlist) => (
            <div
              key={watchlist._id}
              className="w-64 h-92bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-slate-950 hover:shadow-xl transition-shadow duration-300 p-4 relative"
            >
              <Link to={`/watchlist/${watchlist._id}`} className="block">
                <div className="aspect-square mb-4 rounded-lg overflow-hidden">
                  {renderMovieGrid(watchlist)}
                </div>              
                <h3 className="text-xl font-semibold">{watchlist.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {watchlist.movies.length} movies
                </p>
              </Link>

              <button
                onClick={() => handleDeleteWatchlist(watchlist._id)}
                className="absolute bottom-4 right-4 bg-gray-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900 w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 group"
                aria-label="Delete watchlist"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M20.786,4.758c-.101-.024-1.614-.372-3.841-.64l-.852-2.457c-.059-.169-.203-.294-.38-.327-.071-.014-1.784-.334-3.713-.334s-3.642,.321-3.714,.334c-.176,.034-.32,.158-.379,.328l-.852,2.456c-2.226,.268-3.74,.616-3.842,.64-.27,.062-.437,.331-.374,.6,.054,.231,.26,.387,.487,.387,.037,0,.075-.004,.113-.013,.01-.002,.266-.061,.715-.148-.199,1.677-.385,4.286-.385,6.738,0,5.306,.865,9.19,.902,9.353,.04,.176,.172,.318,.346,.369,.131,.039,3.268,.956,6.981,.956s6.85-.917,6.981-.956c.174-.051,.307-.193,.347-.37,.036-.165,.901-4.091,.901-9.352,0-2.46-.185-5.067-.383-6.738,.448,.087,.703,.146,.713,.148,.271,.063,.537-.104,.601-.373,.062-.269-.104-.538-.374-.601ZM8.756,2.269c.553-.088,1.85-.269,3.244-.269s2.689,.18,3.245,.269l.6,1.731c-1.168-.111-2.475-.19-3.845-.19s-2.676,.078-3.845,.19l.6-1.731Zm10.474,10.054c0,4.343-.619,7.835-.817,8.841-.85,.221-3.48,.837-6.412,.837s-5.564-.616-6.413-.837c-.198-.999-.816-4.464-.816-8.841,0-2.551,.214-5.35,.416-6.923,1.591-.264,4.101-.589,6.813-.589s5.226,.325,6.815,.589c.208,1.613,.414,4.348,.414,6.923Z"/>
                  <path d="M9.558,9.118c-.276,0-.5,.224-.5,.5v8.042c0,.276,.224,.5,.5,.5s.5-.224,.5-.5V9.618c0-.276-.224-.5-.5-.5Z"/>
                  <path d="M14.442,18.16c.276,0,.5-.224,.5-.5V9.618c0-.276-.224-.5-.5-.5s-.5,.224-.5,.5v8.042c0,.276,.224,.5,.5,.5Z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New Watchlist Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <span>+</span>
      </button>

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                New Watchlist
              </h3>
            </div>
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
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md"
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
}

// propTypes validation
Watchlist.propTypes = {
  darkMode: PropTypes.bool.isRequired, 
};

export default Watchlist;