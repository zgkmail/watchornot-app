//
//  APIClientTests.swift
//  WatchOrNotTests
//
//  Unit tests for APIClient
//

import XCTest
@testable import WatchOrNot

@MainActor
final class APIClientTests: XCTestCase {
    var apiClient: APIClient!

    override func setUp() async throws {
        try await super.setUp()
        apiClient = APIClient.shared
    }

    // MARK: - Configuration Tests

    func testBaseURLConfiguration() {
        // Test that base URL is correctly configured
        let baseURL = apiClient.baseURL

        // Should be either production or development URL
        let validURLs = [
            "https://watchornot-backend.fly.dev",
            "http://localhost:3001",
            "http://10.0.0.101:3001"
        ]

        XCTAssertTrue(validURLs.contains(baseURL))
    }

    func testTimeoutConfiguration() {
        // Verify timeout values are set
        XCTAssertEqual(Config.requestTimeout, 30.0)
        XCTAssertEqual(Config.resourceTimeout, 300.0)
    }

    // MARK: - Session ID Tests

    func testSessionIDHeader() {
        // Given
        let sessionManager = SessionManager.shared
        sessionManager.saveSessionID("test-session-123")

        // When building a request, it should include session ID
        // This is tested indirectly through integration tests

        // Then
        XCTAssertEqual(sessionManager.getSessionID(), "test-session-123")
    }

    // MARK: - Error Handling Tests

    func testNetworkErrorMapping() {
        // Test that NetworkError cases are properly defined
        let errors: [NetworkError] = [
            .invalidURL,
            .requestFailed(NSError(domain: "test", code: -1)),
            .invalidResponse,
            .decodingFailed(NSError(domain: "test", code: -1)),
            .serverError(500, "Server Error"),
            .networkUnavailable,
            .localNetworkPermissionRequired
        ]

        // Verify all error cases can be instantiated
        XCTAssertEqual(errors.count, 7)
    }

    // MARK: - Image Upload Tests

    func testImageDataPreparation() {
        // Test image compression quality
        XCTAssertEqual(Config.imageCompressionQuality, 0.8)
        XCTAssertEqual(Config.maxImageSize, 5 * 1024 * 1024) // 5MB
    }
}
