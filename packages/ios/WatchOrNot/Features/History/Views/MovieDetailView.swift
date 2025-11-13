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
                                    Text("\(String(entry.year)) • \(genre)")
                                        .font(.subheadline)
                                        .foregroundColor(.textSecondary)
                                } else {
                                    Text(String(entry.year))
                                        .font(.subheadline)
                                        .foregroundColor(.textSecondary)
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
                                    .foregroundColor(Color(red: 216/255, green: 180/255, blue: 254/255))

                                VStack(alignment: .leading, spacing: 8) {
                                    HStack(spacing: 8) {
                                        Text(badgeEmoji)
                                            .font(.title2)

                                        Text(PersonalizedBadgeView(badge: badge, emoji: badgeEmoji).displayName)
                                            .font(.headline)
                                            .foregroundColor(.white)
                                    }

                                    Text(badgeDescription)
                                        .font(.subheadline)
                                        .foregroundColor(Color(red: 233/255, green: 213/255, blue: 255/255))
                                }
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Color(red: 88/255, green: 28/255, blue: 135/255).opacity(0.3))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 12)
                                                .stroke(Color(red: 168/255, green: 85/255, blue: 247/255).opacity(0.3), lineWidth: 1)
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
                                                .foregroundColor(Color(red: 245/255, green: 197/255, blue: 24/255))
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(
                                            RoundedRectangle(cornerRadius: 12)
                                                .fill(Color.cardBackground)
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
                                                .foregroundColor(Color.red)
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(
                                            RoundedRectangle(cornerRadius: 12)
                                                .fill(Color.cardBackground)
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
                                                .foregroundColor(Color.green)
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(
                                            RoundedRectangle(cornerRadius: 12)
                                                .fill(Color.cardBackground)
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
                                    HStack(spacing: 8) {
                                        Image(systemName: "hand.thumbsup.fill")
                                            .font(.title3)
                                        Text("Like")
                                            .fontWeight(.semibold)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .foregroundColor(entry.rating == "up" ? .white : .textSecondary)
                                    .background(
                                        RoundedRectangle(cornerRadius: 12)
                                            .fill(entry.rating == "up" ? Color.green : Color.cardBackground)
                                    )
                                }

                                Button {
                                    let newRating = entry.rating == "down" ? "" : "down"
                                    onRatingChange(newRating)
                                } label: {
                                    HStack(spacing: 8) {
                                        Image(systemName: "hand.thumbsdown.fill")
                                            .font(.title3)
                                        Text("Dislike")
                                            .fontWeight(.semibold)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .foregroundColor(entry.rating == "down" ? .white : .textSecondary)
                                    .background(
                                        RoundedRectangle(cornerRadius: 12)
                                            .fill(entry.rating == "down" ? Color.red : Color.cardBackground)
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
            genre: "Drama, Crime",
            imdbRating: 9.3,
            rottenTomatoes: 91,
            metacritic: 82,
            poster: nil,
            rating: "up",
            timestamp: Date(),
            badge: "perfect-match",
            badgeEmoji: "🎯",
            badgeDescription: "This is right up your alley!"
        ),
        votedCount: 10,
        onRatingChange: { _ in },
        onDelete: {}
    )
}
