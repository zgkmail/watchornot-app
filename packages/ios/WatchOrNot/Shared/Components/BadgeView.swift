//
//  BadgeView.swift
//  WatchOrNot
//
//  Badge component for recommendations
//

import SwiftUI

struct BadgeView: View {
    let badge: Badge

    var body: some View {
        HStack(spacing: 4) {
            Text(badge.type.emoji)
                .font(.caption2)

            Text(badge.label)
                .font(.caption2)
                .fontWeight(.semibold)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(badgeColor.opacity(0.2))
        .foregroundColor(badgeColor)
        .cornerRadius(8)
    }

    private var badgeColor: Color {
        switch badge.type {
        case .genreMatch: return .badgeGenre
        case .directorMatch: return .badgeDirector
        case .castMatch: return .badgeCast
        case .highlyRated: return .badgeRated
        case .hiddenGem: return .badgeGem
        case .cultClassic: return .badgeClassic
        case .awardWinner: return .badgeAward
        }
    }
}

#Preview {
    VStack(spacing: 8) {
        BadgeView(badge: Badge(type: .genreMatch, label: "Drama", reason: "Matches your taste"))
        BadgeView(badge: Badge(type: .highlyRated, label: "Highly Rated", reason: "9.0+ IMDb"))
        BadgeView(badge: Badge(type: .hiddenGem, label: "Hidden Gem", reason: "Underrated"))
    }
    .padding()
    .background(Color.background)
}
