const {
  getMovieDetails,
  suggestAndFetchMoviesAI,
  getRecommendations
} = require('../controllers/movieController');
const { 
  fetchMovieDetailsById,
  fetchMovieByQuery,
  fetchMovieByTitle
} = require('../services/movieService');

// Mock the OpenAI class
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: "1. The Shawshank Redemption\n2. The Godfather\n3. The Dark Knight"
            }
          }]
        })
      }
    }
  }));
});

jest.mock('../services/movieService');

describe('Movie Test', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getMovieDetails', () => {
    it('should return movie details when valid ID is provided', async () => {
      req.params.id = '238';
      const mockMovieDetails = { 
        Title: 'The Godfather',
        Year: '1972',
        Genre: 'Crime, Drama',
        Plot: 'The aging patriarch of an organized crime dynasty transfers control to his son.',
        imdbID: '238'
      };
      fetchMovieDetailsById.mockResolvedValue(mockMovieDetails);

      await getMovieDetails(req, res);

      expect(fetchMovieDetailsById).toHaveBeenCalledWith('238');
      expect(res.json).toHaveBeenCalledWith(mockMovieDetails);
    });

    it('should handle missing movie ID', async () => {
      await getMovieDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Movie ID is required" });
    });

    it('should handle API errors', async () => {
      req.params.id = '238';
      fetchMovieDetailsById.mockRejectedValue(new Error('API error'));

      await getMovieDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch movie details",
        details: "API error"
      });
    });
  });

  describe('suggestAndFetchMoviesAI', () => {
    beforeEach(() => {
      // Mock successful movie detail fetches
      const mockMovieResults = {
        Search: [{
          imdbID: '238',
          Title: 'The Godfather',
          Year: '1972',
          Response: "True"
        }],
        Response: "True"
      };

      fetchMovieByTitle.mockResolvedValue(mockMovieResults);

      // Mock movie details
      const mockDetails = {
        imdbID: '238',
        Title: 'The Godfather',
        Year: '1972',
        Genre: 'Crime, Drama'
      };

      fetchMovieDetailsById.mockResolvedValue(mockDetails);
    });

    it('should return AI suggested movies successfully', async () => {
      req.query.userPrompt = 'prison movies';

      await suggestAndFetchMoviesAI(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        results: expect.any(Array),
        metadata: expect.objectContaining({
          originalPrompt: 'prison movies',
          suggestedTitles: expect.any(Array)
        })
      });
    });

    it('should handle missing user prompt', async () => {
      await suggestAndFetchMoviesAI(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Valid user prompt is required"
      });
    });
  });

  describe('getRecommendations', () => {
    it('should return movie recommendations successfully', async () => {
      req.params.id = '238';
      const mockMovieDetails = {
        id: 238,
        Title: 'The Godfather',
        Genre: 'Crime, Drama',
        Recommendations: [
          { 
            id: 240,
            title: 'The Godfather Part II',
            poster: '/path/to/poster'
          }
        ]
      };
      
      fetchMovieDetailsById.mockResolvedValue(mockMovieDetails);

      await getRecommendations(req, res);

      expect(res.json).toHaveBeenCalledWith({
        movieId: '238',
        recommendations: expect.any(Array)
      });
    });

    it('should handle missing movie ID', async () => {
      await getRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Movie ID is required"
      });
    });

    it('should handle movie not found', async () => {
      req.params.id = '999999';
      fetchMovieDetailsById.mockResolvedValue(null);

      await getRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Movie not found"
      });
    });

    it('should handle API errors', async () => {
      req.params.id = '238';
      fetchMovieDetailsById.mockRejectedValue(new Error('API error'));

      await getRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch movie recommendations",
        details: "API error"
      });
    });
  });
});