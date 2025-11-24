// Mock axios and cache modules BEFORE importing routes
jest.mock('axios');
jest.mock('../utils/cache');
jest.mock('../utils/persistentCache');

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const omdbRouter = require('../routes/omdb');

// Create Express app for testing
function createTestApp(userId = 'test-user-123') {
  const app = express();
  app.use(express.json());

  // Mock session middleware
  app.use((req, res, next) => {
    req.session = {
      id: 'test-session-id',
      userId: userId,
      cookie: {}
    };
    next();
  });

  app.use('/api/omdb', omdbRouter);
  return app;
}

describe('OMDB API Endpoints', () => {
  let app;
  let originalEnv;

  beforeAll(() => {
    originalEnv = process.env.OMDB_API_KEY;
    process.env.OMDB_API_KEY = 'test-omdb-api-key';
  });

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (originalEnv) {
      process.env.OMDB_API_KEY = originalEnv;
    } else {
      delete process.env.OMDB_API_KEY;
    }
  });

  describe('GET /api/omdb/test', () => {
    test('should return success when API key is configured', async () => {
      const mockResponse = {
        Title: 'Inception',
        imdbRating: '8.8',
        Ratings: [
          { Source: 'Internet Movie Database', Value: '8.8/10' },
          { Source: 'Rotten Tomatoes', Value: '87%' },
          { Source: 'Metacritic', Value: '74/100' }
        ]
      };

      axios.get.mockResolvedValue({ status: 200, data: mockResponse });

      const response = await request(app).get('/api/omdb/test');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('OMDb API is configured correctly');
      expect(response.body.details.apiKeyConfigured).toBe(true);
      expect(response.body.details.testMovie).toBe('Inception');
      expect(response.body.details.imdbRating).toBe('8.8');
    });

    test('should return error when API key is not configured', async () => {
      delete process.env.OMDB_API_KEY;

      const response = await request(app).get('/api/omdb/test');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('OMDB_API_KEY not configured');

      process.env.OMDB_API_KEY = 'test-omdb-api-key';
    });

    test('should return error when API key is placeholder', async () => {
      process.env.OMDB_API_KEY = 'your_omdb_api_key_here';

      const response = await request(app).get('/api/omdb/test');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('OMDB_API_KEY not configured');

      process.env.OMDB_API_KEY = 'test-omdb-api-key';
    });

    test('should handle OMDB API errors', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { Error: 'Invalid API key' }
        }
      });

      const response = await request(app).get('/api/omdb/test');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('OMDb API test failed');
    });

    test('should handle network errors', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      const response = await request(app).get('/api/omdb/test');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.debug.message).toBe('Network error');
    });
  });

  describe('GET /api/omdb/ratings/:imdbId', () => {
    test('should fetch ratings for a valid IMDb ID', async () => {
      const mockResponse = {
        Response: 'True',
        Title: 'Inception',
        Year: '2010',
        Director: 'Christopher Nolan',
        Actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page',
        imdbRating: '8.8',
        imdbVotes: '2,500,000',
        Ratings: [
          { Source: 'Internet Movie Database', Value: '8.8/10' },
          { Source: 'Rotten Tomatoes', Value: '87%' },
          { Source: 'Metacritic', Value: '74/100' }
        ]
      };

      axios.get.mockResolvedValue({ data: mockResponse });

      const response = await request(app).get('/api/omdb/ratings/tt1375666');

      expect(response.status).toBe(200);
      expect(response.body.found).toBe(true);
      expect(response.body.title).toBe('Inception');
      expect(response.body.year).toBe('2010');
      expect(response.body.director).toBe('Christopher Nolan');
      expect(response.body.ratings.imdb.rating).toBe(8.8);
      expect(response.body.ratings.rottenTomatoes).toBe(87);
      expect(response.body.ratings.metacritic).toBe(74);
      expect(response.body.responseTime).toBeDefined();

      expect(axios.get).toHaveBeenCalledWith(
        'https://www.omdbapi.com',
        expect.objectContaining({
          params: {
            apikey: 'test-omdb-api-key',
            i: 'tt1375666'
          }
        })
      );
    });

    test('should handle movie not found', async () => {
      axios.get.mockResolvedValue({
        data: {
          Response: 'False',
          Error: 'Movie not found!'
        }
      });

      const response = await request(app).get('/api/omdb/ratings/tt9999999');

      expect(response.status).toBe(200);
      expect(response.body.found).toBe(false);
      expect(response.body.error).toBe('Movie not found!');
    });

    test('should validate IMDb ID format', async () => {
      const invalidIds = [
        'invalid',
        'tt123',         // too short (3 digits)
        'tt123456789',   // too long (9 digits)
        '1375666',       // missing tt prefix
        'TT1375666'      // uppercase
      ];

      for (const invalidId of invalidIds) {
        const response = await request(app).get(`/api/omdb/ratings/${invalidId}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid IMDb ID format');
      }

      expect(axios.get).not.toHaveBeenCalled();
    });

    test('should require authentication', async () => {
      const appNoAuth = createTestApp(null);
      const response = await request(appNoAuth).get('/api/omdb/ratings/tt1375666');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Not authenticated');
      expect(axios.get).not.toHaveBeenCalled();
    });

    test('should handle missing API key', async () => {
      delete process.env.OMDB_API_KEY;

      const response = await request(app).get('/api/omdb/ratings/tt1375666');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('OMDb API key not configured on server. Please contact administrator.');

      process.env.OMDB_API_KEY = 'test-omdb-api-key';
    });

    test('should parse ratings with N/A values', async () => {
      const mockResponse = {
        Response: 'True',
        Title: 'Some Movie',
        Year: '2020',
        Director: 'N/A',
        Actors: 'N/A',
        imdbRating: 'N/A',
        imdbVotes: 'N/A',
        Ratings: []
      };

      axios.get.mockResolvedValue({ data: mockResponse });

      const response = await request(app).get('/api/omdb/ratings/tt1234567');

      expect(response.status).toBe(200);
      expect(response.body.found).toBe(true);
      expect(response.body.director).toBeNull();
      expect(response.body.actors).toBeNull();
      expect(response.body.ratings.imdb.rating).toBeNull();
      expect(response.body.ratings.imdb.votes).toBeNull();
      expect(response.body.ratings.rottenTomatoes).toBeNull();
      expect(response.body.ratings.metacritic).toBeNull();
    });

    test('should handle rate limiting', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 429,
          data: {}
        }
      });

      const response = await request(app).get('/api/omdb/ratings/tt1375666');

      expect(response.status).toBe(429);
      expect(response.body.error).toBe('Rate limit exceeded');
    });

    test('should handle daily limit reached', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 401,
          data: {
            Error: 'Daily limit reached'
          }
        }
      });

      const response = await request(app).get('/api/omdb/ratings/tt1375666');

      expect(response.status).toBe(429);
      expect(response.body.error).toBe('Daily limit reached');
      expect(response.body.debug.type).toBe('daily_limit');
    });

    test('should handle network errors', async () => {
      axios.get.mockRejectedValue({
        request: {},
        message: 'Network error'
      });

      const response = await request(app).get('/api/omdb/ratings/tt1375666');

      expect(response.status).toBe(503);
      expect(response.body.error).toBe('Could not reach OMDb API');
    });

    test('should handle request setup errors', async () => {
      axios.get.mockRejectedValue(new Error('Request setup failed'));

      const response = await request(app).get('/api/omdb/ratings/tt1375666');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch ratings');
    });

    test('should parse different Rotten Tomatoes formats', async () => {
      const mockResponse = {
        Response: 'True',
        Title: 'Test Movie',
        Year: '2020',
        Director: 'Test Director',
        Actors: 'Test Actor',
        imdbRating: '7.5',
        imdbVotes: '100,000',
        Ratings: [
          { Source: 'Rotten Tomatoes', Value: '92%' }
        ]
      };

      axios.get.mockResolvedValue({ data: mockResponse });

      const response = await request(app).get('/api/omdb/ratings/tt1234567');

      expect(response.status).toBe(200);
      expect(response.body.ratings.rottenTomatoes).toBe(92);
    });

    test('should parse different Metacritic formats', async () => {
      const mockResponse = {
        Response: 'True',
        Title: 'Test Movie',
        Year: '2020',
        Director: 'Test Director',
        Actors: 'Test Actor',
        imdbRating: '7.5',
        imdbVotes: '100,000',
        Ratings: [
          { Source: 'Metacritic', Value: '85/100' }
        ]
      };

      axios.get.mockResolvedValue({ data: mockResponse });

      const response = await request(app).get('/api/omdb/ratings/tt1234567');

      expect(response.status).toBe(200);
      expect(response.body.ratings.metacritic).toBe(85);
    });
  });
});
