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
    @EnvironmentObject var appearanceManager: AppearanceManager
    @StateObject private var adManager = AdManager.shared
    @StateObject private var purchaseManager = PurchaseManager.shared
    @State private var showRecreateConfirmation = false
    @State private var showHelpAndSupport = false
    @State private var showAppearanceSettings = false
    @State private var showPurchaseSuccess = false
    @State private var showRestoreSuccess = false
    @State private var purchaseError: String?

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
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

                            // Tier explanation
                            TierExplanationView()
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

                            // Remove Ads section
                            if adManager.shouldShowAds() {
                                VStack(spacing: 12) {
                                    Button {
                                        Task {
                                            let result = await purchaseManager.purchaseRemoveAds()
                                            handlePurchaseResult(result)
                                        }
                                    } label: {
                                        HStack(spacing: 12) {
                                            Image(systemName: "sparkles")
                                                .font(.titleMedium)
                                                .foregroundColor(.yellow)

                                            VStack(alignment: .leading, spacing: 4) {
                                                Text("Remove Ads")
                                                    .font(.titleMedium)
                                                    .foregroundColor(.textPrimary)

                                                if let product = purchaseManager.products.first {
                                                    Text("One-time purchase • \(product.displayPrice)")
                                                        .font(.caption)
                                                        .foregroundColor(.textSecondary)
                                                } else {
                                                    Text("One-time purchase • $4.99")
                                                        .font(.caption)
                                                        .foregroundColor(.textSecondary)
                                                }
                                            }

                                            Spacer()

                                            if purchaseManager.isPurchasing {
                                                ProgressView()
                                            }
                                        }
                                        .padding()
                                        .cardStyle()
                                    }
                                    .disabled(purchaseManager.isPurchasing)
                                }
                                .padding(.horizontal)

                                Divider()
                                    .background(Color.divider)
                                    .padding(.horizontal)
                            } else {
                                // Ad-free status
                                VStack(spacing: 12) {
                                    HStack(spacing: 12) {
                                        Image(systemName: "checkmark.circle.fill")
                                            .font(.titleMedium)
                                            .foregroundColor(.green)

                                        VStack(alignment: .leading, spacing: 4) {
                                            Text("Ad-Free Experience")
                                                .font(.titleMedium)
                                                .foregroundColor(.textPrimary)

                                            Text("Enjoy WatchOrNot without ads")
                                                .font(.caption)
                                                .foregroundColor(.textSecondary)
                                        }

                                        Spacer()
                                    }
                                    .padding()
                                    .cardStyle()
                                }
                                .padding(.horizontal)

                                Divider()
                                    .background(Color.divider)
                                    .padding(.horizontal)
                            }

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
                                        icon: "circle.lefthalf.filled",
                                        title: "Appearance",
                                        action: {
                                            showAppearanceSettings = true
                                        }
                                    )

                                    Divider()
                                        .padding(.leading, 56)

                                    SettingsRow(
                                        icon: "arrow.clockwise",
                                        title: "Restore Purchases",
                                        action: {
                                            Task {
                                                let restored = await purchaseManager.restorePurchases()
                                                if restored {
                                                    showRestoreSuccess = true
                                                } else {
                                                    purchaseError = "No purchases found to restore"
                                                }
                                            }
                                        }
                                    )

                                    Divider()
                                        .padding(.leading, 56)

                                    SettingsRow(
                                        icon: "questionmark.circle",
                                        title: "Help and Support",
                                        action: {
                                            showHelpAndSupport = true
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

            // Banner Ad at bottom
            BannerAdView()
            }
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
        .alert("Purchase Successful", isPresented: $showPurchaseSuccess) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Ads have been removed. Enjoy WatchOrNot ad-free!")
        }
        .alert("Restore Successful", isPresented: $showRestoreSuccess) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Your purchase has been restored successfully!")
        }
        .alert("Error", isPresented: .constant(viewModel.error != nil || purchaseError != nil)) {
            Button("OK") {
                viewModel.error = nil
                purchaseError = nil
            }
        } message: {
            if let error = viewModel.error {
                Text(error)
            } else if let error = purchaseError {
                Text(error)
            }
        }
        .sheet(isPresented: $showHelpAndSupport) {
            NavigationView {
                HelpAndSupportView()
            }
        }
        .sheet(isPresented: $showAppearanceSettings) {
            AppearanceSheetContent()
                .environmentObject(appearanceManager)
        }
    }

    private func handlePurchaseResult(_ result: PurchaseResult) {
        switch result {
        case .success:
            showPurchaseSuccess = true
        case .cancelled:
            // User cancelled - do nothing
            break
        case .pending:
            purchaseError = "Purchase is pending approval"
        case .failed(let error):
            purchaseError = error.localizedDescription
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

struct TierExplanationView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("How Profile Tier Works")
                .font(.titleSmall)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)

            Text("Vote on movies to level up your profile and unlock tiers")
                .font(.caption)
                .foregroundColor(.textSecondary)

            VStack(alignment: .leading, spacing: 8) {
                TierRow(emoji: "🌱", name: "Newcomer", votesRequired: "0-4 votes")
                TierRow(emoji: "🎬", name: "Explorer", votesRequired: "5-14 votes")
                TierRow(emoji: "🎥", name: "Enthusiast", votesRequired: "15-29 votes")
                TierRow(emoji: "⭐", name: "Expert", votesRequired: "30-49 votes")
                TierRow(emoji: "👑", name: "Master", votesRequired: "50+ votes")
            }
        }
        .padding()
        .cardStyle()
    }
}

struct TierRow: View {
    let emoji: String
    let name: String
    let votesRequired: String

    var body: some View {
        HStack(spacing: 8) {
            Text(emoji)
                .font(.bodyMedium)

            Text(name)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.textPrimary)

            Spacer()

            Text(votesRequired)
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

struct AppearanceSettingsView: View {
    @EnvironmentObject var appearanceManager: AppearanceManager
    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack {
            Color.background.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 16) {
                    Text("Choose how WatchOrNot looks on your device")
                        .font(.bodyMedium)
                        .foregroundColor(.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.top)

                    VStack(spacing: 0) {
                        ForEach(AppearanceManager.AppearanceMode.allCases) { mode in
                            AppearanceModeRow(
                                mode: mode,
                                isSelected: appearanceManager.userPreference == mode
                            ) {
                                appearanceManager.userPreference = mode
                            }

                            if mode != AppearanceManager.AppearanceMode.allCases.last {
                                Divider()
                                    .padding(.leading, 56)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
        }
        .navigationTitle("Appearance")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Done") {
                    dismiss()
                }
            }
        }
    }
}

struct AppearanceModeRow: View {
    let mode: AppearanceManager.AppearanceMode
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: mode.icon)
                    .font(.titleMedium)
                    .foregroundColor(.accent)
                    .frame(width: 24)

                VStack(alignment: .leading, spacing: 2) {
                    Text(mode.rawValue)
                        .font(.bodyLarge)
                        .foregroundColor(.textPrimary)

                    Text(mode.description)
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.bodyMedium)
                        .foregroundColor(.accent)
                }
            }
            .padding(.vertical, 12)
        }
    }
}

struct AppearanceSheetContent: View {
    @EnvironmentObject var appearanceManager: AppearanceManager

    var body: some View {
        NavigationView {
            AppearanceSettingsView()
                .environmentObject(appearanceManager)
        }
        .presentationBackground(Color.background)
        .presentationCornerRadius(20)
        .applyAppearance(appearanceManager.colorScheme)
    }
}

#Preview {
    SimplifiedProfileView()
        .environmentObject(SessionManager.shared)
        .environmentObject(AppState())
        .environmentObject(AppearanceManager())
}
