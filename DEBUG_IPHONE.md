# Debugging Session Issues on iPhone/Safari

## What We Know

Backend logs show that on iPhone:
```
X-Session-ID header: missing
Cookie header: MISSING
```

This means the frontend session management is not working on iPhone Safari. The enhanced debugging will help us figure out why.

## Step 1: Deploy the Updated Frontend

The latest code includes enhanced debugging specifically for Safari/iPhone:

```bash
fly deploy
```

## Step 2: Enable Safari Web Inspector on iPhone

To see console logs on your iPhone, you need to enable Safari debugging:

### On iPhone:
1. Open **Settings**
2. Scroll down to **Safari**
3. Scroll to the bottom and tap **Advanced**
4. Enable **Web Inspector**

### On Mac:
1. Open **Safari** (not Chrome!)
2. Go to Safari menu → **Settings** (or **Preferences**)
3. Go to **Advanced** tab
4. Check **Show Develop menu in menu bar**

## Step 3: Connect iPhone to Mac and Debug

1. **Connect your iPhone to your Mac** with a USB cable
2. **On iPhone**: Open Safari and go to `https://watchornot-frontend.fly.dev`
3. **On Mac**: Open Safari
4. In Safari menu bar, click **Develop** → **[Your iPhone Name]** → **watchornot-frontend.fly.dev**
5. This opens Web Inspector showing your iPhone's console

## Step 4: Check the Console Logs

After deploying the updated frontend, look for these logs when you open the app:

### ✅ Good Signs:
```
[Session] Browser detection: {isSafari: true, isIOS: true, localStorageAvailable: true}
[Session] ✅ Session management initialized
[Session] 📌 No existing session - will create on first API call
```

Then when you rate a movie:
```
[Session] ✅ Stored session ID: YkA3V3cOMpFAqe2Q...
```

Then when you refresh:
```
[Session] Retrieved session ID: YkA3V3cOMpFAqe2Q...
[Session] ✅ Added X-Session-ID to request: .../api/ratings
```

### ❌ Bad Signs to Look For:

**If you see:**
```
[Session] localStorage not available
⚠️ Session persistence disabled...
```
**Problem**: Safari Private Browsing mode is on
**Solution**: Turn off Private Browsing

**If you see:**
```
[Session] ⚠️ No session ID available for request
```
**Problem**: Session ID was not stored from previous response
**Solution**: Check if you see "✅ Stored session ID" log earlier

**If you see:**
```
[Session] ⚠️ Response does not contain _sessionId
```
**Problem**: Backend is not sending _sessionId in response
**Solution**: Backend needs to be redeployed

**If you see:**
```
[Session] ❌ Failed to store session ID from response
```
**Problem**: localStorage save failed
**Solution**: Check Safari settings

## Step 5: Check Safari Settings

If localStorage is not available, check these iPhone settings:

### Settings → Safari:
1. **Prevent Cross-Site Tracking**: Try **disabling** this
2. **Block All Cookies**: Must be **disabled**
3. **Private Browsing**: Must be **off** (no dark Safari icon)

### Test localStorage manually:
In Safari Web Inspector Console, type:
```javascript
localStorage.setItem('test', 'hello')
localStorage.getItem('test')
```

Should return `"hello"`. If you get an error, localStorage is blocked.

## Step 6: Alternative - Use Chrome on iPhone

If Safari continues to have issues, try Chrome on iPhone:

1. Install **Chrome** from App Store
2. Open `https://watchornot-frontend.fly.dev` in Chrome
3. Chrome on iOS uses the same rendering engine as Safari but may have different privacy settings

## Step 7: Share Logs

Once you can see the console in Safari Web Inspector, please share:

1. **First page load logs** (everything that starts with `[Session]`)
2. **After rating a movie** (check for "Stored session ID")
3. **After refresh** (check for "Added X-Session-ID")

This will help diagnose the exact issue.

## Common iOS/Safari Issues

### Issue 1: Private Browsing Mode
- **Symptom**: Alert popup says "Session persistence disabled"
- **Solution**: Tap Safari toolbar icon (looks like two squares), tap Private button to turn it off

### Issue 2: "Prevent Cross-Site Tracking"
- **Symptom**: localStorage works but session ID not being sent
- **Solution**: Settings → Safari → Disable "Prevent Cross-Site Tracking"
- **Note**: This shouldn't affect custom headers, but worth trying

### Issue 3: Intelligent Tracking Prevention (ITP)
- **Symptom**: Works in Chrome but not Safari
- **Solution**: Safari's ITP is very aggressive. Our X-Session-ID header approach should bypass it, but ITP might be interfering with fetch()

### Issue 4: Service Worker Interference
- **Symptom**: Fetch interception not working
- **Solution**: Clear Safari cache (Settings → Safari → Clear History and Website Data)

## Expected Backend Logs (After Fix)

When it works correctly, backend logs should show:

```
[Session] GET /api/ratings
  Session ID: YkA3V3cOMpFAqe2Qnsk9xvcr8wZ4urQd
  Cookie header: MISSING
  X-Session-ID header: present  ← This is the key!
  User ID: d974d843-4c8e-478e-b010-d5d970d0da35
[Auth] User d974d843-4c8e-478e-b010-d5d970d0da35 authenticated for session YkA3...
```

Note: `X-Session-ID header: present` means it's working!

## Next Steps

1. Deploy updated frontend: `fly deploy`
2. Set up Safari Web Inspector (steps above)
3. Open app on iPhone and check console logs
4. Share the console logs (especially any warnings or errors)
5. Share backend logs from `fly logs` when accessing from iPhone

With the enhanced debugging, we'll be able to pinpoint exactly where the session flow is failing on iPhone.
