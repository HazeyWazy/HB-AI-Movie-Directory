const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

exports.fetchMovieByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: title,
        language: 'en-US',
        page: 1,
        include_adult: false
      }
    });
    return {
      Search: response.data.results.map(movie => ({
        imdbID: movie.id.toString(), // Convert to string
        Title: movie.title,
        Year: movie.release_date.split('-')[0],
        Poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'N/A',
        Type: 'movie'
      })).filter(movie => movie !== null), // Filter out null values
      totalResults: response.data.total_results,
      Response: 'True'
    };
  } catch (error) {
    throw new Error("Error fetching movies by title");
  }
};

exports.fetchMovieDetailsById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        append_to_response: 'credits'
      }
    });
    return {
      Title: response.data.title,
      Year: response.data.release_date.split('-')[0],
      Rated: response.data.adult ? 'R' : 'PG-13',
      Runtime: `${response.data.runtime} min`,
      Genre: response.data.genres.map(g => g.name).join(', '),
      Director: response.data.credits.crew.find(c => c.job === 'Director')?.name || 'N/A',
      Actors: response.data.credits.cast.slice(0, 5).map(a => a.name).join(', '),
      Plot: response.data.overview,
      Poster: response.data.poster_path ? `https://image.tmdb.org/t/p/w500${response.data.poster_path}` : 'N/A',
      imdbRating: response.data.vote_average.toFixed(1),
      imdbID: response.data.id.toString() // Convert to string
    };
  } catch (error) {
    throw new Error("Error fetching movie details");
  }
};