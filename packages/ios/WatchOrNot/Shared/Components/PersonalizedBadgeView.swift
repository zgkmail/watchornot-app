//
//  PersonalizedBadgeView.swift
//  WatchOrNot
//
//  Personalized recommendation badge component
//

import SwiftUI

struct PersonalizedBadgeView: View {
    let badge: String
    let emoji: String
    let compact: Bool

    init(badge: String, emoji: String, compact: Bool = false) {
        self.badge = badge
        self.emoji = emoji
        self.compact = compact
    }

    var displayName: String {
        let badgeNames: [String: String] = [
            "perfect-match": "Perfect Match",
            "great-pick": "Great Pick",
            "worth-a-try": "Worth a Try",
            "mixed-feelings": "Mixed Feelings",
            "not-your-style": "Not Your Style"
        ]
        return badgeNames[badge] ?? badge
    }

    var body: some View {
        HStack(spacing: compact ? 3 : 4) {
            Text(emoji)
                .font(.system(size: compact ? 10 : 11))

            Text(displayName)
                .font(.system(size: compact ? 10 : 11, weight: .semibold))
                .foregroundColor(.purple.opacity(0.9))
        }
        .padding(.horizontal, compact ? 6 : 8)
        .padding(.vertical, compact ? 3 : 4)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.purple.opacity(0.15))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.purple.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

struct PersonalizedBadgeView_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 16) {
            PersonalizedBadgeView(badge: "perfect-match", emoji: "🎯")
            PersonalizedBadgeView(badge: "great-pick", emoji: "⭐", compact: true)
            PersonalizedBadgeView(badge: "worth-a-try", emoji: "👍")
        }
        .padding()
        .background(Color.black)
    }
}
