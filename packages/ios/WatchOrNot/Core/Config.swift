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

    /// Onboarding movie count
    static let onboardingMovieCount: Int = 10

    /// User tier thresholds
    enum Tier {
        static let newcomerMax = 10
        static let explorerMax = 25
        static let enthusiastMax = 50
        static let aficionadoMax = 100
        static let masterMin = 101
    }
}
