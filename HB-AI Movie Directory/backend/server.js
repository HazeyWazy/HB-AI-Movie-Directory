const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
// const { Configuration, OpenAIApi } = require("openai");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get("/api/search", async (req, res) => {
  try {
    const { title } = req.query;
    const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${title}`;
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
    const prompt = "List the top 4 most Ana de Arms movie";
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
    });
    return res.status(200).json({
      message: "Working",
      suggestion: response.choices[0].message.content,
    });
  } catch (error) {
    return res.status(500).json({
      error: "An error occurred while fetching suggestions",
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
