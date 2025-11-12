//
//  Typography.swift
//  WatchOrNot
//
//  Typography styles
//

import SwiftUI

extension Font {
    // Display
    static let displayLarge = Font.system(size: 57, weight: .bold)
    static let displayMedium = Font.system(size: 45, weight: .bold)
    static let displaySmall = Font.system(size: 36, weight: .bold)

    // Headline
    static let headlineLarge = Font.system(size: 32, weight: .semibold)
    static let headlineMedium = Font.system(size: 28, weight: .semibold)
    static let headlineSmall = Font.system(size: 24, weight: .semibold)

    // Title
    static let titleLarge = Font.system(size: 22, weight: .medium)
    static let titleMedium = Font.system(size: 18, weight: .medium)
    static let titleSmall = Font.system(size: 16, weight: .medium)

    // Body
    static let bodyLarge = Font.system(size: 16, weight: .regular)
    static let bodyMedium = Font.system(size: 14, weight: .regular)
    static let bodySmall = Font.system(size: 12, weight: .regular)

    // Label
    static let labelLarge = Font.system(size: 14, weight: .medium)
    static let labelMedium = Font.system(size: 12, weight: .medium)
    static let labelSmall = Font.system(size: 11, weight: .medium)
}

// Text style modifiers
extension Text {
    func movieTitle() -> some View {
        self
            .font(.titleLarge)
            .foregroundColor(.textPrimary)
    }

    func movieYear() -> some View {
        self
            .font(.bodyMedium)
            .foregroundColor(.textSecondary)
    }

    func sectionHeader() -> some View {
        self
            .font(.headlineSmall)
            .foregroundColor(.textPrimary)
    }

    func badge() -> some View {
        self
            .font(.labelSmall)
            .fontWeight(.semibold)
    }
}
