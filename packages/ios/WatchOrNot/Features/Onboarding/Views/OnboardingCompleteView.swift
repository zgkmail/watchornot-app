//
//  OnboardingCompleteView.swift
//  WatchOrNot
//
//  Onboarding completion screen
//

import SwiftUI

struct OnboardingCompleteView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Success icon
            ZStack {
                Circle()
                    .fill(Color.success.opacity(0.2))
                    .frame(width: 120, height: 120)

                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.success)
            }

            // Title
            Text("You're All Set!")
                .font(.displayMedium)
                .foregroundColor(.textPrimary)
                .multilineTextAlignment(.center)

            // Message
            Text("We've built your taste profile.\nTime to discover amazing movies!")
                .font(.bodyLarge)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .lineSpacing(4)

            Spacer()

            // Continue button
            Button {
                appState.completeOnboarding()
            } label: {
                Text("Start Exploring")
                    .font(.titleMedium)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                    .background(Color.accent)
                    .cornerRadius(16)
            }
            .padding(.horizontal, 40)
            .padding(.bottom, 40)
        }
    }
}

#Preview {
    OnboardingCompleteView()
        .environmentObject(AppState())
        .background(Color.background)
}
