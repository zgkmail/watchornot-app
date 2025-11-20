# iOS App Store Submission Plan

> Complete guide for submitting WatchOrNot to the Apple App Store

## Overview

This document outlines the complete process for submitting the WatchOrNot iOS app to the Apple App Store, including all required materials, steps, and what can be automated or assisted with Claude Code.

**App Information:**
- **App Name:** WatchOrNot
- **Bundle ID:** com.watchornot.app (to be configured)
- **Current Version:** 1.0 (Build 1)
- **Category:** Entertainment / Utilities
- **iOS Target:** iOS 17.0+
- **Tagline:** One Snap. One Answer. Should you watch it or not?

---

## Table of Contents

1. [Pre-Submission Checklist](#pre-submission-checklist)
2. [Required Materials](#required-materials)
3. [Step-by-Step Submission Process](#step-by-step-submission-process)
4. [What Claude Code Can Help With](#what-claude-code-can-help-with)
5. [Timeline Estimate](#timeline-estimate)
6. [Common Rejection Reasons & How to Avoid](#common-rejection-reasons)

---

## Pre-Submission Checklist

### Technical Requirements
- [ ] Xcode project builds without errors/warnings
- [ ] App runs on physical iOS device (not just simulator)
- [ ] All features work as expected
- [ ] No placeholder content or "Lorem ipsum" text
- [ ] Camera permissions properly implemented
- [ ] Privacy policy URL available
- [ ] Backend API is live and stable
- [ ] App doesn't crash on startup or during normal use
- [ ] All UI fits properly on different iPhone sizes (SE, Pro, Pro Max)
- [ ] App works in both light and dark mode (or has forced dark mode)
- [ ] Proper error handling for network failures
- [ ] Offline behavior is graceful

### Legal Requirements
- [ ] Apple Developer Program membership ($99/year)
- [ ] Privacy Policy published online
- [ ] Terms of Service (optional but recommended)
- [ ] Age rating determined
- [ ] Export compliance documented
- [ ] Third-party license acknowledgments

### Content Requirements
- [ ] App icons (all sizes)
- [ ] Screenshots (multiple sizes)
- [ ] App preview video (optional but recommended)
- [ ] Marketing copy written
- [ ] Keywords selected
- [ ] App description written
- [ ] What's New text prepared

---

## Required Materials

### 1. App Icons 🎨
**Status:** ⚠️ MISSING - Currently no icons in AppIcon.appiconset

**Required Sizes:**
```
iPhone:
- 20x20 pt (@2x = 40x40px, @3x = 60x60px)    # Spotlight, Settings
- 29x29 pt (@2x = 58x58px, @3x = 87x87px)    # Settings
- 40x40 pt (@2x = 80x80px, @3x = 120x120px)  # Spotlight
- 60x60 pt (@2x = 120x120px, @3x = 180x180px) # Home Screen

iPad (if supporting iPad):
- 20x20 pt (@1x = 20x20px, @2x = 40x40px)
- 29x29 pt (@1x = 29x29px, @2x = 58x58px)
- 40x40 pt (@1x = 40x40px, @2x = 80x80px)
- 76x76 pt (@1x = 76x76px, @2x = 152x152px)
- 83.5x83.5 pt (@2x = 167x167px)

App Store:
- 1024x1024 px (no transparency, no alpha channel)
```

**Design Guidelines:**
- Simple, memorable design
- Works well at small sizes
- Avoids text (icon should be recognizable without it)
- No transparency
- Rounded corners applied by iOS automatically
- Should reflect the app's purpose (movie/camera theme)

**✅ Claude Code Can Help:**
- Generate icon design concepts
- Create SVG/vector designs
- Generate all required sizes from master design
- Ensure proper formatting and specifications

---

### 2. Screenshots 📱
**Status:** ⚠️ TO BE CREATED

**Required Screen Sizes:**
Apple requires screenshots for at least one device size per display type:

**Required (at minimum):**
- **6.7" Display** (iPhone 15 Pro Max, 14 Pro Max, 13 Pro Max, 12 Pro Max)
  - 1290 x 2796 px (portrait)
  - 2796 x 1290 px (landscape)

- **6.5" Display** (iPhone 11 Pro Max, XS Max)
  - 1242 x 2688 px (portrait)
  - 2688 x 1242 px (landscape)

**Recommended (better coverage):**
- **5.5" Display** (iPhone 8 Plus, 7 Plus, 6s Plus)
  - 1242 x 2208 px (portrait)

**Number of Screenshots:**
- Minimum: 1 per device size
- Maximum: 10 per device size
- **Recommended: 4-6 screenshots** showing key features

**What to Showcase:**
1. **Camera Snap Feature** - Show the poster scanning in action
2. **Movie Recognition** - Display results with movie details
3. **Onboarding Flow** - Show the taste preference setup
4. **Recommendations** - Display personalized movie list with badges
5. **Profile/Stats** - Show user progress and tier system
6. **Beautiful UI** - Highlight dark mode and polished design

**Screenshot Best Practices:**
- Use actual app content (no mockups)
- Add text overlays explaining features (optional but effective)
- First screenshot is most important (appears in search)
- Show diversity in content
- Demonstrate unique selling points
- Keep status bar clean (use 9:41, full battery, full signal)

**✅ Claude Code Can Help:**
- Generate screenshot frame templates
- Create text overlay designs
- Optimize images for file size
- Generate localized versions
- Create marketing frames/borders

---

### 3. App Preview Video (Optional but Recommended) 🎥
**Status:** ⚠️ TO BE CREATED

**Specifications:**
- **Duration:** 15-30 seconds recommended (max 30 seconds)
- **Format:** .mov, .mp4, or .m4v
- **Resolution:** Same as screenshot requirements
- **Size:** Up to 500 MB
- **Orientation:** Portrait or landscape (match device)

**What to Show:**
- App opening (first 2-3 seconds)
- Camera scanning a poster
- Instant recognition and results
- Quick swipe through recommendations
- End with app logo/name

**✅ Claude Code Can Help:**
- Script writing for preview video
- Storyboard creation
- Timestamp planning for key moments

---

### 4. App Store Copy 📝
**Status:** ⚠️ TO BE WRITTEN

#### App Name (Max 30 characters)
```
Option 1: WatchOrNot
Option 2: WatchOrNot - Movie Finder
Option 3: WatchOrNot Movies
```

#### Subtitle (Max 30 characters)
```
Option 1: Snap. Discover. Watch.
Option 2: AI-Powered Movie Discovery
Option 3: Find Movies You'll Love
```

#### Promotional Text (Max 170 characters) - Can be updated anytime
```
Point your camera at any movie poster for instant AI-powered
recommendations. Discover hidden gems tailored to your unique taste.
Download now and never wonder what to watch again!
```

#### Description (Max 4000 characters)
**Structure:**
1. Hook (2-3 sentences)
2. Key Features (bullet points)
3. How It Works (3-4 steps)
4. Why It's Better (unique value props)
5. Call to Action

**Draft:**
```
One Snap. One Answer. Should you watch it or not?

WatchOrNot transforms how you discover movies. Simply snap a photo of any
movie poster, and our AI instantly analyzes it and delivers personalized
recommendations based on your unique taste profile.

✨ KEY FEATURES

📸 INSTANT RECOGNITION
Point your camera at any movie poster—in theaters, at home, or in stores.
Our advanced AI recognizes it instantly and provides detailed information.

🎯 PERSONALIZED RECOMMENDATIONS
Get movie suggestions tailored specifically to you. Our smart algorithm
learns your preferences and finds hidden gems you'll actually want to watch.

🏆 LEVEL UP YOUR TASTE
Track your movie journey from Newcomer to Master Cinephile. See your stats,
history, and progress as you discover more films.

🎨 BEAUTIFUL & INTUITIVE
Gorgeous native iOS design with dark mode support. Fast, smooth, and
delightful to use.

⚡ WORKS OFFLINE
Core features available even without an internet connection. Browse your
history and preferences anytime.

🔒 PRIVACY FIRST
We respect your privacy. No account required to get started. Your data
stays secure.

HOW IT WORKS

1. Snap or upload a movie poster
2. AI analyzes and identifies the film
3. Get instant personalized recommendations
4. Build your taste profile as you explore
5. Discover movies you'll love

WHY WATCHORNOT?

Unlike generic recommendation engines, WatchOrNot learns YOUR specific
taste through actual voting, not just watch history. Our AI-powered vision
technology makes discovering movies as simple as taking a photo.

No more endless scrolling. No more decision fatigue. Just point, snap,
and discover your next favorite film.

Download WatchOrNot today and never wonder what to watch again.

---

Requires iOS 17.0 or later. Camera access required for poster scanning.
```

#### Keywords (Max 100 characters total, comma-separated)
```
movie,cinema,recommendation,AI,poster,film,discover,watch,entertainment,rating
```

**Keyword Strategy:**
- Use all 100 characters
- No spaces after commas
- Research competitor keywords
- Include: movie, film, discover, recommendation, AI, poster, cinema
- Avoid: app, free, best (Apple ignores these)

#### What's New (Max 4000 characters)
```
🎉 Welcome to WatchOrNot 1.0!

This is our initial release, bringing you:

📸 AI-Powered Movie Recognition
Point your camera at any poster for instant identification

🎯 Personalized Recommendations
Get movies tailored to your unique taste

🏆 Progress Tracking
Level up from Newcomer to Master Cinephile

🎨 Beautiful Native Design
Gorgeous dark mode interface built for iOS

We can't wait to help you discover your next favorite movie!

Have feedback? Contact us at support@watchornot.app
```

**✅ Claude Code Can Help:**
- Generate multiple copy variations
- Optimize keyword density
- Translate to other languages
- A/B test copy variations
- Check character limits
- SEO optimization

---

### 5. App Information

#### Primary Category
```
Entertainment
```

#### Secondary Category (Optional)
```
Utilities
OR
Lifestyle
```

#### Content Rights
- [ ] Does your app contain, display, or access third-party content?
  - **YES** - Contains movie data from TMDB and OMDb

#### Age Rating
Based on movie content and features:
- **Rating: 12+**
  - Reason: Infrequent/Mild Mature/Suggestive Themes
  - Movie content may include mature themes

#### Support URL
```
https://watchornot.app/support
OR
https://github.com/zgkmail/watchornot-app/issues
```

#### Marketing URL (Optional)
```
https://watchornot.app
```

#### Privacy Policy URL (REQUIRED)
```
https://watchornot.app/privacy
```
⚠️ **MUST BE CREATED BEFORE SUBMISSION**

**✅ Claude Code Can Help:**
- Generate privacy policy template
- Create terms of service
- Generate support page content

---

### 6. App Review Information

#### Contact Information
- First Name: [Your Name]
- Last Name: [Your Name]
- Phone: [Your Phone]
- Email: [Your Email]

#### Demo Account (if login required)
```
WatchOrNot doesn't require login, so not applicable.
However, provide notes on how to test:

"No login required. Key features to test:
1. Tap 'Snap Movie' to access camera
2. Point at any movie poster (or use sample images)
3. View personalized recommendations
4. Check profile and stats

Sample test: Use the onboarding flow to vote on movies,
then check recommendations."
```

#### Notes
```
WatchOrNot uses the device camera to scan movie posters for
AI-powered identification and recommendations.

Required APIs:
- TMDB API (movie data)
- OMDb API (ratings/details)
- Anthropic Claude API (AI vision)

The app requires camera permission to scan posters. This is
the core feature of the app.

Backend server: [Production URL]

To test camera feature without physical posters, sample movie
poster images are available in the photo picker.
```

#### Attachment (Optional)
If you need to provide sample posters for testing, include them here.

---

### 7. Pricing and Availability

#### Price
```
Free
```

#### Availability
- All territories (or select specific countries)

#### App Availability Date
- Automatic release after approval (recommended)
- OR schedule a specific date

---

### 8. Version Release

#### Manual Release
You can choose to manually release after approval for:
- Coordinated marketing launch
- Press embargo timing
- Bug fix verification

#### Automatic Release
Recommended for initial 1.0 launch.

---

## Step-by-Step Submission Process

### Phase 1: Preparation (Before Code is Ready)

#### Step 1.1: Apple Developer Account Setup
**Time: 1-2 days**

- [ ] Sign up for Apple Developer Program ($99/year)
  - Visit: https://developer.apple.com/programs/
  - Can take 24-48 hours for approval

- [ ] Accept agreements in App Store Connect
  - Visit: https://appstoreconnect.apple.com
  - Review and accept Paid Applications Agreement

- [ ] Set up tax and banking information
  - Required even for free apps
  - App Store Connect → Agreements, Tax, and Banking

**✅ Human Required** - Legal/financial setup

---

#### Step 1.2: Create App Store Connect Record
**Time: 30 minutes**

- [ ] Log into App Store Connect
- [ ] Click "My Apps" → "+" → "New App"
- [ ] Fill in basic information:
  - Platform: iOS
  - Name: WatchOrNot
  - Primary Language: English (U.S.)
  - Bundle ID: Create new (com.watchornot.app)
  - SKU: watchornot-ios (unique identifier)
  - User Access: Full Access

**✅ Human Required** - Account access needed

---

#### Step 1.3: Prepare Visual Assets
**Time: 2-4 hours**

**App Icons:**
- [ ] Design master icon (1024x1024)
- [ ] Generate all required sizes
- [ ] Add to Xcode Assets.xcassets/AppIcon.appiconset
- [ ] Verify in Xcode

**✅ Claude Code Can Help:**
- Icon design concepts (text-based description)
- Generate sizes from master icon
- Verify proper formatting

**Screenshots:**
- [ ] Build app on required device sizes
- [ ] Capture screenshots of key features
- [ ] Add marketing text overlays (optional)
- [ ] Export in required sizes
- [ ] Optimize file sizes

**✅ Claude Code Can Help:**
- Screenshot planning guide
- Frame/overlay templates
- Text overlay suggestions
- Batch processing for sizes

**App Preview Video (Optional):**
- [ ] Record screen capture
- [ ] Edit to 15-30 seconds
- [ ] Add music/voiceover (optional)
- [ ] Export in required format

**✅ Claude Code Can Help:**
- Video script
- Storyboard
- Scene timing breakdown

---

#### Step 1.4: Write App Store Copy
**Time: 2-3 hours**

- [ ] App name (test variations under 30 chars)
- [ ] Subtitle (30 chars)
- [ ] Promotional text (170 chars)
- [ ] Description (up to 4000 chars)
- [ ] Keywords (100 chars)
- [ ] What's New text

**✅ Claude Code Can Help:**
- Generate multiple variations
- Optimize for ASO (App Store Optimization)
- Check character limits
- Keyword research
- Localization

---

#### Step 1.5: Legal Documents
**Time: 1-2 hours**

- [ ] Privacy Policy
  - Must be publicly accessible URL
  - Cover data collection, usage, sharing
  - Address camera access, API calls

- [ ] Terms of Service (optional but recommended)
- [ ] Support page
- [ ] Acknowledgments (third-party licenses)

**✅ Claude Code Can Help:**
- Generate privacy policy template
- Create terms of service
- Build support page content
- List third-party dependencies

---

### Phase 2: Code Preparation

#### Step 2.1: Configure Xcode Project
**Time: 1 hour**

- [ ] Set proper Bundle Identifier
  - Match App Store Connect record
  - Example: com.watchornot.app

- [ ] Configure version numbers
  - Version: 1.0
  - Build: 1 (increment for each submission)

- [ ] Set deployment target
  - iOS 17.0+

- [ ] Configure capabilities
  - Camera usage
  - Photo library access

- [ ] Set app icons
  - Verify all sizes are present
  - Check for transparency (not allowed)

- [ ] Configure signing
  - Select your development team
  - Enable automatic signing (recommended)

**✅ Human Required** - Xcode access needed
**✅ Claude Code Can Help:**
- Guide through Xcode settings
- Verify Info.plist configurations
- Check for common issues

---

#### Step 2.2: Final Testing
**Time: 2-4 hours**

- [ ] Test on physical device (required!)
  - Simulator is NOT sufficient

- [ ] Test all features thoroughly
  - Camera scanning
  - Onboarding flow
  - Recommendations
  - Profile/stats
  - Navigation

- [ ] Test edge cases
  - No internet connection
  - Camera permissions denied
  - Invalid movie posters
  - Server errors

- [ ] Test different devices
  - iPhone SE (small screen)
  - iPhone 15 Pro Max (large screen)
  - iPad (if supported)

- [ ] Verify performance
  - No crashes
  - Smooth animations
  - Fast load times
  - Low memory usage

- [ ] Test accessibility
  - VoiceOver
  - Dynamic Type
  - High Contrast mode

**✅ Human Required** - Physical device testing
**✅ Claude Code Can Help:**
- Generate test cases
- Create testing checklist
- Review crash logs
- Optimize performance issues

---

#### Step 2.3: Build Archive
**Time: 30 minutes**

In Xcode:

1. Select "Any iOS Device" as build target
2. Product → Archive
3. Wait for build to complete
4. Organizer window will open

**Verify Archive:**
- [ ] No warnings or errors
- [ ] Correct version number
- [ ] Correct bundle identifier
- [ ] All assets included
- [ ] File size reasonable (<200 MB for 1.0)

**✅ Human Required** - Xcode access

---

#### Step 2.4: Upload to App Store Connect
**Time: 30 minutes - 2 hours**

1. In Xcode Organizer:
   - Click "Distribute App"
   - Select "App Store Connect"
   - Select "Upload"
   - Choose distribution options:
     - ☑ Upload app symbols (for crash reports)
     - ☑ Manage version and build number
   - Sign and upload

2. Wait for processing
   - Can take 15 minutes to 2 hours
   - You'll receive email when ready
   - Check status in App Store Connect

3. Verify upload
   - App Store Connect → My Apps → WatchOrNot
   - Go to TestFlight tab
   - Build should appear under "iOS Builds"

**✅ Human Required** - Xcode/App Store Connect access

---

### Phase 3: App Store Connect Configuration

#### Step 3.1: Select Build
**Time: 5 minutes**

- [ ] Go to App Store Connect → My Apps → WatchOrNot
- [ ] Click on version (1.0)
- [ ] Scroll to "Build" section
- [ ] Click "+ " to add build
- [ ] Select the uploaded build
- [ ] Save

**✅ Human Required**

---

#### Step 3.2: Fill In App Information
**Time: 1-2 hours**

**General App Information:**
- [ ] App name: WatchOrNot
- [ ] Subtitle: [chosen subtitle]
- [ ] Primary language: English (U.S.)
- [ ] Category: Entertainment
- [ ] Secondary category: Utilities (optional)
- [ ] Content rights: Yes (third-party content)

**App Privacy:**
- [ ] Click "Get Started" under App Privacy
- [ ] Answer data collection questions:
  - Collect user data? Minimal (session ID)
  - Camera access: Yes (for poster scanning)
  - Data types: Usage Data
  - Link to tracking: No
  - Track: No
- [ ] Save privacy information

**Age Rating:**
- [ ] Click "Edit" next to Age Rating
- [ ] Answer questionnaire honestly
  - Violence: None
  - Sexual/Nudity: Infrequent/Mild (movies may contain)
  - Profanity: Infrequent/Mild
  - Mature themes: Infrequent/Mild
- [ ] Should result in 12+ rating
- [ ] Save

**Pricing and Availability:**
- [ ] Price: Free
- [ ] Availability: All territories (or select)
- [ ] Schedule: Release after approval
- [ ] Save

**✅ Human Required** - App Store Connect access
**✅ Claude Code Can Help:**
- Guide through each section
- Answer common questions
- Verify settings

---

#### Step 3.3: Upload Screenshots and Media
**Time: 30 minutes**

- [ ] Go to version (1.0) in App Store Connect
- [ ] Scroll to "App Preview and Screenshots"
- [ ] For each device size:
  - [ ] Drag and drop screenshots (in order)
  - [ ] Add app preview video (optional)
  - [ ] Reorder if needed
- [ ] Preview on different device sizes
- [ ] Save

**Recommended Screenshot Sets:**
- 6.7" Display: 5-6 screenshots
- 5.5" Display: Same screenshots (scaled)

**✅ Human Required** - Upload access
**✅ Claude Code Can Help:**
- Verify image requirements
- Check file sizes
- Suggest ordering

---

#### Step 3.4: Add Description and Copy
**Time: 30 minutes**

- [ ] Promotional text: [from prepared copy]
- [ ] Description: [from prepared copy]
- [ ] Keywords: [from prepared keywords]
- [ ] Support URL: [your support URL]
- [ ] Marketing URL: [optional]
- [ ] Privacy Policy URL: [required]
- [ ] Save

**✅ Human Required**
**✅ Claude Code Can Help:**
- Verify copy fits limits
- Suggest improvements
- Check for typos

---

#### Step 3.5: App Review Information
**Time: 15 minutes**

- [ ] First name, last name, phone, email
- [ ] Sign-in required: No
- [ ] Demo account: Not applicable
- [ ] Notes:
  ```
  WatchOrNot uses camera to scan movie posters for AI identification.
  Camera permission is core functionality.

  To test:
  1. Allow camera access when prompted
  2. Point camera at any movie poster
  3. View AI-powered recommendations

  Backend: [your production URL]
  Third-party APIs: TMDB, OMDb, Anthropic Claude
  ```
- [ ] Attachment: Include sample movie poster images (optional)
- [ ] Save

**✅ Human Required**

---

#### Step 3.6: Version Release Options
**Time: 2 minutes**

Choose release timing:
- [ ] Automatic: Release immediately after approval (recommended)
- [ ] Manual: Manually release after approval
- [ ] Scheduled: Release on specific date

**✅ Human Required**

---

#### Step 3.7: Export Compliance
**Time: 5 minutes**

- [ ] Answer: "Is your app designed to use cryptography?"
  - If using HTTPS only: Select "No"
  - If using custom encryption: May need export documentation

- [ ] For WatchOrNot: Select "No" (standard HTTPS only)
- [ ] Save

**✅ Human Required**

---

### Phase 4: Submission

#### Step 4.1: Final Review
**Time: 30 minutes**

Review everything one last time:
- [ ] Build is attached
- [ ] Screenshots look correct
- [ ] Copy has no typos
- [ ] Links work (privacy, support)
- [ ] Contact info is correct
- [ ] Age rating appropriate
- [ ] Pricing correct
- [ ] All required fields filled

**✅ Human Required**

---

#### Step 4.2: Submit for Review
**Time: 2 minutes**

- [ ] Click "Add for Review" (top right)
- [ ] Review submission summary
- [ ] Click "Submit to App Review"
- [ ] Confirm submission

**You'll see:**
- Status changes to "Waiting for Review"
- Email confirmation sent
- Can take 24-48 hours to start review

**✅ Human Required**

---

### Phase 5: Review Process

#### Step 5.1: Wait for Review
**Timeline: 1-3 days typically**

Status progression:
1. "Waiting for Review" (up to 48 hours)
2. "In Review" (few hours to 1 day)
3. "Pending Developer Release" OR "Ready for Sale"

**What Apple Reviews:**
- App functionality and stability
- Compliance with guidelines
- Privacy practices
- Content appropriateness
- Metadata accuracy
- Performance

**✅ Nothing Required** - Just wait

---

#### Step 5.2: If Rejected
**Timeline: Varies**

Common reasons and fixes:

**Crash on Launch:**
- [ ] Fix crash
- [ ] Increment build number
- [ ] Upload new build
- [ ] Reply to reviewer with resolution

**Incomplete Information:**
- [ ] Add missing info
- [ ] No new build needed
- [ ] Resubmit

**Guideline Violation:**
- [ ] Read rejection reason carefully
- [ ] Fix issue in code or description
- [ ] Upload new build if needed
- [ ] Explain changes in Resolution Center

**Privacy Concerns:**
- [ ] Update privacy policy
- [ ] Clarify data usage in notes
- [ ] Update app privacy section
- [ ] Resubmit

**✅ Human Required** - Review feedback and fix
**✅ Claude Code Can Help:**
- Understand rejection reasons
- Suggest fixes
- Update code if needed

---

#### Step 5.3: If Approved
**Timeline: Immediate or scheduled**

- [ ] Receive approval email
- [ ] App status: "Pending Developer Release" or "Ready for Sale"
- [ ] If automatic release: App goes live immediately
- [ ] If manual: Click "Release This Version"
- [ ] App appears in App Store within hours

**✅ Human Required** - Release decision

---

### Phase 6: Post-Launch

#### Step 6.1: Monitor Launch
**First 24-48 hours**

- [ ] Search for app in App Store
- [ ] Verify all info displays correctly
- [ ] Test download and installation
- [ ] Monitor crash reports
- [ ] Check reviews
- [ ] Monitor analytics

**✅ Human Required**

---

#### Step 6.2: Respond to Reviews
**Ongoing**

- [ ] Thank positive reviewers
- [ ] Address negative feedback
- [ ] Fix reported bugs
- [ ] Track feature requests

**✅ Human Required**
**✅ Claude Code Can Help:**
- Draft review responses
- Analyze feedback patterns
- Prioritize issues

---

#### Step 6.3: Plan Updates
**Ongoing**

- [ ] Monitor crash analytics
- [ ] Track feature requests
- [ ] Plan version 1.1
- [ ] Prepare "What's New" for next update

**✅ Claude Code Can Help:**
- Implement new features
- Fix bugs
- Update copy
- Prepare release notes

---

## What Claude Code Can Help With

### ✅ Strongly Recommended: Let Claude Code Help

1. **App Icons Design**
   - Generate design concepts (described textually)
   - Create icon specifications
   - Generate all required sizes from master
   - Verify formatting and requirements

2. **Marketing Copy**
   - Write app description
   - Generate subtitle variations
   - Optimize keywords for ASO
   - Create "What's New" text
   - Translate to multiple languages
   - A/B test copy variations

3. **Screenshots Planning**
   - Design screenshot templates
   - Create text overlay designs
   - Plan screenshot order
   - Generate marketing frames
   - Batch process for different sizes

4. **Legal Documents**
   - Generate privacy policy template
   - Create terms of service
   - Build support page
   - List third-party acknowledgments
   - Ensure GDPR/CCPA compliance

5. **App Preview Video**
   - Write video script
   - Create storyboard
   - Plan scene timing
   - Suggest background music

6. **Code Review & Fixes**
   - Review code for App Store guidelines compliance
   - Fix crashes and bugs
   - Optimize performance
   - Improve error handling
   - Add missing features

7. **Testing & QA**
   - Generate test cases
   - Create testing checklist
   - Review crash logs
   - Suggest fixes for common issues

8. **Localization**
   - Translate app to multiple languages
   - Localize screenshots
   - Adapt marketing copy for regions

9. **ASO (App Store Optimization)**
   - Research keywords
   - Analyze competitors
   - Optimize description for search
   - Suggest category placement

10. **Post-Launch Support**
    - Analyze user reviews
    - Draft review responses
    - Plan feature updates
    - Write update release notes

### ⚠️ Human Required: Cannot be Automated

1. **Apple Developer Account**
   - Sign up and pay $99/year
   - Accept legal agreements
   - Set up banking/tax info

2. **App Store Connect Access**
   - Log in and configure
   - Upload builds
   - Submit for review
   - Make release decisions

3. **Xcode Operations**
   - Build and archive
   - Sign the app
   - Upload to App Store Connect

4. **Physical Device Testing**
   - Test on real iPhones/iPads
   - Verify camera functionality
   - Test performance

5. **Final Decision Making**
   - Approve final copy
   - Choose release timing
   - Respond to Apple reviewers
   - Handle rejections

6. **Legal Review**
   - Final approval of privacy policy
   - Legal compliance verification
   - Terms of service acceptance

---

## Timeline Estimate

### Optimistic Timeline: 1 Week

```
Day 1: Preparation
- Set up Apple Developer account
- Create App Store Connect record
- Gather requirements

Day 2-3: Assets & Copy (Claude Code helps heavily here)
- Design app icons
- Create screenshots
- Write marketing copy
- Generate privacy policy

Day 4: Code Finalization
- Configure Xcode
- Final testing
- Fix any issues

Day 5: Build & Upload
- Create archive
- Upload to App Store Connect
- Configure app information

Day 6: Submission
- Final review
- Submit for review

Day 7+: Apple Review
- Wait 1-3 days for approval
```

### Realistic Timeline: 2-3 Weeks

```
Week 1: Preparation & Assets
- Days 1-2: Account setup, documentation
- Days 3-7: Icons, screenshots, copy (iterate)

Week 2: Code & Testing
- Days 8-10: Final features, bug fixes
- Days 11-12: Thorough testing
- Days 13-14: Build and upload

Week 3: Review & Launch
- Days 15-16: Configure App Store Connect
- Day 17: Submit
- Days 18-21: Apple review and approval
```

### Conservative Timeline: 4-6 Weeks

```
Weeks 1-2: Foundation
- Legal documents
- Asset creation (multiple iterations)
- Copy refinement
- TestFlight beta testing

Weeks 3-4: Polish
- Bug fixes from beta
- Performance optimization
- Screenshot refinement
- Final testing

Weeks 5-6: Submission & Review
- App Store Connect setup
- Submission
- Review (and potential rejection/resubmission)
- Launch
```

**Factors Affecting Timeline:**
- Developer account approval (24-48 hours)
- Asset creation quality (can iterate)
- Bug count and severity
- Review process (1-3 days, sometimes longer)
- Potential rejection and fixes needed

---

## Common Rejection Reasons & How to Avoid

### 1. App Crashes
**Rejection:** "App crashes on launch or during use"

**How to Avoid:**
- [ ] Test on physical devices
- [ ] Test on different iOS versions
- [ ] Handle all error cases gracefully
- [ ] Never use force unwrapping (!) in Swift
- [ ] Add try-catch for network calls
- [ ] Test with no internet connection
- [ ] Use Xcode's debugging tools

**If Rejected:**
- Fix crash
- Increment build number
- Upload new build
- Add notes explaining fix

---

### 2. Incomplete Information
**Rejection:** "Missing privacy policy" or "Incomplete app information"

**How to Avoid:**
- [ ] Publish privacy policy before submission
- [ ] Verify URL works
- [ ] Fill all required App Store Connect fields
- [ ] Test all URLs (support, marketing, privacy)
- [ ] Complete app privacy section accurately

**If Rejected:**
- Add missing information
- No new build needed
- Resubmit immediately

---

### 3. Inaccurate Metadata
**Rejection:** "Screenshots don't match app" or "Description is misleading"

**How to Avoid:**
- [ ] Screenshots must be from actual app
- [ ] Description must match functionality
- [ ] Don't promise features not yet built
- [ ] Don't exaggerate capabilities
- [ ] Make sure first screenshot is accurate

**If Rejected:**
- Update screenshots or description
- No new build needed usually
- Resubmit

---

### 4. Privacy Concerns
**Rejection:** "Doesn't comply with privacy guidelines"

**How to Avoid:**
- [ ] Explain camera usage clearly
- [ ] Add purpose strings in Info.plist
- [ ] Document data collection in privacy policy
- [ ] Fill app privacy section accurately
- [ ] Don't collect unnecessary data
- [ ] Be transparent about third-party APIs

**For WatchOrNot specifically:**
```xml
<key>NSCameraUsageDescription</key>
<string>WatchOrNot needs access to your camera to snap movie posters and identify them using AI.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>WatchOrNot needs access to your photo library to select movie posters for identification.</string>
```

**If Rejected:**
- Update privacy policy
- Clarify in app review notes
- Update app privacy section
- Resubmit

---

### 5. Performance Issues
**Rejection:** "App is slow" or "Uses too much battery/data"

**How to Avoid:**
- [ ] Optimize image loading
- [ ] Cache API responses
- [ ] Use efficient data structures
- [ ] Test on older devices (iPhone SE)
- [ ] Monitor memory usage
- [ ] Compress images
- [ ] Lazy load content

**If Rejected:**
- Profile with Instruments
- Fix performance bottlenecks
- Upload new build
- Document improvements

---

### 6. Using Camera Without Clear Purpose
**Rejection:** "Camera permission not justified"

**How to Avoid:**
- [ ] Clear usage description in Info.plist
- [ ] Camera is core feature (obvious in app)
- [ ] Don't request permission unnecessarily
- [ ] Explain in reviewer notes

**For WatchOrNot:** This should not be an issue since camera is the primary feature.

---

### 7. Minimum Functionality
**Rejection:** "App doesn't provide enough value"

**How to Avoid:**
- [ ] Ensure all features work
- [ ] No "coming soon" placeholder features
- [ ] Onboarding flow complete
- [ ] Recommendations populated
- [ ] No empty states without data

**If Rejected:**
- Add more content/features
- Ensure backend has sample data
- Upload new build

---

### 8. Third-Party Content Without Rights
**Rejection:** "Using copyrighted content without permission"

**How to Avoid:**
- [ ] Use official APIs (TMDB, OMDb)
- [ ] Attribute data sources in app
- [ ] Follow API terms of service
- [ ] Don't cache movie posters long-term
- [ ] Include proper disclaimers

**For WatchOrNot:**
- Using TMDB and OMDb officially
- Add attribution in settings/about
- Comply with API terms

**If Rejected:**
- Add attribution
- Update settings to show data sources
- Resubmit

---

### 9. Requires Internet but Not Graceful
**Rejection:** "App doesn't handle offline state"

**How to Avoid:**
- [ ] Detect network status
- [ ] Show friendly error messages
- [ ] Don't show generic errors
- [ ] Offer retry mechanism
- [ ] Cache what you can
- [ ] Explain when internet is needed

**If Rejected:**
- Improve offline handling
- Add better error messages
- Upload new build

---

### 10. Misleading App Name
**Rejection:** "App name doesn't match functionality"

**How to Avoid:**
- [ ] Name clearly describes purpose
- [ ] Don't use competitor names
- [ ] Don't use trademarked terms
- [ ] Keep it simple and honest

**For WatchOrNot:** Name is clear and unique - should be fine.

---

## Pro Tips for Faster Approval

### 1. TestFlight First
Before App Store submission:
- [ ] Upload to TestFlight
- [ ] Test with external testers
- [ ] Gather feedback
- [ ] Fix critical bugs
- [ ] Refine UI/UX

**Benefits:**
- Catch issues before review
- No rejection risk
- Faster iteration
- Real user feedback

---

### 2. Clear Reviewer Notes
Help reviewers understand your app:
```
App: WatchOrNot
Purpose: AI-powered movie discovery via poster scanning

How to Test:
1. Launch app
2. Allow camera permission (required for core feature)
3. Tap "Snap Movie"
4. Point at movie poster (samples in photo picker)
5. View AI-generated recommendations

Camera usage is the primary feature - scanning posters for instant movie identification.

Backend: [production URL]
APIs: TMDB (movies), OMDb (ratings), Anthropic Claude (AI vision)

No login required. Works immediately after download.
```

---

### 3. Sample Content
If testing requires specific content:
- [ ] Include sample movie poster images
- [ ] Provide test instructions
- [ ] Make testing easy for reviewers

---

### 4. Respond Quickly
If rejected:
- [ ] Read rejection carefully
- [ ] Fix issue within 24 hours if possible
- [ ] Reply in Resolution Center
- [ ] Explain what you fixed
- [ ] Be polite and professional

---

### 5. Monitor Trends
- Check Apple Developer News
- Watch for policy changes
- Update before they become requirements
- Stay current with iOS versions

---

## Resources

### Official Apple Documentation
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [iOS App Icon Specifications](https://developer.apple.com/design/human-interface-guidelines/app-icons)

### Tools
- [App Store Screenshot Sizes](https://help.apple.com/app-store-connect/#/devd274dd925)
- [Privacy Policy Generator](https://www.termsfeed.com/privacy-policy-generator/)
- [App Icon Maker](https://appicon.co/)
- [Screenshot Framer](https://screenshots.pro/)

### Analytics & ASO
- App Store Connect Analytics
- [Sensor Tower](https://sensortower.com/)
- [App Annie](https://www.appannie.com/)
- [AppFollow](https://appfollow.io/)

### Community
- [Apple Developer Forums](https://developer.apple.com/forums/)
- [Stack Overflow - iOS](https://stackoverflow.com/questions/tagged/ios)
- [r/iOSProgramming](https://reddit.com/r/iOSProgramming)

---

## Next Steps

Ready to start? Here's your action plan:

### Immediate (This Week)
1. [ ] Sign up for Apple Developer Program
2. [ ] Start designing app icon (Claude Code can help!)
3. [ ] Write privacy policy (Claude Code can generate template)
4. [ ] Create App Store Connect record

### Short Term (Next 2 Weeks)
1. [ ] Finalize all visual assets
2. [ ] Complete all marketing copy
3. [ ] Test app thoroughly on physical devices
4. [ ] Fix any outstanding bugs

### Pre-Launch (Week 3)
1. [ ] Create archive in Xcode
2. [ ] Upload to TestFlight for beta testing
3. [ ] Gather feedback and iterate
4. [ ] Prepare final build

### Launch (Week 4)
1. [ ] Upload final build
2. [ ] Configure App Store Connect completely
3. [ ] Submit for review
4. [ ] Wait for approval
5. [ ] Release to world! 🚀

---

**Questions or need help?**
- Claude Code can assist with most preparation tasks
- Ask for specific help with any section above
- Need code reviews, copy editing, or asset generation? Just ask!

**Good luck with your submission! 🎉**
