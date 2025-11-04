const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

/**
 * Test endpoint to verify Claude API configuration
 * GET /api/claude/test
 */
router.get('/test', async (req, res) => {
  console.log('\n========== CLAUDE API TEST ==========');

  try {
    const apiKey = process.env.CLAUDE_API_KEY;

    if (!apiKey || apiKey === 'your_claude_api_key_here') {
      return res.status(500).json({
        status: 'error',
        message: 'CLAUDE_API_KEY not configured',
        debug: 'Set your Anthropic API key in backend/.env file'
      });
    }

    console.log('✓ API key found (length:', apiKey.length, ')');

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    console.log('📤 Testing Claude API connection...');

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: 'Say "hello" in one word'
      }]
    });

    console.log('✅ Claude API test successful');
    console.log('Response:', message.content[0].text);
    console.log('========================================\n');

    return res.json({
      status: 'success',
      message: 'Claude API is configured correctly',
      details: {
        apiKeyConfigured: true,
        model: 'claude-3-haiku-20240307',
        testResponse: message.content[0].text
      }
    });
  } catch (error) {
    console.error('❌ Claude API test failed');
    console.error('Error:', error.message);

    return res.status(500).json({
      status: 'error',
      message: 'Claude API test failed',
      debug: {
        message: error.message,
        type: error.constructor.name
      }
    });
  }
});

/**
 * Identify movie/TV show from image using Claude Vision
 * POST /api/claude/identify
 * Body: { image: 'base64_encoded_image' }
 */
router.post('/identify', async (req, res) => {
  const startTime = Date.now();
  console.log('\n========== CLAUDE VISION REQUEST ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Session ID:', req.session.id);
  console.log('User ID:', req.session.userId);

  try {
    const { image } = req.body;

    // Validate image data
    if (!image) {
      console.error('❌ ERROR: No image data provided in request body');
      return res.status(400).json({
        error: 'Image data is required',
        debug: 'Request body is missing "image" field'
      });
    }

    console.log('✓ Image data received, length:', image.length, 'characters');

    // Sanitize base64 data - remove whitespace, newlines, and other invalid characters
    const sanitizedImage = image.replace(/\s/g, '');
    console.log('✓ Base64 data sanitized, length:', sanitizedImage.length, 'characters');

    // Check authentication
    if (!req.session.userId) {
      console.error('❌ ERROR: User not authenticated');
      return res.status(401).json({
        error: 'Not authenticated',
        debug: 'Session does not contain userId'
      });
    }

    console.log('✓ User authenticated');

    // Check API key
    const apiKey = process.env.CLAUDE_API_KEY;

    if (!apiKey || apiKey === 'your_claude_api_key_here') {
      console.error('❌ FATAL: CLAUDE_API_KEY not configured');
      return res.status(500).json({
        error: 'Claude API key not configured on server. Please contact administrator.',
        debug: 'CLAUDE_API_KEY environment variable is not set'
      });
    }

    console.log('✓ API key configured (length:', apiKey.length, 'characters)');

    // Detect image type from base64 data
    const detectImageType = (base64Data) => {
      const signatures = {
        '/9j/': 'image/jpeg',
        'iVBORw0KGgo': 'image/png',
        'R0lGODlh': 'image/gif',
        'UklGR': 'image/webp'
      };

      for (const [signature, mimeType] of Object.entries(signatures)) {
        if (base64Data.startsWith(signature)) {
          return mimeType;
        }
      }

      // Default to jpeg if can't detect
      return 'image/jpeg';
    };

    const mediaType = detectImageType(sanitizedImage);
    console.log('✓ Detected image type:', mediaType);

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    console.log('📤 Sending request to Claude API...');
    console.log('Model: claude-3-haiku-20240307');

    // Create the message with vision - request JSON format
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: sanitizedImage,
            },
          },
          {
            type: 'text',
            text: `Look at this screenshot from a streaming service. Extract the EXACT title and year (if visible) of the movie or TV show being displayed.

Rules:
1. Ignore all UI elements (buttons, menus, subtitles, logos)
2. Ignore actor names, episode numbers, season info, descriptions
3. If you see multiple titles, return the main/prominent one
4. Keep the exact capitalization as shown

You MUST respond with ONLY a JSON object in this exact format:
{
  "title": "Movie Title Here",
  "year": 2015
}

If no year is visible, use null for year:
{
  "title": "Movie Title Here",
  "year": null
}

If no clear title is visible, respond with:
{
  "title": null,
  "year": null
}

Do not include any other text, explanations, or formatting - only the JSON object.`
          }
        ]
      }]
    });

    const duration = Date.now() - startTime;
    console.log('✅ Claude API responded successfully');
    console.log('Response time:', duration, 'ms');

    const responseText = message.content[0].text.trim();
    console.log('📝 Claude raw response:', responseText);

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError.message);
      console.error('Raw response:', responseText);
      return res.status(500).json({
        error: 'Failed to parse Claude response',
        debug: {
          message: 'Claude did not return valid JSON',
          rawResponse: responseText
        }
      });
    }

    const title = parsedResponse.title;
    const year = parsedResponse.year;

    console.log('📝 Parsed JSON - Title:', title, 'Year:', year);

    // Check if Claude found a title
    if (!title) {
      console.log('⚠️  No title detected in image');
      return res.json({
        title: null,
        year: null,
        confidence: 0,
        message: 'No clear movie or TV show title found in image'
      });
    }

    console.log('========================================\n');

    res.json({
      title: title,
      year: year,
      confidence: 0.9, // Claude is generally very accurate
      model: 'claude-3-haiku-20240307',
      processingTime: duration
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('\n❌❌❌ CLAUDE API ERROR ❌❌❌');
    console.error('Duration:', duration, 'ms');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);

    if (error.status === 401) {
      return res.status(500).json({
        error: 'Claude API authentication failed',
        debug: {
          message: 'API key may be invalid',
          status: 401
        }
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        debug: {
          message: 'Too many requests to Claude API',
          status: 429
        }
      });
    }

    return res.status(500).json({
      error: 'Failed to process image with Claude',
      debug: {
        message: error.message,
        type: error.constructor.name
      }
    });
  }
});

module.exports = router;
