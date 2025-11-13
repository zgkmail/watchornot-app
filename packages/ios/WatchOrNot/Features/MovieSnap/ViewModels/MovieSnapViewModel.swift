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
            if let tmdbMovie = searchResults.results.first(where: { result in
                year == nil || result.year == year
            }) ?? searchResults.results.first {

                // Get full details from OMDb if we have IMDb ID
                // For now, create MovieDetails from TMDB data
                movieDetails = MovieDetails(
                    id: String(tmdbMovie.id),
                    title: tmdbMovie.title,
                    year: tmdbMovie.year,
                    genres: [],
                    director: nil,
                    cast: nil,
                    poster: tmdbMovie.posterPath.map { "https://image.tmdb.org/t/p/w500\($0)" },
                    plot: tmdbMovie.overview,
                    imdbRating: tmdbMovie.voteAverage,
                    runtime: nil,
                    imdbId: nil,
                    rated: nil,
                    released: nil,
                    writer: nil,
                    awards: nil,
                    metascore: nil,
                    imdbVotes: nil,
                    boxOffice: nil,
                    production: nil,
                    website: nil
                )
            } else {
                error = "Movie not found in database"
            }

            isLoadingDetails = false
        } catch {
            self.error = "Failed to load movie details: \(error.localizedDescription)"
            isLoadingDetails = false
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
