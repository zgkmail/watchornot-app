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

    /// Toggle rating for a history entry
    func toggleRating(for entry: HistoryEntry, newRating: String) async {
        // Optimistically update the UI
        if let index = history.firstIndex(where: { $0.id == entry.id }) {
            var updatedEntry = entry
            // If toggling to the same rating, set to nil (toggle off)
            let finalRating = (entry.rating == newRating) ? nil : newRating

            // Create updated entry with new rating
            let updated = HistoryEntry(
                id: updatedEntry.id,
                movieId: updatedEntry.movieId,
                title: updatedEntry.title,
                year: updatedEntry.year,
                genre: updatedEntry.genre,
                imdbRating: updatedEntry.imdbRating,
                rottenTomatoes: updatedEntry.rottenTomatoes,
                metacritic: updatedEntry.metacritic,
                poster: updatedEntry.poster,
                rating: finalRating,
                timestamp: updatedEntry.timestamp,
                badge: updatedEntry.badge,
                badgeEmoji: updatedEntry.badgeEmoji,
                badgeDescription: updatedEntry.badgeDescription
            )

            history[index] = updated

            // Send update to backend
            do {
                struct UpdateRatingResponse: Codable {
                    let success: Bool
                    let badge: String?
                    let badgeEmoji: String?
                    let badgeDescription: String?
                }

                let request = UpdateRatingRequest(
                    id: entry.movieId,
                    title: entry.title,
                    genre: entry.genre,
                    year: entry.year,
                    imdbRating: entry.imdbRating,
                    rottenTomatoes: entry.rottenTomatoes,
                    metacritic: entry.metacritic,
                    poster: entry.poster,
                    director: nil, // Not stored in HistoryEntry
                    cast: nil, // Not stored in HistoryEntry
                    rating: finalRating,
                    timestamp: Int(entry.timestamp.timeIntervalSince1970 * 1000)
                )

                let response = try await apiClient.request(
                    .updateRating(request),
                    expecting: UpdateRatingResponse.self
                )

                // Update badge if returned from backend
                if response.success {
                    let updatedWithBadge = HistoryEntry(
                        id: updated.id,
                        movieId: updated.movieId,
                        title: updated.title,
                        year: updated.year,
                        genre: updated.genre,
                        imdbRating: updated.imdbRating,
                        rottenTomatoes: updated.rottenTomatoes,
                        metacritic: updated.metacritic,
                        poster: updated.poster,
                        rating: finalRating,
                        timestamp: updated.timestamp,
                        badge: response.badge,
                        badgeEmoji: response.badgeEmoji,
                        badgeDescription: response.badgeDescription
                    )
                    history[index] = updatedWithBadge
                }
            } catch {
                // Revert on error
                history[index] = entry
                self.error = "Failed to update rating: \(error.localizedDescription)"
            }
        }
    }
}
