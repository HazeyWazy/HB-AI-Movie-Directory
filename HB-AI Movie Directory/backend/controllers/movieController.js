const { 
  fetchMovieByTitle, 
  fetchMovieDetailsById,
  fetchMovieByQuery 
} = require('../services/movieService');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.CHAT_GPT_API,
  organization: process.env.ORG_KEY,
});

// Helper Functions
const safeMovieFetch = async (title) => {
  try {
    const result = await fetchMovieByTitle(title);
    if (result && result.Response === "True" && result.Search && result.Search.length > 0) {
      return result;
    }
    console.log(`No results found for movie: ${title}`);
    return null;
  } catch (error) {
    console.error(`Error fetching movie '${title}':`, error);
    return null;
  }
};

const getDetailedMovieInfo = async (movie) => {
  if (!movie || !movie.imdbID) return null;
  try {
    return await fetchMovieDetailsById(movie.imdbID);
  } catch (error) {
    console.error(`Error fetching details for movie ID ${movie.imdbID}:`, error);
    return movie;
  }
};

const processGPTResponse = (content) => {
  if (!content) return [];
  return content
    .split('\n')
    .map(line => line.replace(/^\d+[\.\)]\s*/, '').replace(/\([^)]*\)/g, '').trim())
    .filter(title => title.length > 0);
};

// Main Routes
exports.getMovieDetails = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Movie ID is required" });
  }
  try {
    const data = await fetchMovieDetailsById(id);
    res.json(data);
  } catch (error) {
    console.error("Error in getMovieDetails:", error);
    res.status(500).json({ error: "Failed to fetch movie details", details: error.message });
  }
};

exports.suggestAndFetchMoviesAI = async (req, res) => {
  const { userPrompt } = req.query;
  if (!userPrompt || typeof userPrompt !== 'string') {
    return res.status(400).json({ error: "Valid user prompt is required" });
  }

  try {
    // Get AI suggestions
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a movie recommendation expert. Provide specific, well-known movies including both popular and lesser-known films."
        },
        { 
          role: "user", 
          content: `Suggest movies about "${userPrompt}". Return only a numbered list of movie titles.`
        }
      ],
      max_tokens: 500,
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error("Invalid AI response");
    }

    // Process suggestions
    const movieTitles = processGPTResponse(response.choices[0].message.content);
    if (movieTitles.length === 0) {
      return res.status(404).json({ error: "No movie suggestions generated" });
    }

    // Fetch movie details
    const movieFetchPromises = movieTitles.map(safeMovieFetch);
    const movieResults = await Promise.allSettled(movieFetchPromises);

    // Process results
    const foundMovies = movieResults
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value.Search[0])
      .filter(Boolean);

    if (foundMovies.length === 0) {
      return res.status(404).json({
        error: "No movies found",
        searchedTitles: movieTitles
      });
    }

    // Get detailed information
    const detailedMoviePromises = foundMovies.map(getDetailedMovieInfo);
    const detailedResults = await Promise.allSettled(detailedMoviePromises);

    // Process detailed results
    const finalMovies = detailedResults
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);

    // Return results with metadata
    return res.status(200).json({
      results: finalMovies,
      metadata: {
        originalPrompt: userPrompt,
        suggestedTitles: movieTitles,
        foundCount: finalMovies.length,
        totalSuggestions: movieTitles.length
      }
    });

  } catch (error) {
    console.error("Error in suggestAndFetchMoviesAI:", error);
    return res.status(500).json({
      error: "Processing Error",
      message: "Failed to process movie suggestions",
      details: error.message
    });
  }
};

exports.getRecommendations = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Movie ID is required" });
  }

  try {
    // Get movie details with recommendations
    const movieDetails = await fetchMovieDetailsById(id);
    
    if (!movieDetails) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // If no recommendations, try to find similar movies by genre
    if (!movieDetails.Recommendations || movieDetails.Recommendations.length === 0) {
      const genres = movieDetails.Genre.split(', ');
      const similarMovies = await fetchMovieByQuery({ 
        sort_by: 'popularity.desc',
        with_genres: genres[0] // Use first genre
      });
      
      movieDetails.Recommendations = similarMovies
        .filter(movie => movie.imdbID !== id) // Remove the original movie
        .slice(0, 5) // Limit to 5 recommendations
        .map(movie => ({
          id: movie.imdbID,
          title: movie.Title,
          poster: movie.Poster
        }));
    }

    res.json({
      movieId: id,
      recommendations: movieDetails.Recommendations
    });
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    res.status(500).json({
      error: "Failed to fetch movie recommendations",
      details: error.message
    });
  }
};

module.exports = exports;