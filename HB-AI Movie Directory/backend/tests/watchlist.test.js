const {
    createWatchlist,
    getUserWatchlists,
    getWatchlistById,
    addToWatchlist,
    removeFromWatchlist,
    deleteWatchlist
  } = require('../controllers/watchlistController');
  const Watchlist = require('../models/Watchlist');
  const { fetchMovieDetailsById } = require('../services/movieService');
  
  jest.mock('../models/Watchlist');
  jest.mock('../services/movieService');
  
  describe('Watchlist Controller', () => {
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
  
    describe('createWatchlist', () => {
      it('should create a new watchlist successfully', async () => {
        req.body = { name: 'My Watchlist' };
        const mockWatchlist = {
          userId: 'mock_user_id',
          name: 'My Watchlist',
          movies: []
        };
  
        Watchlist.mockImplementation(() => ({
          ...mockWatchlist,
          save: jest.fn().mockResolvedValue(mockWatchlist)
        }));
  
        await createWatchlist(req, res);
  
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "Watchlist created",
          watchlist: expect.objectContaining({
            userId: 'mock_user_id',
            name: 'My Watchlist',
            movies: []
          })
        });
      });
  
      it('should handle missing watchlist name', async () => {
        req.body = {};
        
        // Mock the error that would be thrown by Mongoose
        Watchlist.mockImplementation(() => ({
          save: jest.fn().mockRejectedValue(new Error('Watchlist validation failed: name: Path `name` is required.'))
        }));
  
        await createWatchlist(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: "Error creating watchlist",
          details: expect.stringContaining('name')
        });
      });
    });
  
    describe('getUserWatchlists', () => {
      it('should return all user watchlists', async () => {
        const mockWatchlists = [
          { name: 'Watchlist 1', movies: [] },
          { name: 'Watchlist 2', movies: ['movie1', 'movie2'] }
        ];
        Watchlist.find.mockResolvedValue(mockWatchlists);
  
        await getUserWatchlists(req, res);
  
        expect(Watchlist.find).toHaveBeenCalledWith({ userId: 'mock_user_id' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ watchlists: mockWatchlists });
      });
  
      it('should handle empty watchlists', async () => {
        Watchlist.find.mockResolvedValue([]);
  
        await getUserWatchlists(req, res);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ watchlists: [] });
      });
    });
  
    describe('getWatchlistById', () => {
      it('should return watchlist with movie details', async () => {
        req.params.id = 'watchlist_id';
        const mockWatchlist = {
          _id: 'watchlist_id',
          name: 'My Watchlist',
          movies: ['movie1', 'movie2']
        };
        const mockMovieDetails = [
          { Title: 'Movie 1', Year: '2020' },
          { Title: 'Movie 2', Year: '2021' }
        ];
  
        Watchlist.findOne.mockResolvedValue(mockWatchlist);
        fetchMovieDetailsById
          .mockResolvedValueOnce(mockMovieDetails[0])
          .mockResolvedValueOnce(mockMovieDetails[1]);
  
        await getWatchlistById(req, res);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          watchlist: {
            _id: 'watchlist_id',
            name: 'My Watchlist',
            movies: mockMovieDetails
          }
        });
      });
  
      it('should handle non-existent watchlist', async () => {
        req.params.id = 'nonexistent_id';
        Watchlist.findOne.mockResolvedValue(null);
  
        await getWatchlistById(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Watchlist not found" });
      });
    });
  
    describe('addToWatchlist', () => {
      it('should add movie to watchlist successfully', async () => {
        req.body = { watchlistId: 'watchlist_id', movieId: 'movie123' };
        const mockWatchlist = {
          movies: ['existing_movie'],
          save: jest.fn().mockResolvedValue(true)
        };
        Watchlist.findOne.mockResolvedValue(mockWatchlist);
  
        await addToWatchlist(req, res);
  
        expect(mockWatchlist.movies).toContain('movie123');
        expect(mockWatchlist.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
      });
  
      it('should not add duplicate movie to watchlist', async () => {
        req.body = { watchlistId: 'watchlist_id', movieId: 'existing_movie' };
        const mockWatchlist = {
          movies: ['existing_movie'],
          save: jest.fn().mockResolvedValue(true)
        };
        Watchlist.findOne.mockResolvedValue(mockWatchlist);
  
        await addToWatchlist(req, res);
  
        expect(mockWatchlist.movies).toHaveLength(1);
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });
  
    describe('removeFromWatchlist', () => {
      it('should remove movie from watchlist successfully', async () => {
        req.body = { watchlistId: 'watchlist_id', movieId: 'movie123' };
        const mockWatchlist = {
          movies: ['movie123', 'movie456'],
          save: jest.fn().mockResolvedValue(true)
        };
        Watchlist.findOne.mockResolvedValue(mockWatchlist);
  
        await removeFromWatchlist(req, res);
  
        expect(mockWatchlist.movies).not.toContain('movie123');
        expect(mockWatchlist.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
      });
  
      it('should handle non-existent watchlist', async () => {
        req.body = { watchlistId: 'nonexistent_id', movieId: 'movie123' };
        Watchlist.findOne.mockResolvedValue(null);
  
        await removeFromWatchlist(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Watchlist not found" });
      });
    });
  
    describe('deleteWatchlist', () => {
      it('should delete watchlist successfully', async () => {
        req.params.id = 'watchlist_id';
        Watchlist.findOneAndDelete.mockResolvedValue({ _id: 'watchlist_id' });
  
        await deleteWatchlist(req, res);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: "Watchlist deleted successfully"
        });
      });
  
      it('should handle non-existent watchlist deletion', async () => {
        req.params.id = 'nonexistent_id';
        Watchlist.findOneAndDelete.mockResolvedValue(null);
  
        await deleteWatchlist(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Watchlist not found" });
      });
    });
  });