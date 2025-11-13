//
//  HistoryDetailModal.swift
//  WatchOrNot
//
//  Detail modal for history entries matching web app design
//

import SwiftUI

struct HistoryDetailModal: View {
    let entry: HistoryEntry
    let onDelete: () -> Void
    let onRate: ((String) -> Void)?
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Poster and basic info
                    HStack(alignment: .top, spacing: 16) {
                        // Poster
                        MoviePosterView(
                            posterURL: entry.poster,
                            width: 128,
                            height: 192
                        )
                        .shadow(color: .black.opacity(0.3), radius: 10, x: 0, y: 4)

                        // Basic info
                        VStack(alignment: .leading, spacing: 8) {
                            Text(entry.title)
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(.textPrimary)

                            if let genre = entry.genre {
                                Text("\(String(entry.year)) • \(genre)")
                                    .font(.system(size: 14))
                                    .foregroundColor(.textSecondary)
                            } else {
                                Text(String(entry.year))
                                    .font(.system(size: 14))
                                    .foregroundColor(.textSecondary)
                            }

                            if let director = entry.director, director != "N/A" {
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack(spacing: 4) {
                                        Text("Director:")
                                            .foregroundColor(.textSecondary)
                                        Text(director)
                                            .foregroundColor(.textPrimary)
                                    }
                                    .font(.system(size: 14))
                                }
                            }

                            if let cast = entry.cast, cast != "N/A" {
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack(spacing: 4) {
                                        Text("Cast:")
                                            .foregroundColor(.textSecondary)
                                        Text(cast)
                                            .foregroundColor(.textPrimary)
                                    }
                                    .font(.system(size: 14))
                                    .lineLimit(3)
                                }
                            }

                            if let trailerUrl = entry.trailerUrl, !trailerUrl.isEmpty {
                                if let url = URL(string: trailerUrl) {
                                    Link(destination: url) {
                                        HStack(spacing: 4) {
                                            Text("🎬")
                                            Text("Watch Trailer")
                                                .font(.system(size: 14))
                                                .foregroundColor(.blue)
                                        }
                                    }
                                }
                            }

                            Spacer()
                        }
                    }
                    .padding(.horizontal)

                    // Recommendation badge section
                    if let badge = entry.badge,
                       let badgeEmoji = entry.badgeEmoji,
                       let badgeDescription = entry.badgeDescription {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Recommendation")
                                .font(.system(size: 12))
                                .foregroundColor(Color(red: 0.67, green: 0.47, blue: 0.86).opacity(0.8))

                            HStack(spacing: 8) {
                                Text(badgeEmoji)
                                    .font(.system(size: 24))
                                Text(getBadgeDisplayName(badge))
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(.white)
                            }

                            Text(badgeDescription)
                                .font(.system(size: 14))
                                .foregroundColor(Color(red: 0.85, green: 0.75, blue: 0.95))
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(red: 0.67, green: 0.47, blue: 0.86).opacity(0.2))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color(red: 0.67, green: 0.47, blue: 0.86).opacity(0.3), lineWidth: 1)
                                )
                        )
                        .padding(.horizontal)
                    }

                    // Ratings section
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Ratings")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.textPrimary)

                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                            if let imdbRating = entry.imdbRating {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("IMDb")
                                        .font(.system(size: 12))
                                        .foregroundColor(.textSecondary)
                                    Text(String(format: "%.1f/10", imdbRating))
                                        .font(.system(size: 24, weight: .bold))
                                        .foregroundColor(.yellow)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding()
                                .background(Color.cardBackground)
                                .cornerRadius(12)
                            }

                            if let rottenTomatoes = entry.rottenTomatoes {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Rotten Tomatoes")
                                        .font(.system(size: 12))
                                        .foregroundColor(.textSecondary)
                                    Text("\(rottenTomatoes)%")
                                        .font(.system(size: 24, weight: .bold))
                                        .foregroundColor(.red)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding()
                                .background(Color.cardBackground)
                                .cornerRadius(12)
                            }

                            if let metacritic = entry.metacritic {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Metacritic")
                                        .font(.system(size: 12))
                                        .foregroundColor(.textSecondary)
                                    Text("\(metacritic)/100")
                                        .font(.system(size: 24, weight: .bold))
                                        .foregroundColor(.green)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding()
                                .background(Color.cardBackground)
                                .cornerRadius(12)
                            }
                        }
                    }
                    .padding(.horizontal)

                    // Your Vote section
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Your Vote")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.textPrimary)

                        HStack(spacing: 12) {
                            // Thumbs up button
                            Button {
                                onRate?("up")
                                dismiss()
                            } label: {
                                Image(systemName: "hand.thumbsup.fill")
                                    .font(.system(size: 24))
                                    .foregroundColor(entry.rating == "up" ? .white : .textSecondary)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 64)
                                    .background(
                                        RoundedRectangle(cornerRadius: 16)
                                            .fill(entry.rating == "up" ? Color.green : Color.cardBackground)
                                    )
                            }

                            // Thumbs down button
                            Button {
                                onRate?("down")
                                dismiss()
                            } label: {
                                Image(systemName: "hand.thumbsdown.fill")
                                    .font(.system(size: 24))
                                    .foregroundColor(entry.rating == "down" ? .white : .textSecondary)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 64)
                                    .background(
                                        RoundedRectangle(cornerRadius: 16)
                                            .fill(entry.rating == "down" ? Color.red : Color.cardBackground)
                                    )
                            }
                        }
                    }
                    .padding(.horizontal)

                    // Actions
                    VStack(spacing: 12) {
                        Button {
                            onDelete()
                            dismiss()
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "trash")
                                Text("Remove from History")
                                    .font(.system(size: 17, weight: .semibold))
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(Color.red)
                            )
                        }

                        Button {
                            dismiss()
                        } label: {
                            Text("Close")
                                .font(.system(size: 17, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 56)
                                .background(
                                    RoundedRectangle(cornerRadius: 16)
                                        .fill(Color.secondary.opacity(0.5))
                                )
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 24)
                }
                .padding(.top, 24)
            }
            .background(Color.background.ignoresSafeArea())
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
    HistoryDetailModal(
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
            trailerUrl: "https://www.youtube.com/watch?v=6hB3S9bIaco",
            badge: "perfect-match",
            badgeEmoji: "🎯",
            badgeDescription: "This is right up your alley!"
        ),
        onDelete: {},
        onRate: { _ in }
    )
}
