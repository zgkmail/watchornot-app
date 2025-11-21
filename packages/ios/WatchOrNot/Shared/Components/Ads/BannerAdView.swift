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

    func makeUIView(context: Context) -> BannerView {
        let bannerView = BannerView(adSize: AdSizeBanner)
        bannerView.adUnitID = AdManager.bannerAdUnitID
        bannerView.delegate = context.coordinator

        // Load the ad
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootViewController = windowScene.windows.first?.rootViewController {
            bannerView.rootViewController = rootViewController
            bannerView.load(Request())
        }

        return bannerView
    }

    func updateUIView(_ uiView: BannerView, context: Context) {
        // Banner view doesn't need updates
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    // MARK: - Coordinator

    class Coordinator: NSObject, BannerViewDelegate {
        func bannerViewDidReceiveAd(_ bannerView: BannerView) {
            print("✅ Banner ad loaded successfully")
        }

        func bannerView(_ bannerView: BannerView, didFailToReceiveAdWithError error: Error) {
            print("❌ Banner ad failed to load: \(error.localizedDescription)")
        }

        func bannerViewDidRecordImpression(_ bannerView: BannerView) {
            print("👁️ Banner ad impression recorded")
        }

        func bannerViewWillPresentScreen(_ bannerView: BannerView) {
            print("📱 Banner ad will present screen")
        }

        func bannerViewWillDismissScreen(_ bannerView: BannerView) {
            print("📱 Banner ad will dismiss screen")
        }

        func bannerViewDidDismissScreen(_ bannerView: BannerView) {
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
