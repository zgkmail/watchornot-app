//
//  Config.swift
//  WatchOrNot
//
//  App configuration
//

import Foundation

enum Config {
    // MARK: - Backend Configuration
    /// Toggle this to test with production backend on fly.io
    /// - true: Use https://watchornot-backend.fly.dev (for testing deployed backend)
    /// - false: Use local backend (default for development)
    private static let USE_PRODUCTION_BACKEND = true

    /// API base URL
    static let apiBaseURL: String = {
        #if DEBUG
        // Check if we want to use production backend for testing
        if USE_PRODUCTION_BACKEND {
            return "https://watchornot-backend.fly.dev"
        }

        // For local development
        #if targetEnvironment(simulator)
        // iOS Simulator - use localhost
        return "http://127.0.0.1:3001"
        #else
        // Physical device - use Mac's local IP address
        // Make sure your iPhone and Mac are on the same WiFi network
        return "http://10.0.0.101:3001"
        #endif
        #else
        // Production backend (RELEASE builds always use production)
        return "https://watchornot-backend.fly.dev"
        #endif
    }()

    /// API request timeout
    static let requestTimeout: TimeInterval = 30

    /// Image upload timeout
    static let uploadTimeout: TimeInterval = 60

    /// Items per page for pagination
    static let itemsPerPage: Int = 20

    /// Maximum image size (5MB)
    static let maxImageSize: Int = 5 * 1024 * 1024

    /// JPEG compression quality
    static let imageCompressionQuality: CGFloat = 0.8

    /// Onboarding required votes (backend provides 10 movies, user must vote on 5)
    static let onboardingRequiredVotes: Int = 5

    /// Onboarding total movies provided
    static let onboardingTotalMovies: Int = 10

    /// User tier thresholds (matches backend)
    enum Tier {
        static let explorerMin = 5      // Explorer: 5-14 votes
        static let enthusiastMin = 15   // Enthusiast: 15-29 votes
        static let expertMin = 30       // Expert: 30-49 votes
        static let masterMin = 50       // Master: 50+ votes
    }
}
