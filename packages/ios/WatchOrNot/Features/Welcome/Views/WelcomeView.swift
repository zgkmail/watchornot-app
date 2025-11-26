//
//  WelcomeView.swift
//  WatchOrNot
//
//  Single-screen welcome showing app introduction
//

import SwiftUI

struct WelcomeView: View {
    @EnvironmentObject var appState: AppState
    @State private var isAnimating = false

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [
                    Color(red: 0.11, green: 0.11, blue: 0.18),
                    Color.black,
                    Color(red: 0.11, green: 0.11, blue: 0.18)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()
                    .frame(minHeight: 80, maxHeight: 120)

                // Hero Icon
                ZStack {
                    // Main camera icon with gradient
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [.blue, .purple],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 100, height: 100)
                        .shadow(color: .blue.opacity(0.5), radius: 20, x: 0, y: 10)
                        .scaleEffect(isAnimating ? 1.05 : 1.0)

                    Image(systemName: "camera.fill")
                        .font(.system(size: 46))
                        .foregroundColor(.white)

                    // Thumbs up badge
                    Circle()
                        .fill(Color.green)
                        .frame(width: 32, height: 32)
                        .overlay(
                            Text("👍")
                                .font(.system(size: 16))
                        )
                        .shadow(radius: 4)
                        .offset(x: 36, y: -36)

                    // Thumbs down badge
                    Circle()
                        .fill(Color.red)
                        .frame(width: 32, height: 32)
                        .overlay(
                            Text("👎")
                                .font(.system(size: 16))
                        )
                        .shadow(radius: 4)
                        .offset(x: -36, y: 36)
                }
                .padding(.bottom, 32)
                .onAppear {
                    withAnimation(.easeInOut(duration: 2.0).repeatForever(autoreverses: true)) {
                        isAnimating = true
                    }
                }

                // App Title
                VStack(spacing: 8) {
                    Text("Welcome to")
                        .font(.system(size: 24, weight: .medium))
                        .foregroundColor(.white.opacity(0.9))

                    Text("Watch or Skip")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.white)

                    Text("\"One Snap. One Answer.\"")
                        .font(.system(size: 18, weight: .regular))
                        .italic()
                        .foregroundColor(.gray)
                }
                .padding(.bottom, 40)

                // Value Proposition Card
                VStack(spacing: 16) {
                    // Problem statement
                    VStack(spacing: 4) {
                        Text("Wondering if that movie on")
                            .font(.system(size: 16))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)

                        Text("your screen is worth your")
                            .font(.system(size: 16))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)

                        Text("time tonight?")
                            .font(.system(size: 16))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 4)

                    Spacer()
                        .frame(height: 8)

                    // Solution bullets
                    VStack(spacing: 12) {
                        HStack(spacing: 12) {
                            Text("📸")
                                .font(.system(size: 24))
                            Text("Snap a photo")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white)
                            Spacer()
                        }

                        HStack(spacing: 12) {
                            Text("⚡")
                                .font(.system(size: 24))
                            Text("Get instant answer")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white)
                            Spacer()
                        }

                        HStack(spacing: 12) {
                            Text("🎯")
                                .font(.system(size: 24))
                            Text("Based on YOUR taste")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white)
                            Spacer()
                        }
                    }
                    .padding(.horizontal, 8)

                    // Divider
                    Divider()
                        .background(Color.gray.opacity(0.4))
                        .padding(.vertical, 8)

                    // Tagline
                    Text("Personalized AI recommendations in seconds")
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                        .padding(.bottom, 4)
                }
                .padding(24)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.gray.opacity(0.15))
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(
                                    LinearGradient(
                                        colors: [.blue.opacity(0.3), .purple.opacity(0.3)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    ),
                                    lineWidth: 1
                                )
                        )
                )
                .padding(.horizontal, 24)

                Spacer()
                    .frame(minHeight: 32)

                // CTAs
                VStack(spacing: 12) {
                    // Primary CTA
                    Button(action: {
                        appState.markWelcomeSeen()
                        appState.showOnboarding()
                    }) {
                        HStack(spacing: 12) {
                            Text("🎬")
                                .font(.system(size: 20))

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Build Your Taste Profile")
                                    .font(.system(size: 16, weight: .bold))
                                Text("(5 quick votes)")
                                    .font(.system(size: 12))
                                    .opacity(0.9)
                            }
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(
                            LinearGradient(
                                colors: [.blue, .purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(12)
                        .shadow(color: .blue.opacity(0.3), radius: 10, x: 0, y: 4)
                    }

                    // Secondary CTA
                    Button(action: {
                        appState.markWelcomeSeen()
                        appState.skipOnboarding()
                    }) {
                        Text("Skip to app →")
                            .font(.system(size: 14))
                            .foregroundColor(.gray)
                            .underline()
                    }
                    .padding(.top, 4)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 40)
            }
        }
    }
}

#Preview {
    WelcomeView()
        .environmentObject(AppState())
}
