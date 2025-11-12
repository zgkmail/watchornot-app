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
                            analysisData: viewModel.analysisResult?.data,
                            onReset: { viewModel.reset() }
                        )
                    } else if viewModel.capturedImage != nil && viewModel.isAnalyzing {
                        // Analyzing
                        AnalyzingView()
                    } else {
                        // Initial state - show snap button
                        SnapPromptView(onSnap: { viewModel.openCamera() })
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
    let onSnap: () -> Void

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Icon
            ZStack {
                Circle()
                    .fill(Color.accent.opacity(0.2))
                    .frame(width: 160, height: 160)

                Image(systemName: "camera.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.accent)
            }

            // Instructions
            VStack(spacing: 12) {
                Text("Snap a Movie Poster")
                    .font(.headlineMedium)
                    .foregroundColor(.textPrimary)

                Text("Take a photo of any movie poster\nand we'll identify it for you")
                    .font(.bodyMedium)
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }

            Spacer()

            // Snap button
            Button {
                onSnap()
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: "camera")
                        .font(.titleMedium)

                    Text("Open Camera")
                        .font(.titleMedium)
                        .fontWeight(.semibold)
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 56)
                .background(Color.accent)
                .cornerRadius(16)
            }
            .padding(.horizontal, 40)
            .padding(.bottom, 40)
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

#Preview {
    MovieSnapView()
}
