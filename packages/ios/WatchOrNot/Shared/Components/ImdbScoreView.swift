//
//  ImdbScoreView.swift
//  WatchOrNot
//
//  IMDb score display component
//

import SwiftUI

struct ImdbScoreView: View {
    let score: Double
    let compact: Bool

    init(score: Double, compact: Bool = false) {
        self.score = score
        self.compact = compact
    }

    var body: some View {
        HStack(spacing: compact ? 3 : 4) {
            // IMDb Logo
            ZStack {
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color(red: 245/255, green: 197/255, blue: 24/255)) // #F5C518
                    .frame(width: compact ? 28 : 32, height: compact ? 12 : 14)

                Text("IMDb")
                    .font(.system(size: compact ? 7 : 8, weight: .bold))
                    .foregroundColor(.black)
            }

            // Score
            Text(String(format: "%.1f/10", score))
                .font(.system(size: compact ? 11 : 12, weight: .semibold))
                .foregroundColor(Color(white: 0.85))
        }
    }
}

struct ImdbScoreView_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 16) {
            ImdbScoreView(score: 8.2)
            ImdbScoreView(score: 7.5, compact: true)
        }
        .padding()
        .background(Color.black)
    }
}
