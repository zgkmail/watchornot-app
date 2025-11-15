//
//  SimplifiedProfileView.swift
//  WatchOrNot
//
//  Simplified profile view matching web app design
//

import SwiftUI

struct SimplifiedProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    @EnvironmentObject var sessionManager: SessionManager
    @EnvironmentObject var appState: AppState
    @State private var showRecreateConfirmation = false

    var body: some View {
        NavigationView {
            ZStack {
                Color.background.ignoresSafeArea()

                if viewModel.isLoading && viewModel.userStats == nil {
                    LoadingView()
                } else {
                    ScrollView {
                        VStack(spacing: 24) {
                            // User stats card (tier badge)
                            if let stats = viewModel.userStats {
                                TierBadgeView(stats: stats)
                                    .padding(.horizontal)
                            }

                            // Badge explanation
                            BadgeExplanationView()
                                .padding(.horizontal)

                            Divider()
                                .background(Color.divider)
                                .padding(.horizontal)

                            // Recreate taste profile button
                            VStack(spacing: 12) {
                                Button {
                                    showRecreateConfirmation = true
                                } label: {
                                    HStack(spacing: 12) {
                                        Image(systemName: "arrow.triangle.2.circlepath")
                                            .font(.titleMedium)
                                            .foregroundColor(.purple)

                                        Text("Recreate Taste Profile")
                                            .font(.titleMedium)
                                            .foregroundColor(.textPrimary)

                                        Spacer()
                                    }
                                    .padding()
                                    .cardStyle()
                                }
                                .padding(.horizontal)
                            }

                            Divider()
                                .background(Color.divider)
                                .padding(.horizontal)

                            // Settings section
                            VStack(alignment: .leading, spacing: 16) {
                                Text("Settings & Account")
                                    .font(.headlineSmall)
                                    .foregroundColor(.textPrimary)
                                    .padding(.horizontal)

                                VStack(spacing: 0) {
                                    SettingsRow(
                                        icon: "person.circle",
                                        title: "Account",
                                        action: {
                                            // TODO: Show account details
                                        }
                                    )

                                    Divider()
                                        .padding(.leading, 56)

                                    SettingsRow(
                                        icon: "questionmark.circle",
                                        title: "Help and Support",
                                        action: {
                                            // TODO: Show help
                                        }
                                    )
                                }
                                .padding(.horizontal)
                            }
                        }
                        .padding(.vertical)
                        .padding(.bottom, 24)
                    }
                    .refreshable {
                        await viewModel.loadStats()
                    }
                }
            }
            .navigationTitle("Your Taste Profile")
            .navigationBarTitleDisplayMode(.large)
        }
        .task {
            await viewModel.loadStats()
        }
        .alert("Recreate Taste Profile", isPresented: $showRecreateConfirmation) {
            Button("Cancel", role: .cancel) {}
            Button("Delete All & Restart", role: .destructive) {
                Task {
                    await viewModel.recreateTasteProfile()
                    appState.hasCompletedOnboarding = false
                }
            }
        } message: {
            Text("Are you sure you want to recreate your taste profile? This will delete all your ratings and restart the onboarding survey.")
        }
        .alert("Error", isPresented: .constant(viewModel.error != nil)) {
            Button("OK") {
                viewModel.error = nil
            }
        } message: {
            if let error = viewModel.error {
                Text(error)
            }
        }
    }
}

struct TierBadgeView: View {
    let stats: UserStats

    var body: some View {
        VStack(spacing: 20) {
            // Circular tier badge
            ZStack {
                // Background circle
                Circle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 12)
                    .frame(width: 176, height: 176)

                // Progress circle
                Circle()
                    .trim(from: 0, to: stats.progress)
                    .stroke(tierColor, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                    .frame(width: 176, height: 176)
                    .rotationEffect(.degrees(-90))
                    .animation(.linear, value: stats.progress)

                // Center content
                VStack(spacing: 8) {
                    Text(stats.tier.emoji)
                        .font(.system(size: 60))

                    Text(stats.tier.displayName)
                        .font(.titleLarge)
                        .fontWeight(.bold)
                        .foregroundColor(.textPrimary)

                    Text("\(stats.totalVotes) \(stats.totalVotes == 1 ? "vote" : "votes")")
                        .font(.bodySmall)
                        .foregroundColor(.textSecondary)
                }
            }

            // Progress text
            if let nextTierVotes = stats.nextTierVotes {
                Text("\(nextTierVotes - stats.totalVotes) more \(nextTierVotes - stats.totalVotes == 1 ? "vote" : "votes") to reach **\(nextTierName(stats.tier))**")
                    .font(.bodyMedium)
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
            } else {
                Text("✨ Maximum tier achieved! You're a movie expert!")
                    .font(.bodyMedium)
                    .fontWeight(.semibold)
                    .foregroundColor(.success)
                    .multilineTextAlignment(.center)
            }
        }
        .padding()
    }

    private var tierColor: Color {
        switch stats.tier {
        case .newcomer: return .gray
        case .explorer: return .green
        case .enthusiast: return .purple
        case .expert: return .blue
        case .master: return .yellow
        }
    }

    private func nextTierName(_ tier: UserTier) -> String {
        switch tier {
        case .newcomer: return "Explorer"
        case .explorer: return "Enthusiast"
        case .enthusiast: return "Expert"
        case .expert: return "Master"
        case .master: return ""
        }
    }
}

struct BadgeExplanationView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("How Recommendation Badge Works")
                .font(.titleSmall)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)

            Text("Based on IMDb score + your genre, director, and cast preferences")
                .font(.caption)
                .foregroundColor(.textSecondary)

            VStack(alignment: .leading, spacing: 8) {
                BadgeRow(emoji: "🎯", text: "Perfect Match - This is right up your alley!")
                BadgeRow(emoji: "⭐", text: "Great Pick - You'll probably enjoy this")
                BadgeRow(emoji: "👍", text: "Worth a Try - Give it a shot")
                BadgeRow(emoji: "🤷", text: "Mixed Feelings - Could go either way")
                BadgeRow(emoji: "❌", text: "Not Your Style - Probably skip this")
            }
        }
        .padding()
        .cardStyle()
    }
}

struct BadgeRow: View {
    let emoji: String
    let text: String

    var body: some View {
        HStack(spacing: 8) {
            Text(emoji)
                .font(.bodyMedium)

            Text(text)
                .font(.caption)
                .foregroundColor(.textSecondary)
        }
    }
}

struct SettingsRow: View {
    let icon: String
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.titleMedium)
                    .foregroundColor(.accent)
                    .frame(width: 24)

                Text(title)
                    .font(.bodyLarge)
                    .foregroundColor(.textPrimary)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.textTertiary)
            }
            .padding(.vertical, 12)
        }
    }
}

#Preview {
    SimplifiedProfileView()
        .environmentObject(SessionManager.shared)
        .environmentObject(AppState())
}
