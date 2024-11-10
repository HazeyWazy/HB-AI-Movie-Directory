import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {apiUrl} from "../config";

function Favourites() {
  // State management
  const [favorites, setFavourites] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  // Fetch the user's favorites from the backend
  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const response = await fetch(`${apiUrl}/favourites`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`, 
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setFavourites(data.favorites || []); 
        } else {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch favourites");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching favourites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, []);

  if (loading) {
    return (
      // loader
      <div className="flex flex-col min-h-[85vh] text-center justify-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-orange-300 border-t-gray-300"></div>
        <p className="mt-4 text-lg text-slate-900 dark:text-white">Loading...</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Bringing your favourites together</p>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex-col flex-wrap justify-center gap-10 px-4 py-6">
      <h2 className="text-center text-4xl font-medium">Your Favourite Movies</h2>
      
      {/* Display empty state or movie grid */}
      {favorites && favorites.length === 0 ? (
        <p className="mt-10 text-xl text-center">You have no favourite movies yet.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-10 mt-10">
          {/* Movie card grid */}
          {favorites.map((movie) => (
            <div
              key={movie.imdbID || movie.Title}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-slate-950 hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 w-full sm:w-72"
            >
            <Link to={`/movie/${movie.imdbID}`}>
              {/* Movie card content */}
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

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favourites;
