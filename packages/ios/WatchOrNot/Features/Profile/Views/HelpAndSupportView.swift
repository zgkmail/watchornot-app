//
//  HelpAndSupportView.swift
//  WatchOrNot
//
//  Help and support screen with recommendation badge information
//

import SwiftUI

struct HelpAndSupportView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var showingEmailError = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // How Recommendation Badge Works section
                BadgeExplanationSection()
                    .padding(.horizontal)

                Divider()
                    .background(Color.divider)
                    .padding(.horizontal)

                // Contact & Feedback section
                ContactSection(showingEmailError: $showingEmailError)
                    .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .background(Color.background.ignoresSafeArea())
        .navigationTitle("Help and Support")
        .navigationBarTitleDisplayMode(.large)
        .alert("Unable to Send Email", isPresented: $showingEmailError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Please make sure you have an email app configured on your device, or contact us at zgkmail@gmail.com")
        }
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

struct ContactSection: View {
    @Binding var showingEmailError: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Get in Touch")
                .font(.titleSmall)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)

            Text("Have a question, suggestion, or found a bug? We'd love to hear from you!")
                .font(.caption)
                .foregroundColor(.textSecondary)

            VStack(spacing: 12) {
                // Contact Support via Email button (No account required!)
                Button {
                    sendSupportEmail()
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: "envelope.fill")
                            .font(.titleMedium)
                            .foregroundColor(.blue)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Contact Support")
                                .font(.bodyMedium)
                                .fontWeight(.medium)
                                .foregroundColor(.textPrimary)

                            Text("Send us an email")
                                .font(.caption)
                                .foregroundColor(.textSecondary)
                        }

                        Spacer()

                        Image(systemName: "arrow.up.right")
                            .font(.caption)
                            .foregroundColor(.textTertiary)
                    }
                    .padding()
                    .background(Color.cardBackground)
                    .cornerRadius(12)
                }

                // Report a Bug button
                Button {
                    openGitHubIssue(type: .bug)
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: "ladybug.fill")
                            .font(.titleMedium)
                            .foregroundColor(.red)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Report a Bug")
                                .font(.bodyMedium)
                                .fontWeight(.medium)
                                .foregroundColor(.textPrimary)

                            Text("Requires GitHub account")
                                .font(.caption)
                                .foregroundColor(.textSecondary)
                        }

                        Spacer()

                        Image(systemName: "arrow.up.right")
                            .font(.caption)
                            .foregroundColor(.textTertiary)
                    }
                    .padding()
                    .background(Color.cardBackground)
                    .cornerRadius(12)
                }

                // Request a Feature button
                Button {
                    openGitHubIssue(type: .feature)
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: "lightbulb.fill")
                            .font(.titleMedium)
                            .foregroundColor(.yellow)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Request a Feature")
                                .font(.bodyMedium)
                                .fontWeight(.medium)
                                .foregroundColor(.textPrimary)

                            Text("Requires GitHub account")
                                .font(.caption)
                                .foregroundColor(.textSecondary)
                        }

                        Spacer()

                        Image(systemName: "arrow.up.right")
                            .font(.caption)
                            .foregroundColor(.textTertiary)
                    }
                    .padding()
                    .background(Color.cardBackground)
                    .cornerRadius(12)
                }
            }
        }
        .padding()
        .cardStyle()
    }

    enum IssueType {
        case bug
        case feature
    }

    private func openGitHubIssue(type: IssueType) {
        let baseURL = "https://github.com/zgkmail/watchornot-app/issues/new"

        var urlString: String
        switch type {
        case .bug:
            let title = "Bug Report: "
            let body = """
            **Describe the bug:**
            A clear description of what the bug is.

            **Steps to reproduce:**
            1. Go to '...'
            2. Tap on '...'
            3. See error

            **Expected behavior:**
            What you expected to happen.

            **Device information:**
            - Device: [e.g., iPhone 14 Pro]
            - iOS version: [e.g., iOS 17.0]
            - App version: [e.g., 1.0.0]

            **Screenshots:**
            If applicable, add screenshots to help explain your problem.
            """
            let encodedTitle = title.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
            let encodedBody = body.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
            urlString = "\(baseURL)?title=\(encodedTitle)&body=\(encodedBody)&labels=bug"

        case .feature:
            let title = "Feature Request: "
            let body = """
            **Feature description:**
            A clear description of the feature you'd like to see.

            **Problem it solves:**
            Explain what problem this feature would solve or what it would improve.

            **Proposed solution:**
            How you envision this feature working.

            **Additional context:**
            Any other context or screenshots about the feature request.
            """
            let encodedTitle = title.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
            let encodedBody = body.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
            urlString = "\(baseURL)?title=\(encodedTitle)&body=\(encodedBody)&labels=enhancement"
        }

        if let url = URL(string: urlString) {
            UIApplication.shared.open(url)
        }
    }

    private func sendSupportEmail() {
        let email = "zgkmail@gmail.com"
        let subject = "Watch or Skip Support"
        let body = """


        ---
        Device: \(UIDevice.current.model)
        iOS Version: \(UIDevice.current.systemVersion)
        App Version: \(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "Unknown")
        """

        let encodedSubject = subject.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let encodedBody = body.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""

        if let url = URL(string: "mailto:\(email)?subject=\(encodedSubject)&body=\(encodedBody)") {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url)
            } else {
                showingEmailError = true
            }
        }
    }
}

#Preview {
    NavigationView {
        HelpAndSupportView()
    }
}
