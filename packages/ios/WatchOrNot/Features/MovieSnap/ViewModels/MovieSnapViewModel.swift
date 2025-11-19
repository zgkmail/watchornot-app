//
//  MovieSnapViewModel.swift
//  WatchOrNot
//
//  MovieSnap view model for camera and Claude Vision
//

import Foundation
import UIKit

@MainActor
class MovieSnapViewModel: ObservableObject {
    @Published var capturedImage: UIImage?
    @Published var analysisResult: ClaudeImageAnalysisResponse?
    @Published var movieDetails: MovieDetails?
    @Published var currentRating: String?
    @Published var badge: String?
    @Published var badgeEmoji: String?
    @Published var badgeDescription: String?
    @Published var votedCount: Int = 0
    @Published var isAnalyzing: Bool = false
    @Published var isLoadingDetails: Bool = false
    @Published var error: String?
    @Published var showCamera: Bool = false
    @Published var showPhotoPicker: Bool = false
    @Published var searchQuery: String = ""
    @Published var showManualSearch: Bool = false

    private let apiClient: APIClient

    init(apiClient: APIClient = .shared) {
        self.apiClient = apiClient

        // Fetch initial voted count
        Task {
            await fetchVotedCount()
        }
    }

    /// Open photo library picker
    func openPhotoPicker() {
        showPhotoPicker = true
    }

    /// Search for a movie by name
    func searchMovie(query: String) async {
        guard !query.isEmpty else { return }

        isLoadingDetails = true
        error = nil
        movieDetails = nil

        await loadMovieDetails(title: query, year: nil)
    }

    /// Analyze captured image
    func analyzeImage(_ image: UIImage) async {
        capturedImage = image
        isAnalyzing = true
        error = nil
        analysisResult = nil
        movieDetails = nil

        // Convert image to JPEG data
        guard let imageData = image.jpegData(compressionQuality: Config.imageCompressionQuality) else {
            error = "Failed to process image"
            isAnalyzing = false
            return
        }

        // Check size
        if imageData.count > Config.maxImageSize {
            error = "Image is too large. Please try another photo."
            isAnalyzing = false
            return
        }

        do {
            let response = try await apiClient.uploadImage(
                .analyzeImage,
                imageData: imageData,
                mimeType: "image/jpeg"
            )

            analysisResult = response

            // Check if we got a title (success case)
            if let title = response.title {
                // Load movie details with media type
                await loadMovieDetails(
                    title: title,
                    year: response.year,
                    mediaType: response.mediaType
                )
            } else if let error = response.error {
                self.error = error
            } else if let message = response.message {
                self.error = message
            } else {
                self.error = "Failed to recognize movie or TV show from image"
            }

            isAnalyzing = false
        } catch {
            self.error = "Failed to analyze image: \(error.localizedDescription)"
            isAnalyzing = false
        }
    }

    /// Load full movie details from TMDB/OMDb
    private func loadMovieDetails(title: String, year: Int?, mediaType: String? = nil) async {
        isLoadingDetails = true

        do {
            // Search TMDB for the movie
            let searchResults = try await apiClient.request(
                .searchMovies(query: title),
                expecting: TMDBSearchResponse.self
            )

            // Filter to only movies and TV shows, prefer detected media type
            var validResults = searchResults.results.filter { result in
                result.mediaType == "movie" || result.mediaType == "tv"
            }

            // If Claude detected a media type, prefer those results
            if let detectedType = mediaType {
                let matchingType = validResults.filter { $0.mediaType == detectedType }
                if !matchingType.isEmpty {
                    validResults = matchingType
                }
            }

            // Find best match (by year if available)
            guard let tmdbMovie = validResults.first(where: { result in
                year == nil || result.year == year
            }) ?? validResults.first else {
                error = "Movie or TV show not found in database"
                isLoadingDetails = false
                return
            }

            // Validate media type
            guard tmdbMovie.mediaType == "movie" || tmdbMovie.mediaType == "tv" else {
                error = "Invalid media type: \(tmdbMovie.mediaType)"
                isLoadingDetails = false
                return
            }

            print("📦 Fetching details for: \(tmdbMovie.displayTitle) (\(tmdbMovie.mediaType))")

            // Get full TMDB details including genres, credits, videos
            let tmdbDetails = try await apiClient.request(
                .getMovieDetails(mediaType: tmdbMovie.mediaType, id: String(tmdbMovie.id)),
                expecting: TMDBDetailsResponse.self
            )

            // Get OMDb ratings if we have IMDb ID
            var omdbData: OMDbRatingsResponse? = nil
            if let imdbId = tmdbDetails.externalIds?.imdbId {
                do {
                    omdbData = try await apiClient.request(
                        .getOMDbRatings(imdbId: imdbId),
                        expecting: OMDbRatingsResponse.self
                    )
                    print("✅ OMDb ratings fetched:")
                    print("   IMDb: \(omdbData?.imdbRating ?? 0)")
                    print("   RT: \(omdbData?.rottenTomatoes ?? 0)")
                    print("   Metacritic: \(omdbData?.metacritic ?? 0)")
                } catch {
                    print("⚠️ Could not fetch OMDb ratings:", error.localizedDescription)
                }
            }

            // Extract trailer URL
            var trailerUrl: String? = nil
            if let videos = tmdbDetails.videos?.results {
                if let trailer = videos.first(where: { $0.site == "YouTube" && ($0.type == "Trailer" || $0.type == "Teaser") }) {
                    trailerUrl = "https://www.youtube.com/watch?v=\(trailer.key)"
                }
            }

            // Extract genres (first 3)
            let genres: [String]
            if let tmdbGenres = tmdbDetails.genres {
                genres = tmdbGenres.prefix(3).map { $0.name }
            } else {
                genres = []
            }
            let genreString = genres.isEmpty ? "Unknown" : genres.joined(separator: ", ")

            // Extract director from credits
            let director = tmdbDetails.credits?.crew.first(where: { $0.job == "Director" })?.name ?? omdbData?.director

            // Extract cast (first 3)
            let cast: String?
            if let omdbActors = omdbData?.actors {
                cast = omdbActors
            } else if let tmdbCast = tmdbDetails.credits?.cast.prefix(3).map({ $0.name }) {
                cast = tmdbCast.joined(separator: ", ")
            } else {
                cast = nil
            }

            movieDetails = MovieDetails(
                id: String(tmdbMovie.id),
                title: tmdbMovie.displayTitle,
                year: tmdbMovie.year,
                genres: Array(genres),
                director: director,
                cast: cast,
                poster: tmdbMovie.posterPath.map { "https://image.tmdb.org/t/p/w500\($0)" },
                plot: tmdbDetails.overview ?? tmdbMovie.overview,
                imdbRating: omdbData?.imdbRating ?? tmdbDetails.voteAverage ?? 0.0,
                rottenTomatoes: omdbData?.rottenTomatoes,
                metacritic: omdbData?.metacritic,
                runtime: tmdbDetails.runtime.map { "\($0) min" },
                imdbId: tmdbDetails.externalIds?.imdbId,
                rated: nil,
                released: nil,
                writer: nil,
                awards: nil,
                metascore: omdbData?.metacritic,
                imdbVotes: nil,
                boxOffice: nil,
                production: nil,
                website: nil,
                trailerUrl: trailerUrl,
                genreString: genreString
            )

            print("✅ Movie details loaded successfully")
            print("   Title: \(tmdbMovie.displayTitle)")
            print("   Year from TMDB: \(tmdbMovie.year)")
            print("   Poster: \(movieDetails?.poster ?? "none")")
            print("   IMDb Rating: \(movieDetails?.imdbRating.map { String($0) } ?? "none")")
            print("   RT Score: \(movieDetails?.rottenTomatoes.map { String($0) } ?? "none")")

            // Save to backend automatically (without rating)
            await saveMovieToBackend()

            // Fetch voted count and badge
            await fetchVotedCount()
            await fetchBadgeForCurrentMovie()

            isLoadingDetails = false
        } catch {
            self.error = "Failed to load movie details: \(error.localizedDescription)"
            isLoadingDetails = false
        }
    }

    /// Save movie to backend
    private func saveMovieToBackend() async {
        guard let movie = movieDetails else { return }

        // IMPORTANT: Prevent sending year: 0 to backend
        let yearValue = movie.year > 0 ? movie.year : Calendar.current.component(.year, from: Date())

        print("🔍 DEBUG: saveMovieToBackend()")
        print("   Title: \(movie.title)")
        print("   movie.year: \(movie.year)")
        print("   yearValue to send: \(yearValue)")

        if movie.year == 0 {
            print("⚠️ WARNING: MovieDetails has year = 0 for '\(movie.title)' (ID: \(movie.id))")
            print("   Using fallback year: \(yearValue)")
        }

        let request = SaveMovieRequest(
            id: movie.id,
            title: movie.title,
            year: yearValue,
            genre: movie.genreString ?? "Drama",
            director: movie.director,
            cast: movie.cast,
            poster: movie.poster,
            imdbRating: movie.imdbRating,
            rottenTomatoes: movie.rottenTomatoes,
            metacritic: movie.metacritic,
            trailerUrl: movie.trailerUrl,
            rating: nil  // No rating yet
        )

        do {
            _ = try await apiClient.request(
                .saveRating(request),
                expecting: SaveRatingResponse.self
            )
            print("✅ Movie saved to backend")
        } catch {
            print("⚠️ Could not save movie to backend:", error.localizedDescription)
        }
    }

    /// Fetch voted count from backend
    func fetchVotedCount() async {
        do {
            // Get all ratings - backend returns { ratings: [...], count: number }
            struct RatingsResponse: Codable {
                let ratings: [HistoryEntry]
                let count: Int
            }

            let response = try await apiClient.request(
                .getRatings,
                expecting: RatingsResponse.self
            )
            votedCount = response.ratings.filter { $0.rating != nil }.count
            print("✅ Voted count: \(votedCount)")
        } catch {
            print("⚠️ Could not fetch voted count:", error.localizedDescription)
        }
    }

    /// Submit rating for the current movie
    func submitRating(_ rating: String) async {
        guard let movie = movieDetails else { return }

        // Update UI immediately
        currentRating = rating

        // IMPORTANT: Prevent sending year: 0 to backend
        let yearValue = movie.year > 0 ? movie.year : Calendar.current.component(.year, from: Date())

        if movie.year == 0 {
            print("⚠️ WARNING: MovieDetails has year = 0 for '\(movie.title)' (ID: \(movie.id))")
            print("   Using fallback year: \(yearValue)")
        }

        let request = SaveMovieRequest(
            id: movie.id,
            title: movie.title,
            year: yearValue,
            genre: movie.genreString ?? "Drama",
            director: movie.director,
            cast: movie.cast,
            poster: movie.poster,
            imdbRating: movie.imdbRating,
            rottenTomatoes: movie.rottenTomatoes,
            metacritic: movie.metacritic,
            trailerUrl: movie.trailerUrl,
            rating: rating
        )

        do {
            _ = try await apiClient.request(
                .saveRating(request),
                expecting: SaveRatingResponse.self
            )
            print("✅ Rating saved: \(rating)")

            // Fetch updated voted count and badge
            await fetchVotedCount()
            await fetchBadgeForCurrentMovie()

            // Reset to default view after voting (small delay to show the voted state)
            try? await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
            reset()
        } catch {
            print("⚠️ Could not save rating:", error.localizedDescription)
            self.error = "Failed to save rating. Please try again."
        }
    }

    /// Fetch badge for the current movie
    private func fetchBadgeForCurrentMovie() async {
        guard let movie = movieDetails, votedCount >= 5 else {
            badge = nil
            badgeEmoji = nil
            badgeDescription = nil
            return
        }

        do {
            let request = CalculateBadgeRequest(
                id: movie.id,
                title: movie.title,
                genre: movie.genreString,
                imdbRating: movie.imdbRating,
                rottenTomatoes: movie.rottenTomatoes,
                metacritic: movie.metacritic,
                director: movie.director,
                cast: movie.cast
            )

            let response = try await apiClient.request(
                .calculateBadge(request),
                expecting: BadgeResponse.self
            )

            badge = response.badge
            badgeEmoji = response.badgeEmoji
            badgeDescription = response.badgeDescription
            print("✅ Badge fetched: \(badge ?? "none")")
        } catch {
            print("⚠️ Could not fetch badge:", error.localizedDescription)
        }
    }

    /// Handle wrong title - switch to manual search
    func handleWrongTitle() {
        // Save the current title for search
        searchQuery = movieDetails?.title ?? ""

        // Reset to show search view
        capturedImage = nil
        analysisResult = nil
        movieDetails = nil
        currentRating = nil
        badge = nil
        badgeEmoji = nil
        badgeDescription = nil
        error = nil
        isAnalyzing = false
        isLoadingDetails = false

        // Show manual search
        showManualSearch = true
    }

    /// Skip rating - reset and go back
    func skipRating() {
        reset()
    }

    /// Reset state
    func reset() {
        capturedImage = nil
        analysisResult = nil
        movieDetails = nil
        currentRating = nil
        badge = nil
        badgeEmoji = nil
        badgeDescription = nil
        error = nil
        isAnalyzing = false
        isLoadingDetails = false
        showManualSearch = false
    }

    /// Open camera
    func openCamera() {
        showCamera = true
    }
}
