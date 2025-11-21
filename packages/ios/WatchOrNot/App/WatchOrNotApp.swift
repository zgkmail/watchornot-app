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
    @StateObject private var appearanceManager = AppearanceManager()
    @StateObject private var adManager = AdManager.shared
    @StateObject private var purchaseManager = PurchaseManager.shared

    init() {
        // Initialize AdMob on app launch (if user hasn't purchased ad removal)
        Task { @MainActor in
            AdManager.shared.initializeAdMob()
            await PurchaseManager.shared.loadProducts()

            // Pre-load first interstitial ad
            InterstitialAdManager.shared.loadAd()
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(sessionManager)
                .environmentObject(appState)
                .environmentObject(appearanceManager)
                .environmentObject(adManager)
                .environmentObject(purchaseManager)
                .applyAppearance(appearanceManager.colorScheme)
        }
    }
}

struct AppearanceModifier: ViewModifier {
    let colorScheme: ColorScheme?

    func body(content: Content) -> some View {
        content.preferredColorScheme(colorScheme)
    }
}

extension View {
    func applyAppearance(_ colorScheme: ColorScheme?) -> some View {
        self.modifier(AppearanceModifier(colorScheme: colorScheme))
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

    private let apiClient = APIClient.shared

    init() {
        checkWelcomeAndOnboardingStatus()

        // Trigger network permission prompt early (non-blocking)
        Task {
            await performHealthCheck()
        }
    }

    func checkWelcomeAndOnboardingStatus() {
        // Check if user has seen welcome screens
        hasSeenWelcome = UserDefaults.standard.bool(forKey: "hasSeenWelcome")

        // Check if user has completed onboarding
        hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
    }

    /// Perform health check to trigger local network permission prompt early
    private func performHealthCheck() async {
        #if !targetEnvironment(simulator)
        // Only on physical devices (local network permission needed)
        do {
            struct HealthResponse: Codable {
                let status: String
            }
            _ = try await apiClient.request(.healthCheck, expecting: HealthResponse.self)
            print("✅ Health check succeeded - local network permission granted")
        } catch {
            // Silently fail - permission will be requested again when needed
            print("⚠️ Health check failed (expected on first launch): \(error.localizedDescription)")
        }
        #endif
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
