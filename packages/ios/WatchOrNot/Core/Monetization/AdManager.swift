//
//  AdManager.swift
//  WatchOrNot
//
//  Manages advertisement state and initialization for the app.
//  Handles AdMob SDK initialization and tracks whether user has purchased ad removal.
//

import Foundation
import GoogleMobileAds
import Combine

/// Singleton manager for handling advertisement display and state
@MainActor
class AdManager: NSObject, ObservableObject {
    static let shared = AdManager()

    // MARK: - Published Properties

    /// Whether the user has purchased ad removal
    @Published private(set) var hasRemovedAds: Bool = false

    /// Whether AdMob SDK is initialized
    @Published private(set) var isAdMobInitialized: Bool = false

    // MARK: - Constants

    private let hasRemovedAdsKey = "hasRemovedAds"

    // MARK: - Ad Unit IDs

    #if DEBUG
    // Test ad unit IDs for development
    static let bannerAdUnitID = "ca-app-pub-3940256099942544/2934735716"
    static let interstitialAdUnitID = "ca-app-pub-3940256099942544/4411468910"
    #else
    // Production ad unit IDs (replace with your actual IDs from AdMob)
    static let bannerAdUnitID = "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
    static let interstitialAdUnitID = "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
    #endif

    // MARK: - Initialization

    private override init() {
        super.init()
        loadPurchaseState()
    }

    // MARK: - Public Methods

    /// Initialize the Google Mobile Ads SDK
    func initializeAdMob() {
        guard !isAdMobInitialized && !hasRemovedAds else { return }

        GADMobileAds.sharedInstance().start { [weak self] status in
            DispatchQueue.main.async {
                self?.isAdMobInitialized = true
                print("✅ AdMob initialized: \(status.description)")
            }
        }
    }

    /// Determines whether ads should be displayed
    func shouldShowAds() -> Bool {
        return !hasRemovedAds
    }

    /// Mark that the user has purchased ad removal
    func markAdRemovalPurchased() {
        hasRemovedAds = true
        UserDefaults.standard.set(true, forKey: hasRemovedAdsKey)
        print("✅ Ad removal purchased - ads disabled")
    }

    /// Restore ad removal purchase status (called during purchase restoration)
    func restoreAdRemovalPurchase() {
        hasRemovedAds = true
        UserDefaults.standard.set(true, forKey: hasRemovedAdsKey)
        print("✅ Ad removal restored - ads disabled")
    }

    // MARK: - Private Methods

    private func loadPurchaseState() {
        hasRemovedAds = UserDefaults.standard.bool(forKey: hasRemovedAdsKey)

        if hasRemovedAds {
            print("ℹ️ User has removed ads - AdMob will not initialize")
        }
    }
}
