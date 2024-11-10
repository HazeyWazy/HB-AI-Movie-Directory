// Component to display grid of movie cards from search results
import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const MovieList = ({ movies }) => {
  return (
    <div className="flex flex-wrap justify-center gap-10 mt-10 px-4 py-6">
      {/* Filter out null entries and map through movies */}
      {movies
        .filter((movie) => movie !== null)
        .map((movie) => (
          // Movie card container
          <div
            key={movie.imdbID}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-slate-950 hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 w-full sm:w-72"
          >
            {/* Link to movie details */}
            <Link to={`/movie/${movie.imdbID}`}>
              <div className="flex flex-col overflow-hidden rounded-t-lg p-4">
                {/* Movie poster with fallback */}
                <img
                  src={
                    movie.Poster !== "N/A"
                      ? movie.Poster
                      : "https://via.placeholder.com/300x450?text=No+Image"
                  }
                  alt={movie.Title}
                  className="min-w-full max-h-80 rounded-md mb-4"
                />
                {/* Movie information */}
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {movie.Title}
                </h2>
                <p className="text-md text-gray-600 dark:text-gray-300">
                  {movie.Year} • {movie.Type}
                </p>
              </div>
            </Link>
          </div>
        ))}
    </div>
  );
};

// propTypes validation
MovieList.propTypes = {
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      imdbID: PropTypes.string.isRequired,
      Poster: PropTypes.string.isRequired,
      Title: PropTypes.string.isRequired,
      Year: PropTypes.string.isRequired,
      Type: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default MovieList;