//
//  WelcomeView.swift
//  WatchOrNot
//
//  Welcome screens showing app introduction and how it works
//

import SwiftUI

struct WelcomeView: View {
    @EnvironmentObject var appState: AppState
    @State private var currentScreen = 0

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

            TabView(selection: $currentScreen) {
                // Screen 1: Welcome & Introduction
                WelcomeScreen1()
                    .tag(0)

                // Screen 2: How It Works
                WelcomeScreen2(
                    onStartOnboarding: {
                        appState.markWelcomeSeen()
                        appState.showOnboarding()
                    },
                    onSkip: {
                        appState.markWelcomeSeen()
                        appState.skipOnboarding()
                    }
                )
                .tag(1)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .ignoresSafeArea()

            // Custom page indicators
            VStack {
                Spacer()
                HStack(spacing: 8) {
                    ForEach(0..<2) { index in
                        if index == currentScreen {
                            Capsule()
                                .fill(Color.blue)
                                .frame(width: 32, height: 4)
                        } else {
                            Circle()
                                .fill(Color.gray.opacity(0.5))
                                .frame(width: 8, height: 8)
                        }
                    }
                }
                .padding(.bottom, 24)
            }
        }
    }
}

// MARK: - Screen 1: Welcome & Introduction
struct WelcomeScreen1: View {
    @State private var isAnimating = false

    var body: some View {
        VStack(spacing: 0) {
            Spacer()
                .frame(height: 60)

            // Icon with thumbs up/down
            ZStack {
                // Main camera icon
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [.blue, .purple],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 120, height: 120)
                    .shadow(color: .blue.opacity(0.5), radius: 20, x: 0, y: 10)
                    .scaleEffect(isAnimating ? 1.05 : 1.0)

                Image(systemName: "camera.fill")
                    .font(.system(size: 56))
                    .foregroundColor(.white)

                // Thumbs up badge
                Circle()
                    .fill(Color.green)
                    .frame(width: 36, height: 36)
                    .overlay(
                        Text("👍")
                            .font(.system(size: 18))
                    )
                    .shadow(radius: 4)
                    .offset(x: 42, y: -42)

                // Thumbs down badge
                Circle()
                    .fill(Color.red)
                    .frame(width: 36, height: 36)
                    .overlay(
                        Text("👎")
                            .font(.system(size: 18))
                    )
                    .shadow(radius: 4)
                    .offset(x: -42, y: 42)
            }
            .padding(.bottom, 24)
            .onAppear {
                withAnimation(.easeInOut(duration: 2.0).repeatForever(autoreverses: true)) {
                    isAnimating = true
                }
            }

            // Title
            VStack(spacing: 12) {
                Text("Welcome to")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)

                Text("WatchOrNot")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)

                Text("\"One Snap. One Answer.\"")
                    .font(.system(size: 20, weight: .regular))
                    .italic()
                    .foregroundColor(.gray)
            }
            .padding(.bottom, 32)

            // Description card
            VStack(spacing: 12) {
                Text("Wondering if that movie")
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)

                Text("on your screen is worth")
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)

                Text("watching tonight?")
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)

                Spacer()
                    .frame(height: 12)

                Text("Just snap a photo and")
                    .foregroundColor(.blue)
                    .fontWeight(.medium)
                    .multilineTextAlignment(.center)

                HStack(spacing: 4) {
                    Text("get your answer in seconds")
                        .foregroundColor(.blue)
                        .fontWeight(.medium)

                    Text("⚡")
                }
            }
            .font(.system(size: 16))
            .padding(24)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.gray.opacity(0.15))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                    )
            )
            .padding(.horizontal, 24)

            Spacer()

            // Swipe hint
            HStack(spacing: 8) {
                Text("Swipe to see how")
                    .font(.system(size: 14))
                    .foregroundColor(.gray)

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.gray)
                    .offset(x: isAnimating ? 4 : 0)
            }
            .padding(.bottom, 60)
        }
    }
}

// MARK: - Screen 2: How It Works
struct WelcomeScreen2: View {
    let onStartOnboarding: () -> Void
    let onSkip: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            Spacer()
                .frame(height: 40)

            // Title
            Text("How It Works")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.white)
                .padding(.bottom, 24)

            // 3-step flow in card
            VStack(spacing: 16) {
                // Step 1
                HStack(spacing: 16) {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [.blue, Color(red: 0.2, green: 0.4, blue: 0.8)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 40, height: 40)
                        .overlay(
                            Text("1")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                        )
                        .shadow(radius: 4)

                    HStack(spacing: 12) {
                        // Movie icon
                        ZStack {
                            RoundedRectangle(cornerRadius: 8)
                                .fill(
                                    LinearGradient(
                                        colors: [Color(red: 0.1, green: 0.2, blue: 0.4), .black],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 64, height: 64)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color.gray.opacity(0.6), lineWidth: 1)
                                )

                            Text("🎬")
                                .font(.system(size: 32))

                            Text("📺")
                                .font(.system(size: 20))
                                .offset(x: 20, y: 20)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("See a movie")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white)
                            Text("on your screen")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white)
                        }
                    }

                    Spacer()
                }

                // Arrow down
                Image(systemName: "arrow.down")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.blue)
                    .frame(maxWidth: .infinity, alignment: .center)

                // Step 2
                HStack(spacing: 16) {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [.purple, Color(red: 0.6, green: 0.2, blue: 0.8)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 40, height: 40)
                        .overlay(
                            Text("2")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                        )
                        .shadow(radius: 4)

                    HStack(spacing: 12) {
                        // Phone icon
                        ZStack {
                            RoundedRectangle(cornerRadius: 8)
                                .fill(
                                    LinearGradient(
                                        colors: [Color.gray.opacity(0.8), .black],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 64, height: 64)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color.gray.opacity(0.7), lineWidth: 2)
                                )

                            Text("📱")
                                .font(.system(size: 48))

                            Text("✨")
                                .font(.system(size: 16))
                                .offset(x: 20, y: -20)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Snap a quick")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white)
                            Text("photo")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white)
                        }
                    }

                    Spacer()
                }

                // Arrow down
                Image(systemName: "arrow.down")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.purple)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 4)

                // Step 3
                HStack(spacing: 16) {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [.green, Color(red: 0.2, green: 0.7, blue: 0.3)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 40, height: 40)
                        .overlay(
                            Text("3")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                        )
                        .shadow(radius: 4)

                    HStack(spacing: 12) {
                        // Result icon
                        ZStack {
                            RoundedRectangle(cornerRadius: 8)
                                .fill(
                                    LinearGradient(
                                        colors: [Color.gray.opacity(0.8), .black],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 64, height: 64)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color.gray.opacity(0.7), lineWidth: 2)
                                )

                            VStack(spacing: 4) {
                                Text("✅")
                                    .font(.system(size: 24))

                                Text("Watch It!")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(
                                        LinearGradient(
                                            colors: [.green, Color(red: 0.2, green: 0.7, blue: 0.3)],
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        )
                                    )
                                    .cornerRadius(4)
                            }

                            Text("🎉")
                                .font(.system(size: 16))
                                .offset(x: 20, y: -20)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Get personalized")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white)
                            Text("answer")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white)
                        }
                    }

                    Spacer()
                }

                // Description
                Divider()
                    .background(Color.gray.opacity(0.5))
                    .padding(.top, 8)

                VStack(spacing: 2) {
                    Text("Instant recommendations")
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                    Text("based on your taste")
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                }
                .padding(.top, 8)
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.gray.opacity(0.15))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                    )
            )
            .padding(.horizontal, 20)

            Spacer()

            // CTAs
            VStack(spacing: 12) {
                Button(action: onStartOnboarding) {
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

                Button(action: onSkip) {
                    Text("Skip to app →")
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                        .underline()
                }
                .padding(.top, 4)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 60)
        }
    }
}

#Preview {
    WelcomeView()
        .environmentObject(AppState())
}
