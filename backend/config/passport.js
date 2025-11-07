const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { createOrUpdateOAuthUser, findUserByOAuth } = require('../db/database');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
  passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Extract user info from Google profile
    const oauthData = {
      provider: 'google',
      oauthId: profile.id,
      email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
      displayName: profile.displayName,
      profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
    };

    // Create or update user
    const user = createOrUpdateOAuthUser(oauthData);

    // Store anonymous user ID in session for potential linking
    if (req.session && req.session.userId) {
      user.anonymousUserId = req.session.userId;
    }

    return done(null, user);
  } catch (error) {
    console.error('Error in Google OAuth strategy:', error);
    return done(error, null);
  }
}));

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    anonymousUserId: user.anonymousUserId
  });
});

// Deserialize user from session
passport.deserializeUser(async (sessionData, done) => {
  try {
    // Find user by ID
    const db = require('../db/database').db;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(sessionData.id);

    if (!user) {
      return done(null, false);
    }

    // Attach anonymous user ID if present
    if (sessionData.anonymousUserId) {
      user.anonymousUserId = sessionData.anonymousUserId;
    }

    done(null, user);
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error, null);
  }
});

module.exports = passport;
