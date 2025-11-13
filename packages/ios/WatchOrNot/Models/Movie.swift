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
    let director: String?
    let cast: String?
    let poster: String?
    let plot: String?
    let imdbRating: Double?
    let runtime: String?
    let imdbId: String?

    // Computed properties for backwards compatibility
    var directors: [String] {
        guard let director = director else { return [] }
        return [director]
    }

    var castArray: [String] {
        guard let cast = cast else { return [] }
        return cast.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
    }

    enum CodingKeys: String, CodingKey {
        case id, title, year, genres, director, cast, poster, plot, runtime, imdbRating
        case imdbId = "imdb_id"
    }
}

/// Extended movie details
struct MovieDetails: Codable, Identifiable {
    let id: String
    let title: String
    let year: Int
    let genres: [String]
    let director: String?
    let cast: String?
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

    // Computed properties for backwards compatibility
    var directors: [String] {
        guard let director = director else { return [] }
        return [director]
    }

    var castArray: [String] {
        guard let cast = cast else { return [] }
        return cast.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
    }

    enum CodingKeys: String, CodingKey {
        case id, title, year, genres, director, cast, poster, plot, runtime, imdbRating
        case rated, released, writer, awards, metascore, production, website
        case imdbId = "imdb_id"
        case imdbVotes = "imdb_votes"
        case boxOffice = "box_office"
    }
}
