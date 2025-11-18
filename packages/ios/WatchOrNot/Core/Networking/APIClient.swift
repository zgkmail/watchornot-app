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

        do {
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
                // Backend returns camelCase, not snake_case
                decoder.dateDecodingStrategy = .iso8601
                return try decoder.decode(T.self, from: data)
            } catch {
                // Log the response for debugging decoding errors
                if let responseString = String(data: data, encoding: .utf8) {
                    print("❌ Decoding Error for \(T.self)")
                    print("📥 Response JSON: \(responseString)")
                }
                throw NetworkError.decodingError(error)
            }
        } catch let urlError as URLError {
            // Check for local network permission issues
            if urlError.code == .notConnectedToInternet ||
               urlError.code == .networkConnectionLost ||
               urlError.code == .cannotFindHost ||
               urlError.code == .cannotConnectToHost {
                #if targetEnvironment(simulator)
                throw NetworkError.networkUnavailable
                #else
                // On physical device, likely a local network permission issue
                throw NetworkError.localNetworkPermissionRequired
                #endif
            }
            throw urlError
        }
    }

    /// Upload image data
    func uploadImage(
        _ endpoint: APIEndpoint,
        imageData: Data,
        mimeType: String  // Parameter kept for signature compatibility, but not sent to backend
    ) async throws -> ClaudeImageAnalysisResponse {
        var request = try buildRequest(for: endpoint)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Backend expects just "image" field with base64 data
        // Backend auto-detects image type
        let payload = ClaudeImageAnalysisRequest(
            image: imageData.base64EncodedString()
        )

        let encoder = JSONEncoder()
        request.httpBody = try encoder.encode(payload)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }

        // Log response for debugging
        if let responseString = String(data: data, encoding: .utf8) {
            print("📥 Claude API Response: \(responseString)")
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            // Try to decode error message
            if let errorResponse = try? JSONDecoder().decode(ClaudeImageAnalysisResponse.self, from: data),
               let error = errorResponse.error {
                throw NetworkError.serverError(error)
            }
            throw NetworkError.httpError(statusCode: httpResponse.statusCode)
        }

        let decoder = JSONDecoder()
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
            // Don't convert to snake_case - backend expects camelCase
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
