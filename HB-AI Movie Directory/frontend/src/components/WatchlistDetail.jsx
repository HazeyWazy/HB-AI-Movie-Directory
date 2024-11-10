import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiUrl } from "../config";

function WatchlistDetail() {
  // State management
  const [watchlist, setWatchlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  // Fetch watchlist details and id change
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

  // Handle movie removal
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

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-[85vh] text-center justify-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-orange-300 border-t-gray-300"></div>
        <p className="mt-4 text-lg text-slate-900 dark:text-white">Loading...</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Fetching your watchlist details</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex-col flex-wrap justify-center gap-10 px-4 py-6">
      {/* Watchlist title */}
      <h2 className="text-center text-4xl font-medium mb-6">{watchlist.name}</h2>
      
      {/* Empty state or movie grid */}
      {watchlist.movies.length === 0 ? (
        <p className="mt-10 text-xl text-center">This watchlist is empty.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-10 mt-10">
          {/* Movie cards */}
          {watchlist.movies.map((movie) => (
            <div
              key={movie.imdbID}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-slate-950 hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 w-full sm:w-72 relative"
            >
              <Link to={`/movie/${movie.imdbID}`}>
                <div className="flex flex-col overflow-hidden rounded-lg p-4 mb-3">
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

              {/* Delete button with trash icon */}
              <button
                onClick={() => handleRemoveMovie(movie.imdbID)}
                className="absolute bottom-4 right-4 bg-gray-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900 w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 group"
                aria-label="Remove movie from watchlist"
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
    </div>
  );
}

export default WatchlistDetail;