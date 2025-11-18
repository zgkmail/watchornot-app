//
//  MovieSnapView.swift
//  WatchOrNot
//
//  MovieSnap main view
//

import SwiftUI

struct MovieSnapView: View {
    @StateObject private var viewModel = MovieSnapViewModel()

    var body: some View {
        NavigationView {
            ZStack {
                Color.background.ignoresSafeArea()

                VStack(spacing: 24) {
                    if let movieDetails = viewModel.movieDetails {
                        // Show movie details
                        MovieDetailsResultView(
                            movieDetails: movieDetails,
                            analysisData: viewModel.analysisResult,
                            votedCount: viewModel.votedCount,
                            currentRating: viewModel.currentRating,
                            badge: viewModel.badge,
                            badgeEmoji: viewModel.badgeEmoji,
                            badgeDescription: viewModel.badgeDescription,
                            onRating: { rating in
                                Task {
                                    await viewModel.submitRating(rating)
                                }
                            },
                            onSkip: {
                                viewModel.skipRating()
                            },
                            onWrongTitle: {
                                viewModel.handleWrongTitle()
                            },
                            onReset: { viewModel.reset() }
                        )
                    } else if viewModel.isAnalyzing || viewModel.isLoadingDetails {
                        // Analyzing or loading
                        AnalyzingView()
                    } else {
                        // Initial state - show options
                        SnapPromptView(
                            onTakePhoto: { viewModel.openCamera() },
                            onUploadImage: { viewModel.openPhotoPicker() },
                            onSearch: { query in
                                Task {
                                    await viewModel.searchMovie(query: query)
                                }
                            }
                        )
                    }
                }
            }
            .navigationTitle("Movie Snap")
            .navigationBarTitleDisplayMode(.large)
            .sheet(isPresented: $viewModel.showCamera) {
                CameraView { image in
                    viewModel.showCamera = false
                    Task {
                        await viewModel.analyzeImage(image)
                    }
                }
            }
            .sheet(isPresented: $viewModel.showPhotoPicker) {
                PhotoPicker { image in
                    viewModel.showPhotoPicker = false
                    Task {
                        await viewModel.analyzeImage(image)
                    }
                }
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
}

struct SnapPromptView: View {
    let onTakePhoto: () -> Void
    let onUploadImage: () -> Void
    let onSearch: (String) -> Void

    @State private var searchQuery: String = ""
    @FocusState private var isSearchFocused: Bool

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                Spacer()
                    .frame(height: 20)

                // Icon
                ZStack {
                    Circle()
                        .fill(Color.accent.opacity(0.2))
                        .frame(width: 120, height: 120)

                    Image(systemName: "camera.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.accent)
                }

                // Title
                VStack(spacing: 12) {
                    Text("Discover Movies")
                        .font(.headlineLarge)
                        .foregroundColor(.textPrimary)

                    Text("Snap, upload, or search\nto find your next watch")
                        .font(.bodyMedium)
                        .foregroundColor(.textSecondary)
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)
                }

                // Action Buttons
                VStack(spacing: 16) {
                    // Take Photo Button
                    Button {
                        onTakePhoto()
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: "camera")
                                .font(.titleMedium)

                            Text("Take Photo")
                                .font(.titleMedium)
                                .fontWeight(.semibold)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background(
                            LinearGradient(
                                colors: [Color.blue, Color.purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(16)
                        .shadow(color: .blue.opacity(0.3), radius: 10, x: 0, y: 4)
                    }

                    // Upload Image Button
                    Button {
                        onUploadImage()
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: "photo")
                                .font(.titleMedium)

                            Text("Upload Image")
                                .font(.titleMedium)
                                .fontWeight(.semibold)
                        }
                        .foregroundColor(.accent)
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background(Color.surface)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Color.accent, lineWidth: 2)
                        )
                        .cornerRadius(16)
                    }

                    // Manual Search Field
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 12) {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.textSecondary)

                            TextField("Enter movie or TV show name...", text: $searchQuery)
                                .font(.bodyMedium)
                                .foregroundColor(.textPrimary)
                                .focused($isSearchFocused)
                                .submitLabel(.search)
                                .onSubmit {
                                    if !searchQuery.isEmpty {
                                        onSearch(searchQuery)
                                    }
                                }

                            if !searchQuery.isEmpty {
                                Button {
                                    searchQuery = ""
                                } label: {
                                    Image(systemName: "xmark.circle.fill")
                                        .foregroundColor(.textSecondary)
                                }
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 16)
                        .background(Color.surface)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(isSearchFocused ? Color.accent : Color.gray.opacity(0.3), lineWidth: isSearchFocused ? 2 : 1)
                        )
                        .cornerRadius(16)

                        if !searchQuery.isEmpty {
                            Button {
                                onSearch(searchQuery)
                            } label: {
                                HStack {
                                    Spacer()
                                    Text("Search")
                                        .font(.bodyMedium)
                                        .fontWeight(.semibold)
                                    Image(systemName: "arrow.right")
                                }
                                .foregroundColor(.accent)
                                .padding(.horizontal, 4)
                            }
                        }
                    }
                }
                .padding(.horizontal, 32)

                Spacer()
            }
        }
        .scrollDismissesKeyboard(.interactively)
    }
}

struct AnalyzingView: View {
    var body: some View {
        VStack(spacing: 24) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: .accent))
                .scaleEffect(1.5)

            VStack(spacing: 8) {
                Text("Analyzing Poster")
                    .font(.headlineSmall)
                    .foregroundColor(.textPrimary)

                Text("Using Claude Vision AI...")
                    .font(.bodyMedium)
                    .foregroundColor(.textSecondary)
            }
        }
    }
}

#Preview {
    MovieSnapView()
}
