//
//  ContentView.swift
//  WatchOrNot
//
//  Created by Claude
//  Copyright © 2024 WatchOrNot. All rights reserved.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var sessionManager: SessionManager
    @State private var selectedTab = 0

    var body: some View {
        Group {
            // Show welcome screens if user hasn't seen them
            if !appState.hasSeenWelcome {
                WelcomeView()
            }
            // Show onboarding if triggered from welcome screen or not completed
            else if appState.showingOnboarding || !appState.hasCompletedOnboarding {
                OnboardingView()
            }
            // Show main app
            else {
                TabView(selection: $selectedTab) {
                    MovieSnapView()
                        .tabItem {
                            Label("Snap", systemImage: "camera")
                        }
                        .tag(0)

                    HistoryView()
                        .tabItem {
                            Label("History", systemImage: "clock")
                        }
                        .tag(1)

                    SimplifiedProfileView()
                        .tabItem {
                            Label("Profile", systemImage: "person")
                        }
                        .tag(2)
                }
                .accentColor(.accent)
            }
        }
        .alert("Error", isPresented: .constant(appState.errorMessage != nil)) {
            Button("OK") {
                appState.clearError()
            }
        } message: {
            if let error = appState.errorMessage {
                Text(error)
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
        .environmentObject(SessionManager.shared)
}
