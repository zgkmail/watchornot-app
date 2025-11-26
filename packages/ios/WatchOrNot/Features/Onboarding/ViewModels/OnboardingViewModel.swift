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
    private var shownMovieIds: Set<String> = [] // Track shown movies to prevent duplicates

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
            // Track initially loaded movie IDs
            shownMovieIds = Set(response.movies.map { $0.id })
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
            // Ran out of movies without enough votes - load more movies
            await loadMoreMovies()
        }
    }

    /// Load more movies when user runs out without enough votes
    func loadMoreMovies() async {
        isLoading = true
        error = nil

        do {
            let response = try await apiClient.request(
                .getOnboardingMovies,
                expecting: OnboardingMoviesResponse.self
            )

            // Filter out movies that have already been shown to prevent duplicates
            let newMovies = response.movies.filter { movie in
                !shownMovieIds.contains(movie.id)
            }

            // Update the tracking set with new movie IDs
            newMovies.forEach { movie in
                shownMovieIds.insert(movie.id)
            }

            // Append only new movies to existing list
            movies.append(contentsOf: newMovies)

            // Move to next movie (first of the newly loaded batch)
            moveToNext()
            isLoading = false
        } catch {
            // If loading more movies fails, show error with option to skip to app
            self.error = "Need \(votesRemaining) more vote\(votesRemaining == 1 ? "" : "s") to personalize recommendations. Continue voting or skip to app?"
            isLoading = false
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
