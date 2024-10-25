const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favouritesController');
const Favorites = require('../models/Favourites');
const { fetchMovieDetailsById } = require('../services/movieService');

jest.mock('../models/Favourites');
jest.mock('../services/movieService');

describe('Favorites Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: 'mock_user_id' },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('addFavorite', () => {
    it('should add a movie to favorites successfully', async () => {
      req.body = { movieId: 'movie123' };
      fetchMovieDetailsById.mockResolvedValue({ Title: 'Test Movie' });
      const mockFavorites = {
        userId: 'mock_user_id',
        movies: ['existing_movie'],
        save: jest.fn().mockResolvedValue(true)
      };
      Favorites.findOne.mockResolvedValue(mockFavorites);

      await addFavorite(req, res);

      expect(mockFavorites.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Movie added to favorites"
      }));
    });

    it('should create new favorites list if none exists', async () => {
      req.body = { movieId: 'movie123' };
      fetchMovieDetailsById.mockResolvedValue({ Title: 'Test Movie' });
      Favorites.findOne.mockResolvedValue(null);
      const mockSave = jest.fn().mockResolvedValue(true);
      Favorites.mockImplementation(() => ({ save: mockSave }));

      await addFavorite(req, res);

      expect(Favorites).toHaveBeenCalledWith({
        userId: 'mock_user_id',
        movies: ['movie123']
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a movie from favorites successfully', async () => {
      req.params.movieId = 'movie123';
      const mockFavorites = {
        userId: 'mock_user_id',
        movies: ['movie123', 'movie456'],
        save: jest.fn().mockResolvedValue(true)
      };
      Favorites.findOne.mockResolvedValue(mockFavorites);

      await removeFavorite(req, res);

      expect(mockFavorites.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Movie removed from favorites"
      }));
    });

    it('should handle non-existent movie in favorites', async () => {
      req.params.movieId = 'nonexistent_movie';
      const mockFavorites = {
        userId: 'mock_user_id',
        movies: ['movie123', 'movie456']
      };
      Favorites.findOne.mockResolvedValue(mockFavorites);

      await removeFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Movie not found in favorites"
      });
    });
  });

  describe('getFavorites', () => {
    it('should return all favorite movies with details', async () => {
      const mockFavorites = {
        userId: 'mock_user_id',
        movies: ['movie123', 'movie456']
      };
      const mockMovieDetails = [
        { Title: 'Movie 1', Year: '2020' },
        { Title: 'Movie 2', Year: '2021' }
      ];
      
      Favorites.findOne.mockResolvedValue(mockFavorites);
      fetchMovieDetailsById.mockImplementation((id) => 
        Promise.resolve(mockMovieDetails[mockFavorites.movies.indexOf(id)])
      );

      await getFavorites(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        favorites: mockMovieDetails
      });
    });

    it('should return empty array when no favorites exist', async () => {
      Favorites.findOne.mockResolvedValue(null);

      await getFavorites(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ favorites: [] });
    });
  });
});