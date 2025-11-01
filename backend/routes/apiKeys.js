const express = require('express');
const router = express.Router();
const { encrypt, decrypt } = require('../utils/encryption');
const { storeApiKey, getApiKey, getUserApiKeys, deleteApiKey } = require('../db/database');

/**
 * Store an API key for the current user
 * POST /api/keys
 * Body: { provider: 'tmdb' | 'vision', apiKey: 'key_value' }
 */
router.post('/', (req, res) => {
  try {
    const { provider, apiKey } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Provider and apiKey are required' });
    }

    if (!['tmdb', 'vision'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider. Must be "tmdb" or "vision"' });
    }

    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Encrypt the API key
    const encryptedKey = encrypt(apiKey, process.env.ENCRYPTION_KEY);

    // Store in database
    storeApiKey(req.session.userId, provider, encryptedKey);

    res.json({
      success: true,
      message: `${provider} API key stored successfully`
    });
  } catch (error) {
    console.error('Error storing API key:', error);
    res.status(500).json({ error: 'Failed to store API key' });
  }
});

/**
 * Get all stored API keys for the current user (providers only, not actual keys)
 * GET /api/keys
 */
router.get('/', (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const apiKeys = getUserApiKeys(req.session.userId);

    res.json({
      apiKeys: apiKeys.map(key => ({
        provider: key.provider,
        createdAt: key.created_at,
        updatedAt: key.updated_at
      }))
    });
  } catch (error) {
    console.error('Error getting API keys:', error);
    res.status(500).json({ error: 'Failed to get API keys' });
  }
});

/**
 * Delete an API key
 * DELETE /api/keys/:provider
 */
router.delete('/:provider', (req, res) => {
  try {
    const { provider } = req.params;

    if (!['tmdb', 'vision'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    deleteApiKey(req.session.userId, provider);

    res.json({
      success: true,
      message: `${provider} API key deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

module.exports = router;
