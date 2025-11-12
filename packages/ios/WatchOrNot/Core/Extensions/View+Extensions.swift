//
//  View+Extensions.swift
//  WatchOrNot
//
//  SwiftUI view extensions
//

import SwiftUI

extension View {
    /// Apply card styling
    func cardStyle() -> some View {
        self
            .background(Color.cardBackground)
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.3), radius: 8, x: 0, y: 4)
    }

    /// Add loading overlay
    func loading(_ isLoading: Bool) -> some View {
        self.overlay {
            if isLoading {
                LoadingView()
            }
        }
    }

    /// Conditional modifier
    @ViewBuilder
    func `if`<Content: View>(_ condition: Bool, transform: (Self) -> Content) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }

    /// Hide conditionally
    @ViewBuilder
    func hidden(_ shouldHide: Bool) -> some View {
        if shouldHide {
            self.hidden()
        } else {
            self
        }
    }
}

// Keyboard handling
extension View {
    func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
}
