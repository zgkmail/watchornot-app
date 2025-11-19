# WatchOrNot iOS Monetization Setup Guide

## Overview

WatchOrNot uses a **freemium model with ads**:
- **Free tier**: Full functionality with banner and interstitial ads
- **Premium tier**: One-time $4.99 purchase to remove all ads permanently

## Implementation Components

### ✅ Completed Code Implementation

All monetization code has been implemented:

1. **AdMob Integration** - Banner and interstitial ads
2. **StoreKit Integration** - One-time "Remove Ads" purchase
3. **UI Updates** - Purchase buttons and ad-free status in Profile
4. **Ad Placement** - Banners in Recommendations, History, and Profile views
5. **Interstitial Logic** - Shows fullscreen ad every 5 movie snaps

---

## Setup Steps

### Step 1: Add Google Mobile Ads SDK to Xcode

#### Option A: Swift Package Manager (Recommended)

1. Open `WatchOrNot.xcodeproj` in Xcode
2. Go to **File > Add Package Dependencies**
3. Enter URL: `https://github.com/googleads/swift-package-manager-google-mobile-ads.git`
4. Select **Up to Next Major Version**: `11.0.0` (or latest)
5. Click **Add Package**
6. Select target: `WatchOrNot`
7. Click **Add Package**

#### Option B: CocoaPods (Alternative)

If using CocoaPods, add to `Podfile`:

```ruby
target 'WatchOrNot' do
  use_frameworks!
  pod 'Google-Mobile-Ads-SDK', '~> 11.0'
end
```

Then run:
```bash
cd packages/ios
pod install
```

---

### Step 2: Add AdMob App ID to Info.plist

1. Create an AdMob account at https://apps.admob.com
2. Create a new iOS app in AdMob console
3. Copy your **AdMob App ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`)
4. Open `Info.plist` in Xcode
5. Add new key:
   - **Key**: `GADApplicationIdentifier`
   - **Type**: String
   - **Value**: Your AdMob App ID

Example:
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>
```

> **Note**: The example ID above is a test ID. Replace with your actual AdMob App ID.

---

### Step 3: Create Ad Units in AdMob

1. Go to **Apps** in AdMob console
2. Select your WatchOrNot iOS app
3. Click **Ad units** > **Add ad unit**

#### Create Banner Ad Unit
- **Format**: Banner
- **Name**: "WatchOrNot Banner"
- Copy the **Ad unit ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY`)

#### Create Interstitial Ad Unit
- **Format**: Interstitial
- **Name**: "WatchOrNot Interstitial"
- Copy the **Ad unit ID**

---

### Step 4: Update Ad Unit IDs in Code

Open `packages/ios/WatchOrNot/Core/Monetization/AdManager.swift` and replace the production ad unit IDs:

```swift
#else
// Production ad unit IDs (replace with your actual IDs from AdMob)
static let bannerAdUnitID = "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"      // ← Your banner ID
static let interstitialAdUnitID = "ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ" // ← Your interstitial ID
#endif
```

> **Important**: Leave the `#if DEBUG` test IDs unchanged - they're for development/testing.

---

### Step 5: Set Up In-App Purchase in App Store Connect

#### 5.1 Create App in App Store Connect

1. Log in to https://appstoreconnect.apple.com
2. Go to **My Apps** > **+** > **New App**
3. Fill in app details:
   - **Platform**: iOS
   - **Name**: WatchOrNot
   - **Bundle ID**: Your bundle ID (e.g., `com.yourcompany.watchornot`)
   - **SKU**: `watchornot-ios`

#### 5.2 Create In-App Purchase

1. In your app, go to **Features** tab
2. Click **In-App Purchases** > **+**
3. Select **Non-Consumable**
4. Fill in details:

| Field | Value |
|-------|-------|
| **Reference Name** | Remove Ads |
| **Product ID** | `com.watchornot.removeads` |
| **Price** | $4.99 USD (Tier 5) |

5. **Localizations** (add at least one):
   - **Language**: English (U.S.)
   - **Display Name**: Remove Ads
   - **Description**: Remove all advertisements and enjoy WatchOrNot ad-free, forever. One-time purchase, no subscriptions.

6. **Review Information**:
   - **Screenshot**: Upload screenshot showing the "Remove Ads" button in Profile view

7. Click **Save**

#### 5.3 Important: Do NOT Submit for Review Yet

The IAP will be reviewed when you submit your app for the first time. You can test it immediately using Sandbox.

---

### Step 6: Add StoreKit Capability to Xcode

1. Open `WatchOrNot.xcodeproj` in Xcode
2. Select the **WatchOrNot** target
3. Go to **Signing & Capabilities** tab
4. Click **+ Capability**
5. Add **In-App Purchase**

---

### Step 7: Configure Sandbox Testing

#### 7.1 Create Sandbox Test User

1. In App Store Connect, go to **Users and Access** > **Sandbox**
2. Click **+** to add tester
3. Fill in:
   - **Email**: Use a **unique** email (e.g., `testuser1@yourcompany.com`)
   - **Password**: Create a secure password
   - **Country/Region**: Your testing region

#### 7.2 Sign Out of Production App Store

On your test device:
1. Go to **Settings** > **App Store**
2. Tap your name at top
3. Tap **Sign Out**
4. **Do NOT sign in with Sandbox account yet** - iOS will prompt you during first purchase

#### 7.3 Test the Purchase Flow

1. Build and run app on device (simulator doesn't support IAP)
2. Go to **Profile** tab
3. Tap **Remove Ads** button
4. iOS will prompt: "Use existing Apple ID or create new?"
5. Select **Use Existing Apple ID**
6. Enter your **Sandbox test account** credentials
7. Complete purchase (you won't be charged - it's sandbox)
8. Verify ads disappear throughout the app

---

## Testing Checklist

### Ad Display Testing

- [ ] **Banner ads appear** at bottom of Recommendations view
- [ ] **Banner ads appear** at bottom of History view
- [ ] **Banner ads appear** at bottom of Profile view
- [ ] **Interstitial ad shows** after every 5 movie snaps
- [ ] **Test ads load** (Google test ads with green banner)

### Purchase Flow Testing

- [ ] **"Remove Ads" button** shows in Profile (when ads enabled)
- [ ] **Tapping button** shows Apple purchase sheet
- [ ] **Completing purchase** removes all ads immediately
- [ ] **"Ad-Free Experience" status** shows after purchase
- [ ] **Restore Purchases** button works (reinstall app to test)
- [ ] **Purchase persists** after app restart

### Edge Cases

- [ ] **No ads show** if user already purchased (check Profile status)
- [ ] **Interstitial counter resets** after showing ad
- [ ] **Ads don't show during onboarding** (good UX)
- [ ] **Error handling** when purchase fails (e.g., user cancels)

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         WatchOrNotApp.swift             │
│  - Initialize AdMob on launch           │
│  - Load StoreKit products               │
│  - Pre-load first interstitial ad       │
└─────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼─────────┐
│   AdManager    │   │ PurchaseManager  │
│   (Singleton)  │   │   (Singleton)    │
├────────────────┤   ├──────────────────┤
│ - Init AdMob   │   │ - Load products  │
│ - Check status │   │ - Purchase IAP   │
│ - Unlock ads   │   │ - Restore        │
└───────┬────────┘   └────────┬─────────┘
        │                     │
        │            ┌────────▼─────────┐
        │            │  InterstitialAd  │
        │            │     Manager      │
        │            ├──────────────────┤
        │            │ - Load ad        │
        │            │ - Show ad        │
        │            │ - Track count    │
        │            └──────────────────┘
        │
┌───────▼────────────────────────────────┐
│          BannerAdView                  │
│  - UIViewRepresentable wrapper        │
│  - GADBannerView integration          │
│  - Auto-hide if ads removed           │
└────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼─────────┐
│ Recommendations│   │   HistoryView    │
│     View       │   │                  │
├────────────────┤   ├──────────────────┤
│ [Content]      │   │ [Content]        │
│ [Banner Ad]    │   │ [Banner Ad]      │
└────────────────┘   └──────────────────┘
```

---

## Revenue Estimates

### Assumptions
- 1,000 monthly active users
- 70% free tier (ads) = 700 users
- 30% purchase "Remove Ads" = 300 users
- Average 20 app sessions per user per month
- $4 CPM (cost per 1,000 impressions)

### Projected Revenue

**Ad Revenue (Monthly Recurring)**:
```
700 users × 20 sessions = 14,000 sessions
14,000 sessions × 2 ads/session = 28,000 impressions
28,000 impressions × $4 CPM / 1,000 = $112/month
```

**Purchase Revenue (One-Time)**:
```
300 initial purchases × $4.99 = $1,497
Minus Apple's 30% cut = $1,048 (you keep)

Ongoing new users (10% conversion):
~100 new users/month × 10% = 10 purchases
10 × $4.99 × 0.70 (after Apple cut) = ~$35/month ongoing
```

**Total**:
- **First month**: ~$1,160 ($1,048 + $112)
- **Ongoing**: ~$150/month (ads + new purchases)

---

## Important Notes

### Ad Test Mode vs Production

The code automatically uses **test ad units** in DEBUG builds:
```swift
#if DEBUG
static let bannerAdUnitID = "ca-app-pub-3940256099942544/2934735716"  // Test
#else
static let bannerAdUnitID = "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY" // Your ID
#endif
```

**Always test with DEBUG builds** before submitting to App Store.

### Privacy & App Tracking Transparency (ATT)

AdMob requires showing ATT prompt for personalized ads:

1. Add to `Info.plist`:
```xml
<key>NSUserTrackingUsageDescription</key>
<string>This allows us to show you relevant ads and support the development of WatchOrNot.</string>
```

2. AdMob automatically handles ATT - no code changes needed.

### Production Checklist Before App Store Submission

- [ ] Replace test ad unit IDs with production IDs in `AdManager.swift`
- [ ] Verify AdMob App ID in `Info.plist`
- [ ] Test IAP in Sandbox (on real device)
- [ ] Submit IAP for review with app
- [ ] Add privacy policy URL (required for ads)
- [ ] Test "Restore Purchases" on multiple devices

---

## Troubleshooting

### Ads Not Showing

**Problem**: Blank space where ads should be

**Solutions**:
1. Check AdMob App ID is correct in `Info.plist`
2. Verify you're using test ad unit IDs in DEBUG mode
3. Check Xcode console for AdMob errors
4. Ensure Google Mobile Ads SDK is installed correctly
5. Try running on **real device** (simulator has ad limitations)

### Purchase Not Working

**Problem**: Tapping "Remove Ads" does nothing

**Solutions**:
1. Verify **In-App Purchase capability** is enabled in Xcode
2. Check Bundle ID matches App Store Connect
3. Ensure product ID matches: `com.watchornot.removeads`
4. Test on **real device only** (simulator doesn't support IAP)
5. Sign out of production App Store before testing
6. Check Xcode console for StoreKit errors

### "Product Not Found" Error

**Problem**: StoreKit can't find IAP product

**Solutions**:
1. Wait 2-24 hours after creating IAP in App Store Connect
2. Verify product ID exactly matches: `com.watchornot.removeads`
3. Ensure IAP status is "Ready to Submit" (not "Missing Metadata")
4. Check Bundle ID matches between Xcode and App Store Connect
5. Try clearing product cache: delete app, restart device, reinstall

---

## Support

For issues with:
- **AdMob**: https://support.google.com/admob
- **StoreKit**: https://developer.apple.com/support/app-store-connect/
- **Code Issues**: Check Xcode console logs

---

## Files Modified/Created

### New Files
- `Core/Monetization/AdManager.swift` - Ad state management
- `Core/Monetization/PurchaseManager.swift` - StoreKit integration
- `Shared/Components/Ads/BannerAdView.swift` - Banner ad component
- `Shared/Components/Ads/InterstitialAdManager.swift` - Fullscreen ads

### Modified Files
- `App/WatchOrNotApp.swift` - AdMob initialization
- `Features/Recommendations/Views/RecommendationsView.swift` - Added banner
- `Features/History/Views/HistoryView.swift` - Added banner
- `Features/Profile/Views/SimplifiedProfileView.swift` - Added purchase UI + banner
- `Features/MovieSnap/ViewModels/MovieSnapViewModel.swift` - Interstitial logic

---

**Last Updated**: 2024
**iOS Version**: 16.0+
**AdMob SDK**: 11.0+
**StoreKit**: 2.0
