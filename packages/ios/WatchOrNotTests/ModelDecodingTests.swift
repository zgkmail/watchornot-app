//
//  ModelDecodingTests.swift
//  WatchOrNotTests
//
//  Unit tests for data model decoding
//

import XCTest
@testable import WatchOrNot

final class ModelDecodingTests: XCTestCase {

    // MARK: - UserTier Tests

    func testUserTierDecoding() throws {
        // Test all tier levels
        let tiers: [UserTier] = [.newcomer, .explorer, .enthusiast, .expert, .master]

        for tier in tiers {
            XCTAssertNotNil(tier.displayName)
            XCTAssertNotNil(tier.emoji)
            XCTAssertNotNil(tier.description)
            XCTAssertGreaterThanOrEqual(tier.votesRequired, 0)
        }
    }

    func testUserTierVotesRequired() {
        XCTAssertEqual(UserTier.newcomer.votesRequired, 0)
        XCTAssertEqual(UserTier.explorer.votesRequired, Config.Tier.explorerMin)
        XCTAssertEqual(UserTier.enthusiast.votesRequired, Config.Tier.enthusiastMin)
        XCTAssertEqual(UserTier.expert.votesRequired, Config.Tier.expertMin)
        XCTAssertEqual(UserTier.master.votesRequired, Config.Tier.masterMin)
    }

    // MARK: - HistoryEntry Tests

    func testHistoryEntryDecoding() throws {
        // Given - JSON from backend
        let json = """
        {
            "movie_id": "tt1234567",
            "title": "Test Movie",
            "year": "2023",
            "poster": "https://example.com/poster.jpg",
            "rating": "up",
            "timestamp": 1672531200000,
            "genre": "Action",
            "imdb_rating": 7.5,
            "rotten_tomatoes": 85,
            "metacritic": 70,
            "director": "Test Director",
            "cast": "Actor 1, Actor 2",
            "trailer_url": "https://youtube.com/watch?v=test",
            "badge": "Genre Match",
            "badgeEmoji": "🎬",
            "badgeDescription": "Matches your preferred genre"
        }
        """.data(using: .utf8)!

        // When
        let decoder = JSONDecoder()
        let entry = try decoder.decode(HistoryEntry.self, from: json)

        // Then
        XCTAssertEqual(entry.movieId, "tt1234567")
        XCTAssertEqual(entry.title, "Test Movie")
        XCTAssertEqual(entry.year, 2023)
        XCTAssertEqual(entry.rating, "up")
        XCTAssertEqual(entry.genre, "Action")
        XCTAssertEqual(entry.imdbRating, 7.5)
        XCTAssertEqual(entry.rottenTomatoes, 85)
        XCTAssertEqual(entry.metacritic, 70)
        XCTAssertEqual(entry.badge, "Genre Match")
    }

    func testHistoryEntryYearAsString() throws {
        // Given - Year as string (TEXT from SQLite)
        let json = """
        {
            "movie_id": "tt1234567",
            "title": "Test Movie",
            "year": "2023",
            "timestamp": 1672531200000
        }
        """.data(using: .utf8)!

        // When
        let entry = try JSONDecoder().decode(HistoryEntry.self, from: json)

        // Then
        XCTAssertEqual(entry.year, 2023)
    }

    func testHistoryEntryYearAsInt() throws {
        // Given - Year as integer
        let json = """
        {
            "movie_id": "tt1234567",
            "title": "Test Movie",
            "year": 2023,
            "timestamp": 1672531200000
        }
        """.data(using: .utf8)!

        // When
        let entry = try JSONDecoder().decode(HistoryEntry.self, from: json)

        // Then
        XCTAssertEqual(entry.year, 2023)
    }

    func testHistoryEntryTimestampDecoding() throws {
        // Given - Timestamp in milliseconds
        let json = """
        {
            "movie_id": "tt1234567",
            "title": "Test Movie",
            "year": 2023,
            "timestamp": 1672531200000
        }
        """.data(using: .utf8)!

        // When
        let entry = try JSONDecoder().decode(HistoryEntry.self, from: json)

        // Then - Should convert milliseconds to Date
        XCTAssertNotNil(entry.timestamp)
        // Timestamp: 1672531200000 ms = 2023-01-01 00:00:00 UTC
        let expectedDate = Date(timeIntervalSince1970: 1672531200)
        XCTAssertEqual(entry.timestamp.timeIntervalSince1970, expectedDate.timeIntervalSince1970, accuracy: 1.0)
    }

    // MARK: - TMDB Model Tests

    func testTMDBSearchResultDecoding() throws {
        // Given
        let json = """
        {
            "id": 12345,
            "media_type": "movie",
            "title": "Test Movie",
            "release_date": "2023-01-01",
            "overview": "A test movie",
            "poster_path": "/test.jpg",
            "vote_average": 7.5,
            "popularity": 100.5
        }
        """.data(using: .utf8)!

        // When
        let result = try JSONDecoder().decode(TMDBSearchResult.self, from: json)

        // Then
        XCTAssertEqual(result.id, 12345)
        XCTAssertEqual(result.mediaType, "movie")
        XCTAssertEqual(result.displayTitle, "Test Movie")
        XCTAssertEqual(result.year, 2023)
    }

    func testTMDBSearchResultTVShow() throws {
        // Given - TV show has "name" instead of "title"
        let json = """
        {
            "id": 12345,
            "media_type": "tv",
            "name": "Test Show",
            "first_air_date": "2023-06-15"
        }
        """.data(using: .utf8)!

        // When
        let result = try JSONDecoder().decode(TMDBSearchResult.self, from: json)

        // Then
        XCTAssertEqual(result.displayTitle, "Test Show")
        XCTAssertEqual(result.year, 2023)
    }

    // MARK: - API Response Tests

    func testRatingsResponseDecoding() throws {
        // Given
        let json = """
        {
            "ratings": [],
            "count": 0
        }
        """.data(using: .utf8)!

        // When
        let response = try JSONDecoder().decode(RatingsResponse.self, from: json)

        // Then
        XCTAssertEqual(response.count, 0)
        XCTAssertTrue(response.ratings.isEmpty)
    }

    func testBadgeResponseDecoding() throws {
        // Given
        let json = """
        {
            "badge": "Genre Match",
            "badgeEmoji": "🎬",
            "badgeDescription": "This matches your favorite genre",
            "tier": "expert"
        }
        """.data(using: .utf8)!

        // When
        let response = try JSONDecoder().decode(BadgeResponse.self, from: json)

        // Then
        XCTAssertEqual(response.badge, "Genre Match")
        XCTAssertEqual(response.badgeEmoji, "🎬")
        XCTAssertNotNil(response.badgeDescription)
        XCTAssertEqual(response.tier, "expert")
    }

    func testOMDbRatingsResponseDecoding() throws {
        // Given
        let json = """
        {
            "found": true,
            "title": "Test Movie",
            "year": "2023",
            "director": "Test Director",
            "actors": "Actor 1, Actor 2",
            "ratings": {
                "imdb": {
                    "rating": 7.5,
                    "votes": "100,000"
                },
                "rottenTomatoes": 85,
                "metacritic": 70
            },
            "responseTime": 150
        }
        """.data(using: .utf8)!

        // When
        let response = try JSONDecoder().decode(OMDbRatingsResponse.self, from: json)

        // Then
        XCTAssertEqual(response.found, true)
        XCTAssertEqual(response.imdbRating, 7.5)
        XCTAssertEqual(response.rottenTomatoes, 85)
        XCTAssertEqual(response.metacritic, 70)
    }
}
