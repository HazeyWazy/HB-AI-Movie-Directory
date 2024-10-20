import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import "../index.css";
import { apiUrl } from "../config";

const MovieDetail = ({ onAddToFavourites }) => {
  const [movie, setMovie] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false); // State to control the favourite status
  const { id } = useParams();

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        const response = await fetch(`${apiUrl}/movies/movie/${id}`);
        const data = await response.json();
        setMovie(data);

        // Check if the movie is in the user's favourites by fetching from the backend
        const favouritesResponse = await fetch(`${apiUrl}/favourites`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Authentication
            "Content-Type": "application/json",
          },
        });

        if (favouritesResponse.ok) {
          const favouritesData = await favouritesResponse.json();
          // Check if the movie is in the user's favourites
          if (favouritesData.favorites.some(fav => fav.imdbID === data.imdbID)) {
            setIsFavourite(true);
          }
        } else {
          console.error("Failed to fetch user's favourites");
        }
      } catch (error) {
        console.error("Error fetching movie details or favourites:", error);
      }
    };

    fetchMovieDetail();
  }, [id]);

  const handleFavouriteChange = async () => {
    setIsFavourite(!isFavourite);

    if (!isFavourite) {
      await onAddToFavourites(movie.imdbID); // Call the function to add to favourites when checked
    } else {
      // Handle removal from favourites (if applicable)
    }
  };

  if (!movie) {
    return (
      // loader
      <div className="flex flex-col min-h-[85vh] text-center justify-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-orange-300 border-t-gray-300"></div>
        <p className="mt-4 text-lg text-slate-900 dark:text-white">Loading...</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Rolling out the details, just for you</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white py-12 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-2/5">
          <img
            src={
              movie.Poster !== "N/A"
                ? movie.Poster
                : "https://via.placeholder.com/350x500?text=No+Image"
            }
            alt={movie.Title}
            className="mx-auto rounded-lg shadow-md"
          />
        </div>
        <div className="md:w-3/5 md:ml-10 mt-8 md:mt-0">
          <h1 className="text-4xl font-bold mb-4">{movie.Title}</h1>

          {/* Movie Details Table */}
          <table className="table-auto w-full text-left text-lg mb-4">
            <tbody>
              <tr>
                <td className="font-semibold pr-4">Director:</td>
                <td>{movie.Director}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4">Cast:</td>
                <td>{movie.Actors}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4">Genre:</td>
                <td>{movie.Genre}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4">Year:</td>
                <td>{movie.Year}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4">Rated:</td>
                <td>{movie.Rated}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4">Runtime:</td>
                <td>{movie.Runtime}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-4">Rating:</td>
                <td>{movie.imdbRating}/10</td>
              </tr>
            </tbody>
          </table>

          <p className="mb-4 text-lg">{movie.Plot}</p>

          {/* Add to Favourites Button */}
          <div className="pt-4 max-w-56">
            <input
              type="checkbox"
              id="favorite"
              name="favorite-checkbox"
              className="hidden peer"
              checked={isFavourite}
              onChange={handleFavouriteChange} // Handle the checkbox toggle
            />
            <label
              htmlFor="favorite"
              className="bg-white flex items-center gap-4 p-3 pl-2 cursor-pointer select-none rounded-lg shadow-lg text-black"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`ml-2 transition-all duration-100 ${
                  isFavourite ? "fill-red-500 stroke-red-500" : ""
                }`}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <div className="relative overflow-hidden grid h-[24px]">
                <span
                  className={`transition-all duration-500 transform ${
                    isFavourite ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
                  }`}
                >
                  Add to Favourites
                </span>
                <span
                  className={`transition-all duration-500 transform ${
                    isFavourite ? "-translate-y-6 opacity-100" : "translate-y-full opacity-0"
                  }`}
                >
                  Added to Favourites
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// propTypes validation
MovieDetail.propTypes = {
  onAddToFavourites: PropTypes.func.isRequired, // Function to handle adding to favourites
};

export default MovieDetail;
