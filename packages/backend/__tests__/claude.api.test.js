const request = require('supertest');
const express = require('express');
const session = require('express-session');
const Anthropic = require('@anthropic-ai/sdk');
const claudeRouter = require('../routes/claude');

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk');

// Create Express app for testing
function createTestApp(userId = 'test-user-123') {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Mock session middleware
  app.use((req, res, next) => {
    req.session = {
      id: 'test-session-id',
      userId: userId,
      cookie: {}
    };
    next();
  });

  app.use('/api/claude', claudeRouter);
  return app;
}

describe('Claude API Endpoints', () => {
  let app;
  let originalEnv;
  let mockAnthropicInstance;

  beforeAll(() => {
    originalEnv = process.env.CLAUDE_API_KEY;
    process.env.CLAUDE_API_KEY = 'test-claude-api-key';
  });

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();

    // Mock Anthropic SDK instance
    mockAnthropicInstance = {
      messages: {
        create: jest.fn()
      }
    };

    Anthropic.mockImplementation(() => mockAnthropicInstance);
  });

  afterAll(() => {
    if (originalEnv) {
      process.env.CLAUDE_API_KEY = originalEnv;
    } else {
      delete process.env.CLAUDE_API_KEY;
    }
  });

  describe('GET /api/claude/test', () => {
    test('should return success when API key is configured', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{ text: 'Hello' }]
      });

      const response = await request(app).get('/api/claude/test');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Claude API is configured correctly');
      expect(response.body.details.apiKeyConfigured).toBe(true);
      expect(response.body.details.model).toBe('claude-3-haiku-20240307');
      expect(response.body.details.testResponse).toBe('Hello');

      expect(Anthropic).toHaveBeenCalledWith({
        apiKey: 'test-claude-api-key',
        timeout: 30000
      });

      expect(mockAnthropicInstance.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: 'Say "hello" in one word'
        }]
      });
    });

    test('should return error when API key is not configured', async () => {
      delete process.env.CLAUDE_API_KEY;

      const response = await request(app).get('/api/claude/test');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('CLAUDE_API_KEY not configured');

      process.env.CLAUDE_API_KEY = 'test-claude-api-key';
    });

    test('should return error when API key is placeholder', async () => {
      process.env.CLAUDE_API_KEY = 'your_claude_api_key_here';

      const response = await request(app).get('/api/claude/test');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('CLAUDE_API_KEY not configured');

      process.env.CLAUDE_API_KEY = 'test-claude-api-key';
    });

    test('should handle Claude API errors', async () => {
      mockAnthropicInstance.messages.create.mockRejectedValue(
        new Error('API connection failed')
      );

      const response = await request(app).get('/api/claude/test');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Claude API test failed');
      expect(response.body.debug.message).toBe('API connection failed');
    });
  });

  describe('POST /api/claude/identify', () => {
    const validBase64Image = '/9j/4AAQSkZJRg'; // Valid JPEG base64 start

    test('should identify movie from image', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            title: 'Inception',
            year: 2010,
            media_type: 'movie'
          })
        }]
      });

      const response = await request(app)
        .post('/api/claude/identify')
        .send({ image: validBase64Image });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Inception');
      expect(response.body.year).toBe(2010);
      expect(response.body.media_type).toBe('movie');
      expect(response.body.confidence).toBe(0.9);
      expect(response.body.model).toBe('claude-3-haiku-20240307');
      expect(response.body.processingTime).toBeDefined();
    });

    test('should identify TV show from image', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            title: 'Breaking Bad',
            year: 2008,
            media_type: 'tv'
          })
        }]
      });

      const response = await request(app)
        .post('/api/claude/identify')
        .send({ image: validBase64Image });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Breaking Bad');
      expect(response.body.year).toBe(2008);
      expect(response.body.media_type).toBe('tv');
    });

    test('should handle image with no year', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            title: 'Some Movie',
            year: null,
            media_type: 'movie'
          })
        }]
      });

      const response = await request(app)
        .post('/api/claude/identify')
        .send({ image: validBase64Image });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Some Movie');
      expect(response.body.year).toBeNull();
      expect(response.body.media_type).toBe('movie');
    });

    test('should handle no title found', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            title: null,
            year: null,
            media_type: null
          })
        }]
      });

      const response = await request(app)
        .post('/api/claude/identify')
        .send({ image: validBase64Image });

      expect(response.status).toBe(200);
      expect(response.body.title).toBeNull();
      expect(response.body.confidence).toBe(0);
      expect(response.body.message).toBe('No clear movie or TV show title found in image');
    });

    test('should clean up bonus content phrases', async () => {
      const testCases = [
        { input: 'The Making of Back to the Future', expected: 'Back to the Future' },
        { input: 'Making of Inception', expected: 'Inception' },
        { input: 'Behind the Scenes: The Matrix', expected: 'The Matrix' },
        { input: 'Bonus Features: Fight Club', expected: 'Fight Club' },
        { input: 'Special Edition: Pulp Fiction', expected: 'Pulp Fiction' }
      ];

      for (const testCase of testCases) {
        mockAnthropicInstance.messages.create.mockResolvedValue({
          content: [{
            text: JSON.stringify({
              title: testCase.input,
              year: 2000,
              media_type: 'movie'
            })
          }]
        });

        const response = await request(app)
          .post('/api/claude/identify')
          .send({ image: validBase64Image });

        expect(response.body.title).toBe(testCase.expected);
      }
    });

    test('should require image data', async () => {
      const response = await request(app)
        .post('/api/claude/identify')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Image data is required');
      expect(mockAnthropicInstance.messages.create).not.toHaveBeenCalled();
    });

    test('should sanitize base64 data', async () => {
      const imageWithWhitespace = '/9j/4AAQ\nSkZJ\r\nRg  ';

      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            title: 'Test Movie',
            year: 2020,
            media_type: 'movie'
          })
        }]
      });

      const response = await request(app)
        .post('/api/claude/identify')
        .send({ image: imageWithWhitespace });

      expect(response.status).toBe(200);

      // Verify that whitespace was removed
      const callArgs = mockAnthropicInstance.messages.create.mock.calls[0][0];
      const imageContent = callArgs.messages[0].content.find(c => c.type === 'image');
      expect(imageContent.source.data).not.toContain('\n');
      expect(imageContent.source.data).not.toContain('\r');
      expect(imageContent.source.data).not.toContain(' ');
    });

    test('should validate base64 format', async () => {
      const invalidBase64 = 'not-valid-base64-@#$%';

      const response = await request(app)
        .post('/api/claude/identify')
        .send({ image: invalidBase64 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid base64 image data');
      expect(mockAnthropicInstance.messages.create).not.toHaveBeenCalled();
    });

    test('should require authentication', async () => {
      const appNoAuth = createTestApp(null);
      const response = await request(appNoAuth)
        .post('/api/claude/identify')
        .send({ image: validBase64Image });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Not authenticated');
      expect(mockAnthropicInstance.messages.create).not.toHaveBeenCalled();
    });

    test('should handle missing API key', async () => {
      delete process.env.CLAUDE_API_KEY;

      const response = await request(app)
        .post('/api/claude/identify')
        .send({ image: validBase64Image });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Claude API key not configured on server. Please contact administrator.');

      process.env.CLAUDE_API_KEY = 'test-claude-api-key';
    });

    test('should detect JPEG image type', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            title: 'Test',
            year: 2020,
            media_type: 'movie'
          })
        }]
      });

      await request(app)
        .post('/api/claude/identify')
        .send({ image: '/9j/4AAQSkZJRg' });

      const callArgs = mockAnthropicInstance.messages.create.mock.calls[0][0];
      const imageContent = callArgs.messages[0].content.find(c => c.type === 'image');
      expect(imageContent.source.media_type).toBe('image/jpeg');
    });

    test('should detect PNG image type', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            title: 'Test',
            year: 2020,
            media_type: 'movie'
          })
        }]
      });

      await request(app)
        .post('/api/claude/identify')
        .send({ image: 'iVBORw0KGgo' });

      const callArgs = mockAnthropicInstance.messages.create.mock.calls[0][0];
      const imageContent = callArgs.messages[0].content.find(c => c.type === 'image');
      expect(imageContent.source.media_type).toBe('image/png');
    });

    test('should extract JSON from response with extra text', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: 'Here is the response: {"title": "Test Movie", "year": 2020, "media_type": "movie"} Thanks!'
        }]
      });

      const response = await request(app)
        .post('/api/claude/identify')
        .send({ image: validBase64Image });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test Movie');
    });

    test('should handle invalid JSON response', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: 'This is not JSON at all'
        }]
      });

      const response = await request(app)
        .post('/api/claude/identify')
        .send({ image: validBase64Image });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to parse Claude response');
    });

    test('should handle authentication errors from Claude', async () => {
      const authError = new Error('Authentication failed');
      authError.status = 401;
      mockAnthropicInstance.messages.create.mockRejectedValue(authError);

      const response = await request(app)
        .post('/api/claude/identify')
        .send({ image: validBase64Image });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Claude API authentication failed');
      expect(response.body.debug.status).toBe(401);
    });

    test('should handle rate limiting from Claude', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.status = 429;
      mockAnthropicInstance.messages.create.mockRejectedValue(rateLimitError);

      const response = await request(app)
        .post('/api/claude/identify')
        .send({ image: validBase64Image });

      expect(response.status).toBe(429);
      expect(response.body.error).toBe('Rate limit exceeded');
      expect(response.body.debug.status).toBe(429);
    });

    test('should handle generic Claude API errors', async () => {
      mockAnthropicInstance.messages.create.mockRejectedValue(
        new Error('Something went wrong')
      );

      const response = await request(app)
        .post('/api/claude/identify')
        .send({ image: validBase64Image });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Something went wrong');
    });

    test('should include correct prompt in Claude request', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            title: 'Test',
            year: 2020,
            media_type: 'movie'
          })
        }]
      });

      await request(app)
        .post('/api/claude/identify')
        .send({ image: validBase64Image });

      const callArgs = mockAnthropicInstance.messages.create.mock.calls[0][0];
      expect(callArgs.model).toBe('claude-3-haiku-20240307');
      expect(callArgs.max_tokens).toBe(100);
      expect(callArgs.messages).toHaveLength(1);
      expect(callArgs.messages[0].role).toBe('user');
      expect(callArgs.messages[0].content).toHaveLength(2);
      expect(callArgs.messages[0].content[0].type).toBe('image');
      expect(callArgs.messages[0].content[1].type).toBe('text');
      expect(callArgs.messages[0].content[1].text).toContain('Extract the EXACT main title');
    });
  });
});
