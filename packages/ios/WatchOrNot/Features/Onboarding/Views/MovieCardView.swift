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
                    .fixedSize(horizontal: false, vertical: true)

                Text(String(movie.year))
                    .font(.bodyMedium)
                    .foregroundColor(.textSecondary)

                // Genres - centered
                HStack {
                    Spacer()
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
                    Spacer()
                }

                // Directors
                if !movie.directors.isEmpty {
                    Text("Director: \(movie.directors.joined(separator: ", "))")
                        .font(.caption)
                        .foregroundColor(.textTertiary)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(.horizontal)
        }
    }
}

#Preview {
    let jsonString = """
    {
        "id": "1",
        "title": "The Shawshank Redemption",
        "year": 1994,
        "genres": ["Drama", "Crime"],
        "director": "Frank Darabont",
        "cast": "Tim Robbins, Morgan Freeman",
        "poster": "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        "imdbRating": 9.3
    }
    """
    let jsonData = jsonString.data(using: .utf8)!
    let movie = try! JSONDecoder().decode(OnboardingMovie.self, from: jsonData)

    return MovieCardView(movie: movie)
        .padding()
        .background(Color.background)
}
