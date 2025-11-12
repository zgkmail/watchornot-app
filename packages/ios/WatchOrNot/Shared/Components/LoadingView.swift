//
//  LoadingView.swift
//  WatchOrNot
//
//  Loading indicator
//

import SwiftUI

struct LoadingView: View {
    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.5)

                Text("Loading...")
                    .font(.bodyMedium)
                    .foregroundColor(.white)
            }
            .padding(32)
            .background(Color.cardBackground)
            .cornerRadius(16)
        }
    }
}

#Preview {
    LoadingView()
}
