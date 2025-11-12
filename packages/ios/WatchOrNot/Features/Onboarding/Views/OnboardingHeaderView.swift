//
//  OnboardingHeaderView.swift
//  WatchOrNot
//
//  Onboarding header with progress
//

import SwiftUI

struct OnboardingHeaderView: View {
    let progress: Double
    let votesRemaining: Int

    var body: some View {
        VStack(spacing: 12) {
            // Title
            Text("Build Your Taste Profile")
                .font(.headlineSmall)
                .foregroundColor(.textPrimary)

            // Subtitle
            Text("\(votesRemaining) movies remaining")
                .font(.bodyMedium)
                .foregroundColor(.textSecondary)

            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .frame(width: geometry.size.width, height: 8)
                        .opacity(0.3)
                        .foregroundColor(.gray)

                    Rectangle()
                        .frame(width: min(CGFloat(progress) * geometry.size.width, geometry.size.width), height: 8)
                        .foregroundColor(.accent)
                        .animation(.linear, value: progress)
                }
                .cornerRadius(4)
            }
            .frame(height: 8)
        }
    }
}

#Preview {
    OnboardingHeaderView(progress: 0.3, votesRemaining: 7)
        .padding()
        .background(Color.background)
}
