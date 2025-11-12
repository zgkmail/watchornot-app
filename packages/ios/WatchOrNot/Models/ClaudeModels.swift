//
//  ClaudeModels.swift
//  WatchOrNot
//
//  Claude Vision API models
//

import Foundation

/// Request for Claude image analysis
struct ClaudeImageAnalysisRequest: Codable {
    let image: String  // base64 encoded
    let mimeType: String

    enum CodingKeys: String, CodingKey {
        case image = "imageBase64"
        case mimeType
    }
}

/// Response from Claude image analysis
struct ClaudeImageAnalysisResponse: Codable {
    let success: Bool
    let data: AnalysisData?
    let error: String?
    let rateLimitRemaining: Int?

    struct AnalysisData: Codable {
        let title: String
        let year: Int?
        let confidence: String?
        let reasoning: String?
    }

    enum CodingKeys: String, CodingKey {
        case success, data, error
        case rateLimitRemaining = "rate_limit_remaining"
    }
}
