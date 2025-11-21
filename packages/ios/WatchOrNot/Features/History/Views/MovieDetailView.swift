//
//  MovieDetailView.swift
//  WatchOrNot
//
//  Movie detail modal view
//

import SwiftUI

struct MovieDetailView: View {
    let entry: HistoryEntry
    let votedCount: Int
    let onRatingChange: (String) -> Void
    let onDelete: () -> Void
    @Environment(\.dismiss) var dismiss
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        NavigationView {
            ZStack {
                Color.background.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        // Poster and basic info
                        HStack(alignment: .top, spacing: 16) {
                            MoviePosterView(
                                posterURL: entry.poster,
                                width: 128,
                                height: 192
                            )

                            VStack(alignment: .leading, spacing: 8) {
                                Text(entry.title)
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .foregroundColor(.textPrimary)

                                if let genre = entry.genre {
                                    Text("\(entry.year > 0 ? String(entry.year) : "N/A") • \(genre)")
                                        .font(.subheadline)
                                        .foregroundColor(.textSecondary)
                                } else {
                                    Text(entry.year > 0 ? String(entry.year) : "N/A")
                                        .font(.subheadline)
                                        .foregroundColor(.textSecondary)
                                }

                                if let director = entry.director {
                                    Text("Director: ")
                                        .font(.caption)
                                        .foregroundColor(.textSecondary)
                                    + Text(director)
                                        .font(.caption)
                                        .foregroundColor(.textPrimary)
                                }

                                if let cast = entry.cast {
                                    Text("Cast: ")
                                        .font(.caption)
                                        .foregroundColor(.textSecondary)
                                    + Text(cast)
                                        .font(.caption)
                                        .foregroundColor(.textPrimary)
                                }

                                if let trailerUrl = entry.trailerUrl, let url = URL(string: trailerUrl) {
                                    Link(destination: url) {
                                        HStack(spacing: 4) {
                                            Text("🎬")
                                                .font(.caption)
                                            Text("Watch Trailer")
                                                .font(.caption)
                                                .foregroundColor(.blue)
                                        }
                                    }
                                }

                                Spacer()
                            }
                        }

                        // Recommendation Badge
                        if let badge = entry.badge,
                           let badgeEmoji = entry.badgeEmoji,
                           let badgeDescription = entry.badgeDescription,
                           votedCount >= 5 {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Recommendation")
                                    .font(.caption)
                                    .foregroundColor(.purple.opacity(0.9))

                                VStack(alignment: .leading, spacing: 8) {
                                    HStack(spacing: 8) {
                                        Text(badgeEmoji)
                                            .font(.title2)

                                        Text(PersonalizedBadgeView(badge: badge, emoji: badgeEmoji).displayName)
                                            .font(.headline)
                                            .foregroundColor(.textPrimary)
                                    }

                                    Text(badgeDescription)
                                        .font(.subheadline)
                                        .foregroundColor(.purple.opacity(0.9))
                                }
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Color.purple.opacity(0.15))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 12)
                                                .stroke(Color.purple.opacity(0.3), lineWidth: 1)
                                        )
                                )
                            }
                        } else if votedCount < 5 {
                            // Locked recommendation message
                            HStack(spacing: 12) {
                                Text("🔒")
                                    .font(.title3)

                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Unlock Recommendations")
                                        .font(.subheadline)
                                        .fontWeight(.semibold)
                                        .foregroundColor(.textPrimary)

                                    Text("Vote on \(5 - votedCount) more \(5 - votedCount == 1 ? "title" : "titles") to see personalized recommendations")
                                        .font(.caption)
                                        .foregroundColor(.textSecondary)
                                }
                            }
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.cardBackground.opacity(0.5))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color.textTertiary.opacity(0.3), lineWidth: 1)
                                    )
                            )
                        }

                        // Ratings
                        if entry.imdbRating != nil || entry.rottenTomatoes != nil || entry.metacritic != nil {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Ratings")
                                    .font(.headline)
                                    .foregroundColor(.textPrimary)

                                LazyVGrid(columns: [
                                    GridItem(.flexible()),
                                    GridItem(.flexible())
                                ], spacing: 12) {
                                    if let imdbRating = entry.imdbRating {
                                        VStack(spacing: 4) {
                                            Text("IMDb")
                                                .font(.caption)
                                                .foregroundColor(.textSecondary)

                                            Text(String(format: "%.1f/10", imdbRating))
                                                .font(.title)
                                                .fontWeight(.bold)
                                                .foregroundColor(.yellow)
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(
                                            RoundedRectangle(cornerRadius: 12)
                                                .fill(colorScheme == .dark ? Color.cardBackground : Color.gray.opacity(0.15))
                                        )
                                    }

                                    if let rottenTomatoes = entry.rottenTomatoes {
                                        VStack(spacing: 4) {
                                            Text("Rotten Tomatoes")
                                                .font(.caption)
                                                .foregroundColor(.textSecondary)

                                            Text("\(rottenTomatoes)%")
                                                .font(.title)
                                                .fontWeight(.bold)
                                                .foregroundColor(.red)
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(
                                            RoundedRectangle(cornerRadius: 12)
                                                .fill(colorScheme == .dark ? Color.cardBackground : Color.gray.opacity(0.15))
                                        )
                                    }

                                    if let metacritic = entry.metacritic {
                                        VStack(spacing: 4) {
                                            Text("Metacritic")
                                                .font(.caption)
                                                .foregroundColor(.textSecondary)

                                            Text("\(metacritic)/100")
                                                .font(.title)
                                                .fontWeight(.bold)
                                                .foregroundColor(.green)
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(
                                            RoundedRectangle(cornerRadius: 12)
                                                .fill(colorScheme == .dark ? Color.cardBackground : Color.gray.opacity(0.15))
                                        )
                                    }
                                }
                            }
                        }

                        // Your Vote
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Your Vote")
                                .font(.headline)
                                .foregroundColor(.textPrimary)

                            HStack(spacing: 12) {
                                Button {
                                    let newRating = entry.rating == "up" ? "" : "up"
                                    onRatingChange(newRating)
                                } label: {
                                    Image(systemName: "hand.thumbsup.fill")
                                        .font(.title2)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 16)
                                        .foregroundColor(entry.rating == "up" ? .white : .textSecondary)
                                        .background(
                                            RoundedRectangle(cornerRadius: 12)
                                                .fill(entry.rating == "up" ? Color.green : (colorScheme == .dark ? Color.cardBackground : Color.gray.opacity(0.15)))
                                        )
                                }

                                Button {
                                    let newRating = entry.rating == "down" ? "" : "down"
                                    onRatingChange(newRating)
                                } label: {
                                    Image(systemName: "hand.thumbsdown.fill")
                                        .font(.title2)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 16)
                                        .foregroundColor(entry.rating == "down" ? .white : .textSecondary)
                                        .background(
                                            RoundedRectangle(cornerRadius: 12)
                                                .fill(entry.rating == "down" ? Color.red : (colorScheme == .dark ? Color.cardBackground : Color.gray.opacity(0.15)))
                                        )
                                }
                            }
                        }

                        // Actions
                        VStack(spacing: 12) {
                            Button(role: .destructive) {
                                onDelete()
                                dismiss()
                            } label: {
                                HStack {
                                    Image(systemName: "trash")
                                    Text("Remove from History")
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Color.red)
                                )
                                .foregroundColor(.white)
                                .fontWeight(.semibold)
                            }

                            Button {
                                dismiss()
                            } label: {
                                Text("Close")
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(
                                        RoundedRectangle(cornerRadius: 12)
                                            .fill(Color.cardBackground)
                                    )
                                    .foregroundColor(.textPrimary)
                                    .fontWeight(.semibold)
                            }
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Movie Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .foregroundColor(.textSecondary)
                    }
                }
            }
        }
    }
}

#Preview {
    MovieDetailView(
        entry: HistoryEntry(
            id: "1",
            movieId: "1",
            title: "The Shawshank Redemption",
            year: 1994,
            poster: nil,
            rating: "up",
            timestamp: Date(),
            genre: "Drama, Crime",
            imdbRating: 9.3,
            rottenTomatoes: 91,
            metacritic: 82,
            director: "Frank Darabont",
            cast: "Tim Robbins, Morgan Freeman",
            trailerUrl: nil,
            badge: "perfect-match",
            badgeEmoji: "🎯",
            badgeDescription: "This is right up your alley!"
        ),
        votedCount: 10,
        onRatingChange: { _ in },
        onDelete: {}
    )
}
