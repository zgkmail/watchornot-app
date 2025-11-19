//
//  ViewModelTests.swift
//  WatchOrNotTests
//
//  Unit tests for ViewModels
//

import XCTest
@testable import WatchOrNot

@MainActor
final class ViewModelTests: XCTestCase {

    // MARK: - MovieSnapViewModel Tests

    func testMovieSnapViewModelInitialState() {
        // Given
        let viewModel = MovieSnapViewModel()

        // Then - Initial state should be clean
        XCTAssertNil(viewModel.capturedImage)
        XCTAssertNil(viewModel.analysisResult)
        XCTAssertNil(viewModel.movieDetails)
        XCTAssertNil(viewModel.currentRating)
        XCTAssertFalse(viewModel.isAnalyzing)
        XCTAssertFalse(viewModel.isLoadingDetails)
        XCTAssertFalse(viewModel.showCamera)
        XCTAssertFalse(viewModel.showPhotoPicker)
        XCTAssertEqual(viewModel.votedCount, 0)
    }

    func testMovieSnapViewModelReset() {
        // Given
        let viewModel = MovieSnapViewModel()

        // When
        viewModel.reset()

        // Then
        XCTAssertNil(viewModel.capturedImage)
        XCTAssertNil(viewModel.movieDetails)
        XCTAssertNil(viewModel.currentRating)
        XCTAssertFalse(viewModel.isAnalyzing)
        XCTAssertFalse(viewModel.isLoadingDetails)
    }

    func testMovieSnapViewModelOpenCamera() {
        // Given
        let viewModel = MovieSnapViewModel()

        // When
        viewModel.openCamera()

        // Then
        XCTAssertTrue(viewModel.showCamera)
    }

    func testMovieSnapViewModelOpenPhotoPicker() {
        // Given
        let viewModel = MovieSnapViewModel()

        // When
        viewModel.openPhotoPicker()

        // Then
        XCTAssertTrue(viewModel.showPhotoPicker)
    }

    // MARK: - HistoryViewModel Tests

    func testHistoryViewModelInitialState() {
        // Given
        let viewModel = HistoryViewModel()

        // Then
        XCTAssertTrue(viewModel.history.isEmpty)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
        XCTAssertTrue(viewModel.hasMoreHistory)
    }

    // MARK: - ProfileViewModel Tests

    func testProfileViewModelInitialState() {
        // Given
        let viewModel = ProfileViewModel()

        // Then
        XCTAssertNil(viewModel.userStats)
        XCTAssertTrue(viewModel.history.isEmpty)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
    }

    func testProfileViewModelTierCalculation() {
        // Given
        let viewModel = ProfileViewModel()

        // Test tier calculation logic
        // Newcomer: 0-4 votes
        // Explorer: 5-14 votes
        // Enthusiast: 15-29 votes
        // Expert: 30-49 votes
        // Master: 50+ votes

        // This is tested through UserTier model
        XCTAssertEqual(UserTier.newcomer.votesRequired, 0)
        XCTAssertEqual(UserTier.explorer.votesRequired, 5)
        XCTAssertEqual(UserTier.enthusiast.votesRequired, 15)
        XCTAssertEqual(UserTier.expert.votesRequired, 30)
        XCTAssertEqual(UserTier.master.votesRequired, 50)
    }

    // MARK: - RecommendationsViewModel Tests

    func testRecommendationsViewModelInitialState() {
        // Given
        let viewModel = RecommendationsViewModel()

        // Then
        XCTAssertTrue(viewModel.recommendations.isEmpty)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
        XCTAssertTrue(viewModel.hasMore)
    }

    // MARK: - OnboardingViewModel Tests

    func testOnboardingViewModelInitialState() {
        // Given
        let viewModel = OnboardingViewModel()

        // Then
        XCTAssertTrue(viewModel.movies.isEmpty)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
        XCTAssertEqual(viewModel.currentIndex, 0)
        XCTAssertTrue(viewModel.votes.isEmpty)
    }

    func testOnboardingViewModelVoteTracking() {
        // Given
        let viewModel = OnboardingViewModel()

        // Then - Should track upvotes, downvotes, and skips
        XCTAssertEqual(viewModel.upvoteCount, 0)
        XCTAssertEqual(viewModel.downvoteCount, 0)
        XCTAssertEqual(viewModel.skipCount, 0)
    }
}
