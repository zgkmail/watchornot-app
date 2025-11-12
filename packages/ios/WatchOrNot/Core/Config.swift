//
//  Config.swift
//  WatchOrNot
//
//  App configuration
//

import Foundation

enum Config {
    /// API base URL
    static let apiBaseURL: String = {
        #if DEBUG
        // For local development
        // Use ngrok or your Mac's IP address when testing on device
        return "http://localhost:3000"
        #else
        // Production backend
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
