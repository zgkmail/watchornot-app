//
//  ProfileViewModel.swift
//  WatchOrNot
//
//  Profile view model
//

import Foundation

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var userStats: UserStats?
    @Published var history: [HistoryEntry] = []
    @Published var isLoading: Bool = false
    @Published var isLoadingHistory: Bool = false
    @Published var error: String?
    @Published var currentPage: Int = 1
    @Published var hasMoreHistory: Bool = true

    private let apiClient: APIClient
    private let itemsPerPage = Config.itemsPerPage

    init(apiClient: APIClient = .shared) {
        self.apiClient = apiClient
    }

    /// Load user stats
    func loadStats() async {
        isLoading = true
        error = nil

        do {
            // In a real implementation, we'd have a dedicated stats endpoint
            // For now, we'll use the onboarding status as a proxy
            let status = try await apiClient.request(
                .getOnboardingStatus,
                expecting: OnboardingStatusResponse.self
            )

            // Create stats from onboarding status
            userStats = UserStats(
                tier: calculateTier(votes: status.totalVotes),
                totalVotes: status.totalVotes,
                upvotes: status.upvotes,
                downvotes: status.downvotes,
                skips: status.skips,
                moviesSnapped: 0,
                onboardingComplete: status.hasCompletedOnboarding,
                joinedDate: nil,
                nextTierVotes: calculateNextTierVotes(votes: status.totalVotes)
            )

            isLoading = false
        } catch {
            self.error = "Failed to load stats: \(error.localizedDescription)"
            isLoading = false
        }
    }

    /// Load history
    func loadHistory() async {
        isLoadingHistory = true
        currentPage = 1

        do {
            let response = try await apiClient.request(
                .getRatingHistory(page: currentPage, limit: itemsPerPage),
                expecting: HistoryResponse.self
            )

            history = response.history
            hasMoreHistory = response.hasMore
            isLoadingHistory = false
        } catch {
            self.error = "Failed to load history: \(error.localizedDescription)"
            isLoadingHistory = false
        }
    }

    /// Load more history
    func loadMoreHistory() async {
        guard !isLoadingHistory && hasMoreHistory else { return }

        isLoadingHistory = true
        currentPage += 1

        do {
            let response = try await apiClient.request(
                .getRatingHistory(page: currentPage, limit: itemsPerPage),
                expecting: HistoryResponse.self
            )

            history.append(contentsOf: response.history)
            hasMoreHistory = response.hasMore
            isLoadingHistory = false
        } catch {
            self.error = "Failed to load more: \(error.localizedDescription)"
            currentPage -= 1
            isLoadingHistory = false
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

            // Reload stats to reflect the change
            await loadStats()
        } catch {
            self.error = "Failed to delete entry: \(error.localizedDescription)"
        }
    }

    /// Refresh all data
    func refresh() async {
        await loadStats()
        await loadHistory()
    }

    /// Recreate taste profile (delete all ratings and restart onboarding)
    func recreateTasteProfile() async {
        do {
            // Delete all history entries
            for entry in history {
                _ = try await apiClient.request(
                    .deleteHistoryEntry(String(entry.id)),
                    expecting: VoteResponse.self
                )
            }

            // Clear local state
            history.removeAll()
            userStats = nil

            // Reload stats
            await loadStats()
        } catch {
            self.error = "Failed to recreate profile: \(error.localizedDescription)"
        }
    }

    // MARK: - Helpers

    private func calculateTier(votes: Int) -> UserTier {
        // Match backend tier calculation exactly
        if votes >= Config.Tier.masterMin {
            return .master
        } else if votes >= Config.Tier.expertMin {
            return .expert
        } else if votes >= Config.Tier.enthusiastMin {
            return .enthusiast
        } else if votes >= Config.Tier.explorerMin {
            return .explorer
        } else {
            return .newcomer
        }
    }

    private func calculateNextTierVotes(votes: Int) -> Int? {
        let tier = calculateTier(votes: votes)
        switch tier {
        case .newcomer:
            return Config.Tier.explorerMin
        case .explorer:
            return Config.Tier.enthusiastMin
        case .enthusiast:
            return Config.Tier.expertMin
        case .expert:
            return Config.Tier.masterMin
        case .master:
            return nil // Already at max tier
        }
    }
}
