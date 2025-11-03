const express = require('express');
const router = express.Router();
const axios = require('axios');

const VISION_BASE_URL = 'https://vision.googleapis.com/v1/images:annotate';

/**
 * Test endpoint to verify Vision API configuration
 * GET /api/vision/test
 */
router.get('/test', async (req, res) => {
  console.log('\n========== VISION API TEST ==========');

  try {
    const apiKey = process.env.VISION_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        status: 'error',
        message: 'VISION_API_KEY not configured',
        debug: 'Environment variable VISION_API_KEY is missing'
      });
    }

    console.log('✓ API key found (length:', apiKey.length, ')');

    // Test with a simple base64 encoded 1x1 red pixel PNG
    const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    const visionRequest = {
      requests: [
        {
          image: {
            content: testImage
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1
            }
          ]
        }
      ]
    };

    console.log('📤 Testing Vision API connection...');

    const response = await axios.post(
      `${VISION_BASE_URL}?key=${apiKey}`,
      visionRequest,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Vision API test successful');
    console.log('Response status:', response.status);
    console.log('========================================\n');

    return res.json({
      status: 'success',
      message: 'Vision API is configured correctly',
      details: {
        apiKeyConfigured: true,
        apiKeyLength: apiKey.length,
        apiResponding: true,
        responseStatus: response.status
      }
    });
  } catch (error) {
    console.error('❌ Vision API test failed');
    console.error('Error:', error.message);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));

      return res.status(500).json({
        status: 'error',
        message: 'Vision API test failed',
        debug: {
          status: error.response.status,
          message: error.response.data?.error?.message || error.message,
          details: error.response.data
        }
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Vision API test failed',
      debug: {
        message: error.message,
        type: error.constructor.name
      }
    });
  }
});

/**
 * Proxy endpoint for Google Vision API requests
 * POST /api/vision/detect
 * Body: { image: 'base64_encoded_image' }
 */
router.post('/detect', async (req, res) => {
  const startTime = Date.now();
  console.log('\n========== VISION API REQUEST ==========');
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

    // Check authentication
    if (!req.session.userId) {
      console.error('❌ ERROR: User not authenticated');
      console.log('Session:', req.session);
      return res.status(401).json({
        error: 'Not authenticated',
        debug: 'Session does not contain userId'
      });
    }

    console.log('✓ User authenticated');

    // Check API key
    const apiKey = process.env.VISION_API_KEY;

    if (!apiKey) {
      console.error('❌ FATAL: VISION_API_KEY not found in environment variables');
      return res.status(500).json({
        error: 'Google Vision API key not configured on server. Please contact administrator.',
        debug: 'VISION_API_KEY environment variable is not set'
      });
    }

    console.log('✓ API key configured (length:', apiKey.length, 'characters)');

    // Validate base64 image format
    const base64Pattern = /^[A-Za-z0-9+/=]+$/;
    if (!base64Pattern.test(image)) {
      console.error('❌ ERROR: Invalid base64 format');
      return res.status(400).json({
        error: 'Invalid image format',
        debug: 'Image data is not valid base64'
      });
    }

    console.log('✓ Image format validated (base64)');

    // Prepare Vision API request
    const visionRequest = {
      requests: [
        {
          image: {
            content: image
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 10
            }
          ]
        }
      ]
    };

    console.log('📤 Sending request to Google Vision API...');
    console.log('API URL:', VISION_BASE_URL);
    console.log('Request payload size:', JSON.stringify(visionRequest).length, 'bytes');

    // Make request to Google Vision API
    const response = await axios.post(
      `${VISION_BASE_URL}?key=${apiKey}`,
      visionRequest,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const duration = Date.now() - startTime;
    console.log('✅ Vision API responded successfully');
    console.log('Response status:', response.status);
    console.log('Response time:', duration, 'ms');

    // Log detected text for debugging
    const detectedText = response.data.responses?.[0]?.textAnnotations?.[0]?.description;
    if (detectedText) {
      console.log('📝 Detected text preview:', detectedText.substring(0, 100) + (detectedText.length > 100 ? '...' : ''));
      console.log('Total annotations:', response.data.responses?.[0]?.textAnnotations?.length || 0);
    } else {
      console.log('⚠️  No text detected in image');
    }

    console.log('========================================\n');

    res.json(response.data);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('\n❌❌❌ VISION API ERROR ❌❌❌');
    console.error('Duration:', duration, 'ms');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);

    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response status:', error.response.status);
      console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));

      if (error.response.status === 400) {
        return res.status(400).json({
          error: 'Invalid Vision API request',
          debug: {
            message: error.response.data?.error?.message || 'Bad request',
            status: error.response.status,
            details: error.response.data
          }
        });
      }

      if (error.response.status === 403) {
        console.error('⚠️  API KEY ISSUE: Check if your Vision API key is valid and has permissions');
        return res.status(500).json({
          error: 'Vision API authentication failed',
          debug: {
            message: 'API key may be invalid or lacks permissions',
            status: 403,
            details: error.response.data
          }
        });
      }

      return res.status(error.response.status).json({
        error: error.response.data?.error?.message || 'Vision API error',
        debug: {
          status: error.response.status,
          details: error.response.data
        }
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('❌ No response received from Vision API');
      console.error('Request details:', error.request);
      return res.status(503).json({
        error: 'Could not reach Vision API',
        debug: {
          message: 'Network error - no response received',
          error: error.message
        }
      });
    } else {
      // Something happened in setting up the request
      console.error('❌ Error setting up request:', error.message);
      console.error('Stack trace:', error.stack);
      return res.status(500).json({
        error: 'Failed to process image',
        debug: {
          message: error.message,
          type: error.constructor.name
        }
      });
    }
  }
});

module.exports = router;
