//
//  HelpAndSupportView.swift
//  WatchOrNot
//
//  Help and support screen with recommendation badge information
//

import SwiftUI

struct HelpAndSupportView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // How Recommendation Badge Works section
                BadgeExplanationSection()
                    .padding(.horizontal)

                Divider()
                    .background(Color.divider)
                    .padding(.horizontal)

                // Future help sections can be added here
                // FAQ, Contact Support, etc.
            }
            .padding(.vertical)
        }
        .background(Color.background.ignoresSafeArea())
        .navigationTitle("Help and Support")
        .navigationBarTitleDisplayMode(.large)
    }
}

struct BadgeExplanationSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("How Recommendation Badge Works")
                .font(.titleSmall)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)

            Text("Based on IMDb score + your genre, director, and cast preferences")
                .font(.caption)
                .foregroundColor(.textSecondary)

            VStack(alignment: .leading, spacing: 8) {
                BadgeRow(emoji: "🎯", text: "Perfect Match - This is right up your alley!")
                BadgeRow(emoji: "⭐", text: "Great Pick - You'll probably enjoy this")
                BadgeRow(emoji: "👍", text: "Worth a Try - Give it a shot")
                BadgeRow(emoji: "🤷", text: "Mixed Feelings - Could go either way")
                BadgeRow(emoji: "❌", text: "Not Your Style - Probably skip this")
            }
        }
        .padding()
        .cardStyle()
    }
}

struct BadgeRow: View {
    let emoji: String
    let text: String

    var body: some View {
        HStack(spacing: 8) {
            Text(emoji)
                .font(.bodyMedium)

            Text(text)
                .font(.caption)
                .foregroundColor(.textSecondary)
        }
    }
}

#Preview {
    NavigationView {
        HelpAndSupportView()
    }
}
