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
    @Published var error: String?
    @Published var votedMovies: Set<String> = []
    @Published var isComplete: Bool = false

    private let apiClient: APIClient
    private let totalMoviesNeeded = Config.onboardingMovieCount

    init(apiClient: APIClient = .shared) {
        self.apiClient = apiClient
    }

    var currentMovie: OnboardingMovie? {
        guard currentIndex < movies.count else { return nil }
        return movies[currentIndex]
    }

    var progress: Double {
        Double(votedMovies.count) / Double(totalMoviesNeeded)
    }

    var votesRemaining: Int {
        max(0, totalMoviesNeeded - votedMovies.count)
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

    /// Submit a vote
    func vote(_ voteType: VoteType) async {
        guard let movie = currentMovie else { return }

        isLoading = true

        let request = VoteRequest(
            movieId: movie.id,
            vote: voteType,
            title: movie.title,
            year: movie.year,
            genres: movie.genres,
            directors: movie.directors,
            cast: movie.cast
        )

        do {
            let response = try await apiClient.request(
                .submitVote(request),
                expecting: VoteResponse.self
            )

            votedMovies.insert(movie.id)

            if response.onboardingComplete == true || votedMovies.count >= totalMoviesNeeded {
                isComplete = true
            } else {
                moveToNext()
            }

            isLoading = false
        } catch {
            self.error = "Failed to submit vote: \(error.localizedDescription)"
            isLoading = false
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
        votedMovies.removeAll()
        isComplete = false
        error = nil
    }
}
