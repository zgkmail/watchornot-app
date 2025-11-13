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
    @Published var isAnalyzing: Bool = false
    @Published var isLoadingDetails: Bool = false
    @Published var error: String?
    @Published var showCamera: Bool = false
    @Published var showPhotoPicker: Bool = false
    @Published var searchQuery: String = ""

    private let apiClient: APIClient

    init(apiClient: APIClient = .shared) {
        self.apiClient = apiClient
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

            if response.success, let data = response.data {
                // Load movie details
                await loadMovieDetails(title: data.title, year: data.year)
            } else {
                error = response.error ?? "Failed to recognize movie poster"
            }

            isAnalyzing = false
        } catch {
            self.error = "Failed to analyze image: \(error.localizedDescription)"
            isAnalyzing = false
        }
    }

    /// Load full movie details from TMDB/OMDb
    private func loadMovieDetails(title: String, year: Int?) async {
        isLoadingDetails = true

        do {
            // Search TMDB for the movie
            let searchResults = try await apiClient.request(
                .searchMovies(query: title),
                expecting: TMDBSearchResponse.self
            )

            // Find best match
            guard let tmdbMovie = searchResults.results.first(where: { result in
                year == nil || result.year == year
            }) ?? searchResults.results.first else {
                error = "Movie not found in database"
                isLoadingDetails = false
                return
            }

            // Get full TMDB details including genres, credits, videos
            let tmdbDetails = try await apiClient.request(
                .getMovieDetails(id: String(tmdbMovie.id)),
                expecting: TMDBDetailsResponse.self
            )

            // Get OMDb ratings if we have IMDb ID
            var omdbData: OMDbDetailsResponse? = nil
            if let imdbId = tmdbDetails.externalIds?.imdbId {
                do {
                    omdbData = try await apiClient.request(
                        .getOMDbDetails(imdbId: imdbId),
                        expecting: OMDbDetailsResponse.self
                    )
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
            let genres = tmdbDetails.genres.prefix(3).map { $0.name }
            let genreString = genres.joined(separator: ", ")

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
                title: tmdbMovie.title,
                year: tmdbMovie.year,
                genres: Array(genres),
                director: director,
                cast: cast,
                poster: tmdbMovie.posterPath.map { "https://image.tmdb.org/t/p/w500\($0)" },
                plot: tmdbMovie.overview,
                imdbRating: omdbData?.imdbRating ?? tmdbDetails.voteAverage,
                rottenTomatoes: omdbData?.rottenTomatoes,
                metacritic: omdbData?.metacritic,
                runtime: tmdbDetails.runtime.map { "\($0) min" },
                imdbId: tmdbDetails.externalIds?.imdbId,
                rated: omdbData?.rated,
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

            // Save to backend automatically (without rating)
            await saveMovieToBackend()

            isLoadingDetails = false
        } catch {
            self.error = "Failed to load movie details: \(error.localizedDescription)"
            isLoadingDetails = false
        }
    }

    /// Save movie to backend
    private func saveMovieToBackend() async {
        guard let movie = movieDetails else { return }

        struct SaveMovieRequest: Codable {
            let id: String
            let title: String
            let year: Int
            let genre: String
            let director: String?
            let cast: String?
            let poster: String?
            let imdbRating: Double?
            let rottenTomatoes: Int?
            let metacritic: Int?
            let trailerUrl: String?
            let rating: String?
        }

        let request = SaveMovieRequest(
            id: movie.id,
            title: movie.title,
            year: movie.year,
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
            struct SaveRatingResponse: Codable {
                let success: Bool
            }

            _ = try await apiClient.request(
                .saveRating(request),
                expecting: SaveRatingResponse.self
            )
            print("✅ Movie saved to backend")
        } catch {
            print("⚠️ Could not save movie to backend:", error.localizedDescription)
        }
    }

    /// Reset state
    func reset() {
        capturedImage = nil
        analysisResult = nil
        movieDetails = nil
        error = nil
        isAnalyzing = false
        isLoadingDetails = false
    }

    /// Open camera
    func openCamera() {
        showCamera = true
    }
}

// TMDB Search Response
struct TMDBSearchResponse: Codable {
    let results: [TMDBSearchResult]
    let totalResults: Int

    enum CodingKeys: String, CodingKey {
        case results
        case totalResults = "total_results"
    }
}

struct TMDBSearchResult: Codable {
    let id: Int
    let title: String
    let year: Int
    let overview: String
    let posterPath: String?
    let voteAverage: Double
    let popularity: Double

    enum CodingKeys: String, CodingKey {
        case id, title, overview, popularity
        case year = "release_year"
        case posterPath = "poster_path"
        case voteAverage = "vote_average"
    }
}

// TMDB Details Response
struct TMDBDetailsResponse: Codable {
    let id: Int
    let title: String
    let overview: String
    let voteAverage: Double
    let runtime: Int?
    let genres: [TMDBGenre]
    let externalIds: TMDBExternalIds?
    let credits: TMDBCredits?
    let videos: TMDBVideos?

    enum CodingKeys: String, CodingKey {
        case id, title, overview, runtime, genres, credits, videos
        case voteAverage = "vote_average"
        case externalIds = "external_ids"
    }
}

struct TMDBGenre: Codable {
    let id: Int
    let name: String
}

struct TMDBExternalIds: Codable {
    let imdbId: String?

    enum CodingKeys: String, CodingKey {
        case imdbId = "imdb_id"
    }
}

struct TMDBCredits: Codable {
    let cast: [TMDBCastMember]
    let crew: [TMDBCrewMember]
}

struct TMDBCastMember: Codable {
    let name: String
}

struct TMDBCrewMember: Codable {
    let name: String
    let job: String
}

struct TMDBVideos: Codable {
    let results: [TMDBVideo]
}

struct TMDBVideo: Codable {
    let key: String
    let site: String
    let type: String
}

// OMDb Response
struct OMDbDetailsResponse: Codable {
    let found: Bool?
    let imdbRating: Double?
    let rottenTomatoes: Int?
    let metacritic: Int?
    let director: String?
    let actors: String?
    let rated: String?

    enum CodingKeys: String, CodingKey {
        case found, director, actors, rated
        case imdbRating = "imdb_rating"
        case rottenTomatoes = "rotten_tomatoes"
        case metacritic
    }
}
