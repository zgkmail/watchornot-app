# Image Recognition Debugging Guide

This guide will help you debug image recognition issues in CineSense.

## Enhanced Error Handling Added

We've added comprehensive logging and debugging features to help identify image recognition issues:

### 1. Backend Enhancements

#### Vision API Test Endpoint
A new test endpoint to verify your Vision API configuration:

```bash
# Test if Vision API is configured correctly
curl http://localhost:3001/api/vision/test
```

**Expected success response:**
```json
{
  "status": "success",
  "message": "Vision API is configured correctly",
  "details": {
    "apiKeyConfigured": true,
    "apiKeyLength": 39,
    "apiResponding": true,
    "responseStatus": 200
  }
}
```

**Possible error responses:**
- `VISION_API_KEY not configured` - Missing API key in .env file
- `Vision API test failed` with 403 status - Invalid API key or permissions issue
- `Vision API test failed` with other status - Check the debug details

#### Enhanced Logging

The backend now logs detailed information for every Vision API request:

**Location:** Backend console output

**What's logged:**
- ✓ Request timestamp and session info
- ✓ Image data size
- ✓ Authentication status
- ✓ API key presence (not the actual key)
- ✓ Base64 format validation
- ✓ Vision API request/response timing
- ✓ Detected text preview
- ✓ Detailed error messages with status codes

### 2. Frontend Enhancements

The frontend now provides:
- Detailed console logging for debugging
- Better error messages with actionable suggestions
- Request/response timing
- Vision API error detection

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
- ✅ Should see "CineSense Backend Server" banner
- ✅ Should show port and CORS configuration
- ❌ If it exits with "FATAL ERROR", check your .env file

### Step 2: Test Vision API Configuration

While the server is running, test the Vision API:

```bash
# In a new terminal
curl http://localhost:3001/api/vision/test
```

**If this fails:**
- Check that VISION_API_KEY is in `/backend/.env`
- Verify the API key is valid (copy-paste carefully)
- Ensure Vision API is enabled in Google Cloud Console
- Check for any typos in the .env file

### Step 3: Open the Frontend

1. Open `index.html` in your browser
2. Open browser developer tools (F12)
3. Go to the Console tab
4. Try capturing or uploading an image

### Step 4: Analyze the Logs

#### Backend Console Logs

Look for these sections:

```
========== VISION API REQUEST ==========
Timestamp: 2025-11-02T...
Session ID: ...
User ID: ...
✓ Image data received, length: XXXXX characters
✓ User authenticated
✓ API key configured (length: 39 characters)
✓ Image format validated (base64)
📤 Sending request to Google Vision API...
```

**Common Issues:**

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `❌ ERROR: No image data provided` | Frontend not sending image | Check browser console for frontend errors |
| `❌ ERROR: User not authenticated` | Session issue | Refresh the page |
| `❌ FATAL: VISION_API_KEY not found` | Missing .env variable | Add VISION_API_KEY to .env file |
| `❌ ERROR: Invalid base64 format` | Image encoding issue | Try a different image |
| `⚠️ API KEY ISSUE: Check if your Vision API key is valid` | Invalid or expired API key | Regenerate API key in Google Cloud Console |
| `❌ No response received from Vision API` | Network/firewall issue | Check internet connection, firewall |

#### Frontend Console Logs

Look for these sections:

```
========== FRONTEND IMAGE PROCESSING ==========
Timestamp: ...
✓ Image data received
Data URL length: XXXXX
✓ Base64 extracted, length: XXXXX characters
📤 Sending request to backend...
📥 Response received in XXX ms
✅ Vision API response received
📝 Detected text preview: ...
```

**Common Issues:**

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `❌ Cannot connect to backend server` | Backend not running | Start the backend server |
| `❌ API key issue` | Vision API key problem | Check backend .env file |
| `❌ API authentication failed` | 403 error from Google | Enable Vision API in Google Cloud Console |
| `Failed to fetch` | CORS or network issue | Check CORS settings and backend URL |

### Step 5: Common Troubleshooting

#### Issue: "Backend not responding"

```bash
# Check if backend is running
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","message":"CineSense Backend is running"}
```

#### Issue: "Vision API authentication failed"

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Cloud Vision API for your project
3. Create or verify your API key
4. Update `VISION_API_KEY` in `.env`
5. Restart the backend server

#### Issue: "No text detected in image"

This might not be an error! The Vision API might genuinely not detect text. Try:
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

### Test 2: Vision API Configuration
```bash
curl http://localhost:3001/api/vision/test
```

### Test 3: Full Image Processing
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
- [ ] `/api/vision/test` endpoint returns success
- [ ] Browser can reach `http://localhost:3001/health`
- [ ] Browser console shows no CORS errors
- [ ] Vision API is enabled in Google Cloud Console
- [ ] API key has Vision API permissions

## Next Steps

With enhanced logging, you should now be able to:
1. See exactly where the request fails
2. Get detailed error messages with solutions
3. Understand the request/response flow
4. Identify API key, network, or configuration issues

The logs will tell you exactly what's happening at each step of the image recognition process!
