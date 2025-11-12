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
    case submitVote(VoteRequest)
    case getOnboardingStatus

    // Recommendations
    case getRecommendations(page: Int, limit: Int)

    // Ratings
    case submitRating(String, Int) // movieId, rating
    case getRatingHistory(page: Int, limit: Int)
    case deleteHistoryEntry(String) // entryId

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
        case .submitVote:
            return "/api/onboarding/vote"
        case .getOnboardingStatus:
            return "/api/onboarding/status"
        case .getRecommendations:
            return "/api/recommendations"
        case .submitRating:
            return "/api/ratings"
        case .getRatingHistory:
            return "/api/ratings/history"
        case .deleteHistoryEntry(let id):
            return "/api/ratings/\(id)"
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
        case .analyzeImage, .submitVote, .submitRating:
            return .post
        case .deleteHistoryEntry:
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
        case .getRatingHistory(let page, let limit):
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
        case .submitVote(let request):
            return request
        case .submitRating(let movieId, let rating):
            return ["movieId": movieId, "rating": rating]
        default:
            return nil
        }
    }
}
