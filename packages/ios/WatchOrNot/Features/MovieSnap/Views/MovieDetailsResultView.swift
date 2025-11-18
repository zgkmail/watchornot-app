//
//  MovieDetailsResultView.swift
//  WatchOrNot
//
//  Movie details after successful snap - matches web app design
//

import SwiftUI

struct MovieDetailsResultView: View {
    let movieDetails: MovieDetails
    let analysisData: ClaudeImageAnalysisResponse?
    let votedCount: Int
    let currentRating: String?
    let badge: String?
    let badgeEmoji: String?
    let badgeDescription: String?
    let onRating: (String) -> Void
    let onSkip: () -> Void
    let onWrongTitle: () -> Void
    let onReset: () -> Void

    var body: some View {
        ZStack {
            // Gradient background (matches web app)
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.12, green: 0.12, blue: 0.16), // gray-800
                    Color(red: 0.07, green: 0.07, blue: 0.10), // gray-900
                    Color.black
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            // Bottom sheet card
            VStack {
                Spacer()

                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        // Poster + Movie Info Row
                        HStack(alignment: .top, spacing: 16) {
                            // Poster (96x144 to match web app)
                            if let posterURL = movieDetails.poster {
                                MoviePosterView(
                                    posterURL: posterURL,
                                    width: 96,
                                    height: 144
                                )
                                .cornerRadius(12)
                                .shadow(color: .black.opacity(0.3), radius: 8, x: 0, y: 4)
                            }

                            // Movie Info
                            VStack(alignment: .leading, spacing: 8) {
                                // Title
                                Text(movieDetails.title)
                                    .font(.system(size: 24, weight: .bold))
                                    .foregroundColor(.white)
                                    .lineLimit(3)

                                // "Wrong title? Search instead" button
                                Button(action: onWrongTitle) {
                                    Text("Wrong title? Search instead")
                                        .font(.system(size: 12))
                                        .foregroundColor(Color(.systemGray))
                                        .underline()
                                }
                                .padding(.bottom, 4)

                                // Year • Genre
                                Text("\(movieDetails.year) • \(movieDetails.genreString ?? movieDetails.genres.joined(separator: ", "))")
                                    .font(.system(size: 14))
                                    .foregroundColor(Color(.systemGray))

                                // Director
                                if let director = movieDetails.director {
                                    HStack(alignment: .top, spacing: 4) {
                                        Text("Director:")
                                            .font(.system(size: 12))
                                            .foregroundColor(Color(.systemGray))
                                        Text(director)
                                            .font(.system(size: 12))
                                            .foregroundColor(Color(.systemGray2))
                                    }
                                }

                                // Cast
                                if let cast = movieDetails.cast {
                                    HStack(alignment: .top, spacing: 4) {
                                        Text("Starring:")
                                            .font(.system(size: 12))
                                            .foregroundColor(Color(.systemGray))
                                        Text(cast)
                                            .font(.system(size: 12))
                                            .foregroundColor(Color(.systemGray2))
                                            .lineLimit(2)
                                    }
                                }

                                // Trailer link
                                if let trailerUrl = movieDetails.trailerUrl {
                                    Link(destination: URL(string: trailerUrl)!) {
                                        HStack(spacing: 4) {
                                            Text("🎬")
                                                .font(.system(size: 12))
                                            Text("Watch Trailer")
                                                .font(.system(size: 12))
                                                .foregroundColor(Color(.systemBlue))
                                        }
                                    }
                                    .padding(.top, 4)
                                }
                            }
                        }
                        .padding(20)

                        // Badge or Unlock Message
                        if let badge = badge, let badgeEmoji = badgeEmoji, let badgeDescription = badgeDescription {
                            // Show badge (user has 5+ votes)
                            HStack(spacing: 12) {
                                Text(badgeEmoji)
                                    .font(.system(size: 32))

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(getBadgeDisplayName(badge))
                                        .font(.system(size: 20, weight: .bold))
                                        .foregroundColor(.white)

                                    Text(badgeDescription)
                                        .font(.system(size: 14))
                                        .foregroundColor(Color(red: 0.82, green: 0.71, blue: 0.99)) // purple-200
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(12)
                            .background(
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color(red: 0.38, green: 0.16, blue: 0.56).opacity(0.3), // purple-900/30
                                        Color(red: 0.15, green: 0.30, blue: 0.58).opacity(0.3)  // blue-900/30
                                    ]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color(red: 0.65, green: 0.33, blue: 1.0).opacity(0.3), lineWidth: 1) // purple-500/30
                            )
                            .padding(.horizontal, 20)
                            .padding(.bottom, 16)
                        } else if votedCount < 5 {
                            // Show unlock message (user has < 5 votes)
                            HStack(spacing: 12) {
                                Text("🔒")
                                    .font(.system(size: 20))
                                    .foregroundColor(Color(.systemGray))

                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Unlock Recommendations")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundColor(Color(.systemGray2))

                                    let remaining = 5 - votedCount
                                    Text("Vote on \(remaining) more \(remaining == 1 ? "title" : "titles") to see personalized recommendations")
                                        .font(.system(size: 12))
                                        .foregroundColor(Color(.systemGray))
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(12)
                            .background(
                                Color(red: 0.12, green: 0.12, blue: 0.16).opacity(0.5) // gray-800/50
                            )
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color(.systemGray).opacity(0.3), lineWidth: 1)
                            )
                            .padding(.horizontal, 20)
                            .padding(.bottom, 16)
                        }

                        // Ratings Grid (IMDb, Rotten Tomatoes, Metacritic)
                        HStack(spacing: 12) {
                            // IMDb
                            if let imdbRating = movieDetails.imdbRating {
                                VStack(spacing: 4) {
                                    Text("\(String(format: "%.1f", imdbRating))/10")
                                        .font(.system(size: 24, weight: .bold))
                                        .foregroundColor(Color(red: 0.98, green: 0.82, blue: 0.25)) // yellow-400
                                    Text("IMDb")
                                        .font(.system(size: 12))
                                        .foregroundColor(Color(.systemGray))
                                }
                                .frame(maxWidth: .infinity)
                            }

                            // Rotten Tomatoes
                            if let rottenTomatoes = movieDetails.rottenTomatoes {
                                VStack(spacing: 4) {
                                    Text("\(rottenTomatoes)%")
                                        .font(.system(size: 24, weight: .bold))
                                        .foregroundColor(Color(red: 0.94, green: 0.31, blue: 0.31)) // red-500
                                    Text("Rotten 🍅")
                                        .font(.system(size: 12))
                                        .foregroundColor(Color(.systemGray))
                                }
                                .frame(maxWidth: .infinity)
                            }

                            // Metacritic
                            if let metacritic = movieDetails.metacritic {
                                VStack(spacing: 4) {
                                    Text("\(metacritic)/100")
                                        .font(.system(size: 24, weight: .bold))
                                        .foregroundColor(Color(red: 0.13, green: 0.72, blue: 0.50)) // green-500
                                    Text("Metacritic")
                                        .font(.system(size: 12))
                                        .foregroundColor(Color(.systemGray))
                                }
                                .frame(maxWidth: .infinity)
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 24)
                        .overlay(
                            Rectangle()
                                .frame(height: 1)
                                .foregroundColor(Color(.systemGray).opacity(0.3)),
                            alignment: .bottom
                        )

                        // Call to action text
                        VStack(spacing: 8) {
                            Text("What's your take on this title?")
                                .font(.system(size: 14))
                                .foregroundColor(.white)

                            Text("Vote to build your taste profile!")
                                .font(.system(size: 14))
                                .foregroundColor(.white)

                            Button(action: onSkip) {
                                Text("Skip For Now | Vote Later in History")
                                    .font(.system(size: 14))
                                    .foregroundColor(Color(.systemGray))
                            }
                            .padding(.top, 4)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)

                        // Vote buttons
                        HStack(spacing: 12) {
                            // Thumbs Up
                            Button(action: {
                                onRating("up")
                            }) {
                                Image(systemName: "hand.thumbsup.fill")
                                    .font(.system(size: 32))
                                    .foregroundColor(currentRating == "up" ? .white : Color(.systemGray2))
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 64)
                                    .background(
                                        currentRating == "up" ?
                                            Color(red: 0.13, green: 0.72, blue: 0.50) : // green-500
                                            Color(red: 0.29, green: 0.29, blue: 0.32)   // gray-600
                                    )
                                    .cornerRadius(12)
                            }

                            // Thumbs Down
                            Button(action: {
                                onRating("down")
                            }) {
                                Image(systemName: "hand.thumbsdown.fill")
                                    .font(.system(size: 32))
                                    .foregroundColor(currentRating == "down" ? .white : Color(.systemGray2))
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 64)
                                    .background(
                                        currentRating == "down" ?
                                            Color(red: 0.94, green: 0.31, blue: 0.31) : // red-500
                                            Color(red: 0.29, green: 0.29, blue: 0.32)   // gray-600
                                    )
                                    .cornerRadius(12)
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 20)
                    }
                }
                .background(
                    Color(red: 0.12, green: 0.12, blue: 0.16) // gray-800
                )
                .cornerRadius(24, corners: [.topLeft, .topRight])
                .shadow(color: .black.opacity(0.5), radius: 20, x: 0, y: -5)
                .frame(maxHeight: UIScreen.main.bounds.height * 0.75)
            }
        }
    }

    private func getBadgeDisplayName(_ badge: String) -> String {
        switch badge {
        case "perfect-match": return "Perfect Match"
        case "great-pick": return "Great Pick"
        case "worth-a-try": return "Worth a Try"
        case "mixed-feelings": return "Mixed Feelings"
        case "not-your-style": return "Not Your Style"
        default: return badge.capitalized
        }
    }
}

// Helper extension for specific corner radius
extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

#Preview {
    MovieDetailsResultView(
        movieDetails: MovieDetails(
            id: "1",
            title: "The Shawshank Redemption",
            year: 1994,
            genres: ["Drama"],
            director: "Frank Darabont",
            cast: "Tim Robbins, Morgan Freeman",
            poster: nil,
            plot: "Two imprisoned men bond over a number of years.",
            imdbRating: 9.3,
            rottenTomatoes: 91,
            metacritic: 80,
            runtime: "142 min",
            imdbId: "tt0111161",
            rated: "R",
            released: nil,
            writer: nil,
            awards: nil,
            metascore: 80,
            imdbVotes: nil,
            boxOffice: nil,
            production: nil,
            website: nil,
            trailerUrl: "https://www.youtube.com/watch?v=6hB3S9bIaco",
            genreString: "Drama"
        ),
        analysisData: ClaudeImageAnalysisResponse(
            title: "The Shawshank Redemption",
            year: 1994,
            mediaType: "movie",
            confidence: 0.9,
            model: "claude-3-haiku-20240307",
            processingTime: 1500,
            message: nil,
            error: nil
        ),
        votedCount: 10,
        currentRating: "up",
        badge: "perfect-match",
        badgeEmoji: "🎯",
        badgeDescription: "This is right up your alley!",
        onRating: { _ in },
        onSkip: {},
        onWrongTitle: {},
        onReset: {}
    )
}
