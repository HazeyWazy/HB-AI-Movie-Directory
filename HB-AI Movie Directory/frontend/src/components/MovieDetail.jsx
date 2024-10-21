import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import "../index.css";
import { apiUrl } from "../config";

const MovieDetail = ({
  onAddToFavourites,
  onRemoveFromFavourites,
  onAddToWatchlist,
}) => {
  const [movie, setMovie] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

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
          } else {
            setIsFavourite(false);
          }
        } else {
          setIsFavourite(false);
        }
      } catch (error) {
        console.error("Error fetching movie details or watchlists:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();
  }, [id]);

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

  const handleAddToWatchlist = async () => {
    if (!selectedWatchlist) {
      setError("Please select a watchlist first");
      return;
    }

    try {
      await onAddToWatchlist(selectedWatchlist, movie.imdbID);
      setError(null);
      alert("Movie added to watchlist successfully");
    } catch (error) {
      console.error("Error adding movie to watchlist:", error);
      setError("Failed to add movie to watchlist. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-[85vh] text-center justify-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-orange-300 border-t-gray-300"></div>
        <p className="mt-4 text-lg text-slate-900 dark:text-white">
          Loading...
        </p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Rolling out the details, just for you
        </p>
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
        <p className="text-xl text-slate-900 dark:text-white">
          Movie not found
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white py-12 px-4">
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
                <td className="font-semibold pr-4">Director:</td>
                <td>{movie.Director}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4">Cast:</td>
                <td>{movie.Actors}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4">Genre:</td>
                <td>{movie.Genre}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4">Year:</td>
                <td>{movie.Year}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4">Rated:</td>
                <td>{movie.Rated}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4">Runtime:</td>
                <td>{movie.Runtime}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4">Rating:</td>
                <td>{movie.imdbRating}/10</td>
              </tr>
            </tbody>
          </table>

          <p className="mb-4 text-lg">{movie.Plot}</p>

          {/* Add to Favourites Button */}
          <div className="pt-4 w-full max-w-52">
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
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`flex-shrink-0 transition-all duration-100 ${
                  isFavourite ? "fill-red-500 stroke-red-500" : ""
                }`}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <div className="relative overflow-hidden flex-grow">
                <div className="transition-all duration-500 transform flex flex-col h-6">
                  <span
                    className={`transition-all duration-500 transform ${
                      isFavourite
                        ? "-translate-y-full opacity-0"
                        : "translate-y-0 opacity-100"
                    } whitespace-nowrap`}
                  >
                    Add to Favourites
                  </span>
                  <span
                    className={`transition-all duration-500 transform ${
                      isFavourite
                        ? "translate-y-0 opacity-100"
                        : "translate-y-full opacity-0"
                    } whitespace-nowrap absolute top-0 left-0`}
                  >
                    Added to Favourites
                  </span>
                  <span
                    className={`transition-all duration-500 transform ${
                      isFavourite
                        ? "-translate-y-6 opacity-0"
                        : "translate-y-full opacity-0"
                    } whitespace-nowrap absolute top-0 left-0`}
                  >
                    Added to Favourites
                  </span>
                </div>
              </div>
            </label>
          </div>

          {/* Add to Watchlist Dropdown */}
          <div className="pt-4 max-w-56">
            <select
              value={selectedWatchlist}
              onChange={(e) => setSelectedWatchlist(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">Select a watchlist</option>
              {watchlists.map((watchlist) => (
                <option key={watchlist._id} value={watchlist._id}>
                  {watchlist.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddToWatchlist}
              className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full"
            >
              Add to Selected Watchlist
            </button>
          </div>
        </div>
      </div>
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
