//
//  RecommendationsViewModel.swift
//  WatchOrNot
//
//  Recommendations view model with infinite scroll
//

import Foundation

@MainActor
class RecommendationsViewModel: ObservableObject {
    @Published var movies: [RecommendedMovie] = []
    @Published var isLoading: Bool = false
    @Published var isLoadingMore: Bool = false
    @Published var error: String?
    @Published var preferences: UserPreferences?

    private let apiClient: APIClient
    private var currentPage: Int = 1
    private var hasMore: Bool = true
    private let itemsPerPage = Config.itemsPerPage

    init(apiClient: APIClient = .shared) {
        self.apiClient = apiClient
    }

    /// Load initial recommendations
    func loadRecommendations() async {
        guard !isLoading else { return }

        isLoading = true
        error = nil
        currentPage = 1

        do {
            let response = try await apiClient.request(
                .getRecommendations(page: currentPage, limit: itemsPerPage),
                expecting: RecommendationsResponse.self
            )

            movies = response.movies
            preferences = response.preferences
            hasMore = response.hasMore
            isLoading = false
        } catch {
            self.error = "Failed to load recommendations: \(error.localizedDescription)"
            isLoading = false
        }
    }

    /// Load more recommendations (pagination)
    func loadMore() async {
        guard !isLoadingMore && hasMore && !isLoading else { return }

        isLoadingMore = true
        currentPage += 1

        do {
            let response = try await apiClient.request(
                .getRecommendations(page: currentPage, limit: itemsPerPage),
                expecting: RecommendationsResponse.self
            )

            movies.append(contentsOf: response.movies)
            hasMore = response.hasMore
            isLoadingMore = false
        } catch {
            self.error = "Failed to load more: \(error.localizedDescription)"
            currentPage -= 1 // Rollback page
            isLoadingMore = false
        }
    }

    /// Refresh recommendations
    func refresh() async {
        movies = []
        await loadRecommendations()
    }

    /// Check if we should load more (called when scrolling)
    func shouldLoadMore(currentItem: RecommendedMovie) -> Bool {
        guard let lastMovie = movies.last else { return false }
        return currentItem.id == lastMovie.id
    }
}
