import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiUrl } from "../config";

function WatchlistDetail() {
  const [watchlist, setWatchlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await fetch(`${apiUrl}/watchlist/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWatchlist(data.watchlist);
        } else {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch watchlist");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching watchlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [id]);

  const handleRemoveMovie = async (movieId) => {
    try {
      const response = await fetch(`${apiUrl}/watchlist/remove`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ watchlistId: id, movieId }),
      });

      if (response.ok) {
        setWatchlist(prevWatchlist => ({
          ...prevWatchlist,
          movies: prevWatchlist.movies.filter(movie => movie.imdbID !== movieId)
        }));
      } else {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to remove movie from watchlist");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error removing movie from watchlist:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-[85vh] text-center justify-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-orange-300 border-t-gray-300"></div>
        <p className="mt-4 text-lg text-slate-900 dark:text-white">Loading...</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Fetching your watchlist</p>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex-col flex-wrap justify-center gap-10 px-4 py-6">
      <h2 className="text-center text-4xl font-medium mb-6">{watchlist.name}</h2>
      
      {watchlist.movies.length === 0 ? (
        <p className="mt-10 text-xl text-center">This watchlist is empty.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-10 mt-10">
          {watchlist.movies.map((movie) => (
            <div
              key={movie.imdbID}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-slate-950 hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 w-full sm:w-72"
            >
              <Link to={`/movie/${movie.imdbID}`}>
                <div className="flex flex-col overflow-hidden rounded-t-lg p-4">
                  <img
                    src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image"}
                    alt={movie.Title}
                    className="min-w-full max-h-80 rounded-md mb-4"
                  />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                    {movie.Title} ({movie.Year})
                  </h2>
                  <p className="text-md text-gray-600 dark:text-gray-300 text-center">
                    Rating: {movie.imdbRating}/10
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleRemoveMovie(movie.imdbID)}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-b-lg hover:bg-red-600 transition-colors duration-300"
              >
                Remove from Watchlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WatchlistDetail;