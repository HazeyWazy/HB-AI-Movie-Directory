const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
// const { Configuration, OpenAIApi } = require("openai");
const OpenAI = require("openai");

// const registerRoute = require("./register");
// var userlogin = require("./loginLogout");
// const loadUser = require("./middleware/loadUser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get("/api/search", async (req, res) => {
  try {
    const { title } = req.query;
    const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${title}`;
    console.log("Making request to:", url);
    const response = await axios.get(url);
    console.log(response);
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response ? error.response.data : error.message
    );
    console.error("Error details:", error);
    res.status(500).json({
      error: "An error occurred while fetching data",
      details: error.message,
    });
  }
});

app.get("/api/movie/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${id}`;
    console.log("Making request to:", url);
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response ? error.response.data : error.message
    );
    console.error("Error details:", error);
    res.status(500).json({
      error: "An error occurred while fetching data",
      details: error.message,
    });
  }
});

const openai = new OpenAI({
  apiKey: process.env.CHAT_GPT_API,
  organization: process.env.ORG_KEY,
});

app.get("/api/suggest", async (req, res) => {
  try {
    const {input} = req.query;
    const userInput = `give me movies about ${input}`;
    const prompt = `${userInput}. Please return the results as a numbered list with only the movie titles.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });
    originalRes = response.choices[0].message.content;
    console.log(originalRes);
    userDisplay = originalRes
      .match(/\d+\. (.*?)(?=\n|$)/g)
      ?.map((title) => title.replace(/^\d+\.\s*/, ""));
    return res.status(200).json({
      message: "Working",
      suggestion: userDisplay,
    });
  } catch (error) {
    return res.status(500).json({
      error: "An error occurred while fetching suggestions",
      details: error.message,
    });
  }
});

app.get("/api/suggestMoviesAI", async (req, res) => {
  try {
    const { userPrompt } = req.query;
    if (!userPrompt) {
      return res.status(400).json({ error: "Missing 'userPrompt' query parameter" });
    }

    // Get movie suggestions from OpenAI
    const prompt = `Give me movies about ${userPrompt}. Please return the results as a numbered list with only the movie titles.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
    });

    const suggestedMovies = response.choices[0].message.content
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);

    // Search for each suggested movie using OMDB API
    const movieDetailsPromises = suggestedMovies.map(async (title) => {
      const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${encodeURIComponent(title)}`;
      const response = await axios.get(url);
      return response.data;
    });

    const movieDetails = await Promise.all(movieDetailsPromises);

    // Filter out any movies not found and prepare the response
    const foundMovies = movieDetails.filter(movie => movie.Response === "True");

    return res.status(200).json({
      message: "Suggestions and search results combined successfully",
      results: foundMovies,
    });

  } catch (error) {
    console.error("Error in /api/suggestMoviesAI:", error);
    return res.status(500).json({
      error: "An error occurred while fetching suggestions and searching",
      details: error.message,
    });
  }
});

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; // Export the app for testing
