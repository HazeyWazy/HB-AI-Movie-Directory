import React from "react";
import { Link } from "react-router-dom";

const MovieList = ({ movies }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {movies.map((movie) => (
        <Link
          to={`/movie/${movie.imdbID}`}
          key={movie.imdbID}
          className="block"
        >
          <div className="border rounded-lg overflow-hidden shadow-lg">
            <img
              src={movie.Poster}
              alt={movie.Title}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h2 className="font-bold text-xl mb-2">{movie.Title}</h2>
              <p className="text-gray-700 text-base">Year: {movie.Year}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MovieList;
