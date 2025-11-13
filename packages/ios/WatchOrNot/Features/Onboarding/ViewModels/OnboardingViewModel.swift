//
//  OnboardingViewModel.swift
//  WatchOrNot
//
//  Onboarding flow view model
//

import Foundation

@MainActor
class OnboardingViewModel: ObservableObject {
    @Published var movies: [OnboardingMovie] = []
    @Published var currentIndex: Int = 0
    @Published var isLoading: Bool = false
    @Published var isSubmitting: Bool = false
    @Published var error: String?
    @Published var actualVoteCount: Int = 0 // Only up/down votes, not skips
    @Published var isComplete: Bool = false

    private let apiClient: APIClient
    private let requiredVotes = Config.onboardingRequiredVotes // 5 actual votes needed
    private var allVotes: [VoteRequest] = [] // Store all votes locally

    init(apiClient: APIClient = .shared) {
        self.apiClient = apiClient
    }

    var currentMovie: OnboardingMovie? {
        guard currentIndex < movies.count else { return nil }
        return movies[currentIndex]
    }

    var progress: Double {
        Double(actualVoteCount) / Double(requiredVotes)
    }

    var votesRemaining: Int {
        max(0, requiredVotes - actualVoteCount)
    }

    /// Load onboarding movies
    func loadMovies() async {
        isLoading = true
        error = nil

        do {
            let response = try await apiClient.request(
                .getOnboardingMovies,
                expecting: OnboardingMoviesResponse.self
            )
            movies = response.movies
            isLoading = false
        } catch {
            self.error = "Failed to load movies: \(error.localizedDescription)"
            isLoading = false
        }
    }

    /// Submit a vote (stored locally until batch submission)
    func vote(_ voteType: VoteType) async {
        guard let movie = currentMovie else { return }

        // Don't allow voting if we've already reached the required count
        if voteType != .skip && actualVoteCount >= requiredVotes {
            return
        }

        // Create vote request
        let request = VoteRequest(
            movieId: movie.id,
            vote: voteType,
            title: movie.title,
            year: movie.year,
            genres: movie.genres,
            director: movie.director ?? "",
            cast: movie.cast ?? "",
            poster: movie.poster,
            imdbRating: movie.imdbRating,
            rottenTomatoes: nil,  // Not available in onboarding data
            metacritic: nil       // Not available in onboarding data
        )

        // Store vote locally
        allVotes.append(request)

        // Only increment for actual votes (not skips)
        if voteType != .skip {
            actualVoteCount += 1
        }

        // Check if we've reached required votes
        if actualVoteCount >= requiredVotes {
            // Submit all votes to backend
            await submitAllVotes()
        } else if currentIndex < movies.count - 1 {
            // Move to next movie
            moveToNext()
        } else {
            // Ran out of movies without enough votes
            error = "You need to vote on at least \(requiredVotes) movies (not \"Skip\"). Please try again."
        }
    }

    /// Submit all votes to backend in a batch
    private func submitAllVotes() async {
        isSubmitting = true
        error = nil

        do {
            let response = try await apiClient.request(
                .completeOnboarding(allVotes),
                expecting: VoteResponse.self
            )

            if response.success {
                isComplete = true
            } else {
                error = response.message
            }

            isSubmitting = false
        } catch {
            self.error = "Failed to save your preferences: \(error.localizedDescription)"
            isSubmitting = false
        }
    }

    /// Skip to next movie
    func skip() async {
        await vote(.skip)
    }

    /// Move to next movie
    private func moveToNext() {
        if currentIndex < movies.count - 1 {
            currentIndex += 1
        }
    }

    /// Restart onboarding
    func restart() {
        currentIndex = 0
        actualVoteCount = 0
        allVotes = []
        isComplete = false
        error = nil
    }
}
