# iOS Development Setup Guide

Complete guide to setting up your iOS development environment for WatchOrNot.

## Prerequisites

### System Requirements
- **macOS:** 14.0+ (Sonoma or later)
- **Xcode:** 15.0+
- **Command Line Tools:** Latest version
- **Node.js:** 18.0+ (for backend development)
- **Git:** 2.0+

### Apple Account
- **Apple ID:** Required for code signing
- **Apple Developer Program:** $99/year (required for App Store)
- **TestFlight Access:** Included with developer program

## Step 1: Install Xcode

### Via App Store
```bash
# Open App Store
open -a "App Store"

# Search for "Xcode" and install (13+ GB)
```

### Verify Installation
```bash
xcode-select --version
# Output: xcode-select version 2404 or higher

xcodebuild -version
# Output: Xcode 15.2, Build version 15C500b
```

### Install Command Line Tools
```bash
xcode-select --install
```

## Step 2: Clone Repository

```bash
# Clone the monorepo
git clone https://github.com/zgkmail/watchornot-app.git
cd watchornot-app

# Install root dependencies
npm install
```

## Step 3: Setup Backend (Required)

The iOS app requires the backend API to function.

```bash
# Navigate to backend
cd packages/backend

# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
# - CLAUDE_API_KEY (from https://console.anthropic.com)
# - TMDB_API_KEY (from https://www.themoviedb.org/settings/api)
# - OMDB_API_KEY (from http://www.omdbapi.com/apikey.aspx)

# Install dependencies
npm install

# Initialize database
npm run setup

# Start backend server
npm run dev
```

Backend will run at `http://localhost:3000`

## Step 4: Open iOS Project

### Using Xcode
```bash
cd packages/ios
open WatchOrNot.xcodeproj
```

### First-Time Setup in Xcode

1. **Select Development Team**
   - Click on project in navigator
   - Select "WatchOrNot" target
   - Go to "Signing & Capabilities"
   - Select your Apple ID team

2. **Configure Bundle Identifier**
   ```
   com.yourcompany.watchornot
   ```
   (Change "yourcompany" to your identifier)

3. **Select Simulator**
   - Choose "iPhone 15" or newer
   - iOS 17.0+ required

## Step 5: Configure API Endpoint

Edit `packages/ios/WatchOrNot/Core/Config.swift`:

```swift
enum Config {
    static let apiBaseURL: String = {
        #if DEBUG
        return "http://localhost:3000"  // Local backend
        #else
        return "https://your-production-api.com"
        #endif
    }()
}
```

## Step 6: Build and Run

### Via Xcode
1. Select iPhone 15 simulator (or device)
2. Press `⌘R` to build and run

### Via Command Line
```bash
cd packages/ios

# Build
xcodebuild -scheme WatchOrNot -destination 'platform=iOS Simulator,name=iPhone 15'

# Run tests
xcodebuild test -scheme WatchOrNot -destination 'platform=iOS Simulator,name=iPhone 15'
```

## Step 7: Install Development Tools

### SwiftLint (Code Quality)
```bash
brew install swiftlint
```

Create `.swiftlint.yml` in `packages/ios/`:
```yaml
disabled_rules:
  - trailing_whitespace
opt_in_rules:
  - empty_count
  - missing_docs
excluded:
  - Pods
  - build
line_length: 120
```

### SwiftFormat (Code Formatting)
```bash
brew install swiftformat

# Format code
cd packages/ios
swiftformat .
```

## Step 8: Run on Physical Device

### Prerequisites
- iOS device with iOS 17.0+
- Lightning/USB-C cable
- Device registered in Apple Developer portal

### Steps
1. Connect device to Mac
2. Trust the Mac on device (popup)
3. In Xcode, select your device from dropdown
4. Press `⌘R` to build and run

### Troubleshooting
- **"Could not launch" error:** Check device is unlocked
- **Code signing error:** Verify developer team selected
- **"App installation failed":** Delete old app from device

## Step 9: Backend Connection on Device

### Option A: Use Ngrok (Recommended for Testing)
```bash
# Install ngrok
brew install ngrok

# Start ngrok tunnel to backend
ngrok http 3000

# Copy HTTPS URL (e.g., https://abc123.ngrok.io)
# Update Config.swift apiBaseURL for DEBUG mode
```

### Option B: Deploy Backend
See [Backend Deployment Guide](../06-deployment/backend-deployment.md)

## Verification Checklist

- [ ] Xcode installed and working
- [ ] Backend running at `http://localhost:3000`
- [ ] iOS project opens without errors
- [ ] App builds successfully in simulator
- [ ] App can connect to backend API
- [ ] Camera permissions requested properly
- [ ] SwiftLint configured and running

## Common Issues

### Issue: "Command line tools are not installed"
```bash
xcode-select --install
```

### Issue: "No such module 'SwiftUI'"
- Ensure deployment target is iOS 17.0+
- Clean build folder: `⌘⇧K`

### Issue: "Failed to prepare device for development"
- Restart Xcode
- Disconnect and reconnect device
- Update to latest iOS version

### Issue: "Backend connection failed"
```bash
# Check backend is running
curl http://localhost:3000/health

# Check firewall isn't blocking
# Check API base URL in Config.swift
```

## Next Steps

- [iOS Architecture Guide](../02-architecture/ios-frontend.md)
- [Camera Integration](../05-ios-specific/camera-integration.md)
- [API Reference](../04-api-reference/endpoints.md)
- [Contributing Guide](../07-contributing/code-style.md)

## Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui)
- [Xcode Help](https://developer.apple.com/documentation/xcode)

---

**Need Help?**
- Check [GitHub Issues](https://github.com/zgkmail/watchornot-app/issues)
- See [Troubleshooting Guide](./troubleshooting.md)
