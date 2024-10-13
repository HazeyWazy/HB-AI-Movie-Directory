const axios = require('axios');

exports.fetchMovieByTitle = async (title) => {
  try {
    const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${title}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching movies by title");
  }
};

exports.fetchMovieDetailsById = async (id) => {
  try {
    const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${id}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching movie details");
  }
};
