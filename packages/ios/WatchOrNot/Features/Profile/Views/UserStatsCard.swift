//
//  UserStatsCard.swift
//  WatchOrNot
//
//  User statistics card
//

import SwiftUI

struct UserStatsCard: View {
    let stats: UserStats

    var body: some View {
        VStack(spacing: 20) {
            // Tier badge
            VStack(spacing: 8) {
                Text(stats.tier.emoji)
                    .font(.system(size: 60))

                Text(stats.tier.displayName)
                    .font(.headlineMedium)
                    .foregroundColor(.textPrimary)

                Text(stats.tier.description)
                    .font(.bodySmall)
                    .foregroundColor(.textSecondary)
            }

            // Progress to next tier
            if let nextTierVotes = stats.nextTierVotes {
                VStack(spacing: 8) {
                    HStack {
                        Text("Progress to Next Tier")
                            .font(.labelMedium)
                            .foregroundColor(.textSecondary)

                        Spacer()

                        Text("\(stats.totalVotes) / \(nextTierVotes)")
                            .font(.labelMedium)
                            .foregroundColor(.textPrimary)
                    }

                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            Rectangle()
                                .frame(width: geometry.size.width, height: 8)
                                .opacity(0.3)
                                .foregroundColor(.gray)

                            Rectangle()
                                .frame(width: min(CGFloat(stats.progress) * geometry.size.width, geometry.size.width), height: 8)
                                .foregroundColor(.accent)
                        }
                        .cornerRadius(4)
                    }
                    .frame(height: 8)
                }
            } else {
                Text("🎉 Max Tier Achieved!")
                    .font(.labelLarge)
                    .foregroundColor(.success)
            }

            Divider()
                .background(Color.divider)

            // Stats grid
            HStack(spacing: 0) {
                StatItem(
                    label: "Total Votes",
                    value: "\(stats.totalVotes)",
                    icon: "film"
                )

                Divider()
                    .background(Color.divider)
                    .frame(height: 50)

                StatItem(
                    label: "Upvotes",
                    value: "\(stats.upvotes)",
                    icon: "hand.thumbsup.fill",
                    color: .green
                )

                Divider()
                    .background(Color.divider)
                    .frame(height: 50)

                StatItem(
                    label: "Downvotes",
                    value: "\(stats.downvotes)",
                    icon: "hand.thumbsdown.fill",
                    color: .red
                )
            }

            if stats.moviesSnapped > 0 {
                Divider()
                    .background(Color.divider)

                HStack(spacing: 8) {
                    Image(systemName: "camera.fill")
                        .foregroundColor(.accent)

                    Text("\(stats.moviesSnapped) movies snapped")
                        .font(.bodyMedium)
                        .foregroundColor(.textPrimary)

                    Spacer()
                }
            }
        }
        .padding()
        .cardStyle()
    }
}

struct StatItem: View {
    let label: String
    let value: String
    let icon: String
    var color: Color = .textPrimary

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.titleMedium)
                .foregroundColor(color)

            Text(value)
                .font(.headlineSmall)
                .fontWeight(.bold)
                .foregroundColor(.textPrimary)

            Text(label)
                .font(.caption)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    UserStatsCard(
        stats: UserStats(
            tier: .enthusiast,
            totalVotes: 15,
            upvotes: 10,
            downvotes: 3,
            skips: 2,
            moviesSnapped: 5,
            onboardingComplete: true,
            joinedDate: nil,
            nextTierVotes: 25
        )
    )
    .padding()
    .background(Color.background)
}
