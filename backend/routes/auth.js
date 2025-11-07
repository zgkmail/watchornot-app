const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { linkAnonymousToOAuth } = require('../db/database');

// Check if OAuth is configured
const isOAuthConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

/**
 * Initiate Google OAuth flow
 * GET /auth/google
 */
router.get('/google', (req, res, next) => {
  if (!isOAuthConfigured) {
    return res.status(503).json({
      error: 'OAuth not configured',
      message: 'Social login is not configured on this server. Please contact the administrator.'
    });
  }
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

/**
 * Google OAuth callback
 * GET /auth/google/callback
 */
router.get('/google/callback', (req, res, next) => {
  if (!isOAuthConfigured) {
    return res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }

  passport.authenticate('google', {
    failureRedirect: process.env.FRONTEND_URL || 'http://localhost:3000'
  })(req, res, async (err) => {
    if (err) {
      console.error('Error in OAuth callback:', err);
      return res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
    }

    try {
      // Check if we need to link anonymous account
      if (req.user.anonymousUserId && req.user.anonymousUserId !== req.user.id) {
        console.log(`Linking anonymous user ${req.user.anonymousUserId} to OAuth user ${req.user.id}`);
        linkAnonymousToOAuth(req.user.anonymousUserId, req.user.id);
      }

      // Update session with new user ID
      req.session.userId = req.user.id;

      // Remove anonymous user ID from session
      delete req.user.anonymousUserId;

      // Redirect to frontend
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
    } catch (error) {
      console.error('Error in OAuth callback:', error);
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
    }
  });
});

/**
 * Get current user status
 * GET /auth/status
 */
router.get('/status', (req, res) => {
  if (req.user) {
    // Return user info without sensitive data
    res.json({
      authenticated: true,
      oauthConfigured: isOAuthConfigured,
      user: {
        id: req.user.id,
        email: req.user.email,
        displayName: req.user.display_name,
        profilePicture: req.user.profile_picture,
        oauthProvider: req.user.oauth_provider
      }
    });
  } else if (req.session && req.session.userId) {
    // Anonymous user
    res.json({
      authenticated: false,
      oauthConfigured: isOAuthConfigured,
      user: {
        id: req.session.userId,
        anonymous: true
      }
    });
  } else {
    res.json({
      authenticated: false,
      oauthConfigured: isOAuthConfigured,
      user: null
    });
  }
});

/**
 * Logout user
 * POST /auth/logout
 */
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Failed to destroy session' });
      }

      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

module.exports = router;
