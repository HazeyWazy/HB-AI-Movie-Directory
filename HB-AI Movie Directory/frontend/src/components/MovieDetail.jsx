import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const MovieDetail = () => {
  const [movie, setMovie] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/movie/${id}`);
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
    <div className="">
      <div className="">
        <div className="">
          <h1 className="">{movie.Title}</h1>
          <p>
            <strong>Director:</strong> {movie.Director}
          </p>
          <p>
            <strong>Cast:</strong> {movie.Actors}
          </p>
          <p>
            <strong>Year:</strong> {movie.Year}
          </p>
          <p>
            <strong>Genre:</strong> {movie.Genre}
          </p>
          <p>
            <strong>Plot:</strong> {movie.Plot}
          </p>
          <p>
            <strong>Rating:</strong> {movie.imdbRating}
          </p>
        </div>
        <div className="">
          <img src={movie.Poster} alt={movie.Title} />
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
