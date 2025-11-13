//
//  HistoryViewModel.swift
//  WatchOrNot
//
//  History view model
//

import Foundation

@MainActor
class HistoryViewModel: ObservableObject {
    @Published var history: [HistoryEntry] = []
    @Published var isLoading: Bool = false
    @Published var isLoadingMore: Bool = false
    @Published var error: String?
    @Published var currentPage: Int = 1
    @Published var hasMoreHistory: Bool = true

    private let apiClient: APIClient
    private let itemsPerPage = Config.itemsPerPage

    init(apiClient: APIClient = .shared) {
        self.apiClient = apiClient
    }

    /// Load history
    func loadHistory() async {
        isLoading = true

        do {
            let response = try await apiClient.request(
                .getRatings,
                expecting: RatingsResponse.self
            )

            history = response.ratings
            // Backend returns all ratings, no pagination
            hasMoreHistory = false
            isLoading = false
        } catch {
            self.error = "Failed to load history: \(error.localizedDescription)"
            isLoading = false
        }
    }

    /// Load more history (not needed since backend returns all ratings)
    func loadMoreHistory() async {
        // No-op: Backend returns all ratings at once
    }

    /// Delete history entry
    func deleteEntry(_ entry: HistoryEntry) async {
        do {
            struct DeleteResponse: Codable {
                let success: Bool
            }

            _ = try await apiClient.request(
                .deleteRating(entry.movieId),
                expecting: DeleteResponse.self
            )

            history.removeAll { $0.id == entry.id }
        } catch {
            self.error = "Failed to delete entry: \(error.localizedDescription)"
        }
    }

    /// Refresh all data
    func refresh() async {
        await loadHistory()
    }
}
