# Local Development Setup Guide

This guide will help you run the WatchOrNot app locally to test the camera viewfinder frame feature on your iPhone.

## 📋 Prerequisites

- Node.js and npm installed
- Your computer and iPhone on the same WiFi network
- Your computer's local IP address (e.g., 10.0.0.101)

## 🚀 Quick Start

### 1. Navigate to Project Directory

```bash
cd /path/to/watchornot-app
```

### 2. Checkout the Feature Branch

```bash
git checkout claude/plan-viewfinder-frame-feature-011CUuicLKzSpoh3JiK918oy
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

You should see:
```
VITE v5.4.21  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: http://YOUR_IP:3000/
```

### 5. Test Locally (Non-Camera Features)

You can test the app on your computer or iPhone for general functionality:
- Navigate to: `http://localhost:3000` (on your computer)
- Or: `http://10.0.0.101:3000` (on your iPhone, same WiFi)

**⚠️ Note:** The camera feature **will not work** in local HTTP development because iOS Safari requires HTTPS for camera access. See "Testing Camera Features" below.

## 📱 Testing Camera Features on iPhone

Since iOS Safari requires HTTPS for camera access, you must test the camera viewfinder frame feature on the **deployed Fly.io app**:

### Option 1: Deploy and Test on Fly.io (Recommended)

1. **Deploy your changes to Fly.io:**
   ```bash
   fly deploy
   ```

2. **Access from your iPhone:**
   - Open Safari on your iPhone
   - Navigate to: `https://watchornot-frontend.fly.dev`
   - Tap **"Open Camera"**
   - Allow camera permissions
   - You should see the viewfinder with the frame guide! 🎉

### Option 2: Test on Desktop (Limited)

You can test the frame overlay visually on your desktop (without actual camera):
- Navigate to: `http://localhost:3000`
- Tap "Open Camera"
- You'll see the camera permission error, but the frame overlay and UI can still be inspected in DevTools

## 🔧 Configuration

### Backend Options

The app is configured to use the **deployed Fly.io backend** by default. This is recommended because:
- ✅ Has HTTPS (required when frontend uses HTTPS)
- ✅ API keys are already configured (TMDB, Claude, OMDB)
- ✅ No mixed content errors
- ✅ No additional setup needed

To change the backend, edit `.env.development`:

```env
# Option 1: Use deployed backend (default - recommended)
VITE_BACKEND_URL=https://watchornot-backend.fly.dev

# Option 2: Use local backend (uncomment below)
# VITE_BACKEND_URL=http://localhost:3001
```

**Important:** If you use a local HTTP backend with HTTPS frontend:
- ⚠️ You'll get mixed content errors
- ⚠️ Camera won't work on iPhone
- ⚠️ You'll need to set up local API keys in backend/.env

## 🧪 Testing the Frame Feature

Once the app is running on your iPhone, test:

### Visual Elements
- [ ] Frame overlay appears (white rectangular box)
- [ ] Corner markers are visible (L-shaped brackets at each corner)
- [ ] Instruction text displays: "Fit the movie title in the frame"
- [ ] Text fades out after 5 seconds

### Functionality
- [ ] "Open Camera" button opens live viewfinder
- [ ] Frame is centered and properly sized
- [ ] Capture button works (white circle)
- [ ] Stop button works (red circle with X)

### Settings
- [ ] Go to Profile tab → Settings
- [ ] Toggle "Camera Frame Guide" off - frame should disappear on next camera open
- [ ] Toggle back on - frame should reappear
- [ ] Setting persists after closing/reopening app

## 🐛 Troubleshooting

### "Camera API not available" Error

**Cause:** iOS Safari requires HTTPS for camera access, but local dev runs on HTTP
**Solution:** Test camera features on the deployed Fly.io app: `https://watchornot-frontend.fly.dev`

### Page Won't Load from iPhone

**Possible causes:**

1. **Firewall blocking port 3000**
   - macOS: System Preferences → Security & Privacy → Firewall → Firewall Options
   - Windows: Windows Defender Firewall → Allow an app through firewall
   - Allow Node.js or port 3000

2. **Wrong IP address**
   - Check your current IP:
     ```bash
     # macOS/Linux
     ifconfig | grep "inet "

     # Windows
     ipconfig
     ```

3. **Different WiFi networks**
   - Ensure both devices are on the same network

## 💻 Test on Desktop First

You can test the app on your computer first using:

```
http://localhost:3000
```

This lets you verify:
- App loads correctly
- UI and styling are correct
- Settings toggle works
- Build has no errors
- Non-camera features work

**Note:** Camera features won't work in desktop browsers or local HTTP. Test camera on Fly.io deployment.

## 📦 Deploy to Fly.io

Once you've tested locally and everything works:

```bash
# Build the app
npm run build

# Deploy to Fly.io (requires fly CLI installed)
fly deploy
```

The deployed app will be available at:
```
https://watchornot-frontend.fly.dev
```

## 💡 Tips

- The frame guide can be disabled in Profile → Settings if users find it intrusive
- The instruction text auto-fades to keep the viewfinder clean
- Settings are saved in localStorage and persist across sessions
- The deployed backend already has all API keys configured

## 🎯 What's New in This Branch

- ✅ Viewfinder frame overlay with corner markers
- ✅ Auto-fading instruction text
- ✅ Settings toggle to enable/disable guide
- ✅ Configurable backend URL via .env
- ✅ "Open Camera" button now activates live viewfinder
- ✅ Local dev uses HTTP (camera testing done on Fly.io deployment)

## 📞 Need Help?

Check the main README.md or create an issue on GitHub.
