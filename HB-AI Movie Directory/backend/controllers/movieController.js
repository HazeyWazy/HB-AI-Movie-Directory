const axios = require('axios');
const OpenAI = require('openai');
const { fetchMovieByTitle, fetchMovieDetailsById } = require('../services/movieService');

const openai = new OpenAI({
  apiKey: process.env.CHAT_GPT_API,
  organization: process.env.ORG_KEY,
});

exports.searchMovie = async (req, res) => {
  const { title } = req.query;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  try {
    const data = await fetchMovieByTitle(title);
    res.json(data);
  } catch (error) {
    console.error("Error fetching movie data:", error);
    res.status(500).json({ error: "Error fetching movie data", details: error.message });
  }
};

exports.getMovieDetails = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Movie ID is required" });
  }
  try {
    const data = await fetchMovieDetailsById(id);
    if (data.Response === "False") {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json(data);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    res.status(500).json({ error: "Error fetching movie details", details: error.message });
  }
};

exports.suggestMoviesAI = async (req, res) => {
  const { input } = req.query;
  if (!input) {
    return res.status(400).json({ error: "Input is required" });
  }
  try {
    const prompt = `Give me movies about ${input}. Please return the results as a numbered list with only the movie titles.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });
    
    const movieTitles = response.choices[0].message.content
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);

    return res.status(200).json({ suggestion: movieTitles });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ error: "Error fetching suggestions", details: error.message });
  }
};

exports.suggestAndFetchMoviesAI = async (req, res) => {
  const { userPrompt } = req.query;
  if (!userPrompt) {
    return res.status(400).json({ error: "User prompt is required" });
  }
  try {
    const prompt = `Give me movies about ${userPrompt}. Please return the results as a numbered list with only the movie titles.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
    });

    const movieTitles = response.choices[0].message.content
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);

    const movieDetailsPromises = movieTitles.map(fetchMovieByTitle);
    const movieDetails = await Promise.all(movieDetailsPromises);
    const foundMovies = movieDetails
      .filter(movie => movie.Response === "True")
      .map(movie => movie.Search[0]);

    return res.status(200).json({ results: foundMovies });
  } catch (error) {
    console.error("Error in fetching suggestions and searching:", error);
    res.status(500).json({ error: "Error in fetching suggestions and searching", details: error.message });
  }
};