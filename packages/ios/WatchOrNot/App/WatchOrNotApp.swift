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
    @Published var hasSeenWelcome: Bool = false
    @Published var hasCompletedOnboarding: Bool = false
    @Published var showingOnboarding: Bool = false
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    init() {
        checkWelcomeAndOnboardingStatus()
    }

    func checkWelcomeAndOnboardingStatus() {
        // Check if user has seen welcome screens
        hasSeenWelcome = UserDefaults.standard.bool(forKey: "hasSeenWelcome")

        // Check if user has completed onboarding
        hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
    }

    func markWelcomeSeen() {
        hasSeenWelcome = true
        UserDefaults.standard.set(true, forKey: "hasSeenWelcome")
    }

    func showOnboarding() {
        showingOnboarding = true
    }

    func skipOnboarding() {
        // Mark both welcome and onboarding as complete when skipped
        hasSeenWelcome = true
        hasCompletedOnboarding = true
        UserDefaults.standard.set(true, forKey: "hasSeenWelcome")
        UserDefaults.standard.set(true, forKey: "hasCompletedOnboarding")
    }

    func completeOnboarding() {
        hasCompletedOnboarding = true
        showingOnboarding = false
        UserDefaults.standard.set(true, forKey: "hasCompletedOnboarding")
    }

    func showError(_ message: String) {
        errorMessage = message
    }

    func clearError() {
        errorMessage = nil
    }
}
