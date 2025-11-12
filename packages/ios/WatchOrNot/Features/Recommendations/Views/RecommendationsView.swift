//
//  RecommendationsView.swift
//  WatchOrNot
//
//  Recommendations main view
//

import SwiftUI

struct RecommendationsView: View {
    @StateObject private var viewModel = RecommendationsViewModel()

    var body: some View {
        NavigationView {
            ZStack {
                Color.background.ignoresSafeArea()

                if viewModel.isLoading && viewModel.movies.isEmpty {
                    LoadingView()
                } else if viewModel.movies.isEmpty {
                    EmptyStateView()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            // Header with preferences
                            if let preferences = viewModel.preferences {
                                PreferencesHeaderView(preferences: preferences)
                                    .padding(.horizontal)
                                    .padding(.top, 8)
                            }

                            // Movie list
                            ForEach(viewModel.movies) { movie in
                                MovieListItemView(movie: movie)
                                    .padding(.horizontal)
                                    .onAppear {
                                        if viewModel.shouldLoadMore(currentItem: movie) {
                                            Task {
                                                await viewModel.loadMore()
                                            }
                                        }
                                    }
                            }

                            // Loading more indicator
                            if viewModel.isLoadingMore {
                                ProgressView()
                                    .padding()
                            }
                        }
                        .padding(.vertical)
                    }
                    .refreshable {
                        await viewModel.refresh()
                    }
                }
            }
            .navigationTitle("Discover")
            .navigationBarTitleDisplayMode(.large)
        }
        .task {
            await viewModel.loadRecommendations()
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

struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "film.stack")
                .font(.system(size: 64))
                .foregroundColor(.textTertiary)

            Text("No Recommendations Yet")
                .font(.headlineSmall)
                .foregroundColor(.textPrimary)

            Text("Complete the onboarding to get personalized movie recommendations")
                .font(.bodyMedium)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
    }
}

#Preview {
    RecommendationsView()
}
