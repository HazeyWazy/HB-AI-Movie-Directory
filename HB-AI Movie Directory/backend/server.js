const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get('/api/search', async (req, res) => {
    try {
      const { title } = req.query;
      const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${title}`;
      console.log('Making request to:', url);
      const response = await axios.get(url);
      res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
        console.error('Error details:', error);
        res.status(500).json({ error: 'An error occurred while fetching data', details: error.message });
      }
  });

app.get('/api/movie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${id}`;
    console.log('Making request to:', url);
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error.response ? error.response.data : error.message);
    console.error('Error details:', error);
    res.status(500).json({ error: 'An error occurred while fetching data', details: error.message });
  }
});

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; // Export the app for testing