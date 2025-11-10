# Fix Session Persistence on Fly.io

## Problem
Movies disappear from history after browser refresh when deployed on fly.io.

## Root Cause
The backend needs the `FRONTEND_URL` environment variable set on fly.io for:
1. CORS to allow requests from the frontend domain
2. Session cookies to work properly across domains

Without this variable, CORS rejects requests and cookies aren't sent/stored.

## Solution

### Step 1: Set the FRONTEND_URL secret

Run this command to set the frontend URL on your fly.io backend:

```bash
cd backend
fly secrets set FRONTEND_URL="https://watchornot-frontend.fly.dev"
```

Replace `watchornot-frontend.fly.dev` with your actual frontend domain if different.

**Important:** The `NODE_ENV=production` is now set in `fly.toml`, so the next deploy will automatically enable production mode.

### Step 2: Deploy the updated backend

The code has been updated with:
- `NODE_ENV=production` in Dockerfile (for secure cookies)
- `trust proxy: 1` (for rate limiting behind fly.io proxy)
- FRONTEND_URL validation (fails fast if not set)
- Better logging for debugging

Deploy the changes:

```bash
cd backend
fly deploy
```

### Step 3: Verify the deployment

Check the logs to confirm the configuration:

```bash
fly logs
```

You should see:
```
✓ Environment: production
✓ Database storage: /data
✓ Trust proxy: 1 (first proxy only)
✓ CORS allowed origin: https://watchornot-frontend.fly.dev
✓ Session cookies: secure=true, sameSite=none, httpOnly=true
```

### Step 4: Test session persistence

1. Open your frontend: `https://watchornot-frontend.fly.dev`
2. Scan or search for a movie
3. Rate it (thumbs up/down)
4. Refresh the page
5. Movie should still be in History tab ✅

## Technical Details

### What was fixed:

1. **Fly.io configuration** (`backend/fly.toml`):
   - Added `[env]` section with `NODE_ENV = "production"`
   - This ensures production mode is enabled when deployed

2. **Dockerfile** (`backend/Dockerfile`):
   - Added `ENV NODE_ENV=production` as fallback

3. **Server configuration** (`backend/server.js`):
   - Added `trust proxy: 1` for fly.io's reverse proxy
   - Added FRONTEND_URL validation (exits if not set in production)
   - Updated session database path to use `/data` (fly.io persistent volume)
   - Added `sameSite: 'none'` for cross-origin cookies
   - Improved logging for debugging

### How session persistence works:

1. **Database storage**: Sessions and ratings stored in `/data` (persistent volume)
2. **Session cookies**: Sent with `secure=true`, `httpOnly=true`, `sameSite=none`
3. **CORS**: Allows `credentials: true` for the frontend origin
4. **Trust proxy**: Correctly identifies client IPs for rate limiting

### Troubleshooting

If movies still don't persist after refresh:

1. **Check FRONTEND_URL is set**:
   ```bash
   fly secrets list
   ```

2. **Check backend logs for CORS errors**:
   ```bash
   fly logs
   ```
   Look for: `❌ CORS rejected origin: https://...`

3. **Check browser console for errors**:
   - Open browser DevTools (F12)
   - Look for CORS or cookie errors

4. **Verify cookies are being set**:
   - DevTools → Application → Cookies
   - Should see a cookie from `watchornot-backend.fly.dev`
   - Should have `Secure`, `HttpOnly`, `SameSite=None` flags

5. **Check the persistent volume exists**:
   ```bash
   fly volumes list
   ```
   Should show a volume named `data` attached to the backend app

## Environment Variables Needed

Make sure these are set on fly.io:

```bash
# Required
fly secrets set SESSION_SECRET="your-random-secret-key"
fly secrets set TMDB_API_KEY="your-tmdb-api-key"
fly secrets set FRONTEND_URL="https://watchornot-frontend.fly.dev"

# Optional (for additional features)
fly secrets set CLAUDE_API_KEY="your-claude-api-key"
fly secrets set OMDB_API_KEY="your-omdb-api-key"
```

Generate a secure SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
