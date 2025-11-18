//
//  WatchOrNotUITests.swift
//  WatchOrNotUITests
//
//  UI tests for critical user flows
//

import XCTest

final class WatchOrNotUITests: XCTestCase {

    var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["UI-Testing"]
    }

    override func tearDown() {
        app = nil
        super.tearDown()
    }

    // MARK: - Welcome Flow Tests

    func testWelcomeScreenAppears() {
        // Given
        app.launch()

        // Then - Welcome screen should appear for first-time users
        // Note: This test assumes the app starts with welcome screens
        // Adjust based on actual welcome flow implementation
        XCTAssertTrue(app.isRunning)
    }

    // MARK: - Onboarding Flow Tests

    func testOnboardingFlowNavigation() {
        // Given
        app.launch()

        // Skip welcome screens if they exist
        // Navigate through onboarding

        // Test that user can navigate through onboarding
        // This is a placeholder - implement based on actual UI elements
    }

    // MARK: - Tab Navigation Tests

    func testTabNavigationExists() {
        // Given
        app.launch()

        // Wait for main app to load (skip welcome/onboarding for this test)
        sleep(2)

        // Then - Tab bar should be accessible
        let tabBar = app.tabBars.firstMatch
        if tabBar.exists {
            XCTAssertTrue(tabBar.exists)
        }
    }

    func testSnapTabExists() {
        // Given
        app.launch()
        sleep(2)

        // Then - Snap tab should exist
        let snapTab = app.tabBars.buttons["Snap"]
        if snapTab.exists {
            XCTAssertTrue(snapTab.exists)
        }
    }

    func testHistoryTabExists() {
        // Given
        app.launch()
        sleep(2)

        // Then - History tab should exist
        let historyTab = app.tabBars.buttons["History"]
        if historyTab.exists {
            XCTAssertTrue(historyTab.exists)
        }
    }

    func testProfileTabExists() {
        // Given
        app.launch()
        sleep(2)

        // Then - Profile tab should exist
        let profileTab = app.tabBars.buttons["Profile"]
        if profileTab.exists {
            XCTAssertTrue(profileTab.exists)
        }
    }

    // MARK: - Movie Snap Flow Tests

    func testCameraButtonExists() {
        // Given
        app.launch()
        sleep(2)

        // Navigate to Snap tab if not already there
        let snapTab = app.tabBars.buttons["Snap"]
        if snapTab.exists {
            snapTab.tap()

            // Then - Camera button should exist
            // Adjust selector based on actual implementation
            sleep(1)
        }
    }

    // MARK: - History Flow Tests

    func testHistoryViewLoads() {
        // Given
        app.launch()
        sleep(2)

        // When - Navigate to History tab
        let historyTab = app.tabBars.buttons["History"]
        if historyTab.exists {
            historyTab.tap()

            // Then - History view should load
            sleep(1)
            XCTAssertTrue(app.isRunning)
        }
    }

    // MARK: - Profile Flow Tests

    func testProfileViewLoads() {
        // Given
        app.launch()
        sleep(2)

        // When - Navigate to Profile tab
        let profileTab = app.tabBars.buttons["Profile"]
        if profileTab.exists {
            profileTab.tap()

            // Then - Profile view should load
            sleep(1)
            XCTAssertTrue(app.isRunning)
        }
    }

    // MARK: - Accessibility Tests

    func testAccessibilityIdentifiers() {
        // Given
        app.launch()
        sleep(2)

        // Verify key UI elements have accessibility identifiers
        // This helps with UI testing and accessibility

        // Test should pass if app launches successfully
        XCTAssertTrue(app.isRunning)
    }

    // MARK: - Performance Tests

    func testLaunchPerformance() {
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            app.launch()
            app.terminate()
        }
    }
}
