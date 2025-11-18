# WatchOrNot iOS Tests

This directory contains comprehensive unit tests and UI tests for the WatchOrNot iOS app.

## Test Structure

### Unit Tests (`WatchOrNotTests/`)

#### SessionManagerTests.swift
Tests for session management and Keychain storage:
- Session ID save/load
- User ID persistence
- Session clearing
- Multi-session handling
- Authentication state

#### APIClientTests.swift
Tests for API client functionality:
- Base URL configuration
- Timeout configuration
- Session ID headers
- Error handling
- Image upload preparation

#### ModelDecodingTests.swift
Tests for data model decoding:
- `UserTier` decoding
- `HistoryEntry` decoding (handles both string and int years)
- Timestamp conversion (milliseconds to Date)
- TMDB model decoding (movies and TV shows)
- API response models
- Badge response parsing

#### ViewModelTests.swift
Tests for all ViewModels:
- `MovieSnapViewModel` - Initial state, reset, camera/photo picker
- `HistoryViewModel` - Initial state, history loading
- `ProfileViewModel` - Tier calculation, stats management
- `RecommendationsViewModel` - Pagination state
- `OnboardingViewModel` - Vote tracking

#### ConfigTests.swift
Tests for app configuration:
- API base URLs
- Timeout values
- Image configuration
- Onboarding settings
- Tier thresholds
- Pagination settings

### UI Tests (`WatchOrNotUITests/`)

#### WatchOrNotUITests.swift
End-to-end UI tests for critical flows:
- Welcome screen
- Tab navigation (Snap, History, Profile)
- Camera functionality
- Accessibility
- Launch performance

#### OnboardingUITests.swift
Onboarding-specific UI tests:
- Movie voting flow
- Progress tracking
- Completion flow
- Vote button interactions

## Running Tests

### Using Xcode

1. Open `WatchOrNot.xcodeproj` in Xcode
2. Select the test target (`WatchOrNotTests` or `WatchOrNotUITests`)
3. Press `Cmd + U` to run all tests
4. Or click the diamond icon next to individual test methods

### Using xcodebuild (Command Line)

```bash
# Run all unit tests
xcodebuild test -scheme WatchOrNot -destination 'platform=iOS Simulator,name=iPhone 15,OS=17.0'

# Run specific test class
xcodebuild test -scheme WatchOrNot -only-testing:WatchOrNotTests/SessionManagerTests

# Run UI tests
xcodebuild test -scheme WatchOrNot -only-testing:WatchOrNotUITests
```

## Test Coverage

### Current Coverage Areas

✅ **Session Management** - Keychain storage, persistence
✅ **API Client** - Configuration, error handling
✅ **Data Models** - Decoding, type conversion
✅ **ViewModels** - State management, initialization
✅ **Configuration** - Settings validation
✅ **UI Flows** - Tab navigation, onboarding

### Areas Needing Mock Data

Some tests require mock API responses or network stubbing:
- API endpoint integration tests
- Image upload tests
- Movie search tests
- Rating submission tests

### Recommendations

1. **Add Network Mocking**: Use a library like `URLProtocol` mocking or dependency injection
2. **Increase Coverage**: Add tests for error scenarios
3. **Integration Tests**: Test complete user flows
4. **Performance Tests**: Monitor memory usage and response times

## Continuous Integration

To run tests in CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: |
    xcodebuild test \
      -scheme WatchOrNot \
      -destination 'platform=iOS Simulator,name=iPhone 15,OS=17.0' \
      -enableCodeCoverage YES
```

## Troubleshooting

### Tests Not Running

- Ensure test targets are added to the Xcode project
- Verify app scheme includes test targets
- Check that `@testable import WatchOrNot` is working

### UI Tests Failing

- UI tests require the simulator to be launched
- Ensure accessibility identifiers are set on UI elements
- Add waits for async operations

### Flaky Tests

- Avoid hardcoded sleep() calls
- Use XCTest expectations for async operations
- Mock network calls to avoid external dependencies

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use `setUp()` and `tearDown()` properly
3. **Naming**: Use descriptive test names (`testWhatIsBeingTested`)
4. **Assertions**: Use specific assertions with helpful messages
5. **Coverage**: Aim for >80% code coverage for critical paths

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass before committing
3. Update this README if adding new test files
4. Maintain test coverage above current levels
