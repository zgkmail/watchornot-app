# WatchOrNot Detail Card Component Analysis

## 1. COMPONENT LOCATION

**File:** `/home/user/watchornot-app/src/App.jsx`
- **Lines:** 1816-1916 (Detail Card Render)
- **All Logic:** Within the single monolithic `App.jsx` file (35K+ lines)

### Key State Variables:
- `currentMovie` - The movie object being displayed
- `hasScanned` - Boolean indicating if a movie has been identified
- `activeTab` - Current tab ('snap', 'history', 'profile')

---

## 2. DETAIL CARD UI STRUCTURE

**Location:** Lines 1816-1916

```jsx
{activeTab === 'snap' && hasScanned && currentMovie && (
  <div className="h-full relative">
    <div className="absolute bottom-0 left-0 right-0 px-4 pb-2">
      <div className="rounded-2xl p-5 relative z-10 max-h-[70vh] overflow-y-auto">
        <!-- 2.1: Movie Poster & Title Section -->
        <div className="flex gap-4 mb-4">
          <img src={currentMovie.poster} />
          <div className="flex-1">
            <h2>{currentMovie.title}</h2>           <!-- ⭐ TITLE DISPLAY -->
            <p>{currentMovie.year} • {currentMovie.genre}</p>
            <p>Director: {currentMovie.director}</p>
            <p>Starring: {currentMovie.cast}</p>
            <a href={currentMovie.trailerUrl}>🎬 Watch Trailer</a>
          </div>
        </div>
        
        <!-- 2.2: Recommendation Badge Section -->
        {currentMovie.badge ? (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
            <span className="text-3xl">{currentMovie.badgeEmoji}</span>
            <div className="text-white text-xl font-bold">{currentMovie.badge}</div>
            <div className="text-purple-200 text-sm">{currentMovie.badgeDescription}</div>
          </div>
        ) : (
          /* "Unlock Recommendations" message if < 5 votes */
        )}
        
        <!-- 2.3: Ratings Section -->
        <div className="flex items-center justify-around mb-6 pb-6 border-b">
          <div className="text-center">
            <div className="text-yellow-400 text-2xl font-bold">{currentMovie.imdbRating}/10</div>
            <div className="text-xs">IMDb</div>
          </div>
          <div className="text-center">
            <div className="text-red-500 text-2xl font-bold">{currentMovie.rottenTomatoes}%</div>
            <div className="text-xs">Rotten 🍅</div>
          </div>
          <div className="text-center">
            <div className="text-green-500 text-2xl font-bold">{currentMovie.metacritic}/100</div>
            <div className="text-xs">Metacritic</div>
          </div>
        </div>
        
        <!-- 2.4: Voting Section -->
        <div className="text-center mb-4">
          <p className="text-sm mb-2">What's your take on this title?</p>
          <p className="text-sm mb-3">Vote to build your taste profile!</p>
          <button>Skip For Now | Vote Later in History</button>
        </div>
        
        <!-- 2.5: Action Buttons -->
        <div className="flex gap-3">
          <button onClick={() => handleRating('up')}>👍 Thumbs Up</button>
          <button onClick={() => handleRating('down')}>👎 Thumbs Down</button>
        </div>
      </div>
    </div>
  </div>
)}
```

### Display Components in Detail:

#### 2.1 Movie Information Header
- **Poster:** `currentMovie.poster` (TMDB URL)
- **Title:** `currentMovie.title` (Line 1831) ⭐ **THE RECOGNIZED TITLE**
- **Year:** `currentMovie.year` (from TMDB/Claude)
- **Genre:** `currentMovie.genre` (from TMDB)
- **Director:** `currentMovie.director` (from OMDb or TMDB)
- **Cast:** `currentMovie.cast` (from OMDb or TMDB)
- **Trailer:** `currentMovie.trailerUrl` (from TMDB videos)

#### 2.2 Recommendation Badge
- **Badge Name:** `currentMovie.badge`
- **Emoji:** `currentMovie.badgeEmoji`
- **Description:** `currentMovie.badgeDescription`
- **Tier:** `currentMovie.tier`
- Calculated based on user's taste profile (5+ votes required)

#### 2.3 Rating Aggregates
- **IMDb:** `currentMovie.imdbRating` (from OMDb)
- **Rotten Tomatoes:** `currentMovie.rottenTomatoes` (from OMDb)
- **Metacritic:** `currentMovie.metacritic` (from OMDb)

---

## 3. DATA FLOW: CAMERA → DETAIL CARD

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Take Photo/Upload Image                                        │
│     └─> handleFileUpload() [Line 582]                              │
│         └─> FileReader.readAsDataURL()                             │
│             └─> processImage(imageData) [Line 979]                 │
│                                                                     │
│  2. IMAGE COMPRESSION (Line 914-977)                               │
│     └─> compressImage() [Line 914]                                 │
│         • Resizes to max 1920px                                    │
│         • Targets 4MB max (5MB Claude limit)                       │
│         • Quality reduction: 0.85 → 0.5                            │
│                                                                     │
│  3. CLAUDE VISION ANALYSIS [Backend: Line 73]                      │
│     └─> POST /api/claude/identify (base64 image)                   │
│         └─> Claude API (claude-3-haiku-20240307)                   │
│             └─> Image → JSON extraction                            │
│                 {                                                  │
│                   "title": "Exact Movie Title",                    │
│                   "year": 2005,                                    │
│                   "confidence": 0.9                                │
│                 }                                                  │
│             └─> Post-processing: Clean bonus content phrases       │
│                 • Removes "The Making of", "Behind the Scenes"    │
│                 • Removes "Director's Cut", "Special Edition"     │
│                                                                     │
│  4. MOVIE SEARCH (Line 1093-1467)                                  │
│     └─> searchMovie(detectedTitle, detectedYear) [Line 1093]       │
│         • Generate alternatives (The, A, spacing variations)      │
│         • Try TMDB search with each alternative                   │
│         • Score results based on:                                 │
│           - Title match (exact > prefix/suffix > substring)       │
│           - Year match (exact > ±1 > ±3 > penalty)                │
│           - Popularity score (0-100 range)                        │
│         • Filter: Only movie/TV (not people/making-of bonus)      │
│         • Return highest scoring result                           │
│                                                                     │
│  5. FETCH MOVIE DETAILS (Line 1305-1370)                           │
│     └─> GET /api/tmdb/{type}/{id}                                  │
│         └─> Get: genres, credits (director, cast), videos         │
│                                                                     │
│  6. FETCH OMDb RATINGS (Line 1317-1358)                            │
│     └─> GET /api/omdb/ratings/{imdbId}                             │
│         └─> Get: IMDb rating, Rotten Tomatoes, Metacritic        │
│         └─> Error handling for rate limit (429)                   │
│                                                                     │
│  7. CALCULATE BADGE (Line 1394-1430)                               │
│     └─> POST /api/ratings/calculate-badge                          │
│         └─> Backend analyzes against user's taste profile         │
│             └─> Returns badge, emoji, description, tier           │
│                                                                     │
│  8. BUILD MOVIE OBJECT (Line 1373-1389)                            │
│     └─> Compile all data:                                         │
│         {                                                          │
│           id: number,                                             │
│           title: string,          ← DISPLAY TITLE                 │
│           year: string,                                           │
│           genre: string,                                          │
│           director: string,                                       │
│           cast: string,                                           │
│           poster: URL,                                            │
│           score: number,                                          │
│           imdbRating: number,                                     │
│           imdbVotes: number,                                      │
│           rottenTomatoes: number,                                 │
│           metacritic: number,                                     │
│           trailerUrl: URL,                                        │
│           rating: null,                                           │
│           badge: string,                                          │
│           badgeEmoji: string,                                     │
│           badgeDescription: string,                               │
│           timestamp: ISO8601                                      │
│         }                                                          │
│                                                                     │
│  9. UPDATE STATE & DISPLAY CARD                                    │
│     └─> setCurrentMovie(movieData) [Line 1432]                    │
│     └─> setHasScanned(true) [Line 1452]                           │
│     └─> setIsProcessing(false) [Line 1453]                        │
│     └─> Save to backend: POST /api/ratings                        │
│         └─> Detail card renders with currentMovie                 │
│             └─> SHOWS: title, year, genre, director, cast,       │
│                 poster, ratings, badge, trailer link             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. WHERE THE TITLE COMES FROM

### The "Recognized Title" Journey:

```
Image Captured
    ↓
Claude Vision Analysis (claude-3-haiku-20240307)
    ↓
Claude Returns: {title: "Movie Title", year: 2005}
    ↓
detectedTitle = claudeData.title (Line 1038)
    ↓
searchMovie(detectedTitle, detectedYear) (Line 1058)
    ↓
TMDB Search & Match Scoring (Lines 1142-1260)
    ↓
Get Best Match from TMDB
    ↓
movieData.title = movie.title || movie.name (Line 1375)
    ↓
setCurrentMovie(movieData) (Line 1432)
    ↓
Detail Card displays: {currentMovie.title} (Line 1831)
```

### Critical Point: Title Source
The title displayed in the detail card comes from **TMDB**, not from Claude's original detection.

**Why?** Because TMDB has canonical/standardized movie titles. Claude detects what it sees in the image, but the final display uses the standardized TMDB title.

---

## 5. ERROR HANDLING & RECOVERY MECHANISMS

### 5.1 Image Processing Errors (Lines 984-1091)

**Error Types Handled:**
1. **No image data** (Line 986)
   - Throws: "No image data provided"
   
2. **Base64 extraction fails** (Line 1000)
   - Throws: "Failed to extract base64 data from image"
   
3. **Network errors** (Line 1069)
   - Detects: "Failed to fetch" or "NetworkError"
   - Message: "Cannot connect to backend server"
   
4. **API key issues** (Line 1073)
   - Detects: "API key" in error
   - Message: "API key may be invalid or missing"
   
5. **API authentication failure** (Line 1077)
   - Detects: "403" in error
   - Message: "Vision API key lacks permissions"
   
6. **Claude returns no title** (Line 1049)
   - Triggers: Manual search mode
   - Message: "Could not identify a movie or TV show in the image"
   
7. **General API errors** (Line 1082)
   - Passes through error message
   - Suggests: "Try manual search instead"

**Error Response Flow:**
```
Error in processImage()
    ↓
catch(error) block [Lines 1059-1090]
    ↓
Categorize error type
    ↓
Build user-friendly message
    ↓
alert(userMessage)
    ↓
setIsProcessing(false)
    ↓
setSearchMode(true) [Enable manual search]
```

### 5.2 Movie Search Errors (Lines 1270-1294)

**Search Failures:**
1. **No results with any alternative query** (Line 1285)
   - Suggestion: Manual search with exact title
   
2. **Invalid media type** (Line 1297-1299)
   - Throws: "Invalid media type"
   
3. **TMDB API failures** (Line 1201-1203)
   - Propagates error to user

### 5.3 OMDb Rating Errors (Lines 1321-1358)

**Graceful Degradation:**
```
No IMDb ID
    ↓ Skip OMDb fetch
    
OMDb API Error (500)
    ↓ Console warning, continue without ratings
    
Rate limit (429)
    ↓ Console warning "Rate limit exceeded"
    ↓ Continue without ratings
    ↓ User still sees movie card with TMDB/IMDb data
```

### 5.4 Badge Calculation Errors (Lines 1394-1430)

```
Badge API fails
    ↓
catch(error) [Line 1428]
    ↓
console.warn('Could not calculate badge:', error)
    ↓
Detail card displays without badge
    ↓
User can still vote
```

---

## 6. TITLE CORRECTION MECHANISMS

### 6.1 Claude's Bonus Content Filtering (Backend: Lines 285-308)

Automatically removes common phrases:
- "The Making of [Title]" → "[Title]"
- "Behind the Scenes of [Title]" → "[Title]"
- "Director's Cut: [Title]" → "[Title]"
- "Extended Edition: [Title]" → "[Title]"
- "[Title]: Behind the Scenes" → "[Title]"
- "[Title] - The Making of" → "[Title]"

### 6.2 Alternative Query Generation (Frontend: Lines 1100-1139)

If initial search fails, tries alternatives:
```
Original: "The Matrix"
    ↓
Alternatives:
1. "The Matrix"          (original)
2. "Matrix"              (without "The")
3. "A The Matrix"        (prepend "A")
4. "TheMatrix" → "The Matrix" (spacing)
5. "The Matrix II"       (sequel variation)
6. "The Matrix 2"        (sequel variation)
7. "The Matrix Part II"  (sequel variation)
8. "The Matrix III"      (sequel 3)
... etc
```

### 6.3 MANUAL SEARCH (Frontend: Lines 1789-1803)

**User Interface for Correction:**
```
Manual Search Button (Line 1783)
    ↓
setSearchMode(!searchMode)
    ↓
Shows input field:
  <input 
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyPress={(e) => e.key === 'Enter' && searchMovie(searchQuery)}
    placeholder="Enter movie or TV show name..."
  />
    ↓
User can:
• Type corrected title
• Press Enter or click Search button
• searchMovie() executes with manual query
• Detail card updates with corrected result
```

**When Manual Search is Triggered:**
- No title detected by Claude (Line 1052)
- No TMDB results found (Line 1292)
- User clicks "Manual Search" button (Line 1783)

---

## 7. STATE MANAGEMENT

### Key State Variables (Lines 163-189):

```javascript
// Snap tab state
const [activeTab, setActiveTab] = useState('snap');      // Current view
const [hasScanned, setHasScanned] = useState(false);     // Movie found?
const [isProcessing, setIsProcessing] = useState(false); // Loading state
const [currentMovie, setCurrentMovie] = useState(null);  // ← DISPLAYED MOVIE
const [currentMovieRating, setCurrentMovieRating] = useState(null); // User vote

// Search state
const [searchQuery, setSearchQuery] = useState('');      // Manual search input
const [searchMode, setSearchMode] = useState(false);     // Manual search UI?

// History state
const [movieHistory, setMovieHistory] = useState({});    // All scanned movies

// Camera state
const [stream, setStream] = useState(null);              // Camera stream
const [cameraActive, setCameraActive] = useState(false); // Camera on?

// UI state
const [swipedItem, setSwipedItem] = useState(null);      // Swipe tracking
const [detailModalMovie, setDetailModalMovie] = useState(null); // Modal movie
const [isDarkMode, setIsDarkMode] = useState(...);       // Theme
```

---

## 8. TITLE DISPLAY IMPLEMENTATION

**Exact Rendering (Line 1831):**
```jsx
<h2 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
  {currentMovie.title}
</h2>
```

**What's Being Displayed:**
- Source: `currentMovie.title`
- Type: String
- Content: TMDB canonical title
- Updated: When `setCurrentMovie()` is called (Line 1432)
- Rendered: Only when `activeTab === 'snap' && hasScanned && currentMovie` (Line 1816)

---

## 9. POTENTIAL TITLE MISMATCH SCENARIOS

### Scenario 1: Claude Detects Wrong Title
- **Detection:** "Red Dragon" vs Actual: "Red Dragon"
- **Recovery:** User uses manual search

### Scenario 2: Misspelled Title Detected
- **Detection:** "The Matric" 
- **Recovery:** 
  1. First tries exact search → No results
  2. Tries alternatives (The, spacing, etc.) → Still no match
  3. Falls back to: "No results found" alert
  4. Enables manual search mode

### Scenario 3: TV Show vs Movie
- **Example:** Detected as "The Office" (title)
- **Search:** TMDB returns both movie and TV show
- **Filter:** Only returns media_type='movie' or 'tv'
- **Ranking:** Uses year to disambiguate

### Scenario 4: Bonus Content Phrase
- **Detection:** "The Making of Back to the Future"
- **Backend Processing:** Strips "The Making of" prefix
- **Search:** Searches for "Back to the Future"
- **Result:** Correct movie found

---

## 10. KEY FILES & LINE REFERENCES

### Frontend (`/src/App.jsx`):
| Component/Function | Lines | Purpose |
|---|---|---|
| Detail Card UI | 1816-1916 | Displays movie info |
| `handleFileUpload` | 582-591 | Capture/upload image |
| `processImage` | 979-1091 | Main processing pipeline |
| `compressImage` | 914-977 | Image optimization |
| `searchMovie` | 1093-1467 | TMDB search & details |
| `scoreResult` | 1142-1191 | Ranking algorithm |
| `extractMovieCandidates` | 764-874 | Extract title candidates |
| `cleanMovieTitle` | 598-758 | Parse OCR text |
| `handleMovieRating` | 359-449 | Save user rating |
| `handleRating` | 1469-1474 | Vote button handler |
| Manual Search UI | 1783-1803 | Fallback search |

### Backend (`/backend/routes/`):
| Route | File | Purpose |
|---|---|---|
| POST /api/claude/identify | claude.js | Vision analysis |
| GET /api/tmdb/search | tmdb.js | Movie search |
| GET /api/tmdb/{type}/{id} | tmdb.js | Movie details |
| GET /api/omdb/ratings/{imdbId} | omdb.js | Ratings/awards |
| POST /api/ratings/calculate-badge | ratings.js | Badge calculation |
| POST /api/ratings | ratings.js | Save movie/rating |

---

## 11. SUMMARY

### The Title Display Flow:
```
User captures image
    ↓
Claude Vision extracts: "Movie Title" (with confidence 0.9)
    ↓
Clean bonus phrases: "The Making of..." → "..."
    ↓
Search TMDB with alternatives: "Movie Title", "The Movie Title", etc.
    ↓
Score and rank results by: title match > year match > popularity
    ↓
Fetch full details from TMDB + OMDb ratings
    ↓
Calculate recommendation badge from user profile
    ↓
Create movieData object with TMDB-standardized title
    ↓
Call setCurrentMovie(movieData)
    ↓
Detail card renders with: currentMovie.title (TMDB canonical name)
```

### Error Recovery Paths:
1. **No title detected** → Manual search mode
2. **No search results** → Manual search mode + helpful message
3. **Multiple matches** → Score and pick best
4. **Missing ratings** → Show what's available (graceful degradation)
5. **Missing badge** → Show card without badge

### Strengths:
- Multi-source title extraction (Claude + TMDB)
- Intelligent alternative query generation
- Scoring system for disambiguation
- Graceful error handling
- Manual search fallback
- Bonus content filtering

### Potential Improvements:
- Edit/correct title button in detail card (not currently implemented)
- User feedback on title accuracy
- Cache alternative spellings
- ML-based title similarity matching
