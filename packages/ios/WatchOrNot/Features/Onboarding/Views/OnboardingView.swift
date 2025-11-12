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
        .alert("Error", isPresented: .constant(viewModel.error != nil)) {
            Button("Try Again") {
                viewModel.error = nil
                Task {
                    await viewModel.loadMovies()
                }
            }
            Button("Cancel", role: .cancel) {
                viewModel.error = nil
            }
        } message: {
            if let error = viewModel.error {
                Text(error)
            }
        }
    }
}

#Preview {
    OnboardingView()
        .environmentObject(AppState())
}
