//
//  OnboardingModels.swift
//  WatchOrNot
//
//  Onboarding flow models
//

import Foundation

/// Movie for onboarding voting
struct OnboardingMovie: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let year: Int
    let genres: [String]
    let director: String?
    let cast: String?
    private let posterPath: String
    let imdbRating: Double

    // Computed property for full poster URL
    var poster: String {
        if posterPath.starts(with: "http") {
            return posterPath
        }
        return "https://image.tmdb.org/t/p/w500\(posterPath)"
    }

    // Computed properties for backwards compatibility
    var directors: [String] {
        guard let director = director else { return [] }
        return [director]
    }

    var castArray: [String] {
        guard let cast = cast else { return [] }
        return cast.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
    }

    enum CodingKeys: String, CodingKey {
        case id, title, year, genres, director, cast, imdbRating
        case posterPath = "poster"
    }
}

/// Response with onboarding movies
struct OnboardingMoviesResponse: Codable {
    let movies: [OnboardingMovie]
}

/// Vote type
enum VoteType: String, Codable {
    case up = "up"
    case down = "down"
    case skip = "skip"

    var emoji: String {
        switch self {
        case .up: return "👍"
        case .down: return "👎"
        case .skip: return "⏭"
        }
    }
}

/// Vote submission request
struct VoteRequest: Codable {
    let movieId: String
    let vote: VoteType
    let title: String
    let year: Int
    let genres: [String]
    let director: String
    let cast: String
    let poster: String
    let imdbRating: Double?
    let rottenTomatoes: Int?
    let metacritic: Int?

    enum CodingKeys: String, CodingKey {
        case movieId, vote, title, year, genres, director, cast, poster, imdbRating, rottenTomatoes, metacritic
    }
}

/// Vote submission response
struct VoteResponse: Codable {
    let success: Bool
    let message: String?
    let totalVotes: Int?
    let tier: String?
    let savedVotes: Int?
    let processingTime: Int?

    enum CodingKeys: String, CodingKey {
        case success, message, totalVotes, tier, savedVotes, processingTime
    }
}

/// Onboarding status
struct OnboardingStatusResponse: Codable {
    let hasCompletedOnboarding: Bool
    let totalVotes: Int
    let upvotes: Int
    let downvotes: Int
    let skips: Int

    enum CodingKeys: String, CodingKey {
        case totalVotes, upvotes, downvotes, skips
        case hasCompletedOnboarding = "has_completed_onboarding"
    }
}

/// Onboarding complete request (batch submission)
struct OnboardingCompleteRequest: Codable {
    let votes: [VoteRequest]
}
