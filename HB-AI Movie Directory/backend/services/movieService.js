// Movie Service: Handles all TMDB API interactions for movie data
const axios = require("axios");

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Helper function for making API requests
const makeApiRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error.message);
    throw new Error(`TMDB API request failed: ${error.message}`);
  }
};

// Search movies by title with pagination
exports.fetchMovieByTitle = async (title, page = 1) => {
  try {
    const data = await makeApiRequest("/search/movie", {
      query: title,
      language: "en-US",
      page: page,
      include_adult: false,
      region: "US",
      sort_by: "popularity.desc",
    });

    // Transform TMDB data to match application schema
    return {
      Search: data.results
        .map((movie) => ({
          imdbID: movie.id.toString(),
          Title: movie.title,
          Year: movie.release_date?.split("-")[0] || "N/A",
          Poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "N/A",
          Type: "movie",
          Overview: movie.overview,
          VoteAverage: movie.vote_average,
          popularity: movie.popularity,
        }))
        .filter((movie) => movie.Poster !== "N/A"),
      totalResults: data.total_results,
      page: data.page,
      totalPages: data.total_pages,
      Response: data.results.length > 0 ? "True" : "False",
    };
  } catch (error) {
    console.error("Error in fetchMovieByTitle:", error);
    throw new Error("Failed to fetch movies by title");
  }
};

// Get detailed movie information including credits and recommendations
exports.fetchMovieDetailsById = async (id) => {
  try {
    const data = await makeApiRequest(`/movie/${id}`, {
      language: "en-US",
      append_to_response: "credits,keywords,recommendations",
    });

    // Get director from crew
    const director =
      data.credits?.crew?.find((person) => person.job === "Director")?.name ||
      "N/A";

    // Get top 5 cast members
    const actors =
      data.credits?.cast
        ?.slice(0, 5)
        ?.map((actor) => actor.name)
        ?.join(", ") || "N/A";

    // Get recommendations
    const recommendations =
      data.recommendations?.results?.slice(0, 5)?.map((movie) => ({
        id: movie.id.toString(),
        title: movie.title,
        poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "N/A",
      })) || [];

    // Return formatted movie details
    return {
      imdbID: data.id.toString(),
      Title: data.title,
      Year: data.release_date?.split("-")[0] || "N/A",
      Rated: data.adult ? "R" : "PG-13",
      Runtime: data.runtime ? `${data.runtime} min` : "N/A",
      Genre: data.genres?.map((g) => g.name).join(", ") || "N/A",
      Director: director,
      Actors: actors,
      Plot: data.overview || "N/A",
      Poster: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : "N/A",
      imdbRating: data.vote_average?.toFixed(1) || "N/A",
      Popularity: data.popularity,
      Budget: data.budget || "N/A",
      Revenue: data.revenue || "N/A",
      Recommendations: recommendations,
    };
  } catch (error) {
    console.error("Error in fetchMovieDetailsById:", error);
    throw new Error("Failed to fetch movie details");
  }
};

// Search movies by various criteria (genres, popularity, etc.)
exports.fetchMovieByQuery = async (params = {}) => {
  try {
    const data = await makeApiRequest("/discover/movie", {
      language: "en-US",
      include_adult: false,
      page: params.page || 1,
      sort_by: params.sort_by || "popularity.desc",
      with_genres: params.with_genres,
      ...params,
    });

    // Transform and filter results
    return data.results
      .map((movie) => ({
        imdbID: movie.id.toString(),
        Title: movie.title,
        Year: movie.release_date?.split("-")[0] || "N/A",
        Poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "N/A",
        Type: "movie",
        Overview: movie.overview,
        VoteAverage: movie.vote_average,
        popularity: movie.popularity,
      }))
      .filter((movie) => movie.Poster !== "N/A");
  } catch (error) {
    console.error("Error in fetchMovieByQuery:", error);
    throw new Error("Failed to fetch movies by query");
  }
};

// Get movie trailer with smart fallback options
exports.fetchMovieTrailerById = async (id, movieTitle, releaseYear) => {
  console.log("service: ", id);
  try {
    const data = await makeApiRequest(`/movie/${id}/videos`, {
      language: "en-US",
    });

    const trailers = data.results || [];
    console.log("Trailers array:", trailers);

    if (!Array.isArray(trailers)) {
      throw new Error("No trailers found or incorrect structure");
    }

    // First priority: Trailer matching the movie title and containing "Official Trailer"
    const filteredTrailer = trailers.find(
      (video) =>
        video.type === "Trailer" &&
        video.site === "YouTube" &&
        video.name && // Ensure video.name is defined
        movieTitle && // Ensure movieTitle is defined
        (video.name.toLowerCase().includes(movieTitle.toLowerCase()) ||
          video.name.toLowerCase().includes("official trailer"))
    );

    // Fallback: Any trailer from the release year
    const fallbackTrailer = trailers.find(
      (video) =>
        video.type === "Trailer" &&
        video.site === "YouTube" &&
        video.published_at &&
        new Date(video.published_at).getFullYear() === releaseYear
    );

    // Last fallback: Any YouTube trailer if neither of the above works
    const defaultTrailer = trailers.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    const selectedTrailer = filteredTrailer || fallbackTrailer || defaultTrailer;

    if (selectedTrailer) {
      return {
        trailerUrl: `https://www.youtube.com/embed/${selectedTrailer.key}`,
      };
    } else {
      return { error: "Trailer not found" };
    }
  } catch (error) {
    console.error("Error in fetchMovieTrailerById:", error);
    throw new Error("Failed to fetch movie trailer");
  }
};

module.exports = exports;