//
//  ConfigTests.swift
//  WatchOrNotTests
//
//  Unit tests for Config values
//

import XCTest
@testable import WatchOrNot

final class ConfigTests: XCTestCase {

    // MARK: - Network Configuration Tests

    func testAPIBaseURLs() {
        // Verify valid base URLs are defined
        let validURLs = [
            Config.API.baseURL,
            Config.API.localDeviceURL
        ]

        for url in validURLs {
            XCTAssertFalse(url.isEmpty)
            XCTAssertTrue(url.hasPrefix("http"))
        }
    }

    func testTimeoutValues() {
        // Verify timeout configurations
        XCTAssertGreaterThan(Config.requestTimeout, 0)
        XCTAssertGreaterThan(Config.resourceTimeout, 0)
        XCTAssertGreaterThanOrEqual(Config.resourceTimeout, Config.requestTimeout)
    }

    // MARK: - Image Configuration Tests

    func testImageConfiguration() {
        // Verify image settings
        XCTAssertGreaterThan(Config.maxImageSize, 0)
        XCTAssertGreaterThan(Config.imageCompressionQuality, 0)
        XCTAssertLessThanOrEqual(Config.imageCompressionQuality, 1.0)
    }

    // MARK: - Onboarding Configuration Tests

    func testOnboardingConfiguration() {
        // Verify onboarding settings
        XCTAssertGreaterThan(Config.Onboarding.minRequiredVotes, 0)
        XCTAssertGreaterThan(Config.Onboarding.totalMoviesToShow, 0)
        XCTAssertGreaterThanOrEqual(
            Config.Onboarding.totalMoviesToShow,
            Config.Onboarding.minRequiredVotes
        )
    }

    // MARK: - Tier Configuration Tests

    func testTierThresholds() {
        // Verify tier thresholds are in ascending order
        XCTAssertEqual(Config.Tier.newcomerMin, 0)
        XCTAssertGreaterThan(Config.Tier.explorerMin, Config.Tier.newcomerMin)
        XCTAssertGreaterThan(Config.Tier.enthusiastMin, Config.Tier.explorerMin)
        XCTAssertGreaterThan(Config.Tier.expertMin, Config.Tier.enthusiastMin)
        XCTAssertGreaterThan(Config.Tier.masterMin, Config.Tier.expertMin)
    }

    func testTierValues() {
        // Verify specific tier values match requirements
        XCTAssertEqual(Config.Tier.newcomerMin, 0)
        XCTAssertEqual(Config.Tier.explorerMin, 5)
        XCTAssertEqual(Config.Tier.enthusiastMin, 15)
        XCTAssertEqual(Config.Tier.expertMin, 30)
        XCTAssertEqual(Config.Tier.masterMin, 50)
    }

    // MARK: - Pagination Configuration Tests

    func testPaginationConfiguration() {
        // Verify pagination settings
        XCTAssertGreaterThan(Config.itemsPerPage, 0)
        XCTAssertLessThanOrEqual(Config.itemsPerPage, 100) // Reasonable upper limit
    }
}
