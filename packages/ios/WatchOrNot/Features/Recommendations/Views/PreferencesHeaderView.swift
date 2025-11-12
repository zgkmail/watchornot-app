//
//  PreferencesHeaderView.swift
//  WatchOrNot
//
//  Display user preferences header
//

import SwiftUI

struct PreferencesHeaderView: View {
    let preferences: UserPreferences

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Your Taste Profile")
                .font(.headlineSmall)
                .foregroundColor(.textPrimary)

            VStack(alignment: .leading, spacing: 8) {
                if !preferences.favoriteGenres.isEmpty {
                    PreferenceRow(
                        icon: "film",
                        label: "Favorite Genres",
                        items: preferences.favoriteGenres.prefix(3)
                    )
                }

                if !preferences.favoriteDirectors.isEmpty {
                    PreferenceRow(
                        icon: "person.fill",
                        label: "Favorite Directors",
                        items: preferences.favoriteDirectors.prefix(3)
                    )
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }
}

struct PreferenceRow: View {
    let icon: String
    let label: String
    let items: ArraySlice<String>

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(.accent)
                .frame(width: 16)

            Text(label + ":")
                .font(.caption)
                .foregroundColor(.textSecondary)

            Text(Array(items).joined(separator: ", "))
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.textPrimary)
                .lineLimit(1)
        }
    }
}

#Preview {
    PreferencesHeaderView(
        preferences: UserPreferences(
            favoriteGenres: ["Drama", "Thriller", "Action"],
            favoriteDirectors: ["Christopher Nolan", "Quentin Tarantino"],
            favoriteCast: ["Leonardo DiCaprio"],
            averageRatingThreshold: 7.5
        )
    )
    .padding()
    .background(Color.background)
}
