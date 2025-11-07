# Social Login Setup Guide

This guide will help you set up Google OAuth for your WatchOrNot application so users can sign in and sync their ratings across devices.

## Features

- **Cross-device sync**: Users can access their movie ratings from any device
- **Automatic account linking**: Anonymous ratings are automatically transferred when a user signs in
- **Secure authentication**: Uses OAuth 2.0 for secure, passwordless authentication
- **User profiles**: Display user name, email, and profile picture

## Prerequisites

- A Google Cloud Platform account (free)
- Your WatchOrNot app running locally or deployed

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "WatchOrNot")
4. Click "Create"

### 2. Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name: "WatchOrNot"
   - Add your email as support email
   - Add app logo (optional)
   - Save and continue
   - Add scopes: `email`, `profile` (should be default)
   - Save and continue
   - Add test users (your email) during development
   - Save and continue

4. Create OAuth Client ID:
   - Application type: "Web application"
   - Name: "WatchOrNot Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - Your production URL (e.g., `https://watchornot.com`)
   - Authorized redirect URIs:
     - `http://localhost:3001/auth/google/callback` (development)
     - Your production backend URL + `/auth/google/callback`
   - Click "Create"

5. Copy your **Client ID** and **Client Secret**

### 4. Configure Environment Variables

1. Open `backend/.env` (create from `.env.example` if needed)
2. Add your OAuth credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

3. For production, update the callback URL to your production domain

### 5. Restart Your Backend

```bash
cd backend
npm start
```

## Testing

1. Open your app at `http://localhost:3000`
2. Go to the "Profile" tab
3. Click "Continue with Google"
4. You should be redirected to Google's sign-in page
5. After signing in, you'll be redirected back to your app
6. Your profile should now show your Google account info

## How It Works

### Anonymous Users
- When users first open the app, they start as anonymous users
- Their ratings are stored locally with a session ID
- They can use the app fully without signing in

### Account Linking
- When an anonymous user signs in with Google:
  1. The backend creates a new authenticated user account
  2. All existing ratings are automatically transferred to the new account
  3. The anonymous session is deleted
  4. User can now access their ratings from any device

### Data Sync
- Authenticated users' data is synced in real-time
- All ratings, preferences, and history are accessible from any device
- Logout doesn't delete data - it's preserved on the server

## Security

- OAuth tokens are handled securely by Passport.js
- User passwords are never stored (Google handles authentication)
- Sessions use secure, HTTP-only cookies
- CORS is configured to only allow requests from your frontend

## Troubleshooting

### "Error: redirect_uri_mismatch"
- Ensure the redirect URI in Google Cloud Console exactly matches your callback URL
- Don't forget the `/auth/google/callback` path
- Check for http vs https
- Check for trailing slashes

### "This app isn't verified"
- During development, click "Advanced" → "Go to [your app] (unsafe)"
- For production, submit your app for Google verification

### "Invalid credentials"
- Double-check your Client ID and Client Secret in `.env`
- Make sure there are no extra spaces or quotes
- Restart your backend server after changing `.env`

## Production Deployment

1. Update `GOOGLE_CALLBACK_URL` to your production domain
2. Add your production URL to authorized origins and redirect URIs in Google Cloud Console
3. Set `NODE_ENV=production` in your environment
4. Enable secure cookies (already configured in code)
5. Consider submitting for Google verification for better UX

## Adding More OAuth Providers

The system is designed to support multiple OAuth providers. To add Facebook, Twitter, or others:

1. Install the appropriate Passport strategy:
   ```bash
   npm install passport-facebook
   ```

2. Add configuration in `backend/config/passport.js`
3. Add routes in `backend/routes/auth.js`
4. Update the frontend Profile tab with additional sign-in buttons

## Support

For issues or questions:
- Check the backend logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure your Google Cloud project has the correct OAuth configuration
- Review the [Passport.js documentation](http://www.passportjs.org/)
