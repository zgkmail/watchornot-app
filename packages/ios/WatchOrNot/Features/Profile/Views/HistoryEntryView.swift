//
//  HistoryEntryView.swift
//  WatchOrNot
//
//  History entry item view
//

import SwiftUI

struct HistoryEntryView: View {
    let entry: HistoryEntry
    let onDelete: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            // Poster
            MoviePosterView(
                posterURL: entry.poster,
                width: 60,
                height: 90
            )

            // Info
            VStack(alignment: .leading, spacing: 6) {
                Text(entry.title)
                    .font(.bodyLarge)
                    .fontWeight(.medium)
                    .foregroundColor(.textPrimary)
                    .lineLimit(2)

                Text(String(entry.year))
                    .font(.bodySmall)
                    .foregroundColor(.textSecondary)

                Spacer()

                // Timestamp
                Text(formatDate(entry.timestamp))
                    .font(.caption)
                    .foregroundColor(.textTertiary)
            }

            Spacer()

            // Vote indicator
            VStack {
                Text(ratingEmoji(entry.rating))
                    .font(.title)

                Text(entry.rating ?? "Unknown")
                    .font(.caption)
                    .foregroundColor(.textSecondary)
            }
        }
        .padding()
        .cardStyle()
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button(role: .destructive) {
                onDelete()
            } label: {
                Label("Delete", systemImage: "trash")
            }
        }
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }

    private func ratingEmoji(_ rating: String?) -> String {
        switch rating {
        case "up": return "👍"
        case "down": return "👎"
        case "skip": return "⏭️"
        default: return "❓"
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
            badge: "perfect-match",
            badgeEmoji: "🎯",
            badgeDescription: "This is right up your alley!"
        ),
        onDelete: {}
    )
    .padding()
    .background(Color.background)
}
