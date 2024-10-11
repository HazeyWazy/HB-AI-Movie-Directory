import React from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import "../index.css";

const MovieList = ({ movies }) => {
  return (
    <div className="flex flex-wrap justify-center gap-10 mt-10 px-4 py-6">
      {movies.map((movie) => (
        <Link
          to={`/movie/${movie.imdbID}`}
          key={movie.imdbID}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-slate-950 hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 w-full sm:w-72"
        >
          <div className="flex flex-col overflow-hidden rounded-t-lg p-4">
            <img
              src={movie.Poster}
              alt={movie.Title}
              className="min-w-full max-h-80 rounded-md mb-4"
            />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{movie.Title}</h2>
            <p className="text-md text-gray-600 dark:text-gray-300">{movie.Year} • {movie.Type}</p>     
          </div>
        </Link>
      ))}
    </div>
  );
};

// propTypes validation
MovieList.propTypes = {
  movies: PropTypes.func.isRequired,
};

export default MovieList;
