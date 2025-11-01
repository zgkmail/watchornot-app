const express = require('express');
const router = express.Router();
const axios = require('axios');
const { decrypt } = require('../utils/encryption');
const { getApiKey } = require('../db/database');

const VISION_BASE_URL = 'https://vision.googleapis.com/v1/images:annotate';

/**
 * Proxy endpoint for Google Vision API requests
 * POST /api/vision/detect
 * Body: { image: 'base64_encoded_image' }
 */
router.post('/detect', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get encrypted API key from database
    const encryptedKey = getApiKey(req.session.userId, 'vision');

    if (!encryptedKey) {
      return res.status(404).json({ error: 'Google Vision API key not found. Please set your API key first.' });
    }

    // Decrypt the API key
    const apiKey = decrypt(encryptedKey, process.env.ENCRYPTION_KEY);

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

    // Make request to Google Vision API
    const response = await axios.post(
      `${VISION_BASE_URL}?key=${apiKey}`,
      visionRequest,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Vision API error:', error.response?.data || error.message);

    if (error.response?.status === 400) {
      return res.status(400).json({
        error: 'Invalid Vision API request. Please check your API key and image data.'
      });
    }

    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 'Failed to process image with Vision API'
    });
  }
});

module.exports = router;
