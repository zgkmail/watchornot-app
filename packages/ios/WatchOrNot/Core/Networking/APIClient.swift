//
//  APIClient.swift
//  WatchOrNot
//
//  Core networking client for API communication
//

import Foundation

/// Main API client for handling HTTP requests
@MainActor
class APIClient: ObservableObject {
    static let shared = APIClient()

    private let baseURL: URL
    private let session: URLSession

    init(baseURL: String = Config.apiBaseURL) {
        guard let url = URL(string: baseURL) else {
            fatalError("Invalid base URL: \(baseURL)")
        }
        self.baseURL = url

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 300
        config.httpAdditionalHeaders = [
            "Content-Type": "application/json",
            "Accept": "application/json"
        ]
        self.session = URLSession(configuration: config)
    }

    /// Make a generic API request
    func request<T: Decodable>(
        _ endpoint: APIEndpoint,
        expecting type: T.Type
    ) async throws -> T {
        let request = try buildRequest(for: endpoint)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }

        // Store session ID if present
        if let sessionID = httpResponse.value(forHTTPHeaderField: "X-Session-ID") {
            SessionManager.shared.saveSessionID(sessionID)
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.httpError(statusCode: httpResponse.statusCode)
        }

        do {
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(T.self, from: data)
        } catch {
            throw NetworkError.decodingError(error)
        }
    }

    /// Upload image data
    func uploadImage(
        _ endpoint: APIEndpoint,
        imageData: Data,
        mimeType: String
    ) async throws -> ClaudeImageAnalysisResponse {
        var request = try buildRequest(for: endpoint)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload = ClaudeImageAnalysisRequest(
            image: imageData.base64EncodedString(),
            mimeType: mimeType
        )

        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        request.httpBody = try encoder.encode(payload)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.httpError(statusCode: httpResponse.statusCode)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(ClaudeImageAnalysisResponse.self, from: data)
    }

    private func buildRequest(for endpoint: APIEndpoint) throws -> URLRequest {
        let url = baseURL.appendingPathComponent(endpoint.path)
        var components = URLComponents(url: url, resolvingAgainstBaseURL: true)
        components?.queryItems = endpoint.queryItems

        guard let finalURL = components?.url else {
            throw NetworkError.invalidURL
        }

        var request = URLRequest(url: finalURL)
        request.httpMethod = endpoint.method.rawValue

        // Add session ID if available
        if let sessionID = SessionManager.shared.getSessionID() {
            request.setValue(sessionID, forHTTPHeaderField: "X-Session-ID")
        }

        // Add body if needed
        if let body = endpoint.body {
            let encoder = JSONEncoder()
            encoder.keyEncodingStrategy = .convertToSnakeCase
            request.httpBody = try encoder.encode(body)
        }

        return request
    }
}

/// HTTP methods
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
    case patch = "PATCH"
}
