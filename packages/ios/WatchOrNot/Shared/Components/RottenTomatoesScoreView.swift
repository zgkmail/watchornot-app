//
//  RottenTomatoesScoreView.swift
//  WatchOrNot
//
//  Rotten Tomatoes score display component
//

import SwiftUI

struct RottenTomatoesScoreView: View {
    let score: Int
    let compact: Bool

    init(score: Int, compact: Bool = false) {
        self.score = score
        self.compact = compact
    }

    var body: some View {
        HStack(spacing: compact ? 2 : 3) {
            // Tomato emoji
            Text("🍅")
                .font(.system(size: compact ? 11 : 12))

            // Score percentage
            Text("\(score)%")
                .font(.system(size: compact ? 11 : 12, weight: .semibold))
                .foregroundColor(Color(red: 248/255, green: 113/255, blue: 113/255)) // Red-ish color
        }
    }
}

struct RottenTomatoesScoreView_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 16) {
            RottenTomatoesScoreView(score: 85)
            RottenTomatoesScoreView(score: 92, compact: true)
        }
        .padding()
        .background(Color.black)
    }
}
