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

                // Genres
                if let genres = entry.genres, !genres.isEmpty {
                    Text(genres.prefix(2).joined(separator: ", "))
                        .font(.caption)
                        .foregroundColor(.textTertiary)
                        .lineLimit(1)
                }

                Spacer()

                // Timestamp
                Text(formatDate(entry.date))
                    .font(.caption)
                    .foregroundColor(.textTertiary)
            }

            Spacer()

            // Vote indicator
            VStack {
                Text(entry.vote.emoji)
                    .font(.title)

                Text(entry.vote.rawValue)
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
}

#Preview {
    HistoryEntryView(
        entry: HistoryEntry(
            id: 1,
            movieId: "1",
            title: "The Shawshank Redemption",
            year: 1994,
            vote: .up,
            timestamp: ISO8601DateFormatter().string(from: Date()),
            poster: nil,
            genres: ["Drama", "Crime"]
        ),
        onDelete: {}
    )
    .padding()
    .background(Color.background)
}
