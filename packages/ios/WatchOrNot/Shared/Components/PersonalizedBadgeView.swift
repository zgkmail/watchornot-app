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
                .foregroundColor(Color(red: 216/255, green: 180/255, blue: 254/255)) // Purple-300
        }
        .padding(.horizontal, compact ? 6 : 8)
        .padding(.vertical, compact ? 3 : 4)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color(red: 88/255, green: 28/255, blue: 135/255).opacity(0.3)) // Purple-900/30
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color(red: 168/255, green: 85/255, blue: 247/255).opacity(0.3), lineWidth: 1) // Purple-500/30
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
