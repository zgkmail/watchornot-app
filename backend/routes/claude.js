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

    // Validate base64 format
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    if (!base64Regex.test(sanitizedImage)) {
      console.error('❌ ERROR: Invalid base64 format detected');
      console.error('First 100 chars:', sanitizedImage.substring(0, 100));
      return res.status(400).json({
        error: 'Invalid base64 image data',
        debug: 'Image data contains invalid characters for base64'
      });
    }
    console.log('✓ Base64 format validated');

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
    console.log('Base64 data preview (first 50 chars):', sanitizedImage.substring(0, 50));

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
            text: `Look at this screenshot. Extract the EXACT main title of the movie or TV show being displayed.

CRITICAL RULES:
1. Extract ONLY the main movie/show title - ignore ALL descriptive text
2. Ignore phrases like "The Making of...", "Behind the Scenes", "Bonus Features", "Special Edition"
3. If you see "The Making of Back to the Future", return "Back to the Future" (not the making-of text)
4. Preserve ALL spaces in the title exactly as shown
5. "Red Dragon" = TWO words, "Back to the Future" = FOUR words
6. Ignore UI elements (buttons, menus, subtitles, progress bars)
7. Ignore actor names, episode numbers, season info, plot descriptions
8. Return the MAIN title only, typically the largest/most prominent text
9. Keep exact capitalization and spacing as shown

Respond with ONLY valid JSON - nothing else:
{
  "title": "Exact Movie Title",
  "year": 2005
}

If no year visible, use null:
{
  "title": "Movie Title",
  "year": null
}

If no clear title:
{
  "title": null,
  "year": null
}

Return ONLY the JSON object with no additional text, explanations, markdown, or code blocks.`
          }
        ]
      }]
    });

    const duration = Date.now() - startTime;
    console.log('✅ Claude API responded successfully');
    console.log('Response time:', duration, 'ms');

    const responseText = message.content[0].text.trim();
    console.log('📝 Claude raw response:', responseText);

    // Parse JSON response - extract JSON from response that might have extra text
    let parsedResponse;
    try {
      // Try to parse directly first
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      // If direct parse fails, try to extract JSON from the response
      console.log('⚠️  Direct JSON parse failed, attempting to extract JSON...');

      // Look for JSON object in the response (between { and })
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
          console.log('✓ Successfully extracted JSON from response');
        } catch (extractError) {
          console.error('❌ Failed to parse extracted JSON:', extractError.message);
          console.error('Extracted text:', jsonMatch[0]);
          console.error('Raw response:', responseText);
          return res.status(500).json({
            error: 'Failed to parse Claude response',
            debug: {
              message: 'Claude did not return valid JSON',
              rawResponse: responseText,
              extractedJson: jsonMatch[0]
            }
          });
        }
      } else {
        console.error('❌ No JSON object found in response');
        console.error('Raw response:', responseText);
        return res.status(500).json({
          error: 'Failed to parse Claude response',
          debug: {
            message: 'No JSON object found in Claude response',
            rawResponse: responseText
          }
        });
      }
    }

    let title = parsedResponse.title;
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

    // Post-process: Clean up common bonus content phrases that Claude might have included
    const bonusPhrases = [
      /^The Making of\s+/i,
      /^Making of\s+/i,
      /^Behind the Scenes:\s*/i,
      /^Behind the Scenes of\s+/i,
      /^Bonus Features:\s*/i,
      /^Special Edition:\s*/i,
      /^Extended Edition:\s*/i,
      /^Director's Cut:\s*/i,
      /:\s*The Making of$/i,
      /:\s*Behind the Scenes$/i,
      /\s*-\s*The Making of$/i,
      /\s*-\s*Behind the Scenes$/i
    ];

    const originalTitle = title;
    for (const phrase of bonusPhrases) {
      title = title.replace(phrase, '').trim();
    }

    if (originalTitle !== title) {
      console.log('🧹 Cleaned title from:', originalTitle);
      console.log('                 to:', title);
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
    console.error('Error status:', error.status);
    console.error('Full error:', JSON.stringify(error, null, 2));

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

    // Return the actual error message from Claude API
    return res.status(500).json({
      error: error.message || 'Failed to process image with Claude',
      debug: {
        message: error.message,
        type: error.constructor.name,
        status: error.status
      }
    });
  }
});

module.exports = router;
