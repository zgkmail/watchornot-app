//
//  SessionManagerTests.swift
//  WatchOrNotTests
//
//  Unit tests for SessionManager
//

import XCTest
@testable import WatchOrNot

@MainActor
final class SessionManagerTests: XCTestCase {
    var sessionManager: SessionManager!

    override func setUp() async throws {
        try await super.setUp()
        // Clear any existing session before each test
        sessionManager = SessionManager.shared
        sessionManager.clearSession()
    }

    override func tearDown() async throws {
        sessionManager.clearSession()
        try await super.tearDown()
    }

    // MARK: - Session Management Tests

    func testSaveAndLoadSessionID() {
        // Given
        let testSessionID = "test-session-123"

        // When
        sessionManager.saveSessionID(testSessionID)

        // Then
        XCTAssertEqual(sessionManager.getSessionID(), testSessionID)
        XCTAssertTrue(sessionManager.isAuthenticated)
    }

    func testSaveAndLoadUserID() {
        // Given
        let testUserID = "user-456"

        // When
        sessionManager.saveUserID(testUserID)

        // Then
        XCTAssertEqual(sessionManager.userID, testUserID)
    }

    func testClearSession() {
        // Given
        sessionManager.saveSessionID("test-session-123")
        sessionManager.saveUserID("user-456")

        // When
        sessionManager.clearSession()

        // Then
        XCTAssertNil(sessionManager.getSessionID())
        XCTAssertNil(sessionManager.userID)
        XCTAssertFalse(sessionManager.isAuthenticated)
    }

    func testSessionPersistence() {
        // Given
        let testSessionID = "persistent-session-789"
        sessionManager.saveSessionID(testSessionID)

        // When - Create new instance to simulate app restart
        let newSessionManager = SessionManager.shared

        // Then - Session should persist
        XCTAssertEqual(newSessionManager.getSessionID(), testSessionID)
        XCTAssertTrue(newSessionManager.isAuthenticated)
    }

    func testMultipleSessionUpdates() {
        // Given
        let firstSessionID = "session-1"
        let secondSessionID = "session-2"

        // When
        sessionManager.saveSessionID(firstSessionID)
        XCTAssertEqual(sessionManager.getSessionID(), firstSessionID)

        sessionManager.saveSessionID(secondSessionID)

        // Then - Should update to new session
        XCTAssertEqual(sessionManager.getSessionID(), secondSessionID)
    }

    func testIsAuthenticatedState() {
        // Initially not authenticated
        XCTAssertFalse(sessionManager.isAuthenticated)

        // After saving session
        sessionManager.saveSessionID("test-session")
        XCTAssertTrue(sessionManager.isAuthenticated)

        // After clearing
        sessionManager.clearSession()
        XCTAssertFalse(sessionManager.isAuthenticated)
    }
}
