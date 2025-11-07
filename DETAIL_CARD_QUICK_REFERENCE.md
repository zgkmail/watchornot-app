# Detail Card Component - Quick Reference

## WHAT IS IT?
A bottom-sheet card that appears after successfully identifying a movie from a camera photo. Shows:
- Movie title (from TMDB)
- Poster image
- Year, genre, director, cast
- IMDb/Rotten Tomatoes/Metacritic ratings
- Personal recommendation badge
- Up/Down vote buttons

## WHERE IS IT?
**File:** `/home/user/watchornot-app/src/App.jsx`
**Lines:** 1816-1916 (Render)
**Condition:** Only shows when `activeTab === 'snap' && hasScanned && currentMovie`

## HOW DOES THE TITLE GET THERE?

```
IMAGE → CLAUDE (identifies title) → TMDB (standardizes title) → DETAIL CARD
```

### Step-by-step:
1. **User captures/uploads image**
   - `handleFileUpload()` (line 582)
   
2. **Image compression**
   - `compressImage()` (line 914) - max 4MB
   
3. **Claude Vision Analysis**
   - POST `/api/claude/identify` with base64 image
   - Returns: `{title: "Movie Title", year: 2005}`
   
4. **Title cleanup** (backend)
   - Removes "The Making of", "Behind the Scenes", etc.
   
5. **TMDB search**
   - Tries multiple alternatives (with "The", without "The", spacing fixes, etc.)
   - Scores results by: title match > year match > popularity
   
6. **Fetch full movie data**
   - Details: genres, director, cast, videos (trailer)
   - Ratings: IMDb, Rotten Tomatoes, Metacritic (from OMDb)
   
7. **Calculate badge**
   - Based on user's taste profile and voting history
   
8. **Create movie object**
   ```javascript
   const movieData = {
     id: number,
     title: string,              // ← FROM TMDB (canonical)
     year: string,               // ← FROM TMDB
     genre: string,              // ← FROM TMDB
     director: string,           // ← FROM OMDb OR TMDB
     cast: string,               // ← FROM OMDb OR TMDB
     poster: URL,                // ← FROM TMDB
     imdbRating: number,         // ← FROM OMDb
     rottenTomatoes: number,     // ← FROM OMDb
     metacritic: number,         // ← FROM OMDb
     trailerUrl: URL,            // ← FROM TMDB
     badge: string,              // ← FROM BACKEND CALCULATION
     badgeEmoji: string,         // ← FROM BACKEND CALCULATION
     badgeDescription: string,   // ← FROM BACKEND CALCULATION
   }
   ```
   
9. **Update state**
   - `setCurrentMovie(movieData)` (line 1432)
   - `setHasScanned(true)` (line 1452)
   
10. **Render detail card**
    - Displays `currentMovie.title` at line 1831

## KEY QUESTION: WHY MIGHT TITLE BE WRONG?

### Potential Issues:
1. **Claude misread the image** - See a blurry or unclear title on screen
   - Recovery: Use "Manual Search" button

2. **TMDB has different title** - Official title differs from what's displayed
   - Recovery: Manual search finds it correctly

3. **Bonus content not stripped** - Claude detected "The Making of Back to the Future"
   - Recovery: Backend strips known phrases, but if new phrase, manual search

4. **Ambiguous movie** - Multiple movies with same/similar name
   - Recovery: Year-based scoring or manual search

## ERROR HANDLING

### When Claude Finds No Title
```
No title from Claude
    ↓
Alert: "Could not identify a movie or TV show in the image"
    ↓
setSearchMode(true)
    ↓
Shows manual search input field
```

### When TMDB Search Fails
```
No results found with any alternative query
    ↓
Alert: "No results found. Please try manual search..."
    ↓
Enable manual search mode
```

### When OMDb Ratings Unavailable
```
Rate limited (429) OR API error
    ↓
Console warning
    ↓
Continue with TMDB/IMDb data
    ↓
User still sees card (graceful degradation)
```

## MANUAL SEARCH FLOW

```jsx
// Button to enable manual search (line 1783)
<button onClick={() => setSearchMode(!searchMode)}>
  <Search /> Manual Search
</button>

// Input field appears when searchMode = true (lines 1789-1803)
{searchMode && (
  <input 
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyPress={(e) => e.key === 'Enter' && searchMovie(searchQuery)}
    placeholder="Enter movie or TV show name..."
  />
)}

// User types corrected title and presses Enter
// → searchMovie(userInput) executes
// → Same TMDB search process runs
// → Detail card updates with correct movie
```

## STATE VARIABLES INVOLVED

```javascript
// Main display state
currentMovie = {
  title: string,
  year: string,
  genre: string,
  director: string,
  cast: string,
  poster: URL,
  imdbRating: number,
  rottenTomatoes: number,
  metacritic: number,
  trailerUrl: URL,
  badge: string,
  badgeEmoji: string,
  badgeDescription: string,
  ...
}

// Control visibility
hasScanned: boolean        // true = show card
activeTab: 'snap'          // must be 'snap' tab
isProcessing: boolean      // true = show spinner

// User interaction
currentMovieRating: 'up' | 'down' | null
```

## STYLING

**Card Container:** (lines 1821)
- Dark mode: `bg-gray-800`
- Light mode: `bg-white shadow-2xl`
- Max height: 70vh (scrollable)
- Position: Fixed bottom, rounded corners

**Title Display:** (line 1831)
- Font size: `text-2xl`
- Font weight: `font-bold`
- Dark mode: `text-white`
- Light mode: `text-gray-900`

**Ratings Section:** (lines 1875-1892)
- IMDb: Yellow (#fbbf24)
- Rotten Tomatoes: Red (#ef4444)
- Metacritic: Green (#22c55e)

**Badge Section:** (lines 1853-1862)
- Gradient background: purple to blue
- Emoji: 3xl size
- Bold text: badge name

**Buttons:** (lines 1900-1911)
- Thumbs Up: Green when selected
- Thumbs Down: Red when selected
- Gray when unselected
- Large padding: py-4

## RATING SYSTEM

When user votes:
1. Click Up/Down button
2. `handleRating('up' | 'down')` executes (line 1469)
3. `handleMovieRating(movieId, rating)` (line 359)
4. Optimistic UI update: `setMovieHistory()`
5. POST `/api/ratings` to backend with voting data
6. Backend recalculates badge
7. Badge updates in detail card
8. Auto-advance to next snap after 1.5s (line 1473)

## COMMON MODIFICATION POINTS

If you want to add features:

### Add a "Report Wrong Title" Button:
```jsx
// After the vote buttons (line 1912)
<button onClick={() => alert('Feedback noted')} className="w-full mt-2 py-2 text-sm text-blue-500">
  Report Wrong Title
</button>
```

### Edit Title Directly:
```jsx
// After line 1831, add edit mode
{editMode ? (
  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
) : (
  <h2>{currentMovie.title}</h2>
)}
```

### Show Confidence Score:
```jsx
// Below title (after line 1831)
{currentMovie.confidence && (
  <span className="text-xs text-gray-500">
    {(currentMovie.confidence * 100).toFixed(0)}% match
  </span>
)}
```

## TESTING

### Test Correct Movie Recognition:
1. Open app
2. Take/upload clear photo of movie title
3. Verify card shows correct title

### Test Wrong Title Recovery:
1. Take blurry/unclear photo
2. Click "Manual Search"
3. Type correct title
4. Verify card updates

### Test Missing Ratings:
1. Search movie without IMDb ID
2. Verify card still shows with available data

### Test Dark/Light Mode:
1. Toggle dark mode
2. Verify text colors change appropriately

## RELATED FUNCTIONS

| Function | Purpose | Lines |
|---|---|---|
| `handleFileUpload` | Capture image | 582-591 |
| `processImage` | Main pipeline | 979-1091 |
| `compressImage` | Optimize size | 914-977 |
| `searchMovie` | TMDB search | 1093-1467 |
| `scoreResult` | Rank results | 1142-1191 |
| `handleRating` | Vote handler | 1469-1474 |
| `handleMovieRating` | Save rating | 359-449 |

## BACKEND ROUTES INVOLVED

| Route | File | Method |
|---|---|---|
| `/api/claude/identify` | claude.js | POST |
| `/api/tmdb/search` | tmdb.js | GET |
| `/api/tmdb/{type}/{id}` | tmdb.js | GET |
| `/api/omdb/ratings/{imdbId}` | omdb.js | GET |
| `/api/ratings/calculate-badge` | ratings.js | POST |
| `/api/ratings` | ratings.js | POST |

## GITHUB BRANCH FOR THIS ISSUE

Current branch: `claude/fix-wrong-title-detail-card-011CUsXHxkB36FUt8SW15w3P`

This branch name suggests there's a known issue about wrong titles in the detail card that needs fixing.

## NEXT STEPS FOR DEVELOPMENT

1. **Identify the specific issue:** What exact wrong title scenario is happening?
2. **Add debugging:** Log Claude's detected title vs final displayed title
3. **Add user correction:** Button to update displayed title
4. **Improve matching:** Better scoring/disambiguation for edge cases
5. **Feedback loop:** Let users report/correct incorrect matches

