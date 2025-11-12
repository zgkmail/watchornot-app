//
//  UserModels.swift
//  WatchOrNot
//
//  User profile and stats models
//

import Foundation

/// User tier levels (matches backend tier system)
enum UserTier: String, Codable {
    case newcomer = "Newcomer"      // 0-4 votes
    case explorer = "Explorer"      // 5-14 votes
    case enthusiast = "Enthusiast"  // 15-29 votes
    case expert = "Expert"          // 30-49 votes
    case master = "Master"          // 50+ votes

    var displayName: String {
        rawValue
    }

    var emoji: String {
        switch self {
        case .newcomer: return "🌱"
        case .explorer: return "🎬"
        case .enthusiast: return "🎥"
        case .expert: return "⭐"
        case .master: return "👑"
        }
    }

    var description: String {
        switch self {
        case .newcomer: return "Just getting started"
        case .explorer: return "Exploring movies"
        case .enthusiast: return "Growing your taste"
        case .expert: return "Expert opinion"
        case .master: return "Ultimate movie master"
        }
    }

    var votesRequired: Int {
        switch self {
        case .newcomer: return 0
        case .explorer: return Config.Tier.explorerMin
        case .enthusiast: return Config.Tier.enthusiastMin
        case .expert: return Config.Tier.expertMin
        case .master: return Config.Tier.masterMin
        }
    }
}

/// User statistics
struct UserStats: Codable {
    let tier: UserTier
    let totalVotes: Int
    let upvotes: Int
    let downvotes: Int
    let skips: Int
    let moviesSnapped: Int
    let onboardingComplete: Bool
    let joinedDate: String?
    let nextTierVotes: Int?

    enum CodingKeys: String, CodingKey {
        case tier, upvotes, downvotes, skips, joinedDate
        case totalVotes = "total_votes"
        case moviesSnapped = "movies_snapped"
        case onboardingComplete = "onboarding_complete"
        case nextTierVotes = "next_tier_votes"
    }

    var progress: Double {
        let currentTier = tier.votesRequired
        let nextTier = nextTierVotes ?? 0
        let range = Double(nextTier - currentTier)
        let current = Double(totalVotes - currentTier)
        return range > 0 ? current / range : 1.0
    }
}

/// User stats response
struct UserStatsResponse: Codable {
    let stats: UserStats
}

/// History entry
struct HistoryEntry: Codable, Identifiable, Hashable {
    let id: Int
    let movieId: String
    let title: String
    let year: Int
    let vote: VoteType
    let timestamp: String
    let poster: String?
    let genres: [String]?

    enum CodingKeys: String, CodingKey {
        case id, title, year, vote, timestamp, poster, genres
        case movieId = "movie_id"
    }

    var date: Date {
        let formatter = ISO8601DateFormatter()
        return formatter.date(from: timestamp) ?? Date()
    }
}

/// History response
struct HistoryResponse: Codable {
    let history: [HistoryEntry]
    let totalCount: Int
    let page: Int
    let limit: Int
    let hasMore: Bool

    enum CodingKeys: String, CodingKey {
        case history, page, limit
        case totalCount = "total_count"
        case hasMore = "has_more"
    }
}
