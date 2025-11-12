//
//  Colors.swift
//  WatchOrNot
//
//  App color palette
//

import SwiftUI

extension Color {
    // Primary colors
    static let accent = Color("AccentColor")
    static let background = Color("Background")
    static let surface = Color("Surface")

    // Text colors
    static let textPrimary = Color("TextPrimary")
    static let textSecondary = Color("TextSecondary")
    static let textTertiary = Color("TextTertiary")

    // Semantic colors
    static let success = Color("Success")
    static let error = Color("Error")
    static let warning = Color("Warning")

    // Badge colors
    static let badgeGenre = Color.blue
    static let badgeDirector = Color.purple
    static let badgeCast = Color.yellow
    static let badgeRated = Color.red
    static let badgeGem = Color.green
    static let badgeClassic = Color.orange
    static let badgeAward = Color(red: 1.0, green: 0.84, blue: 0.0) // Gold

    // UI element colors
    static let cardBackground = Color(white: 0.15)
    static let divider = Color(white: 0.3)

    // Gradient colors
    static let gradientStart = Color(red: 0.1, green: 0.1, blue: 0.15)
    static let gradientEnd = Color(red: 0.05, green: 0.05, blue: 0.1)
}
