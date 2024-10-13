const { searchMovie, getMovieDetails, suggestMoviesAI, suggestAndFetchMoviesAI } = require('../controllers/movieController');
const { fetchMovieByTitle, fetchMovieDetailsById } = require('../services/movieService');

jest.mock('../services/movieService');

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: "1. Inception\n2. The Matrix\n3. Interstellar"
              }
            }]
          })
        }
      }
    };
  });
});

const OpenAI = require('openai');

describe('Movie Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('searchMovie', () => {
    it('should return movie data when title is provided', async () => {
      req.query.title = 'Inception';
      const mockMovieData = { Title: 'Inception', Year: '2010' };
      fetchMovieByTitle.mockResolvedValue(mockMovieData);

      await searchMovie(req, res);

      expect(fetchMovieByTitle).toHaveBeenCalledWith('Inception');
      expect(res.json).toHaveBeenCalledWith(mockMovieData);
    });

    it('should return error when title is not provided', async () => {
      await searchMovie(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Title is required" });
    });
  });

  describe('getMovieDetails', () => {
    it('should return movie details when valid ID is provided', async () => {
      req.params.id = 'tt1375666';
      const mockMovieDetails = { Title: 'Inception', Year: '2010', Response: "True" };
      fetchMovieDetailsById.mockResolvedValue(mockMovieDetails);

      await getMovieDetails(req, res);

      expect(fetchMovieDetailsById).toHaveBeenCalledWith('tt1375666');
      expect(res.json).toHaveBeenCalledWith(mockMovieDetails);
    });

    it('should return error when movie is not found', async () => {
      req.params.id = 'invalid_id';
      fetchMovieDetailsById.mockResolvedValue({ Response: "False" });

      await getMovieDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Movie not found" });
    });
  });

  describe('suggestMoviesAI', () => {
    it('should return AI-suggested movie titles', async () => {
      req.query.input = 'sci-fi';

      await suggestMoviesAI(req, res);

      expect(OpenAI).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        suggestion: ['Inception', 'The Matrix', 'Interstellar']
      });
    });
  });

  describe('suggestAndFetchMoviesAI', () => {
    it('should return AI-suggested movies with details', async () => {
      req.query.userPrompt = 'sci-fi';
      fetchMovieByTitle.mockResolvedValueOnce({
        Response: "True",
        Search: [{ Title: 'Inception', Year: '2010' }]
      });
      fetchMovieByTitle.mockResolvedValueOnce({
        Response: "True",
        Search: [{ Title: 'The Matrix', Year: '1999' }]
      });
      fetchMovieByTitle.mockResolvedValueOnce({
        Response: "True",
        Search: [{ Title: 'Interstellar', Year: '2014' }]
      });

      await suggestAndFetchMoviesAI(req, res);

      expect(OpenAI).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        results: [
          { Title: 'Inception', Year: '2010' },
          { Title: 'The Matrix', Year: '1999' },
          { Title: 'Interstellar', Year: '2014' }
        ]
      });
    });
  });
});