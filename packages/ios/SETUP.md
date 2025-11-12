# WatchOrNot iOS App - Setup Guide

## Overview

The iOS app is fully implemented with SwiftUI and ready for development. All Swift source files have been created following the MVVM architecture pattern.

## Project Structure

```
packages/ios/
├── WatchOrNot/
│   ├── App/                      # App entry point
│   │   ├── WatchOrNotApp.swift
│   │   └── ContentView.swift
│   ├── Core/                     # Core infrastructure
│   │   ├── Networking/
│   │   │   ├── APIClient.swift
│   │   │   ├── APIEndpoint.swift
│   │   │   └── NetworkError.swift
│   │   ├── Session/
│   │   │   └── SessionManager.swift
│   │   ├── Extensions/
│   │   │   └── View+Extensions.swift
│   │   └── Config.swift
│   ├── Models/                   # Data models
│   │   ├── Movie.swift
│   │   ├── ClaudeModels.swift
│   │   ├── OnboardingModels.swift
│   │   ├── RecommendationModels.swift
│   │   └── UserModels.swift
│   ├── Features/                 # Feature modules
│   │   ├── Onboarding/
│   │   ├── Recommendations/
│   │   ├── MovieSnap/
│   │   └── Profile/
│   ├── Shared/                   # Reusable components
│   │   ├── Components/
│   │   └── Theme/
│   └── Resources/
│       ├── Info.plist
│       └── Assets.xcassets/
├── WatchOrNotTests/             # Unit tests (to be added)
└── WatchOrNotUITests/           # UI tests (to be added)
```

## Next Steps to Open in Xcode

Since all Swift files are created, you need to create an Xcode project to build and run the app.

### Option 1: Create Xcode Project Manually (Recommended for Quick Start)

1. **Open Xcode** (version 15.0 or later)

2. **Create New Project:**
   - File → New → Project
   - Select "iOS" → "App"
   - Click "Next"

3. **Configure Project:**
   - Product Name: `WatchOrNot`
   - Team: Select your Apple Developer team
   - Organization Identifier: `com.watchornot` (or your own)
   - Bundle Identifier: `com.watchornot.WatchOrNot`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Storage: None (we'll use our own models)
   - Click "Next"

4. **Save Location:**
   - Navigate to: `/home/user/watchornot-app/packages/ios/`
   - **IMPORTANT:** Uncheck "Create Git repository"
   - Click "Create"

5. **Add Source Files:**
   - In Xcode, **delete** the default `ContentView.swift` and `WatchOrNotApp.swift` that Xcode created
   - Right-click on the project in the navigator → "Add Files to WatchOrNot"
   - Select the `WatchOrNot` folder (the one containing App, Core, Features, etc.)
   - **Check** "Copy items if needed"
   - **Check** "Create groups"
   - **Select** WatchOrNot target
   - Click "Add"

6. **Configure Project Settings:**
   - Select the project in the navigator
   - Select the "WatchOrNot" target
   - **General Tab:**
     - Minimum Deployments: iOS 17.0
     - Device: iPhone
   - **Signing & Capabilities Tab:**
     - Enable "Automatically manage signing"
     - Select your Team
   - **Info Tab:**
     - Ensure camera and photo library permissions are set (check Info.plist)

7. **Update Info.plist Reference:**
   - Select target → Build Settings
   - Search for "Info.plist"
   - Set path to: `WatchOrNot/Resources/Info.plist`

8. **Build and Run:**
   - Select a simulator (iPhone 15 recommended)
   - Press ⌘R to build and run

### Option 2: Use Swift Package Manager (Advanced)

If you prefer a more modern approach, you can use Swift Package Manager, but this requires additional configuration.

## Backend Configuration

Before running the app, ensure the backend is running:

```bash
# In the project root
cd packages/backend
npm install
npm run dev
```

The backend will run on `http://localhost:3000` by default.

### For Device Testing

If testing on a physical device, you'll need to make the backend accessible:

1. **Option A: Use ngrok (Recommended for testing)**
   ```bash
   ngrok http 3000
   ```

   Update `Config.swift`:
   ```swift
   #if DEBUG
   return "https://your-ngrok-url.ngrok.io"
   #else
   ```

2. **Option B: Use your Mac's IP address**
   ```bash
   ifconfig | grep "inet "
   ```

   Update `Config.swift`:
   ```swift
   #if DEBUG
   return "http://YOUR_MAC_IP:3000"
   #else
   ```

## Required API Keys

The backend needs these environment variables in `packages/backend/.env`:

```env
CLAUDE_API_KEY=your_key_here
TMDB_API_KEY=your_key_here
OMDB_API_KEY=your_key_here
SESSION_SECRET=your_random_string_here
```

## Features Implemented

✅ **Core Infrastructure**
- Networking layer with URLSession
- Session management with Keychain
- All data models matching TypeScript contracts
- Theme and styling system

✅ **Onboarding Flow**
- 10-movie voting carousel
- Progress tracking
- Vote submission
- Completion screen

✅ **Recommendations**
- Infinite scroll list
- Badge system
- Movie cards with posters
- Pull-to-refresh

✅ **MovieSnap**
- Camera integration
- Image capture
- Claude Vision API integration
- Movie details display

✅ **Profile**
- User statistics
- Tier progression
- Vote history
- Swipe-to-delete

## Testing

Once the Xcode project is set up, you can run tests:

```bash
# Via npm
npm run test

# Via xcodebuild
xcodebuild test -scheme WatchOrNot -destination 'platform=iOS Simulator,name=iPhone 15'

# Via Xcode
⌘U
```

## Troubleshooting

### "Cannot find type X in scope"
- Make sure all files are added to the Xcode target
- Check that files are in the correct groups
- Clean build folder (⌘⇧K) and rebuild

### Camera not working in simulator
- Camera features require a physical device
- For testing, use the photo library permission

### Network errors
- Check backend is running on port 3000
- Verify Config.swift has correct URL
- Check Info.plist has NSAppTransportSecurity exceptions if using HTTP

### Build errors
- Ensure iOS deployment target is 17.0+
- Verify Swift version is 5.9+
- Check that all dependencies are resolved

## Next Development Steps

1. **Create Unit Tests** in `WatchOrNotTests/`
2. **Create UI Tests** in `WatchOrNotUITests/`
3. **Add proper app icon** to Assets.xcassets
4. **Implement settings screen** for logout, etc.
5. **Add animations and polish**
6. **Set up CI/CD** with GitHub Actions (already configured in `.github/workflows/ios-ci.yml`)

## Resources

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WatchOrNot Backend API](../backend/README.md)
- [API Contracts](../shared/api-contracts.ts)

## Questions?

Check the main [project documentation](../../README.md) or refer to the backend API documentation in `packages/backend/`.
