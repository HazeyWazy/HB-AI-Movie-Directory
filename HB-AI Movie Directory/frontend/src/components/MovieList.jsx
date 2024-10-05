import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

const MovieList = ({ movies }) => {
  return (
    <div className="movie-list">
      {movies.map((movie) => (
        <Link
          to={`/movie/${movie.imdbID}`}
          key={movie.imdbID}
          className="movie-item"
        >
          <div className="movie-card">
            <img
              src={movie.Poster}
              alt={movie.Title}
              className="movie-poster"
            />
            <div className="movie-info">
              <h2 className="movie-title">{movie.Title}</h2>
              <p className="movie-year">Year: {movie.Year}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MovieList;
