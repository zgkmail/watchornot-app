# Deploy Session Persistence Fix

## Summary

This fix implements a workaround for third-party cookie blocking that prevents session persistence between the frontend and backend on different domains.

## Root Cause

Modern browsers (Safari, Chrome) block third-party cookies even with `sameSite=none` and `secure=true` when the frontend (`watchornot-frontend.fly.dev`) and backend (`watchornot-backend.fly.dev`) are on different domains.

This caused:
- New session created on every request
- Movies disappearing from history after refresh
- Cookies never sent back to server (logs showed `Cookie header: MISSING`)

## The Fix

Implemented a dual-approach session management system:

### Backend Changes
- Sends session ID in response body (`_sessionId` field)
- Accepts session ID from `X-Session-ID` custom header
- Still supports regular cookies as fallback

### Frontend Changes
- Automatic fetch() interception (no code changes needed)
- Stores session ID in localStorage
- Adds `X-Session-ID` header to all API requests
- Session persists across browser refreshes

## Deployment Steps

### 1. Deploy Backend

```bash
cd backend
fly deploy
```

Watch the logs to verify deployment:
```bash
fly logs
```

You should see:
```
✓ Environment: production
✓ Production mode: FRONTEND_URL = https://watchornot-frontend.fly.dev
✓ CORS allowed origin: https://watchornot-frontend.fly.dev
✓ Session cookies: secure=true, sameSite=none, httpOnly=true
```

### 2. Deploy Frontend

```bash
cd ..  # Back to root directory
fly deploy
```

### 3. Test Session Persistence

1. Open your frontend: `https://watchornot-frontend.fly.dev`
2. Open browser console (F12) - you should see:
   ```
   [Session] Session management initialized
   ```
3. Scan or search for a movie
4. Rate it (thumbs up/down)
5. Watch console - you should see:
   ```
   [Session] Stored session ID: jBnBdrZmWylQGf3A...
   ```
6. **Refresh the page** 🔄
7. Watch console - you should see:
   ```
   [Session] Added X-Session-ID to request: .../api/ratings
   ```
8. Movie should **still be in History** ✅

### 4. Verify in Backend Logs

Check the backend logs:
```bash
cd backend
fly logs
```

You should see logs like:
```
[Session] GET /api/ratings
  Session ID: jBnBdrZmWylQGf3AljavxxHKNa8C1e84
  Cookie header: MISSING
  X-Session-ID header: present
  User ID: c1714338-c4fe-410c-94b5-08cdf12e5bbe
[Auth] User c1714338-c4fe-410c-94b5-08cdf12e5bbe authenticated for session jBnBdrZmWylQGf3A...
```

Key indicators of success:
- ✅ Same Session ID across requests
- ✅ Same User ID across requests
- ✅ `X-Session-ID header: present` (even if Cookie header is MISSING)

## Troubleshooting

### Movies still not persisting

1. **Clear browser localStorage**:
   - Open Console (F12)
   - Run: `localStorage.clear()`
   - Refresh page

2. **Check browser console for errors**:
   - Should see `[Session] Session management initialized`
   - Should see `[Session] Stored session ID:` when making requests
   - Should see `[Session] Added X-Session-ID to request:` on subsequent requests

3. **Check backend logs**:
   ```bash
   fly logs
   ```
   - Look for `X-Session-ID header: present`
   - Verify same User ID across requests

4. **Verify session ID is being stored**:
   - Console: `localStorage.getItem('watchornot_session_id')`
   - Should return a session ID string

### Backend not receiving X-Session-ID header

Check if the frontend deployed correctly:
```bash
fly apps list
```

Redeploy frontend:
```bash
fly deploy
```

### Different User IDs on each request

This means the session isn't being found. Check:
1. Session ID format is correct (not undefined or null)
2. Backend logs show `X-Session-ID header: present`
3. Database is using persistent storage (`/data`)

## Technical Details

### How It Works

1. **First API Request**:
   - Frontend: `fetch('/api/ratings')`
   - Backend: Creates session, returns `{..., _sessionId: "xyz123"}`
   - Frontend: Stores "xyz123" in localStorage

2. **Subsequent Requests**:
   - Frontend: Adds header `X-Session-ID: xyz123`
   - Backend: Reconstructs cookie header: `connect.sid=xyz123`
   - Express-session: Finds existing session
   - Same user ID retrieved

3. **After Browser Refresh**:
   - localStorage still has session ID
   - Frontend automatically adds `X-Session-ID` header
   - Session persists

### Why This Works

- **localStorage persists** across browser refreshes
- **Custom headers work** even when cookies are blocked
- **Express-session compatibility** - we reconstruct the cookie format
- **Zero frontend changes** - fetch() interception is transparent

### Files Changed

Backend:
- `backend/server.js` - Session ID handling middleware
- `backend/fly.toml` - NODE_ENV=production
- `backend/Dockerfile` - NODE_ENV=production

Frontend:
- `src/utils/session.js` - Session management utility (NEW)
- `src/main.jsx` - Initialize session management

## Alternative Solution (Future)

For a more robust solution, consider:
1. Using same domain for frontend/backend (e.g., apex domain with path routing)
2. Deploying behind a reverse proxy (nginx) that handles both
3. Using Fly.io's edge routing to serve both under same domain

This would allow regular cookies to work without any workarounds.
