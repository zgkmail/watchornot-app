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
                            initialSearchQuery: viewModel.searchQuery,
                            onTakePhoto: { viewModel.openCamera() },
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
            .fullScreenCover(isPresented: $viewModel.showCamera) {
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
    let initialSearchQuery: String
    let onTakePhoto: () -> Void
    let onSearch: (String) -> Void

    @State private var searchQuery: String = ""
    @FocusState private var isSearchFocused: Bool

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                Spacer()
                    .frame(height: 16)

                // Icon - Camera + TV combo
                ZStack {
                    Circle()
                        .fill(Color.accent.opacity(0.2))
                        .frame(width: 100, height: 100)

                    ZStack {
                        // TV in background
                        Image(systemName: "tv.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.accent.opacity(0.5))
                            .offset(x: -6, y: 6)

                        // Camera in foreground
                        Image(systemName: "camera.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.accent)
                            .offset(x: 6, y: -6)
                    }
                }
                .onTapGesture {
                    // Dismiss keyboard when tapping outside search field
                    isSearchFocused = false
                }

                Spacer()
                    .frame(height: 12)

                // Title
                VStack(spacing: 6) {
                    Text("Watch or Skip?")
                        .font(.headlineLarge)
                        .foregroundColor(.textPrimary)

                    Text("Snap movies and TV shows on Netflix, Prime Video, etc.\nfor instant recommendations")
                        .font(.bodySmall)
                        .foregroundColor(.textSecondary)
                        .multilineTextAlignment(.center)
                        .lineSpacing(2)
                        .padding(.horizontal, 24)
                }
                .onTapGesture {
                    // Dismiss keyboard when tapping outside search field
                    isSearchFocused = false
                }

                Spacer()
                    .frame(height: 16)

                // How It Works Section
                HowItWorksView()
                    .padding(.horizontal, 8)
                    .onTapGesture {
                        // Dismiss keyboard when tapping
                        isSearchFocused = false
                    }

                Spacer()
                    .frame(height: 16)

                // Action Buttons
                VStack(spacing: 12) {
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
                        .frame(height: 52)
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

                    // Manual Search Field
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 12) {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.textSecondary)

                            TextField("Search movie or show...", text: $searchQuery)
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
                        .padding(.vertical, 14)
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
                .padding(.horizontal, 24)

                Spacer()
                    .frame(height: 16)
            }
        }
        .scrollDismissesKeyboard(.interactively)
        .onAppear {
            // Pre-populate search query if provided (e.g., from "Wrong title?" button)
            if !initialSearchQuery.isEmpty {
                searchQuery = initialSearchQuery
                isSearchFocused = true
            }
        }
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

struct HowItWorksView: View {
    var body: some View {
        VStack(spacing: 0) {
            // Title
            HStack {
                Text("How It Works")
                    .font(.bodyMedium)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 12)

            // Steps
            VStack(spacing: 10) {
                // Step 1: Snap
                HowItWorksStep(
                    icon: "tv.fill",
                    iconColor: .blue,
                    title: "Snap",
                    description: "Point your phone and snap the poster on your TV screen",
                    showArrow: true
                )

                // Step 2: Analyze
                HowItWorksStep(
                    icon: "sparkles",
                    iconColor: .purple,
                    title: "Analyze",
                    description: "AI finds the show and checks it against your taste profile",
                    showArrow: true
                )

                // Step 3: Decide
                HowItWorksStep(
                    icon: "checkmark.circle.fill",
                    iconColor: .green,
                    title: "Decide",
                    description: "Get an instant recommendation to watch the show or not",
                    showArrow: false
                )
            }
            .padding(.horizontal, 20)
        }
        .padding(.vertical, 16)
        .background(Color.surface)
        .cornerRadius(14)
    }
}

struct HowItWorksStep: View {
    let icon: String
    let iconColor: Color
    let title: String
    let description: String
    let showArrow: Bool

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 12) {
                // Icon Circle
                ZStack {
                    Circle()
                        .fill(iconColor.opacity(0.15))
                        .frame(width: 38, height: 38)

                    Image(systemName: icon)
                        .font(.system(size: 18))
                        .foregroundColor(iconColor)
                }

                // Text Content
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.bodyMedium)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)

                    Text(description)
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer()
            }

            // Arrow between steps
            if showArrow {
                HStack {
                    Spacer()
                        .frame(width: 19) // Center under icon

                    Image(systemName: "arrow.down")
                        .font(.system(size: 12))
                        .foregroundColor(.textSecondary.opacity(0.5))
                        .frame(height: 12)

                    Spacer()
                }
            }
        }
    }
}

#Preview {
    MovieSnapView()
}
