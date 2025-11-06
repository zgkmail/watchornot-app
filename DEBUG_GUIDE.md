# WatchOrNot Debugging Guide

This guide will help you debug issues in WatchOrNot.

## Enhanced Error Handling

We've added comprehensive logging and debugging features to help identify issues:

### 1. Backend Enhancements

#### Enhanced Logging

The backend logs detailed information for every API request:

**Location:** Backend console output

**What's logged:**
- ✓ Request timestamp and session info
- ✓ Image data size
- ✓ Authentication status
- ✓ API key presence (not the actual key)
- ✓ Base64 format validation
- ✓ API request/response timing
- ✓ Detected text preview
- ✓ Detailed error messages with status codes

### 2. Frontend Enhancements

The frontend provides:
- Detailed console logging for debugging
- Better error messages with actionable suggestions
- Request/response timing
- API error detection

**Location:** Browser developer console (F12)

**What's logged:**
- ✓ Image processing workflow
- ✓ Request URL and timing
- ✓ Response status and structure
- ✓ Detected text
- ✓ Specific error types with troubleshooting hints

### 3. Request Logging Middleware

All API requests are now logged with:
- Timestamp
- HTTP method and path
- Headers (content-type, content-length)
- Body (with smart truncation for images)

## How to Debug Issues

### Step 1: Start the Backend Server

```bash
cd backend
npm install  # If not already installed
node server.js
```

**Watch for:**
- ✅ Server should start without errors
- ✅ Should see "WatchOrNot Backend Server" banner
- ✅ Should show port and CORS configuration
- ❌ If it exits with "FATAL ERROR", check your .env file

### Step 2: Open the Frontend

1. Open `index.html` in your browser
2. Open browser developer tools (F12)
3. Go to the Console tab
4. Try capturing or uploading an image

### Step 3: Analyze the Logs

#### Backend Console Logs

Look for request logs showing:
- Timestamp
- HTTP method and path
- Session ID and User ID
- Request/response status

**Common Issues:**

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `❌ ERROR: No image data provided` | Frontend not sending image | Check browser console for frontend errors |
| `❌ ERROR: User not authenticated` | Session issue | Refresh the page |
| `❌ FATAL: TMDB_API_KEY not found` | Missing .env variable | Add TMDB_API_KEY to .env file |
| `❌ ERROR: Invalid base64 format` | Image encoding issue | Try a different image |

#### Frontend Console Logs

Look for:
- Image processing workflow
- Request URL and timing
- Response status and structure
- Detected text
- Specific error types with troubleshooting hints

**Common Issues:**

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `❌ Cannot connect to backend server` | Backend not running | Start the backend server |
| `❌ API key issue` | API key problem | Check backend .env file |
| `Failed to fetch` | CORS or network issue | Check CORS settings and backend URL |

### Step 5: Common Troubleshooting

#### Issue: "Backend not responding"

```bash
# Check if backend is running
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","message":"WatchOrNot Backend is running"}
```

#### Issue: "No text detected in image"

This might not be an error! The image recognition might genuinely not detect text. Try:
- Using an image with clear, large text
- Better lighting conditions
- A different image format
- Manual search instead

#### Issue: "Rate limit exceeded"

The app has rate limiting (30 requests per 15 minutes). Wait 15 minutes or adjust in `server.js`:

```javascript
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30  // Increase this number
});
```

## Testing the Enhanced Error Handling

### Test 1: Backend Connectivity
```bash
curl http://localhost:3001/health
```

### Test 2: Full Image Processing
1. Open `index.html` in browser
2. Open DevTools Console (F12)
3. Upload a movie poster with text
4. Watch both backend console and browser console for logs

## Log Files Location

All logs appear in:
- **Backend:** Terminal/console where you run `node server.js`
- **Frontend:** Browser Developer Console (F12 → Console tab)

## Getting Help

If you're still stuck after reviewing the logs:

1. Copy the relevant error logs from both backend and frontend
2. Check that all environment variables are set
3. Verify API key has correct permissions
4. Try the test endpoint first

## Quick Checklist

- [ ] Backend server is running
- [ ] `.env` file exists with all required keys
- [ ] Browser can reach `http://localhost:3001/health`
- [ ] Browser console shows no CORS errors
- [ ] TMDB API key is configured in `.env`

## Next Steps

With enhanced logging, you should now be able to:
1. See exactly where the request fails
2. Get detailed error messages with solutions
3. Understand the request/response flow
4. Identify API key, network, or configuration issues

The logs will tell you exactly what's happening at each step of the image recognition process!
