//
//  HistoryEntryView.swift
//  WatchOrNot
//
//  History entry item view
//

import SwiftUI

struct HistoryEntryView: View {
    let entry: HistoryEntry
    let votedCount: Int // Total number of votes to determine if badge should be shown
    let onDelete: () -> Void
    let onRatingToggle: (String) -> Void // Callback for rating toggle (up/down)
    let onTap: () -> Void // Callback when card is tapped

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Poster - increased size to match web app
            MoviePosterView(
                posterURL: entry.poster,
                width: 96,
                height: 144
            )

            // Info
            VStack(alignment: .leading, spacing: 6) {
                // Title
                Text(entry.title)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.textPrimary)
                    .lineLimit(2)

                // Year & Genre
                if let genre = entry.genre {
                    Text("\(String(entry.year)) • \(genre)")
                        .font(.bodySmall)
                        .foregroundColor(.textSecondary)
                        .lineLimit(1)
                } else {
                    Text(String(entry.year))
                        .font(.bodySmall)
                        .foregroundColor(.textSecondary)
                }

                // Personalized Badge (only show if badge exists and user has >= 5 votes)
                if let badge = entry.badge,
                   let badgeEmoji = entry.badgeEmoji,
                   votedCount >= 5 {
                    PersonalizedBadgeView(badge: badge, emoji: badgeEmoji, compact: true)
                        .padding(.top, 2)
                }

                // Scores Row
                HStack(spacing: 12) {
                    if let imdbRating = entry.imdbRating {
                        ImdbScoreView(score: imdbRating, compact: true)
                    }

                    if let rottenTomatoes = entry.rottenTomatoes {
                        RottenTomatoesScoreView(score: rottenTomatoes, compact: true)
                    }
                }
                .padding(.top, 4)

                Spacer()

                // Rating Toggle Buttons
                HStack(spacing: 12) {
                    // Thumbs Up
                    Button {
                        onRatingToggle(entry.rating == "up" ? "" : "up")
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "hand.thumbsup.fill")
                                .font(.system(size: 14))
                            Text("Like")
                                .font(.system(size: 12, weight: .medium))
                        }
                        .foregroundColor(entry.rating == "up" ? .white : Color(white: 0.6))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(entry.rating == "up" ? Color.green.opacity(0.8) : Color(white: 0.2))
                        )
                    }

                    // Thumbs Down
                    Button {
                        onRatingToggle(entry.rating == "down" ? "" : "down")
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "hand.thumbsdown.fill")
                                .font(.system(size: 14))
                            Text("Dislike")
                                .font(.system(size: 12, weight: .medium))
                        }
                        .foregroundColor(entry.rating == "down" ? .white : Color(white: 0.6))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(entry.rating == "down" ? Color.red.opacity(0.8) : Color(white: 0.2))
                        )
                    }
                }
            }
            .padding(.vertical, 4)
        }
        .padding(12)
        .cardStyle()
        .contentShape(Rectangle())
        .onTapGesture {
            onTap()
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button(role: .destructive) {
                onDelete()
            } label: {
                Label("Delete", systemImage: "trash")
            }
        }
    }
}

#Preview {
    HistoryEntryView(
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
        onDelete: {},
        onRatingToggle: { _ in },
        onTap: {}
    )
    .padding()
    .background(Color.background)
}
