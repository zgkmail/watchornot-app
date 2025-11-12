//
//  RecommendationModels.swift
//  WatchOrNot
//
//  Recommendation models
//

import Foundation

/// Badge type for recommendations
enum BadgeType: String, Codable {
    case genreMatch = "genre_match"
    case directorMatch = "director_match"
    case castMatch = "cast_match"
    case highlyRated = "highly_rated"
    case hiddenGem = "hidden_gem"
    case cultClassic = "cult_classic"
    case awardWinner = "award_winner"

    var emoji: String {
        switch self {
        case .genreMatch: return "🎬"
        case .directorMatch: return "🎥"
        case .castMatch: return "⭐"
        case .highlyRated: return "🔥"
        case .hiddenGem: return "💎"
        case .cultClassic: return "👑"
        case .awardWinner: return "🏆"
        }
    }

    var color: String {
        switch self {
        case .genreMatch: return "blue"
        case .directorMatch: return "purple"
        case .castMatch: return "yellow"
        case .highlyRated: return "red"
        case .hiddenGem: return "green"
        case .cultClassic: return "gold"
        case .awardWinner: return "gold"
        }
    }
}

/// Recommendation badge
struct Badge: Codable, Identifiable, Hashable {
    var id: String { type.rawValue + label }
    let type: BadgeType
    let label: String
    let reason: String
}

/// Recommended movie with badges
struct RecommendedMovie: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let year: Int
    let genres: [String]
    let directors: [String]
    let cast: [String]
    let poster: String?
    let plot: String?
    let imdbRating: Double?
    let runtime: String?
    let imdbId: String?
    let badges: [Badge]
    let matchScore: Double?
    let recommendationReason: String?

    enum CodingKeys: String, CodingKey {
        case id, title, year, genres, directors, cast, poster, plot, runtime, badges
        case imdbRating = "imdb_rating"
        case imdbId = "imdb_id"
        case matchScore = "match_score"
        case recommendationReason = "recommendation_reason"
    }
}

/// Recommendations response
struct RecommendationsResponse: Codable {
    let movies: [RecommendedMovie]
    let totalCount: Int
    let hasMore: Bool
    let preferences: UserPreferences?

    enum CodingKeys: String, CodingKey {
        case movies, preferences
        case totalCount = "total_count"
        case hasMore = "has_more"
    }
}

/// User preferences
struct UserPreferences: Codable {
    let favoriteGenres: [String]
    let favoriteDirectors: [String]
    let favoriteCast: [String]
    let averageRatingThreshold: Double

    enum CodingKeys: String, CodingKey {
        case favoriteGenres = "favorite_genres"
        case favoriteDirectors = "favorite_directors"
        case favoriteCast = "favorite_cast"
        case averageRatingThreshold = "average_rating_threshold"
    }
}
