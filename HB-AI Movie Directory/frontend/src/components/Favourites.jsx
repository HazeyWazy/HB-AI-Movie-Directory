import React, { useEffect, useState } from "react";
import {apiUrl} from "../config";


function Favourites() {
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="favorites-section p-4">
      <h2 className="text-center text-2xl font-medium my-5">Your Favourite Movies</h2>
      {favorites && favorites.length === 0 ? (
        <p className="text-center">You have no favourite movies yet.</p>
      ) : (
        <div className="movie-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((movie) => (
            <div key={movie.imdbID || movie.Title} className="movie-card p-2 border rounded-lg shadow-md" style={{ maxWidth: '200px' }}>
              <img src={movie.Poster} alt={movie.Title} className="w-full h-auto" style={{ maxHeight: '200px', objectFit: 'cover' }} />
              <h3 className="text-sm font-medium mt-2 text-center">{movie.Title}</h3>
              <p className="text-xs text-center">{movie.Year}</p>
              <p className="text-xs text-center">Rated: {movie.Rated}</p>
              <p className="text-xs text-center">Released: {movie.Released}</p>
              <p className="text-xs text-center">Runtime: {movie.Runtime}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favourites;
