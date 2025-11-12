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
            if !appState.hasCompletedOnboarding {
                OnboardingView()
            } else {
                TabView(selection: $selectedTab) {
                    RecommendationsView()
                        .tabItem {
                            Label("Discover", systemImage: "film")
                        }
                        .tag(0)

                    MovieSnapView()
                        .tabItem {
                            Label("Snap", systemImage: "camera")
                        }
                        .tag(1)

                    ProfileView()
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
