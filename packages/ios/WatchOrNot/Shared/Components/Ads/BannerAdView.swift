//
//  BannerAdView.swift
//  WatchOrNot
//
//  SwiftUI wrapper for Google AdMob banner advertisements.
//  Displays banner ads at the bottom of views when user hasn't purchased ad removal.
//

import SwiftUI
import GoogleMobileAds

/// SwiftUI view that displays a Google AdMob banner ad
struct BannerAdView: View {
    @StateObject private var adManager = AdManager.shared

    var body: some View {
        if adManager.shouldShowAds() {
            BannerAdViewRepresentable()
                .frame(height: 50)
                .background(Color(.systemBackground))
        }
    }
}

/// UIViewRepresentable wrapper for GADBannerView
private struct BannerAdViewRepresentable: UIViewRepresentable {
    @StateObject private var adManager = AdManager.shared

    func makeUIView(context: Context) -> GADBannerView {
        let bannerView = GADBannerView(adSize: GADAdSizeBanner)
        bannerView.adUnitID = AdManager.bannerAdUnitID
        bannerView.delegate = context.coordinator

        // Load the ad
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootViewController = windowScene.windows.first?.rootViewController {
            bannerView.rootViewController = rootViewController
            bannerView.load(GADRequest())
        }

        return bannerView
    }

    func updateUIView(_ uiView: GADBannerView, context: Context) {
        // Banner view doesn't need updates
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    // MARK: - Coordinator

    class Coordinator: NSObject, GADBannerViewDelegate {
        func bannerViewDidReceiveAd(_ bannerView: GADBannerView) {
            print("✅ Banner ad loaded successfully")
        }

        func bannerView(_ bannerView: GADBannerView, didFailToReceiveAdWithError error: Error) {
            print("❌ Banner ad failed to load: \(error.localizedDescription)")
        }

        func bannerViewDidRecordImpression(_ bannerView: GADBannerView) {
            print("👁️ Banner ad impression recorded")
        }

        func bannerViewWillPresentScreen(_ bannerView: GADBannerView) {
            print("📱 Banner ad will present screen")
        }

        func bannerViewWillDismissScreen(_ bannerView: GADBannerView) {
            print("📱 Banner ad will dismiss screen")
        }

        func bannerViewDidDismissScreen(_ bannerView: GADBannerView) {
            print("📱 Banner ad dismissed screen")
        }
    }
}

// MARK: - Preview

#Preview {
    VStack {
        Spacer()
        Text("Content Above Ad")
        Spacer()
        BannerAdView()
    }
}
