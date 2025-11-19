//
//  APIEndpoint.swift
//  WatchOrNot
//
//  API endpoint definitions
//

import Foundation

/// API endpoint configuration
enum APIEndpoint {
    // Claude Vision
    case analyzeImage

    // Onboarding
    case getOnboardingMovies
    case completeOnboarding([VoteRequest]) // Submit all votes at once
    case getOnboardingStatus

    // Recommendations
    case getRecommendations(page: Int, limit: Int)

    // Ratings
    case submitRating(String, Int) // movieId, rating
    case saveRating(Encodable) // Full movie data with rating
    case updateRating(movieId: String, rating: String?) // Update only rating (PATCH)
    case getRatings // Get all ratings (for history)
    case deleteRating(String) // movieId
    case calculateBadge(Encodable) // Calculate recommendation badge for movie

    // TMDB
    case searchMovies(query: String)
    case getMovieDetails(mediaType: String, id: String)

    // OMDb
    case getOMDbRatings(imdbId: String)

    // Health
    case healthCheck
    case getSession

    var path: String {
        switch self {
        case .analyzeImage:
            return "/api/claude/identify"
        case .getOnboardingMovies:
            return "/api/onboarding/movies"
        case .completeOnboarding:
            return "/api/onboarding/complete"
        case .getOnboardingStatus:
            return "/api/onboarding/status"
        case .getRecommendations:
            return "/api/recommendations"
        case .submitRating, .saveRating:
            return "/api/ratings"
        case .updateRating(let movieId, _):
            return "/api/ratings/\(movieId)"
        case .getRatings:
            return "/api/ratings"
        case .deleteRating(let movieId):
            return "/api/ratings/\(movieId)"
        case .calculateBadge:
            return "/api/ratings/calculate-badge"
        case .searchMovies:
            return "/api/tmdb/search"
        case .getMovieDetails(let mediaType, let id):
            return "/api/tmdb/\(mediaType)/\(id)"
        case .getOMDbRatings(let imdbId):
            return "/api/omdb/ratings/\(imdbId)"
        case .healthCheck:
            return "/health"
        case .getSession:
            return "/api/session"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .analyzeImage, .completeOnboarding, .submitRating, .saveRating, .calculateBadge:
            return .post
        case .updateRating:
            return .patch
        case .deleteRating:
            return .delete
        default:
            return .get
        }
    }

    var queryItems: [URLQueryItem]? {
        switch self {
        case .getRecommendations(let page, let limit):
            return [
                URLQueryItem(name: "page", value: "\(page)"),
                URLQueryItem(name: "limit", value: "\(limit)")
            ]
        case .searchMovies(let query):
            return [URLQueryItem(name: "query", value: query)]
        default:
            return nil
        }
    }

    var body: Encodable? {
        switch self {
        case .completeOnboarding(let votes):
            // Match web app format: { votes: [...] }
            return OnboardingCompleteRequest(votes: votes)
        case .submitRating(let movieId, let rating):
            return SubmitRatingRequest(movieId: movieId, rating: rating)
        case .updateRating(_, let rating):
            return UpdateRatingOnlyRequest(rating: rating)
        case .saveRating(let data), .calculateBadge(let data):
            return data
        default:
            return nil
        }
    }
}

// MARK: - Request Models

struct SubmitRatingRequest: Codable {
    let movieId: String
    let rating: Int
}

/// Update rating only request - for PATCH /api/ratings/:movieId
struct UpdateRatingOnlyRequest: Codable {
    let rating: String? // "up", "down", or null to toggle off
}

/// Update rating request - DEPRECATED: Use UpdateRatingOnlyRequest with PATCH endpoint instead
/// This struct is kept for backward compatibility but should not be used for rating updates
struct UpdateRatingRequest: Codable {
    let id: String
    let title: String
    let genre: String?
    let year: Int
    let imdbRating: Double?
    let rottenTomatoes: Int?
    let metacritic: Int?
    let poster: String?
    let director: String?
    let cast: String?
    let rating: String? // "up", "down", or null to toggle off
    let timestamp: Int
}
