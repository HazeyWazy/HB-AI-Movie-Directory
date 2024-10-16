import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const MovieDetail = () => {
  const [movie, setMovie] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        const response = await fetch(`https://group-project-gwdp-monday-12pm.onrender.com/api/movies/movie/${id}`);
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    fetchMovieDetail();
  }, [id]);

  if (!movie) {
    return ( 
      // loader
      <div className="flex flex-col min-h-[90vh] text-center justify-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-orange-300 border-t-gray-300"></div>
        <p className="mt-4 text-lg text-slate-900 dark:text-white">Loading...</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Rolling out the details, just for you</p>
      </div>
    )
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white py-12 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-1/2">
          <img
            src={movie.Poster}
            alt={movie.Title}
            className="mx-auto rounded-lg shadow-md"
          />
        </div>
        <div className="md:w-1/2 md:ml-10 mt-8 md:mt-0">
          <h1 className="text-4xl font-bold mb-4">{movie.Title}</h1>
          <p className="mb-2">
            <strong>Director:</strong> {movie.Director}
          </p>
          <p className="mb-2">
            <strong>Cast:</strong> {movie.Actors}
          </p>
          <p className="mb-2">
            <strong>Year:</strong> {movie.Year}
          </p>
          <p className="mb-2">
            <strong>Genre:</strong> {movie.Genre}
          </p>
          <p className="mb-4">
            <strong>Rating:</strong> {movie.imdbRating} / 10
          </p>
          <p className="mb-4 text-lg">{movie.Plot}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
