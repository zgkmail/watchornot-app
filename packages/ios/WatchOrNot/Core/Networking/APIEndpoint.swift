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
    case getRatings // Get all ratings (for history)
    case deleteRating(String) // movieId

    // TMDB
    case searchMovies(query: String)
    case getMovieDetails(id: String)

    // OMDb
    case getOMDbDetails(imdbId: String)

    // Health
    case healthCheck
    case getSession

    var path: String {
        switch self {
        case .analyzeImage:
            return "/api/claude/analyze"
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
        case .getRatings:
            return "/api/ratings"
        case .deleteRating(let movieId):
            return "/api/ratings/\(movieId)"
        case .searchMovies:
            return "/api/tmdb/search"
        case .getMovieDetails(let id):
            return "/api/tmdb/movie/\(id)"
        case .getOMDbDetails:
            return "/api/omdb/details"
        case .healthCheck:
            return "/health"
        case .getSession:
            return "/api/session"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .analyzeImage, .completeOnboarding, .submitRating, .saveRating:
            return .post
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
        case .getOMDbDetails(let imdbId):
            return [URLQueryItem(name: "imdbId", value: imdbId)]
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
        case .saveRating(let data):
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
