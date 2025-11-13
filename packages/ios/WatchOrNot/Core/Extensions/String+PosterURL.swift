//
//  String+PosterURL.swift
//  WatchOrNot
//
//  Extension to convert poster paths to full TMDB URLs
//

import Foundation

extension String {
    /// Converts a poster path to a full TMDB image URL
    /// - Returns: Full URL string for the poster image, or the original string if already a full URL
    func toPosterURL() -> String {
        // If it's already a full URL, return as is
        if self.hasPrefix("http://") || self.hasPrefix("https://") {
            return self
        }

        // If it's a TMDB path (starts with /), construct the full URL
        if self.hasPrefix("/") {
            return "https://image.tmdb.org/t/p/w500\(self)"
        }

        // Otherwise return as is
        return self
    }
}
