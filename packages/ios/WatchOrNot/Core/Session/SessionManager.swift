//
//  SessionManager.swift
//  WatchOrNot
//
//  Session management with Keychain storage
//

import Foundation
import Security

/// Manages user session and authentication
@MainActor
class SessionManager: ObservableObject {
    static let shared = SessionManager()

    @Published private(set) var sessionID: String?
    @Published private(set) var userID: String?
    @Published var isAuthenticated: Bool = false

    private let sessionIDKey = "com.watchornot.sessionID"
    private let userIDKey = "com.watchornot.userID"

    private init() {
        loadSession()
    }

    /// Load session from Keychain
    func loadSession() {
        sessionID = loadFromKeychain(key: sessionIDKey)
        userID = loadFromKeychain(key: userIDKey)
        isAuthenticated = sessionID != nil
    }

    /// Save session ID to Keychain
    func saveSessionID(_ id: String) {
        sessionID = id
        isAuthenticated = true
        saveToKeychain(key: sessionIDKey, value: id)
    }

    /// Save user ID to Keychain
    func saveUserID(_ id: String) {
        userID = id
        saveToKeychain(key: userIDKey, value: id)
    }

    /// Get current session ID
    func getSessionID() -> String? {
        return sessionID
    }

    /// Clear session (logout)
    func clearSession() {
        sessionID = nil
        userID = nil
        isAuthenticated = false
        deleteFromKeychain(key: sessionIDKey)
        deleteFromKeychain(key: userIDKey)
        UserDefaults.standard.removeObject(forKey: "hasCompletedOnboarding")
    }

    // MARK: - Keychain Helpers

    private func saveToKeychain(key: String, value: String) {
        let data = value.data(using: .utf8)!

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]

        // Delete existing item
        SecItemDelete(query as CFDictionary)

        // Add new item
        let status = SecItemAdd(query as CFDictionary, nil)

        if status != errSecSuccess {
            print("Error saving to Keychain: \(status)")
        }
    }

    private func loadFromKeychain(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)

        guard status == errSecSuccess,
              let data = item as? Data,
              let value = String(data: data, encoding: .utf8) else {
            return nil
        }

        return value
    }

    private func deleteFromKeychain(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]

        SecItemDelete(query as CFDictionary)
    }
}
