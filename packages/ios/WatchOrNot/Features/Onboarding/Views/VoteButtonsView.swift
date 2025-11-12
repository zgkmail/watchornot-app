//
//  VoteButtonsView.swift
//  WatchOrNot
//
//  Vote buttons for onboarding
//

import SwiftUI

struct VoteButtonsView: View {
    let onUpvote: () async -> Void
    let onDownvote: () async -> Void
    let onSkip: () async -> Void

    var body: some View {
        HStack(spacing: 20) {
            // Downvote
            VoteButton(
                icon: "hand.thumbsdown.fill",
                color: .red,
                size: 60
            ) {
                await onDownvote()
            }

            // Skip
            VoteButton(
                icon: "arrow.right",
                color: .gray,
                size: 50
            ) {
                await onSkip()
            }

            // Upvote
            VoteButton(
                icon: "hand.thumbsup.fill",
                color: .green,
                size: 60
            ) {
                await onUpvote()
            }
        }
    }
}

struct VoteButton: View {
    let icon: String
    let color: Color
    let size: CGFloat
    let action: () async -> Void

    @State private var isPressed = false

    var body: some View {
        Button {
            Task {
                await action()
            }
        } label: {
            Image(systemName: icon)
                .font(.system(size: size * 0.4))
                .foregroundColor(.white)
                .frame(width: size, height: size)
                .background(color)
                .clipShape(Circle())
                .shadow(color: color.opacity(0.5), radius: 10, x: 0, y: 5)
        }
        .scaleEffect(isPressed ? 0.9 : 1.0)
        .animation(.spring(response: 0.3), value: isPressed)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true }
                .onEnded { _ in isPressed = false }
        )
    }
}

#Preview {
    VoteButtonsView(
        onUpvote: {},
        onDownvote: {},
        onSkip: {}
    )
    .padding()
    .background(Color.background)
}
