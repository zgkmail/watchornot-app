//
//  MovieCardView.swift
//  WatchOrNot
//
//  Movie card for onboarding
//

import SwiftUI

struct MovieCardView: View {
    let movie: OnboardingMovie

    var body: some View {
        VStack(spacing: 16) {
            // Poster
            MoviePosterView(
                posterURL: movie.poster,
                width: 240,
                height: 360
            )
            .shadow(color: .black.opacity(0.5), radius: 20, x: 0, y: 10)

            // Movie info
            VStack(spacing: 8) {
                Text(movie.title)
                    .font(.headlineMedium)
                    .foregroundColor(.textPrimary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)

                Text(String(movie.year))
                    .font(.bodyMedium)
                    .foregroundColor(.textSecondary)

                // Genres
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(movie.genres, id: \.self) { genre in
                            Text(genre)
                                .font(.caption)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.cardBackground)
                                .foregroundColor(.textSecondary)
                                .cornerRadius(16)
                        }
                    }
                }

                // Rating
                if movie.imdbRating > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                        Text(String(format: "%.1f", movie.imdbRating))
                            .font(.bodyMedium)
                            .foregroundColor(.textPrimary)
                    }
                }

                // Directors
                if !movie.directors.isEmpty {
                    Text("Directed by \(movie.directors.joined(separator: ", "))")
                        .font(.caption)
                        .foregroundColor(.textTertiary)
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                }
            }
            .padding(.horizontal)
        }
    }
}

#Preview {
    MovieCardView(
        movie: OnboardingMovie(
            id: "1",
            title: "The Shawshank Redemption",
            year: 1994,
            genres: ["Drama", "Crime"],
            directors: ["Frank Darabont"],
            cast: ["Tim Robbins", "Morgan Freeman"],
            poster: "https://via.placeholder.com/240x360",
            imdbRating: 9.3
        )
    )
    .padding()
    .background(Color.background)
}
