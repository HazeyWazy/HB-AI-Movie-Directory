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
      const response = await axios.get(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${title}`);
      res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while fetching data', details: error.message });
      }
  });

app.get('/api/movie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});