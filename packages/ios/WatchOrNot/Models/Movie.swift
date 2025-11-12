//
//  Movie.swift
//  WatchOrNot
//
//  Generated from api-contracts.ts
//

import Foundation

/// Basic movie information
struct Movie: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let year: Int
    let genres: [String]
    let directors: [String]
    let cast: [String]
    let poster: String?
    let plot: String?
    let imdbRating: Double?
    let runtime: String?
    let imdbId: String?

    enum CodingKeys: String, CodingKey {
        case id, title, year, genres, directors, cast, poster, plot, runtime
        case imdbRating = "imdb_rating"
        case imdbId = "imdb_id"
    }
}

/// Extended movie details
struct MovieDetails: Codable, Identifiable {
    let id: String
    let title: String
    let year: Int
    let genres: [String]
    let directors: [String]
    let cast: [String]
    let poster: String?
    let plot: String?
    let imdbRating: Double?
    let runtime: String?
    let imdbId: String?
    let rated: String?
    let released: String?
    let writer: String?
    let awards: String?
    let metascore: String?
    let imdbVotes: String?
    let boxOffice: String?
    let production: String?
    let website: String?

    enum CodingKeys: String, CodingKey {
        case id, title, year, genres, directors, cast, poster, plot, runtime
        case rated, released, writer, awards, metascore, production, website
        case imdbRating = "imdb_rating"
        case imdbId = "imdb_id"
        case imdbVotes = "imdb_votes"
        case boxOffice = "box_office"
    }
}
