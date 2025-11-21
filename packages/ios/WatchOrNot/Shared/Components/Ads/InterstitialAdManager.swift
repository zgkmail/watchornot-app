//
//  InterstitialAdManager.swift
//  WatchOrNot
//
//  Manages interstitial (fullscreen) advertisements.
//  Shows interstitial ads at key moments (e.g., every 5 movie snaps).
//

import Foundation
import GoogleMobileAds
import UIKit

/// Singleton manager for displaying interstitial ads
@MainActor
class InterstitialAdManager: NSObject, ObservableObject {
    static let shared = InterstitialAdManager()

    // MARK: - Properties

    private var interstitialAd: InterstitialAd?
    private var isLoading = false
    private let adManager = AdManager.shared

    // MARK: - Initialization

    private override init() {
        super.init()
    }

    // MARK: - Public Methods

    /// Load an interstitial ad (call this in advance before showing)
    func loadAd() {
        guard adManager.shouldShowAds() && !isLoading else { return }

        isLoading = true

        InterstitialAd.load(
            with: AdManager.interstitialAdUnitID,
            request: Request(),
            completionHandler: { [weak self] ad, error in
            guard let self = self else { return }

            self.isLoading = false

            if let error = error {
                print("❌ Failed to load interstitial ad: \(error.localizedDescription)")
                return
            }

            self.interstitialAd = ad
            self.interstitialAd?.fullScreenContentDelegate = self
            print("✅ Interstitial ad loaded successfully")
            }
        )
    }

    /// Show the interstitial ad if one is loaded
    func showAdIfAvailable() {
        guard adManager.shouldShowAds() else { return }

        guard let interstitialAd = interstitialAd else {
            print("ℹ️ Interstitial ad not ready - loading new ad")
            loadAd()
            return
        }

        // Get the root view controller
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootViewController = windowScene.windows.first?.rootViewController else {
            print("❌ Could not find root view controller")
            return
        }

        // Present the ad
        interstitialAd.present(from: rootViewController)
    }

    /// Check if an ad is ready to show
    func isAdReady() -> Bool {
        return interstitialAd != nil && adManager.shouldShowAds()
    }
}

// MARK: - GADFullScreenContentDelegate

extension InterstitialAdManager: FullScreenContentDelegate {
    func adDidRecordImpression(_ ad: FullScreenPresentingAd) {
        print("👁️ Interstitial ad impression recorded")
    }

    func adDidRecordClick(_ ad: FullScreenPresentingAd) {
        print("🖱️ Interstitial ad clicked")
    }

    func ad(_ ad: FullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: Error) {
        print("❌ Interstitial ad failed to present: \(error.localizedDescription)")
        // Load a new ad for next time
        loadAd()
    }

    func adWillPresentFullScreenContent(_ ad: FullScreenPresentingAd) {
        print("📱 Interstitial ad will present")
    }

    func adWillDismissFullScreenContent(_ ad: FullScreenPresentingAd) {
        print("📱 Interstitial ad will dismiss")
    }

    func adDidDismissFullScreenContent(_ ad: FullScreenPresentingAd) {
        print("📱 Interstitial ad dismissed")
        // Clear the ad and load a new one for next time
        interstitialAd = nil
        loadAd()
    }
}
