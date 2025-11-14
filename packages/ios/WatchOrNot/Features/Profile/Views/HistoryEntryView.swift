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
    let onRate: ((String) -> Void)?
    @State private var showDetailModal = false

    init(entry: HistoryEntry, votedCount: Int = 0, onDelete: @escaping () -> Void, onRate: ((String) -> Void)? = nil) {
        self.entry = entry
        self.votedCount = votedCount
        self.onDelete = onDelete
        self.onRate = onRate
    }

    var body: some View {
        Button {
            showDetailModal = true
        } label: {
            HStack(spacing: 12) {
                // Poster - matching web app size (96x144px)
                MoviePosterView(
                    posterURL: entry.poster,
                    width: 96,
                    height: 144
                )

                // Info section
                VStack(alignment: .leading, spacing: 6) {
                    // Title
                    Text(entry.title)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.textPrimary)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)

                    // Year and Genre
                    if let genre = entry.genre {
                        Text("\(String(entry.year)) • \(genre)")
                            .font(.system(size: 14))
                            .foregroundColor(.textSecondary)
                    } else {
                        Text(String(entry.year))
                            .font(.system(size: 14))
                            .foregroundColor(.textSecondary)
                    }

                    // Badge (if available and user has voted on at least 5 titles)
                    if let badgeEmoji = entry.badgeEmoji,
                       let badge = entry.badge,
                       let badgeDescription = entry.badgeDescription,
                       votedCount >= 5 {
                        HStack(spacing: 4) {
                            Text(badgeEmoji)
                                .font(.system(size: 12))
                            Text(getBadgeDisplayName(badge))
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(Color(red: 0.67, green: 0.47, blue: 0.86))
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color(red: 0.67, green: 0.47, blue: 0.86).opacity(0.15))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color(red: 0.67, green: 0.47, blue: 0.86).opacity(0.3), lineWidth: 1)
                                )
                        )
                    }

                    // Ratings (IMDb and Rotten Tomatoes)
                    HStack(spacing: 12) {
                        if let imdbRating = entry.imdbRating {
                            HStack(spacing: 4) {
                                // IMDb logo using SF Symbol
                                Image(systemName: "star.fill")
                                    .font(.system(size: 12))
                                    .foregroundColor(.yellow)
                                Text(String(format: "%.1f/10", imdbRating))
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.textPrimary)
                            }
                        }

                        if let rottenTomatoes = entry.rottenTomatoes {
                            HStack(spacing: 4) {
                                Text("🍅")
                                    .font(.system(size: 12))
                                Text("\(rottenTomatoes)%")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(Color(red: 0.96, green: 0.26, blue: 0.21))
                            }
                        }
                    }

                    Spacer()

                    // Vote buttons - bigger size proportional to card
                    HStack(spacing: 8) {
                        // Thumbs up button
                        Button {
                            // Toggle: if already up, cancel vote (empty string), otherwise set to up
                            let newRating = entry.rating == "up" ? "" : "up"
                            onRate?(newRating)
                        } label: {
                            Image(systemName: "hand.thumbsup.fill")
                                .font(.system(size: 20))
                                .foregroundColor(entry.rating == "up" ? .white : .textSecondary)
                                .frame(width: 50, height: 50)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(entry.rating == "up" ? Color.green : Color.cardBackground)
                                )
                        }
                        .buttonStyle(PlainButtonStyle())

                        // Thumbs down button
                        Button {
                            // Toggle: if already down, cancel vote (empty string), otherwise set to down
                            let newRating = entry.rating == "down" ? "" : "down"
                            onRate?(newRating)
                        } label: {
                            Image(systemName: "hand.thumbsdown.fill")
                                .font(.system(size: 20))
                                .foregroundColor(entry.rating == "down" ? .white : .textSecondary)
                                .frame(width: 50, height: 50)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(entry.rating == "down" ? Color.red : Color.cardBackground)
                                )
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(12)
            .background(Color.cardBackground)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.divider, lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button(role: .destructive) {
                onDelete()
            } label: {
                Label("Delete", systemImage: "trash")
            }
        }
        .sheet(isPresented: $showDetailModal) {
            MovieDetailView(
                entry: entry,
                votedCount: votedCount,
                onRatingChange: { newRating in
                    onRate?(newRating)
                },
                onDelete: onDelete
            )
        }
    }

    private func getBadgeDisplayName(_ badge: String) -> String {
        switch badge {
        case "perfect-match": return "Perfect Match"
        case "great-pick": return "Great Pick"
        case "worth-a-try": return "Worth a Try"
        case "mixed-feelings": return "Mixed Feelings"
        case "not-your-style": return "Not Your Style"
        default: return badge
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
            poster: nil,
            rating: "up",
            timestamp: Date(),
            genre: "Drama",
            imdbRating: 9.3,
            rottenTomatoes: 91,
            metacritic: 80,
            director: "Frank Darabont",
            cast: "Tim Robbins, Morgan Freeman",
            trailerUrl: nil,
            badge: "perfect-match",
            badgeEmoji: "🎯",
            badgeDescription: "This is right up your alley!"
        ),
        votedCount: 10,
        onDelete: {},
        onRate: { _ in }
    )
    .padding()
    .background(Color.background)
}
