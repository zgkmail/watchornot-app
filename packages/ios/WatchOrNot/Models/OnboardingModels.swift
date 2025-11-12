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
    let directors: [String]
    let cast: [String]
    let poster: String
    let imdbRating: Double

    enum CodingKeys: String, CodingKey {
        case id, title, year, genres, directors, cast, poster
        case imdbRating = "imdb_rating"
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
    let directors: [String]
    let cast: [String]

    enum CodingKeys: String, CodingKey {
        case vote, title, year, genres, directors, cast
        case movieId = "movie_id"
    }
}

/// Vote submission response
struct VoteResponse: Codable {
    let success: Bool
    let message: String
    let totalVotes: Int?
    let onboardingComplete: Bool?

    enum CodingKeys: String, CodingKey {
        case success, message
        case totalVotes = "total_votes"
        case onboardingComplete = "onboarding_complete"
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
