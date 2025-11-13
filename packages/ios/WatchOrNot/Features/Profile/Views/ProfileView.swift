//
//  ProfileView.swift
//  WatchOrNot
//
//  Profile main view
//

import SwiftUI

struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    @EnvironmentObject var sessionManager: SessionManager
    @State private var selectedEntry: HistoryEntry?

    var body: some View {
        NavigationView {
            ZStack {
                Color.background.ignoresSafeArea()

                if viewModel.isLoading && viewModel.userStats == nil {
                    LoadingView()
                } else {
                    ScrollView {
                        VStack(spacing: 24) {
                            // User stats card
                            if let stats = viewModel.userStats {
                                UserStatsCard(stats: stats)
                                    .padding(.horizontal)
                            }

                            // History section
                            VStack(alignment: .leading, spacing: 16) {
                                Text("Vote History")
                                    .font(.headlineSmall)
                                    .foregroundColor(.textPrimary)
                                    .padding(.horizontal)

                                if viewModel.history.isEmpty {
                                    EmptyVoteHistoryView()
                                        .padding(.horizontal)
                                } else {
                                    ForEach(viewModel.history) { entry in
                                        HistoryEntryView(
                                            entry: entry,
                                            votedCount: viewModel.userStats?.totalVotes ?? 0,
                                            onDelete: {
                                                Task {
                                                    await viewModel.deleteEntry(entry)
                                                }
                                            },
                                            onRatingToggle: { newRating in
                                                Task {
                                                    await viewModel.updateRating(entry, newRating: newRating)
                                                }
                                            },
                                            onTap: {
                                                selectedEntry = entry
                                            }
                                        )
                                        .padding(.horizontal)
                                    }

                                    if viewModel.isLoadingHistory {
                                        ProgressView()
                                            .padding()
                                    }
                                }
                            }
                        }
                        .padding(.vertical)
                    }
                    .refreshable {
                        await viewModel.refresh()
                    }
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        // TODO: Show settings
                    } label: {
                        Image(systemName: "gearshape")
                            .foregroundColor(.accent)
                    }
                }
            }
        }
        .task {
            await viewModel.loadStats()
            await viewModel.loadHistory()
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
        .sheet(item: $selectedEntry) { entry in
            MovieDetailView(
                entry: entry,
                votedCount: viewModel.userStats?.totalVotes ?? 0,
                onRatingChange: { newRating in
                    Task {
                        await viewModel.updateRating(entry, newRating: newRating)
                    }
                },
                onDelete: {
                    Task {
                        await viewModel.deleteEntry(entry)
                        selectedEntry = nil
                    }
                }
            )
        }
    }
}

struct EmptyVoteHistoryView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "clock")
                .font(.system(size: 48))
                .foregroundColor(.textTertiary)

            Text("No vote history yet")
                .font(.bodyMedium)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .cardStyle()
    }
}

#Preview {
    ProfileView()
        .environmentObject(SessionManager.shared)
}
