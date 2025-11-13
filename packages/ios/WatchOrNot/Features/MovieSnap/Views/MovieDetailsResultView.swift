//
//  MovieDetailsResultView.swift
//  WatchOrNot
//
//  Movie details after successful snap
//

import SwiftUI

struct MovieDetailsResultView: View {
    let movieDetails: MovieDetails
    let analysisData: ClaudeImageAnalysisResponse.AnalysisData?
    let onReset: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Success indicator
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.success)

                    Text("Movie Identified!")
                        .font(.titleMedium)
                        .foregroundColor(.textPrimary)
                }
                .padding()

                // Poster
                MoviePosterView(
                    posterURL: movieDetails.poster,
                    width: 200,
                    height: 300
                )
                .shadow(color: .black.opacity(0.3), radius: 15, x: 0, y: 8)

                // Movie info
                VStack(spacing: 16) {
                    // Title and year
                    VStack(spacing: 4) {
                        Text(movieDetails.title)
                            .font(.headlineLarge)
                            .foregroundColor(.textPrimary)
                            .multilineTextAlignment(.center)

                        Text(String(movieDetails.year))
                            .font(.titleMedium)
                            .foregroundColor(.textSecondary)
                    }

                    // Rating
                    if let rating = movieDetails.imdbRating {
                        HStack(spacing: 8) {
                            Image(systemName: "star.fill")
                                .foregroundColor(.yellow)

                            Text(String(format: "%.1f / 10", rating))
                                .font(.titleMedium)
                                .fontWeight(.semibold)
                                .foregroundColor(.textPrimary)
                        }
                    }

                    // Plot
                    if let plot = movieDetails.plot, !plot.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Plot")
                                .font(.headlineSmall)
                                .foregroundColor(.textPrimary)

                            Text(plot)
                                .font(.bodyMedium)
                                .foregroundColor(.textSecondary)
                                .lineSpacing(4)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardStyle()
                    }

                    // AI Confidence
                    if let data = analysisData, let confidence = data.confidence {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack(spacing: 8) {
                                Image(systemName: "sparkles")
                                    .foregroundColor(.accent)

                                Text("AI Analysis")
                                    .font(.headlineSmall)
                                    .foregroundColor(.textPrimary)
                            }

                            Text("Confidence: \(confidence)")
                                .font(.bodySmall)
                                .foregroundColor(.textSecondary)

                            if let reasoning = data.reasoning {
                                Text(reasoning)
                                    .font(.bodySmall)
                                    .foregroundColor(.textTertiary)
                                    .italic()
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardStyle()
                    }
                }
                .padding(.horizontal)

                // Actions
                VStack(spacing: 12) {
                    Button {
                        // TODO: Navigate to full details or rate
                    } label: {
                        Text("View Full Details")
                            .font(.titleMedium)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(Color.accent)
                            .cornerRadius(16)
                    }

                    Button {
                        onReset()
                    } label: {
                        Text("Snap Another")
                            .font(.titleMedium)
                            .foregroundColor(.accent)
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(Color.cardBackground)
                            .cornerRadius(16)
                    }
                }
                .padding(.horizontal, 40)
                .padding(.bottom, 40)
            }
            .padding(.top)
        }
    }
}

#Preview {
    MovieDetailsResultView(
        movieDetails: MovieDetails(
            id: "1",
            title: "The Shawshank Redemption",
            year: 1994,
            genres: ["Drama"],
            director: "Frank Darabont",
            cast: "Tim Robbins, Morgan Freeman",
            poster: nil,
            plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
            imdbRating: 9.3,
            runtime: "142 min",
            imdbId: "tt0111161",
            rated: "R",
            released: nil,
            writer: nil,
            awards: nil,
            metascore: nil,
            imdbVotes: nil,
            boxOffice: nil,
            production: nil,
            website: nil
        ),
        analysisData: ClaudeImageAnalysisResponse.AnalysisData(
            title: "The Shawshank Redemption",
            year: 1994,
            confidence: "High",
            reasoning: "Clear title and distinctive poster design"
        ),
        onReset: {}
    )
    .background(Color.background)
}
