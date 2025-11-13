//
//  MoviePosterView.swift
//  WatchOrNot
//
//  Movie poster image view
//

import SwiftUI

struct MoviePosterView: View {
    let posterURL: String?
    let width: CGFloat
    let height: CGFloat

    var body: some View {
        Group {
            if let urlString = posterURL,
               !urlString.isEmpty,
               let url = URL(string: urlString.toPosterURL()) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .empty:
                        placeholderView
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    case .failure:
                        placeholderView
                    @unknown default:
                        placeholderView
                    }
                }
            } else {
                placeholderView
            }
        }
        .frame(width: width, height: height)
        .background(Color.cardBackground)
        .cornerRadius(8)
        .clipped()
    }

    private var placeholderView: some View {
        ZStack {
            Color.cardBackground

            Image(systemName: "film")
                .font(.system(size: width * 0.3))
                .foregroundColor(.textTertiary)
        }
    }
}

#Preview {
    MoviePosterView(
        posterURL: nil,
        width: 120,
        height: 180
    )
}
