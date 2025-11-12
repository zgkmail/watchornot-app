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
        currentPage = 1

        do {
            let response = try await apiClient.request(
                .getRatingHistory(page: currentPage, limit: itemsPerPage),
                expecting: HistoryResponse.self
            )

            history = response.history
            hasMoreHistory = response.hasMore
            isLoading = false
        } catch {
            self.error = "Failed to load history: \(error.localizedDescription)"
            isLoading = false
        }
    }

    /// Load more history
    func loadMoreHistory() async {
        guard !isLoadingMore && hasMoreHistory else { return }

        isLoadingMore = true
        currentPage += 1

        do {
            let response = try await apiClient.request(
                .getRatingHistory(page: currentPage, limit: itemsPerPage),
                expecting: HistoryResponse.self
            )

            history.append(contentsOf: response.history)
            hasMoreHistory = response.hasMore
            isLoadingMore = false
        } catch {
            self.error = "Failed to load more: \(error.localizedDescription)"
            currentPage -= 1
            isLoadingMore = false
        }
    }

    /// Delete history entry
    func deleteEntry(_ entry: HistoryEntry) async {
        do {
            _ = try await apiClient.request(
                .deleteHistoryEntry(String(entry.id)),
                expecting: VoteResponse.self
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
