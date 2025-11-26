//
//  OnboardingView.swift
//  WatchOrNot
//
//  Onboarding flow main view
//

import SwiftUI

struct OnboardingView: View {
    @StateObject private var viewModel = OnboardingViewModel()
    @EnvironmentObject var appState: AppState

    // Computed property to determine if error is skip validation
    private var isSkipValidationError: Bool {
        guard let error = viewModel.error else { return false }
        return error.contains("Need") && error.contains("more vote")
    }

    // Computed property for dynamic alert title
    private var alertTitle: String {
        if isSkipValidationError {
            return "Almost There!"
        } else {
            return "Connection Issue"
        }
    }

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color.gradientStart, Color.gradientEnd],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                if viewModel.isComplete {
                    OnboardingCompleteView()
                } else if viewModel.isSubmitting {
                    // Submitting votes to server
                    VStack(spacing: 24) {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.5)

                        Text("Saving your preferences...")
                            .font(.bodyMedium)
                            .foregroundColor(.textSecondary)
                    }
                } else if let movie = viewModel.currentMovie {
                    VStack(spacing: 20) {
                        // Header
                        OnboardingHeaderView(
                            progress: viewModel.progress,
                            votesRemaining: viewModel.votesRemaining
                        )
                        .padding(.horizontal)
                        .padding(.top, 20)

                        // Movie card
                        MovieCardView(movie: movie)
                            .padding(.horizontal, 24)

                        // Vote buttons
                        VoteButtonsView(
                            onUpvote: { await viewModel.vote(.up) },
                            onDownvote: { await viewModel.vote(.down) },
                            onSkip: { await viewModel.skip() }
                        )
                        .padding(.horizontal, 40)
                        .padding(.bottom, 40)
                    }
                } else {
                    // Loading state
                    VStack(spacing: 16) {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.5)

                        Text("Preparing your movies...")
                            .font(.bodyMedium)
                            .foregroundColor(.textSecondary)
                    }
                }
            }
        }
        .task {
            await viewModel.loadMovies()
        }
        .alert(alertTitle, isPresented: .constant(viewModel.error != nil)) {
            if isSkipValidationError {
                // User needs more votes - offer to continue or skip to app
                Button("Continue Voting") {
                    viewModel.error = nil
                    Task {
                        await viewModel.loadMoreMovies()
                    }
                }
                Button("Skip to App") {
                    viewModel.error = nil
                    appState.skipOnboarding()
                }
            } else {
                // Connection or other error - offer to retry
                Button("Try Again") {
                    viewModel.error = nil
                    Task {
                        await viewModel.loadMovies()
                    }
                }
                Button("Cancel", role: .cancel) {
                    viewModel.error = nil
                }
            }
        } message: {
            if let error = viewModel.error {
                // Show helpful message for local network permission
                if error.contains("Local network access required") {
                    Text("To connect to your local server, Watch or Skip needs permission to access your local network.\n\nPlease tap \"Allow\" when prompted, then tap \"Try Again\".")
                } else {
                    Text(error)
                }
            }
        }
    }
}

#Preview {
    OnboardingView()
        .environmentObject(AppState())
}
