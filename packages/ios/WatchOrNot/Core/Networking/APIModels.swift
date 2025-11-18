//
//  APIModels.swift
//  WatchOrNot
//
//  Centralized API request/response models
//

import Foundation

// MARK: - Common Response Models

/// Generic success response
struct SuccessResponse: Codable {
    let success: Bool
}

/// Delete operation response
struct DeleteResponse: Codable {
    let success: Bool
}

// MARK: - Rating Models

/// Save movie/rating request (used for both saving movies and updating ratings)
struct SaveMovieRequest: Codable {
    let id: String
    let title: String
    let year: Int
    let genre: String
    let director: String?
    let cast: String?
    let poster: String?
    let imdbRating: Double?
    let rottenTomatoes: Int?
    let metacritic: Int?
    let trailerUrl: String?
    let rating: String?
}

/// Save rating response
struct SaveRatingResponse: Codable {
    let success: Bool
    let movieId: String?
    let badge: String?
    let badgeEmoji: String?
    let badgeDescription: String?
}

/// Rating request (for updating existing ratings)
struct RatingRequest: Codable {
    let id: String
    let title: String
    let year: Int
    let genre: String?
    let imdbRating: Double?
    let rottenTomatoes: Int?
    let metacritic: Int?
    let poster: String?
    let director: String?
    let cast: String?
    let rating: String?  // Optional to support null for canceling
}

/// Rating response
struct RatingResponse: Codable {
    let success: Bool
    let movieId: String
    let badge: String?
    let badgeEmoji: String?
    let badgeDescription: String?
}

/// Ratings collection response (from GET /api/ratings)
struct RatingsResponse: Codable {
    let ratings: [HistoryEntry]
    let count: Int
}

// MARK: - Badge Models

/// Calculate badge request
struct CalculateBadgeRequest: Codable {
    let id: String
    let title: String
    let genre: String?
    let imdbRating: Double?
    let rottenTomatoes: Int?
    let metacritic: Int?
    let director: String?
    let cast: String?
}

/// Badge response
struct BadgeResponse: Codable {
    let badge: String?
    let badgeEmoji: String?
    let badgeDescription: String?
    let tier: String?
}

// MARK: - Onboarding Models

/// Onboarding status response
struct OnboardingStatusResponse: Codable {
    let hasCompletedOnboarding: Bool
    let totalVotes: Int
    let upvotes: Int
    let downvotes: Int
    let skips: Int
}

// MARK: - TMDB Models

/// TMDB Search Response
struct TMDBSearchResponse: Codable {
    let results: [TMDBSearchResult]
    let totalResults: Int

    enum CodingKeys: String, CodingKey {
        case results
        case totalResults = "total_results"
    }
}

/// TMDB Search Result
struct TMDBSearchResult: Codable {
    let id: Int
    let mediaType: String
    let title: String?  // Movies have "title"
    let name: String?   // TV shows have "name"
    let releaseDate: String?  // Movies have "release_date"
    let firstAirDate: String?  // TV shows have "first_air_date"
    let overview: String?  // Some content may not have overview
    let posterPath: String?
    let voteAverage: Double?  // Some content may not have ratings
    let popularity: Double?  // Some content may not have popularity

    enum CodingKeys: String, CodingKey {
        case id, overview, popularity
        case mediaType = "media_type"
        case title, name
        case releaseDate = "release_date"
        case firstAirDate = "first_air_date"
        case posterPath = "poster_path"
        case voteAverage = "vote_average"
    }

    // Helper properties
    var displayTitle: String {
        title ?? name ?? "Unknown"
    }

    var year: Int {
        let dateString = releaseDate ?? firstAirDate ?? ""
        if let yearString = dateString.split(separator: "-").first,
           let yearInt = Int(yearString) {
            return yearInt
        }
        return 0
    }
}

/// TMDB Details Response
struct TMDBDetailsResponse: Codable {
    let id: Int
    let title: String?      // Movies have "title"
    let name: String?       // TV shows have "name"
    let overview: String?   // Some content may not have overview
    let voteAverage: Double?  // Some content may not have ratings yet
    let runtime: Int?
    let genres: [TMDBGenre]?  // Some content may not have genres
    let externalIds: TMDBExternalIds?
    let credits: TMDBCredits?
    let videos: TMDBVideos?

    enum CodingKeys: String, CodingKey {
        case id, title, name, overview, runtime, genres, credits, videos
        case voteAverage = "vote_average"
        case externalIds = "external_ids"
    }

    // Helper to get display title (works for both movies and TV shows)
    var displayTitle: String {
        title ?? name ?? "Unknown"
    }
}

struct TMDBGenre: Codable {
    let id: Int
    let name: String
}

struct TMDBExternalIds: Codable {
    let imdbId: String?

    enum CodingKeys: String, CodingKey {
        case imdbId = "imdb_id"
    }
}

struct TMDBCredits: Codable {
    let cast: [TMDBCastMember]
    let crew: [TMDBCrewMember]
}

struct TMDBCastMember: Codable {
    let name: String
}

struct TMDBCrewMember: Codable {
    let name: String
    let job: String
}

struct TMDBVideos: Codable {
    let results: [TMDBVideo]
}

struct TMDBVideo: Codable {
    let key: String
    let site: String
    let type: String
}

// MARK: - OMDb Models

/// OMDb Ratings Response (from /api/omdb/ratings/:imdbId)
struct OMDbRatingsResponse: Codable {
    let found: Bool?
    let title: String?
    let year: String?
    let director: String?
    let actors: String?
    let ratings: OMDbRatings?
    let responseTime: Int?

    struct OMDbRatings: Codable {
        let imdb: OMDbImdb?
        let rottenTomatoes: Int?
        let metacritic: Int?

        struct OMDbImdb: Codable {
            let rating: Double?
            let votes: String?
        }
    }

    // Helper properties for backward compatibility
    var imdbRating: Double? {
        ratings?.imdb?.rating
    }

    var rottenTomatoes: Int? {
        ratings?.rottenTomatoes
    }

    var metacritic: Int? {
        ratings?.metacritic
    }
}
