# WatchOrNot iOS App

> 🚀 **Status: Active Development**
> Native iOS app built with SwiftUI targeting iOS 17.0+

## Overview

Native iOS application providing the full WatchOrNot experience:
- 📸 Snap movie posters with camera integration
- 🎯 Personalized recommendations based on taste profile
- 🏆 Progress tracking with tier system
- 🎨 Beautiful SwiftUI interface with dark mode

## Tech Stack

- **UI Framework:** SwiftUI
- **iOS Target:** iOS 17.0+
- **Language:** Swift 5.9+
- **Architecture:** MVVM (Model-View-ViewModel)
- **Networking:** URLSession + async/await
- **Persistence:** SwiftData / Core Data
- **Camera:** AVFoundation
- **Testing:** XCTest + ViewInspector
- **Dependency Management:** Swift Package Manager

## Project Structure

```
WatchOrNot/
├── App/
│   ├── WatchOrNotApp.swift              # App entry point
│   └── AppDelegate.swift                # App lifecycle
│
├── Core/                                 # Core infrastructure
│   ├── Networking/
│   │   ├── APIClient.swift              # HTTP client wrapper
│   │   ├── APIEndpoint.swift            # Endpoint definitions
│   │   ├── NetworkError.swift           # Error handling
│   │   └── RequestBuilder.swift         # Request construction
│   ├── Persistence/
│   │   ├── PersistenceController.swift  # Core Data controller
│   │   └── WatchOrNot.xcdatamodeld      # Data model
│   ├── Session/
│   │   └── SessionManager.swift         # Session & auth
│   └── Extensions/
│       ├── View+Extensions.swift        # SwiftUI helpers
│       └── Color+Theme.swift            # Color extensions
│
├── Features/                             # Feature modules
│   ├── MovieSnap/                       # Camera & image analysis
│   │   ├── Views/
│   │   │   ├── CameraView.swift
│   │   │   └── MovieDetailsView.swift
│   │   ├── ViewModels/
│   │   │   └── MovieSnapViewModel.swift
│   │   └── Models/
│   │       └── MovieDetails.swift
│   ├── Onboarding/                      # 5-movie voting flow
│   │   ├── Views/
│   │   │   ├── OnboardingView.swift
│   │   │   └── MovieCardView.swift
│   │   ├── ViewModels/
│   │   │   └── OnboardingViewModel.swift
│   │   └── Models/
│   │       └── OnboardingMovie.swift
│   ├── Recommendations/                  # Movie recommendations
│   │   ├── Views/
│   │   │   ├── RecommendationsView.swift
│   │   │   └── MovieListItemView.swift
│   │   ├── ViewModels/
│   │   │   └── RecommendationsViewModel.swift
│   │   └── Models/
│   │       ├── RecommendedMovie.swift
│   │       └── Badge.swift
│   └── Profile/                          # User profile & history
│       ├── Views/
│       │   ├── ProfileView.swift
│       │   ├── HistoryView.swift
│       │   └── SettingsView.swift
│       ├── ViewModels/
│       │   ├── ProfileViewModel.swift
│       │   └── HistoryViewModel.swift
│       └── Models/
│           └── UserStats.swift
│
├── Shared/                               # Reusable components
│   ├── Components/
│   │   ├── Buttons/
│   │   │   ├── PrimaryButton.swift
│   │   │   └── VoteButton.swift
│   │   ├── Cards/
│   │   │   └── MovieCard.swift
│   │   └── LoadingView.swift
│   └── Theme/
│       ├── Colors.swift                 # Color palette
│       └── Typography.swift             # Text styles
│
└── Resources/
    ├── Assets.xcassets                  # Images, icons
    ├── Info.plist                       # App config
    └── Localizable.strings              # Translations

WatchOrNotTests/                         # Unit tests
├── Networking/
│   └── APIClientTests.swift
├── ViewModels/
│   └── OnboardingViewModelTests.swift
└── Mocks/
    └── MockAPIClient.swift

WatchOrNotUITests/                       # UI tests
├── OnboardingUITests.swift
└── MovieSnapUITests.swift
```

## Getting Started

### Prerequisites

1. **macOS:** 14.0+ (Sonoma)
2. **Xcode:** 15.0+
3. **Apple ID:** For code signing
4. **iOS Device/Simulator:** iOS 17.0+

### Initial Setup

```bash
# 1. Navigate to iOS package
cd packages/ios

# 2. Generate Xcode project (when ready)
# This will be done via Xcode or xcodegen

# 3. Open in Xcode
open WatchOrNot.xcodeproj

# 4. Configure signing
# Xcode → Signing & Capabilities → Team
```

### Development Workflow

```bash
# Run on simulator
⌘R in Xcode

# Run tests
⌘U in Xcode

# Or via command line
xcodebuild test -scheme WatchOrNot -destination 'platform=iOS Simulator,name=iPhone 15'
```

## Architecture

### MVVM Pattern

```swift
// Model (from packages/shared)
struct Movie: Codable {
    let id: String
    let title: String
    let year: Int
}

// ViewModel (business logic)
@MainActor
class MovieSnapViewModel: ObservableObject {
    @Published var movie: Movie?
    @Published var isLoading = false
    @Published var error: Error?

    private let apiClient: APIClient

    func analyzeImage(_ image: UIImage) async {
        // Network call, error handling
    }
}

// View (SwiftUI)
struct MovieDetailsView: View {
    @StateObject var viewModel: MovieSnapViewModel

    var body: some View {
        if let movie = viewModel.movie {
            // Display movie
        }
    }
}
```

### Networking Layer

```swift
// APIClient handles all HTTP requests
let client = APIClient(baseURL: "https://api.watchornot.app")

// Type-safe endpoints
let response = try await client.request(
    .getRecommendations(page: 1),
    expecting: RecommendationsResponse.self
)
```

### Session Management

```swift
// Keychain-backed session storage
let session = SessionManager.shared
session.saveSessionID("abc123")
```

## Features Implementation Status

### Phase 1: Core Infrastructure ⏳
- [ ] Networking layer (URLSession wrapper)
- [ ] Session management (Keychain)
- [ ] Persistence (SwiftData/CoreData)
- [ ] Basic navigation structure

### Phase 2: Camera & Snap 📸
- [ ] Camera permission handling
- [ ] Camera capture UI (AVFoundation)
- [ ] Image upload to backend
- [ ] Movie details display
- [ ] Error handling

### Phase 3: Onboarding 🎬
- [ ] 10-movie carousel
- [ ] Vote buttons (👍/👎/⏭)
- [ ] Progress indicator
- [ ] Completion animation
- [ ] Vote persistence

### Phase 4: Recommendations 🎯
- [ ] Movie list with infinite scroll
- [ ] Badge system
- [ ] Filtering/sorting
- [ ] Pull-to-refresh
- [ ] Empty states

### Phase 5: Profile & History 👤
- [ ] User stats display
- [ ] Tier progression
- [ ] History list
- [ ] Swipe-to-delete
- [ ] Settings screen

### Phase 6: Polish ✨
- [ ] Dark mode
- [ ] Haptic feedback
- [ ] Animations
- [ ] Error recovery
- [ ] Accessibility

## Code Generation

### Swift Models from TypeScript

```bash
# Generate Swift models from shared contracts
cd ../..
npm run codegen:swift

# Output: packages/ios/WatchOrNot/Models/Generated/
# - Movie.swift
# - RecommendedMovie.swift
# - UserStats.swift
# - etc.
```

**Example Generated Code:**
```swift
// Auto-generated from packages/shared/api-contracts.ts
struct Movie: Codable, Identifiable {
    let id: String
    let title: String
    let year: Int
    let genres: [String]
    let directors: [String]
    let cast: [String]
    let poster: String?
    let plot: String?
    let imdbRating: Double?
    let runtime: String?
    let imdbId: String?
}
```

## Testing

### Unit Tests
```swift
class OnboardingViewModelTests: XCTestCase {
    func testVoteUpdatesState() async {
        let mockClient = MockAPIClient()
        let viewModel = OnboardingViewModel(apiClient: mockClient)

        await viewModel.vote(.up, for: "movie123")

        XCTAssertEqual(mockClient.lastVote, .up)
        XCTAssertEqual(viewModel.voteCount, 1)
    }
}
```

### UI Tests
```swift
class OnboardingUITests: XCTestCase {
    func testOnboardingFlow() {
        let app = XCUIApplication()
        app.launch()

        // Vote on 5 movies
        for _ in 0..<5 {
            app.buttons["thumbsUp"].tap()
        }

        // Should see completion screen
        XCTAssertTrue(app.staticTexts["Onboarding Complete"].exists)
    }
}
```

## Backend Integration

### API Base URL

Configure in `Config.swift`:
```swift
enum Config {
    static let apiBaseURL: String = {
        #if DEBUG
        return "http://localhost:3000"
        #else
        return "https://api.watchornot.app"
        #endif
    }()
}
```

### Session Handling

The iOS app shares the same session-based auth as web:
- Session ID stored in Keychain
- Sent via `Cookie` header or `x-session-id`
- Backend tracks votes, preferences per session

## Deployment

### TestFlight (Beta)

```bash
# Archive for TestFlight
xcodebuild archive \
  -scheme WatchOrNot \
  -archivePath build/WatchOrNot.xcarchive

# Upload to App Store Connect
xcodebuild -exportArchive \
  -archivePath build/WatchOrNot.xcarchive \
  -exportPath build/ \
  -exportOptionsPlist ExportOptions.plist
```

### App Store

See [iOS Deployment Guide](../../docs/06-deployment/ios-deployment.md)

## Resources

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [WatchOrNot API Reference](../../docs/04-api-reference/)

## Questions?

See the [main README](../../README.md) or [iOS Development Guide](../../docs/05-ios-specific/).
