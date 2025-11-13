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
    let id: String
    let movieId: String
    let title: String
    let year: Int
    let rating: String?
    let timestamp: Date
    let poster: String?
    let badge: String?
    let badgeEmoji: String?
    let badgeDescription: String?

    enum CodingKeys: String, CodingKey {
        case title, year, rating, poster, badge, badgeDescription
        case id = "movie_id"
        case movieId = "movie_id"
        case timestamp = "rated_at"
        case badgeEmoji = "badgeEmoji"
    }

    init(id: String, movieId: String, title: String, year: Int, poster: String?, rating: String?, timestamp: Date, badge: String?, badgeEmoji: String?, badgeDescription: String?) {
        self.id = id
        self.movieId = movieId
        self.title = title
        self.year = year
        self.poster = poster
        self.rating = rating
        self.timestamp = timestamp
        self.badge = badge
        self.badgeEmoji = badgeEmoji
        self.badgeDescription = badgeDescription
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let movieId = try container.decode(String.self, forKey: .movieId)
        self.id = movieId
        self.movieId = movieId
        self.title = try container.decode(String.self, forKey: .title)
        self.year = try container.decode(Int.self, forKey: .year)
        self.poster = try container.decodeIfPresent(String.self, forKey: .poster)
        self.rating = try container.decodeIfPresent(String.self, forKey: .rating)

        // Handle timestamp - backend returns ISO8601 string
        if let timestampString = try? container.decode(String.self, forKey: .timestamp) {
            let formatter = ISO8601DateFormatter()
            self.timestamp = formatter.date(from: timestampString) ?? Date()
        } else {
            self.timestamp = Date()
        }

        self.badge = try container.decodeIfPresent(String.self, forKey: .badge)
        self.badgeEmoji = try container.decodeIfPresent(String.self, forKey: .badgeEmoji)
        self.badgeDescription = try container.decodeIfPresent(String.self, forKey: .badgeDescription)
    }
}

/// History response (deprecated - use RatingsResponse)
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

/// Ratings response from GET /api/ratings
struct RatingsResponse: Codable {
    let ratings: [HistoryEntry]
    let count: Int
}
