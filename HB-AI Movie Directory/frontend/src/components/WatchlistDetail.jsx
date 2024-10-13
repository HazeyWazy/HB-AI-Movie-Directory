import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MovieList from "./MovieList"; // Import the MovieList component

const WatchlistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState(null);
  const [newName, setNewName] = useState("");
  const [movieDetails, setMovieDetails] = useState([]); // Store movie details

  useEffect(() => {
    fetchWatchlistDetails();
  }, [id]);

  useEffect(() => {
    if (watchlist && watchlist.movies) {
      fetchMoviesDetails(watchlist.movies); // Fetch movie details when the watchlist is loaded
    }
  }, [watchlist]);

  const fetchWatchlistDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/watchlists/${id}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data);
        setNewName(data.name);
      } else {
        console.error("Error fetching watchlist:", response.status);
      }
    } catch (error) {
      console.error("Error fetching watchlist details:", error);
    }
  };

  const fetchMoviesDetails = async (movieIds) => {
    try {
      const movieDetailPromises = movieIds.map(async (movieId) => {
        const response = await fetch(
          `http://localhost:5000/api/movies/movie/${movieId}`,
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          return await response.json();
        } else {
          console.error(`Error fetching details for movie ${movieId}`);
          return null;
        }
      });

      const movies = await Promise.all(movieDetailPromises);
      const filteredMovies = movies.filter((movie) => movie !== null); // Exclude failed fetches
      setMovieDetails(filteredMovies);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };

  if (!watchlist) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{watchlist.name}</h2>

      {/* Render the MovieList component with fetched movie details */}
      {movieDetails.length > 0 ? (
        <MovieList movies={movieDetails} />
      ) : (
        <p>No movies in this watchlist yet.</p>
      )}
    </div>
  );
};

export default WatchlistDetail;
