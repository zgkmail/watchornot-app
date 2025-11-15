//
//  MovieListItemView.swift
//  WatchOrNot
//
//  Movie list item for recommendations
//

import SwiftUI

struct MovieListItemView: View {
    let movie: RecommendedMovie

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            // Poster
            MoviePosterView(
                posterURL: movie.poster,
                width: 100,
                height: 150
            )

            // Info
            VStack(alignment: .leading, spacing: 8) {
                // Title and year
                VStack(alignment: .leading, spacing: 4) {
                    Text(movie.title)
                        .font(.titleMedium)
                        .foregroundColor(.textPrimary)
                        .lineLimit(2)

                    Text(String(movie.year))
                        .font(.bodySmall)
                        .foregroundColor(.textSecondary)
                }

                // Badges
                if !movie.badges.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 6) {
                            ForEach(movie.badges) { badge in
                                BadgeView(badge: badge)
                            }
                        }
                    }
                }

                // Genres
                if !movie.genres.isEmpty {
                    Text(movie.genres.prefix(3).joined(separator: ", "))
                        .font(.caption)
                        .foregroundColor(.textTertiary)
                        .lineLimit(1)
                }

                Spacer()

                // Rating and Match Score
                HStack(spacing: 12) {
                    if let rating = movie.imdbRating {
                        HStack(spacing: 4) {
                            // IMDb logo badge
                            Text("IMDb")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(.black)
                                .padding(.horizontal, 3)
                                .padding(.vertical, 1)
                                .background(
                                    RoundedRectangle(cornerRadius: 2)
                                        .fill(Color(red: 0.96, green: 0.77, blue: 0.09))
                                )
                            Text(String(format: "%.1f", rating))
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.textPrimary)
                        }
                    }

                    if let matchScore = movie.matchScore {
                        HStack(spacing: 4) {
                            Image(systemName: "heart.fill")
                                .font(.caption)
                                .foregroundColor(.red)
                            Text("\(Int(matchScore * 100))%")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.textPrimary)
                        }
                    }
                }
            }

            Spacer()
        }
        .padding()
        .cardStyle()
    }
}

#Preview {
    MovieListItemView(
        movie: RecommendedMovie(
            id: "1",
            title: "The Shawshank Redemption",
            year: 1994,
            genres: ["Drama", "Crime"],
            directors: ["Frank Darabont"],
            cast: ["Tim Robbins", "Morgan Freeman"],
            poster: nil,
            plot: "Two imprisoned men bond over a number of years...",
            imdbRating: 9.3,
            runtime: "142 min",
            imdbId: "tt0111161",
            badges: [
                Badge(type: .genreMatch, label: "Drama", reason: "Matches your taste"),
                Badge(type: .highlyRated, label: "Highly Rated", reason: "9.3 IMDb")
            ],
            matchScore: 0.92,
            recommendationReason: "Based on your love for drama"
        )
    )
    .padding()
    .background(Color.background)
}
