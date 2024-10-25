const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Helper function for making API requests
const makeApiRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error.message);
    throw new Error(`TMDB API request failed: ${error.message}`);
  }
};

exports.fetchMovieByTitle = async (title, page = 1) => {
  try {
    const data = await makeApiRequest('/search/movie', {
      query: title,
      language: 'en-US',
      page: page,
      include_adult: false,
      region: 'US',
      sort_by: 'popularity.desc'
    });

    return {
      Search: data.results.map(movie => ({
        imdbID: movie.id.toString(),
        Title: movie.title,
        Year: movie.release_date?.split('-')[0] || 'N/A',
        Poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'N/A',
        Type: 'movie',
        Overview: movie.overview,
        VoteAverage: movie.vote_average,
        popularity: movie.popularity
      })).filter(movie => movie.Poster !== 'N/A'),
      totalResults: data.total_results,
      page: data.page,
      totalPages: data.total_pages,
      Response: data.results.length > 0 ? "True" : "False"
    };
  } catch (error) {
    console.error("Error in fetchMovieByTitle:", error);
    throw new Error("Failed to fetch movies by title");
  }
};

exports.fetchMovieDetailsById = async (id) => {
  try {
    const data = await makeApiRequest(`/movie/${id}`, {
      language: 'en-US',
      append_to_response: 'credits,keywords,recommendations'
    });

    // Get director from crew
    const director = data.credits?.crew?.find(person => person.job === 'Director')?.name || 'N/A';
    
    // Get top 5 cast members
    const actors = data.credits?.cast
      ?.slice(0, 5)
      ?.map(actor => actor.name)
      ?.join(', ') || 'N/A';

    // Get recommendations
    const recommendations = data.recommendations?.results
      ?.slice(0, 5)
      ?.map(movie => ({
        id: movie.id.toString(),
        title: movie.title,
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'N/A'
      })) || [];

    return {
      imdbID: data.id.toString(),
      Title: data.title,
      Year: data.release_date?.split('-')[0] || 'N/A',
      Rated: data.adult ? 'R' : 'PG-13',
      Runtime: data.runtime ? `${data.runtime} min` : 'N/A',
      Genre: data.genres?.map(g => g.name).join(', ') || 'N/A',
      Director: director,
      Actors: actors,
      Plot: data.overview || 'N/A',
      Poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'N/A',
      imdbRating: data.vote_average?.toFixed(1) || 'N/A',
      Popularity: data.popularity,
      Budget: data.budget || 'N/A',
      Revenue: data.revenue || 'N/A',
      Recommendations: recommendations
    };
  } catch (error) {
    console.error("Error in fetchMovieDetailsById:", error);
    throw new Error("Failed to fetch movie details");
  }
};

exports.fetchMovieByQuery = async (params = {}) => {
  try {
    const data = await makeApiRequest('/discover/movie', {
      language: 'en-US',
      include_adult: false,
      page: params.page || 1,
      sort_by: params.sort_by || 'popularity.desc',
      with_genres: params.with_genres,
      ...params
    });

    return data.results.map(movie => ({
      imdbID: movie.id.toString(),
      Title: movie.title,
      Year: movie.release_date?.split('-')[0] || 'N/A',
      Poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'N/A',
      Type: 'movie',
      Overview: movie.overview,
      VoteAverage: movie.vote_average,
      popularity: movie.popularity
    })).filter(movie => movie.Poster !== 'N/A');
  } catch (error) {
    console.error("Error in fetchMovieByQuery:", error);
    throw new Error("Failed to fetch movies by query");
  }
};

module.exports = exports;