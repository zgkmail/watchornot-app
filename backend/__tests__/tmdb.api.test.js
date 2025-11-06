const request = require('supertest');
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const tmdbRouter = require('../routes/tmdb');
const {
  mockTMDBSearchResponse,
  mockTMDBMovieDetailsResponse,
  createTestMovie
} = require('../testHelpers');

// Mock axios
jest.mock('axios');

// Create Express app for testing
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

  // Mock session middleware
  app.use((req, res, next) => {
    req.session.userId = 'test-user-123';
    next();
  });

  app.use('/api/tmdb', tmdbRouter);
  return app;
}

describe('TMDB API Endpoints', () => {
  let app;

  beforeEach(() => {
    // Set up test environment variables
    process.env.TMDB_API_KEY = 'test-api-key';

    // Create test app
    app = createTestApp();

    // Clear all mock calls
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.TMDB_API_KEY;
  });

  describe('GET /api/tmdb/search', () => {
    test('should search for a movie successfully', async () => {
      const movie = createTestMovie({
        id: '27205',
        title: 'Inception'
      });

      const mockResponse = mockTMDBSearchResponse(movie);
      axios.get.mockResolvedValue({ data: mockResponse });

      const response = await request(app)
        .get('/api/tmdb/search')
        .query({ query: 'Inception' });

      expect(response.status).toBe(200);
      expect(response.body.results).toBeDefined();
      expect(response.body.results[0].title).toBe('Inception');
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/search/multi',
        expect.objectContaining({
          params: {
            api_key: 'test-api-key',
            query: 'Inception'
          }
        })
      );
    });

    test('should return 400 if query parameter is missing', async () => {
      const response = await request(app)
        .get('/api/tmdb/search');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Query parameter is required');
      expect(axios.get).not.toHaveBeenCalled();
    });

    test('should return 500 if TMDB API key is not configured', async () => {
      delete process.env.TMDB_API_KEY;

      const response = await request(app)
        .get('/api/tmdb/search')
        .query({ query: 'Inception' });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('TMDB API key not configured');
      expect(axios.get).not.toHaveBeenCalled();
    });

    test('should handle TMDB API errors', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { status_message: 'Invalid API key' }
        }
      });

      const response = await request(app)
        .get('/api/tmdb/search')
        .query({ query: 'Inception' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid TMDB API key. Please check your API key.');
    });

    test('should handle network errors', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      const response = await request(app)
        .get('/api/tmdb/search')
        .query({ query: 'Inception' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to search TMDB');
    });

    test('should return empty results if no matches found', async () => {
      axios.get.mockResolvedValue({
        data: {
          page: 1,
          results: [],
          total_pages: 0,
          total_results: 0
        }
      });

      const response = await request(app)
        .get('/api/tmdb/search')
        .query({ query: 'NonexistentMovie12345' });

      expect(response.status).toBe(200);
      expect(response.body.results).toEqual([]);
      expect(response.body.total_results).toBe(0);
    });
  });

  describe('GET /api/tmdb/:mediaType/:id', () => {
    test('should get movie details successfully', async () => {
      const movie = createTestMovie({
        id: '27205',
        title: 'Inception',
        director: 'Christopher Nolan',
        cast: 'Leonardo DiCaprio, Tom Hardy, Ellen Page'
      });

      const mockResponse = mockTMDBMovieDetailsResponse(movie);
      axios.get.mockResolvedValue({ data: mockResponse });

      const response = await request(app)
        .get('/api/tmdb/movie/27205');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(27205);
      expect(response.body.title).toBe('Inception');
      expect(response.body.credits).toBeDefined();
      expect(response.body.credits.crew).toBeDefined();
      expect(response.body.credits.cast).toBeDefined();

      expect(axios.get).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/movie/27205',
        expect.objectContaining({
          params: {
            api_key: 'test-api-key',
            append_to_response: 'credits,external_ids'
          }
        })
      );
    });

    test('should get TV show details successfully', async () => {
      const tvShow = createTestMovie({
        id: '1396',
        title: 'Breaking Bad'
      });

      const mockResponse = mockTMDBMovieDetailsResponse(tvShow);
      axios.get.mockResolvedValue({ data: mockResponse });

      const response = await request(app)
        .get('/api/tmdb/tv/1396');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1396);

      expect(axios.get).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/tv/1396',
        expect.objectContaining({
          params: {
            api_key: 'test-api-key',
            append_to_response: 'credits,external_ids'
          }
        })
      );
    });

    test('should return 400 for invalid media type', async () => {
      const response = await request(app)
        .get('/api/tmdb/invalid/123');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid media type. Must be "movie" or "tv"');
      expect(axios.get).not.toHaveBeenCalled();
    });

    test('should return 500 if TMDB API key is not configured', async () => {
      delete process.env.TMDB_API_KEY;

      const response = await request(app)
        .get('/api/tmdb/movie/27205');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('TMDB API key not configured');
      expect(axios.get).not.toHaveBeenCalled();
    });

    test('should handle 404 for non-existent movie', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 404,
          data: { status_message: 'The resource you requested could not be found.' }
        }
      });

      const response = await request(app)
        .get('/api/tmdb/movie/999999999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('The resource you requested could not be found.');
    });

    test('should handle TMDB API authentication errors', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { status_message: 'Invalid API key' }
        }
      });

      const response = await request(app)
        .get('/api/tmdb/movie/27205');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid TMDB API key. Please check your API key.');
    });
  });

  describe('Authentication', () => {
    test('should reject unauthenticated search requests', async () => {
      // Create app without session mock
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use(session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
      }));
      unauthApp.use('/api/tmdb', tmdbRouter);

      const response = await request(unauthApp)
        .get('/api/tmdb/search')
        .query({ query: 'Inception' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Not authenticated');
    });

    test('should reject unauthenticated details requests', async () => {
      // Create app without session mock
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use(session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
      }));
      unauthApp.use('/api/tmdb', tmdbRouter);

      const response = await request(unauthApp)
        .get('/api/tmdb/movie/27205');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Not authenticated');
    });
  });

  describe('Response Format', () => {
    test('should return TMDB response format with credits and external IDs', async () => {
      const movie = createTestMovie({
        id: '550',
        title: 'Fight Club'
      });

      const mockResponse = mockTMDBMovieDetailsResponse(movie);
      axios.get.mockResolvedValue({ data: mockResponse });

      const response = await request(app)
        .get('/api/tmdb/movie/550');

      expect(response.status).toBe(200);

      // Verify expected TMDB response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('overview');
      expect(response.body).toHaveProperty('credits');
      expect(response.body).toHaveProperty('external_ids');

      // Verify credits structure
      expect(response.body.credits).toHaveProperty('cast');
      expect(response.body.credits).toHaveProperty('crew');
      expect(Array.isArray(response.body.credits.cast)).toBe(true);
      expect(Array.isArray(response.body.credits.crew)).toBe(true);

      // Verify external IDs structure
      expect(response.body.external_ids).toHaveProperty('imdb_id');
    });
  });
});
