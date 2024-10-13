const request = require('supertest');
const app = require('../../server');
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const movieService = require('../../services/movieService');

// Mock the OpenAI module
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  };
});

const OpenAI = require('openai');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Movie Controller', () => {
  describe('GET /api/movies/search', () => {
    it('should search for movies', async () => {
      const mockMovieData = { Search: [{ Title: 'Inception', Year: '2010' }] };
      jest.spyOn(movieService, 'fetchMovieByTitle').mockResolvedValue(mockMovieData);

      const res = await request(app)
        .get('/api/movies/search')
        .query({ title: 'Inception' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockMovieData);
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .get('/api/movies/search')
        .query({});

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });
  });

  describe('GET /api/movies/movie/:id', () => {
    it('should get movie details by ID', async () => {
      const mockMovieDetails = { Title: 'Inception', Year: '2010', Director: 'Christopher Nolan', Response: "True" };
      jest.spyOn(movieService, 'fetchMovieDetailsById').mockResolvedValue(mockMovieDetails);

      const res = await request(app)
        .get('/api/movies/movie/tt1375666');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockMovieDetails);
    });

    it('should return 404 if movie is not found', async () => {
      jest.spyOn(movieService, 'fetchMovieDetailsById').mockResolvedValue({ Response: "False" });

      const res = await request(app)
        .get('/api/movies/movie/nonexistent');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Movie not found');
    });
  });

  describe('GET /api/movies/suggest', () => {
    it('should suggest movies based on input "Christopher Nolan and Space"', async () => {
      const mockSuggestions = ['1. Interstellar', '2. 2001: A Space Odyssey', '3. Gravity'];
      OpenAI.prototype.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: mockSuggestions.join('\n') } }]
      });

      const res = await request(app)
        .get('/api/movies/suggest')
        .query({ input: 'Christopher Nolan and Space' });

      expect(res.statusCode).toBe(200);
      expect(res.body.suggestion).toContain('Interstellar');
    });

    it('should return 400 if input is missing', async () => {
      const res = await request(app)
        .get('/api/movies/suggest')
        .query({});

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Input is required');
    });
  });

  describe('GET /api/movies/suggestAndFetch', () => {
    it('should suggest and fetch movies based on input "Christopher Nolan and Space"', async () => {
      const mockSuggestions = ['Interstellar', '2001: A Space Odyssey', 'Gravity'];
      OpenAI.prototype.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: mockSuggestions.join('\n') } }]
      });

      const mockMovieData = {
        Response: "True",
        Search: [{ Title: 'Interstellar', Year: '2014', imdbID: 'tt0816692', Type: 'movie' }]
      };
      jest.spyOn(movieService, 'fetchMovieByTitle').mockResolvedValue(mockMovieData);

      const res = await request(app)
        .get('/api/movies/suggestAndFetch')
        .query({ userPrompt: 'Christopher Nolan and Space' });

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].Title).toBe('Interstellar');
    });

    it('should return 400 if userPrompt is missing', async () => {
      const res = await request(app)
        .get('/api/movies/suggestAndFetch')
        .query({});

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('User prompt is required');
    });
  });
});