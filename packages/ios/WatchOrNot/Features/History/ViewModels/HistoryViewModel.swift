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

    /// Update rating for a history entry
    func updateRating(_ entry: HistoryEntry, newRating: String) async {
        do {
            // Convert empty string to nil for backend (web app sends null to cancel vote)
            let ratingValue: String? = newRating.isEmpty ? nil : newRating

            let request = RatingRequest(
                id: entry.movieId,
                title: entry.title,
                year: entry.year,
                genre: entry.genre,
                imdbRating: entry.imdbRating,
                rottenTomatoes: entry.rottenTomatoes,
                metacritic: entry.metacritic,
                poster: entry.poster,
                director: entry.director,
                cast: entry.cast,
                rating: ratingValue
            )

            let response = try await apiClient.request(
                .saveRating(request),
                expecting: RatingResponse.self
            )

            // Update local state
            if let index = history.firstIndex(where: { $0.id == entry.id }) {
                var updatedEntry = entry
                // Create a new HistoryEntry with updated values
                let newEntry = HistoryEntry(
                    id: updatedEntry.id,
                    movieId: updatedEntry.movieId,
                    title: updatedEntry.title,
                    year: updatedEntry.year,
                    poster: updatedEntry.poster,
                    rating: ratingValue,  // Use nil if canceled
                    timestamp: updatedEntry.timestamp,
                    genre: updatedEntry.genre,
                    imdbRating: updatedEntry.imdbRating,
                    rottenTomatoes: updatedEntry.rottenTomatoes,
                    metacritic: updatedEntry.metacritic,
                    director: updatedEntry.director,
                    cast: updatedEntry.cast,
                    trailerUrl: updatedEntry.trailerUrl,
                    badge: response.badge ?? updatedEntry.badge,
                    badgeEmoji: response.badgeEmoji ?? updatedEntry.badgeEmoji,
                    badgeDescription: response.badgeDescription ?? updatedEntry.badgeDescription
                )
                history[index] = newEntry
            }
        } catch {
            self.error = "Failed to update rating: \(error.localizedDescription)"
        }
    }
}
