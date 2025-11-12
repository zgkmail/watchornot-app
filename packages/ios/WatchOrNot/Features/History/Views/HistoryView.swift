//
//  HistoryView.swift
//  WatchOrNot
//
//  History tab view
//

import SwiftUI

struct HistoryView: View {
    @StateObject private var viewModel = HistoryViewModel()

    var body: some View {
        NavigationView {
            ZStack {
                Color.background.ignoresSafeArea()

                if viewModel.isLoading && viewModel.history.isEmpty {
                    LoadingView()
                } else if viewModel.history.isEmpty {
                    EmptyHistoryView()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(viewModel.history) { entry in
                                HistoryEntryView(entry: entry) {
                                    Task {
                                        await viewModel.deleteEntry(entry)
                                    }
                                }
                                .padding(.horizontal)
                            }

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
            .navigationTitle("Your Snap History")
            .navigationBarTitleDisplayMode(.large)
        }
        .task {
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
    }
}

struct EmptyHistoryView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "clock")
                .font(.system(size: 64))
                .foregroundColor(.textTertiary)

            Text("No titles yet")
                .font(.headlineSmall)
                .foregroundColor(.textPrimary)

            Text("Start snapping!")
                .font(.bodyMedium)
                .foregroundColor(.textSecondary)
        }
    }
}

#Preview {
    HistoryView()
}
