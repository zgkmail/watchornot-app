//
//  AppearanceManager.swift
//  WatchOrNot
//
//  Manages the app's appearance mode (light, dark, or system)
//

import SwiftUI

class AppearanceManager: ObservableObject {
    @Published var userPreference: AppearanceMode {
        didSet {
            UserDefaults.standard.set(userPreference.rawValue, forKey: "appearanceMode")
        }
    }

    enum AppearanceMode: String, CaseIterable, Identifiable {
        case system = "System"
        case light = "Light"
        case dark = "Dark"

        var id: String { rawValue }

        var icon: String {
            switch self {
            case .system:
                return "circle.lefthalf.filled"
            case .light:
                return "sun.max.fill"
            case .dark:
                return "moon.stars.fill"
            }
        }

        var description: String {
            switch self {
            case .system:
                return "Follow system settings"
            case .light:
                return "Light mode"
            case .dark:
                return "Dark mode"
            }
        }
    }

    init() {
        // Load saved preference or default to system
        if let saved = UserDefaults.standard.string(forKey: "appearanceMode"),
           let mode = AppearanceMode(rawValue: saved) {
            self.userPreference = mode
        } else {
            self.userPreference = .system
        }
    }

    /// Returns the ColorScheme to apply, or nil for system default
    var colorScheme: ColorScheme? {
        switch userPreference {
        case .system:
            return nil  // Use system default
        case .light:
            return .light
        case .dark:
            return .dark
        }
    }
}
