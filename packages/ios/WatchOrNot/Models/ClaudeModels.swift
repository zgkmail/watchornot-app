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

    // Backend expects "image" field with base64 data
    // Backend auto-detects image type, so no mimeType needed
}

/// Response from Claude image analysis
struct ClaudeImageAnalysisResponse: Codable {
    let title: String?
    let year: Int?
    let mediaType: String?  // "movie" or "tv"
    let confidence: Double?
    let model: String?
    let processingTime: Int?
    let message: String?
    let error: String?

    enum CodingKeys: String, CodingKey {
        case title, year, confidence, model, message, error
        case mediaType = "media_type"
        case processingTime
    }
}
