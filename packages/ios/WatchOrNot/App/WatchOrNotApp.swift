//
//  WatchOrNotApp.swift
//  WatchOrNot
//
//  Created by Claude
//  Copyright © 2024 WatchOrNot. All rights reserved.
//

import SwiftUI

@main
struct WatchOrNotApp: App {
    @StateObject private var sessionManager = SessionManager.shared
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(sessionManager)
                .environmentObject(appState)
                .preferredColorScheme(.dark)
        }
    }
}

/// App-wide state management
@MainActor
class AppState: ObservableObject {
    @Published var hasCompletedOnboarding: Bool = false
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    init() {
        checkOnboardingStatus()
    }

    func checkOnboardingStatus() {
        // Check if user has completed onboarding
        hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
    }

    func completeOnboarding() {
        hasCompletedOnboarding = true
        UserDefaults.standard.set(true, forKey: "hasCompletedOnboarding")
    }

    func showError(_ message: String) {
        errorMessage = message
    }

    func clearError() {
        errorMessage = nil
    }
}
